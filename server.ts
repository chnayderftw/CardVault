import express from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import {
  authenticateToken,
  requireAdmin,
  rateLimiter,
  sanitizeMessageContent,
  AuthenticatedRequest
} from './server/middleware';
import { User, CardProduct, Order, Deposit, SupportTicket, Announcement } from './src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_marketplace_jwt_secret_key_2026';
const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(rateLimiter(200, 60000));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth: Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { fullName, email, password, confirmPassword } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'Full name, email, and password are required.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }

      const existingUser = db.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: User & { passwordHash: string } = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'user',
        balance: 0.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.createUser(newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { passwordHash: _, ...safeUser } = newUser;
      res.status(201).json({ token, user: safeUser });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Failed to create user account.' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email address or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email address or password.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { passwordHash: _, ...safeUser } = user;
      res.json({ token, user: safeUser });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Failed to process login.' });
    }
  });

  // Auth: Get Current User Me
  app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
    const user = db.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // Auth: Change Password
  app.post('/api/auth/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = db.findUserById(req.user!.id);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      db.updateUser(user.id, { passwordHash: newHash, mustChangePassword: false });

      if (user.role === 'admin') {
        db.addAuditLog({
          id: `log-${Date.now()}`,
          adminEmail: user.email,
          action: 'ADMIN_PASSWORD_CHANGED',
          details: 'Administrator updated default/initial security password.',
          timestamp: new Date().toISOString()
        });
      }

      res.json({ message: 'Password changed successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update password.' });
    }
  });

  // Settings (Public)
  app.get('/api/settings', (req, res) => {
    res.json(db.getSettings());
  });

  // Products Marketplace (Public)
  app.get('/api/products', (req, res) => {
    const products = db.getProducts().filter(p => p.status === 'active');
    res.json(products);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.findProductById(req.params.id);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ error: 'Product not found or unavailable.' });
    }
    res.json(product);
  });

  // Announcements (Public)
  app.get('/api/announcements', (req, res) => {
    res.json(db.getAnnouncements());
  });

  // Orders (Authenticated)
  app.get('/api/orders', authenticateToken, (req: AuthenticatedRequest, res) => {
    if (req.user!.role === 'admin') {
      return res.json(db.getOrders());
    }
    res.json(db.getOrdersByUserId(req.user!.id));
  });

  app.get('/api/orders/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    const order = db.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized order access.' });
    }
    res.json(order);
  });

  // Create Order (Direct Balance Purchase or USDT Order Creation)
  app.post('/api/orders', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const { productId, quantity = 1, paymentMethod = 'balance', txHash } = req.body;
      const product = db.findProductById(productId);

      if (!product || product.status !== 'active') {
        return res.status(404).json({ error: 'Selected card product is no longer available.' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ error: 'Insufficient inventory in stock for this card product.' });
      }

      const totalAmount = product.price * quantity;
      const user = db.findUserById(req.user!.id)!;

      if (paymentMethod === 'balance') {
        if (user.balance < totalAmount) {
          return res.status(400).json({ error: 'Insufficient account balance. Please deposit funds or pay via USDT TRC20.' });
        }

        // Deduct balance & fulfill immediately
        db.updateUser(user.id, { balance: user.balance - totalAmount });
        db.updateProduct(product.id, { stock: product.stock - quantity });

        const order: Order = {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: user.id,
          userEmail: user.email,
          productId: product.id,
          productName: product.name,
          productBrand: product.brand,
          productType: product.cardType,
          amount: totalAmount,
          quantity,
          paymentStatus: 'paid',
          deliveryStatus: 'delivered',
          fulfillmentData: {
            claimCode: `CLAIM-${product.brand.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-2026`,
            instructions: `Use code to access official ${product.issuer} issuance portal and activate balance.`
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        db.createOrder(order);
        return res.status(201).json(order);
      } else {
        // USDT TRC20 Payment Workflow Creation
        const order: Order = {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: user.id,
          userEmail: user.email,
          productId: product.id,
          productName: product.name,
          productBrand: product.brand,
          productType: product.cardType,
          amount: totalAmount,
          quantity,
          paymentStatus: 'pending',
          deliveryStatus: 'pending',
          txHash: txHash ? txHash.trim() : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        db.createOrder(order);
        return res.status(201).json(order);
      }
    } catch (err) {
      console.error('Create order error:', err);
      res.status(500).json({ error: 'Failed to create order.' });
    }
  });

  // Submit TRC20 Payment Transaction Hash for Order
  app.post('/api/orders/:id/pay-trc20', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const { txHash } = req.body;
      if (!txHash || txHash.trim().length < 10) {
        return res.status(400).json({ error: 'Valid TRC20 transaction hash is required.' });
      }

      const order = db.findOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found.' });
      if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized.' });
      }

      // Set to 'verifying' status as mandated by prompt guidelines
      const updatedOrder = db.updateOrder(order.id, {
        paymentStatus: 'verifying',
        txHash: txHash.trim()
      });

      res.json({
        message: 'Transaction hash submitted. Backend payment verification is pending.',
        order: updatedOrder
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit transaction hash.' });
    }
  });

  // Deposits (Authenticated)
  app.get('/api/deposits', authenticateToken, (req: AuthenticatedRequest, res) => {
    if (req.user!.role === 'admin') {
      return res.json(db.getDeposits());
    }
    res.json(db.getDepositsByUserId(req.user!.id));
  });

  app.post('/api/deposits', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const { amount, txHash } = req.body;
      const numAmount = parseFloat(amount);

      if (isNaN(numAmount) || numAmount < 10) {
        return res.status(400).json({ error: 'Minimum deposit amount is $10.00 USDT.' });
      }

      if (!txHash || txHash.trim().length < 10) {
        return res.status(400).json({ error: 'A valid TRC20 transaction hash is required.' });
      }

      const settings = db.getSettings();
      const deposit: Deposit = {
        id: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: req.user!.id,
        userEmail: req.user!.email,
        amount: numAmount,
        network: 'TRC20',
        walletAddress: settings.trc20WalletAddress,
        txHash: txHash.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.createDeposit(deposit);
      res.status(201).json(deposit);
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit deposit request.' });
    }
  });

  // Support Conversations
  app.get('/api/support/tickets', authenticateToken, (req: AuthenticatedRequest, res) => {
    if (req.user!.role === 'admin') {
      return res.json(db.getTickets());
    }
    res.json(db.getTicketsByUserId(req.user!.id));
  });

  app.post('/api/support/tickets', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const { subject, message } = req.body;
      if (!subject || !message) {
        return res.status(400).json({ error: 'Subject and message are required.' });
      }

      const cleanContent = sanitizeMessageContent(message);

      const ticket: SupportTicket = {
        id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: req.user!.id,
        userName: req.user!.fullName,
        userEmail: req.user!.email,
        subject: subject.trim(),
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: req.user!.id,
            senderName: req.user!.fullName,
            senderRole: req.user!.role,
            content: cleanContent,
            timestamp: new Date().toISOString()
          }
        ]
      };

      db.createTicket(ticket);
      res.status(201).json(ticket);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create support ticket.' });
    }
  });

  app.post('/api/support/tickets/:id/messages', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Message content cannot be empty.' });
      }

      const ticket = db.findTicketById(req.params.id);
      if (!ticket) return res.status(404).json({ error: 'Support ticket not found.' });

      if (req.user!.role !== 'admin' && ticket.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized ticket access.' });
      }

      const cleanContent = sanitizeMessageContent(content);

      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: req.user!.id,
        senderName: req.user!.fullName,
        senderRole: req.user!.role,
        content: cleanContent,
        timestamp: new Date().toISOString()
      };

      const updated = db.addMessageToTicket(ticket.id, newMsg);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to send support message.' });
    }
  });


  // --- ADMINISTRATOR DASHBOARD ROUTES ---

  // Admin: Get All Users
  app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
    const users = db.getUsers().map(({ passwordHash, ...user }) => user);
    res.json(users);
  });

  // Admin: Adjust User Balance
  app.post('/api/admin/users/:id/balance', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const { balance } = req.body;
      const num = parseFloat(balance);
      if (isNaN(num) || num < 0) return res.status(400).json({ error: 'Invalid balance amount.' });

      const updated = db.updateUser(req.params.id, { balance: num });
      if (!updated) return res.status(404).json({ error: 'User not found.' });

      db.addAuditLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user!.email,
        action: 'USER_BALANCE_ADJUSTED',
        details: `Set balance for user ${updated.email} to $${num.toFixed(2)}`,
        timestamp: new Date().toISOString()
      });

      const { passwordHash: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ error: 'Failed to adjust balance.' });
    }
  });

  // Admin: Verify Order USDT TRC20 Payment & Deliver Card Credentials
  app.post('/api/admin/orders/:id/verify-payment', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const { status, fulfillmentData } = req.body; // 'paid' or 'failed'
      const order = db.findOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found.' });

      if (status === 'paid') {
        const product = db.findProductById(order.productId);
        if (product && product.stock >= order.quantity) {
          db.updateProduct(product.id, { stock: product.stock - order.quantity });
        }

        const cardNumber = fulfillmentData?.cardNumber?.trim() || `4532 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
        const expDate = fulfillmentData?.expDate?.trim() || `12/28`;
        const cvv = fulfillmentData?.cvv?.trim() || `${Math.floor(100 + Math.random() * 900)}`;
        const instructions = fulfillmentData?.instructions?.trim() || `Virtual Card active. Ready for online card purchases & 3DS authorization.`;

        const updatedOrder = db.updateOrder(order.id, {
          paymentStatus: 'paid',
          deliveryStatus: 'delivered',
          fulfillmentData: {
            cardNumber,
            expDate,
            cvv,
            claimCode: cardNumber,
            instructions
          }
        });

        db.addAuditLog({
          id: `log-${Date.now()}`,
          adminEmail: req.user!.email,
          action: 'ORDER_PAYMENT_VERIFIED',
          details: `Confirmed TRC20 payment & issued card details for Order #${order.id} ($${order.amount.toFixed(2)} USDT)`,
          timestamp: new Date().toISOString()
        });

        return res.json(updatedOrder);
      } else {
        const updatedOrder = db.updateOrder(order.id, { paymentStatus: 'failed', deliveryStatus: 'failed' });
        return res.json(updatedOrder);
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to verify order payment.' });
    }
  });

  // Admin: Verify Deposit
  app.post('/api/admin/deposits/:id/verify', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const { status } = req.body; // 'approved' or 'rejected'
      const deposit = db.findDepositById(req.params.id);
      if (!deposit) return res.status(404).json({ error: 'Deposit not found.' });

      if (deposit.status !== 'pending') {
        return res.status(400).json({ error: 'Deposit has already been processed.' });
      }

      if (status === 'approved') {
        const user = db.findUserById(deposit.userId);
        if (user) {
          db.updateUser(user.id, { balance: user.balance + deposit.amount });
        }

        const updated = db.updateDeposit(deposit.id, { status: 'approved' });

        db.addAuditLog({
          id: `log-${Date.now()}`,
          adminEmail: req.user!.email,
          action: 'DEPOSIT_APPROVED',
          details: `Approved TRC20 Deposit #${deposit.id} of $${deposit.amount.toFixed(2)} USDT for ${deposit.userEmail}`,
          timestamp: new Date().toISOString()
        });

        return res.json(updated);
      } else {
        const updated = db.updateDeposit(deposit.id, { status: 'rejected' });
        return res.json(updated);
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to process deposit verification.' });
    }
  });

  // Admin: Product Management
  app.get('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
    res.json(db.getProducts());
  });

  app.post('/api/admin/products', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const newProd: CardProduct = {
        id: `prod-${Date.now()}`,
        brand: req.body.brand || 'Visa',
        name: req.body.name,
        bin: req.body.bin || '400000',
        issuer: req.body.issuer || 'Issuing Institution',
        cardType: req.body.cardType || 'Prepaid',
        level: req.body.level || 'Standard',
        country: req.body.country || 'United States',
        currency: req.body.currency || 'USD',
        region: req.body.region || 'North America',
        expirationPolicy: req.body.expirationPolicy || 'Valid 12 Months',
        features: Array.isArray(req.body.features) ? req.body.features : ['Instant Portal Issuance'],
        price: parseFloat(req.body.price) || 105.0,
        stock: parseInt(req.body.stock) || 50,
        isPremium: Boolean(req.body.isPremium),
        isFeatured: Boolean(req.body.isFeatured),
        imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
        deliveryMethod: req.body.deliveryMethod || 'Instant Encrypted Portal Code',
        terms: req.body.terms || 'Legally issued prepaid card product.',
        status: 'active',
        createdAt: new Date().toISOString()
      };

      db.createProduct(newProd);

      db.addAuditLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user!.email,
        action: 'PRODUCT_CREATED',
        details: `Created new product: ${newProd.name} ($${newProd.price} USDT)`,
        timestamp: new Date().toISOString()
      });

      res.status(201).json(newProd);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create product.' });
    }
  });

  app.put('/api/admin/products/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const updated = db.updateProduct(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Product not found.' });

      db.addAuditLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user!.email,
        action: 'PRODUCT_UPDATED',
        details: `Updated product #${req.params.id}`,
        timestamp: new Date().toISOString()
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update product.' });
    }
  });

  app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    db.deleteProduct(req.params.id);
    db.addAuditLog({
      id: `log-${Date.now()}`,
      adminEmail: req.user!.email,
      action: 'PRODUCT_DELETED',
      details: `Deleted product #${req.params.id}`,
      timestamp: new Date().toISOString()
    });
    res.json({ message: 'Product removed successfully.' });
  });

  // Admin: Announcements
  app.post('/api/admin/announcements', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const { title, content, category, isImportant } = req.body;
      const ann: Announcement = {
        id: `ann-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        category: category || 'Announcement',
        isImportant: Boolean(isImportant),
        createdAt: new Date().toISOString()
      };

      db.createAnnouncement(ann);

      db.addAuditLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user!.email,
        action: 'ANNOUNCEMENT_PUBLISHED',
        details: `Published announcement: "${ann.title}"`,
        timestamp: new Date().toISOString()
      });

      res.status(201).json(ann);
    } catch (err) {
      res.status(500).json({ error: 'Failed to publish announcement.' });
    }
  });

  app.delete('/api/admin/announcements/:id', authenticateToken, requireAdmin, (req, res) => {
    db.deleteAnnouncement(req.params.id);
    res.json({ message: 'Announcement deleted.' });
  });

  // Admin: Site Settings & Wallet Address Management
  app.put('/api/admin/settings', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const updated = db.updateSettings(req.body);

      db.addAuditLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user!.email,
        action: 'SETTINGS_UPDATED',
        details: `Updated TRC20 merchant wallet & site parameters`,
        timestamp: new Date().toISOString()
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update settings.' });
    }
  });

  // Admin: Audit Logs
  app.get('/api/admin/audit-logs', authenticateToken, requireAdmin, (req, res) => {
    res.json(db.getAuditLogs());
  });

  // Admin: Sales & Financial Statistics Overview
  app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
    const orders = db.getOrders();
    const deposits = db.getDeposits();
    const users = db.getUsers();
    const products = db.getProducts();

    const totalPaidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const totalVolumeUSD = totalPaidOrders.reduce((sum, o) => sum + o.amount, 0);

    const pendingOrdersCount = orders.filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'verifying').length;
    const pendingDepositsCount = deposits.filter(d => d.status === 'pending').length;

    res.json({
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalPaidOrders: totalPaidOrders.length,
      totalVolumeUSD,
      pendingOrdersCount,
      pendingDepositsCount
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
