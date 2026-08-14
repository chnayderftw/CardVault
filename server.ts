import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { authenticate, optionalAuthenticate, requireAdmin, generateToken, AuthRequest } from './server/auth';
import { Product, Order, OrderItem } from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), store: 'CardVault' });
  });

  // Settings (Public)
  app.get('/api/settings', (req, res) => {
    const settings = db.getSettings();
    res.json(settings);
  });

  // Categories (Public)
  app.get('/api/categories', (req, res) => {
    const categories = db.getCategories();
    res.json(categories);
  });

  // Products (Public)
  app.get('/api/products', (req, res) => {
    const { category, search, brand } = req.query as { category?: string; search?: string; brand?: string };
    const products = db.getProducts({ category, search, brand });
    res.json(products);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // QR Code generator for USDT TRC20 payment
  app.get('/api/payment/qr', async (req, res) => {
    try {
      const address = (req.query.address as string) || db.getSettings().usdtTrc20Address;
      const amount = req.query.amount as string;
      // TRC20 URI or raw address
      const qrData = amount ? `tron:${address}?amount=${amount}` : address;
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 280,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      res.json({ qrDataUrl, address });
    } catch (err) {
      console.error('QR code generation error:', err);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  });

  // Authentication
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { fullName, email, password, confirmPassword } = req.body;
      if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'Please provide full name, email, and password' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      const existing = db.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const newUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 10),
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        status: 'active' as const,
        passwordHash
      };

      const safeUser = db.createUser(newUser);
      const token = generateToken(safeUser);

      res.status(201).json({ user: safeUser, token });
    } catch (err: any) {
      console.error('Signup error:', err);
      res.status(500).json({ error: err.message || 'Signup failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
      }

      const userRecord = db.findUserByEmail(email);
      if (!userRecord) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const match = bcrypt.compareSync(password, userRecord.passwordHash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (userRecord.status === 'disabled') {
        return res.status(403).json({ error: 'Account has been disabled. Please contact support.' });
      }

      const { passwordHash, ...safeUser } = userRecord;
      const token = generateToken(safeUser);

      res.json({ user: safeUser, token });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticate, (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // Orders
  app.post('/api/orders/create', optionalAuthenticate, async (req: AuthRequest, res) => {
    try {
      const { items, customerEmail, customerName, customerNotes } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
      }

      const user = req.user;
      const email = user ? user.email : customerEmail;
      const name = user ? user.fullName : (customerName || 'Customer');

      if (!email) {
        return res.status(400).json({ error: 'Email address is required to create an order' });
      }

      let totalUSD = 0;
      const validatedItems: OrderItem[] = [];

      for (const it of items) {
        const product = db.getProductById(it.productId);
        if (!product) {
          return res.status(400).json({ error: `Product not found: ${it.productId}` });
        }
        if (product.availability === 'out_of_stock') {
          return res.status(400).json({ error: `${product.name} is currently out of stock` });
        }
        const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
        const itemTotal = product.price * qty;
        totalUSD += itemTotal;

        validatedItems.push({
          productId: product.id,
          name: product.name,
          brand: product.brand,
          cardType: product.cardType,
          value: product.value,
          price: product.price,
          quantity: qty,
          image: product.image,
          region: product.region,
        });
      }

      const settings = db.getSettings();
      const exchangeRate = settings.exchangeRateUsdt || 1.0;
      const totalUSDT = parseFloat((totalUSD * exchangeRate).toFixed(2));
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      const newOrder: Order = {
        id: orderId,
        userId: user ? user.id : 'guest_' + Math.random().toString(36).substring(2, 9),
        userEmail: email.toLowerCase().trim(),
        userName: name,
        items: validatedItems,
        totalUSD: parseFloat(totalUSD.toFixed(2)),
        totalUSDT,
        paymentMethod: 'USDT_TRC20',
        paymentAddress: settings.usdtTrc20Address,
        paymentStatus: 'Awaiting Payment',
        orderStatus: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerNotes: customerNotes || ''
      };

      const created = db.createOrder(newOrder);
      res.status(201).json(created);
    } catch (err: any) {
      console.error('Create order error:', err);
      res.status(500).json({ error: err.message || 'Failed to create order' });
    }
  });

  app.get('/api/orders/my-orders', authenticate, (req: AuthRequest, res) => {
    const orders = db.getOrders({ userId: req.user!.id });
    res.json(orders);
  });

  app.get('/api/orders/:orderId', optionalAuthenticate, (req: AuthRequest, res) => {
    const order = db.getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Allow if user is admin or is order owner or guest tracking by ID
    res.json(order);
  });

  // Submit TXID
  app.post('/api/orders/:orderId/submit-txid', async (req, res) => {
    const { txHash } = req.body;
    if (!txHash || txHash.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid TRON transaction hash (TXID)' });
    }

    const order = db.submitTransactionHash(req.params.orderId, txHash.trim());
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Transaction hash submitted successfully. Payment is now Pending Verification.',
      order
    });
  });

  // Admin APIs
  app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const stats = db.getAdminStats();
    res.json(stats);
  });

  app.get('/api/admin/orders', requireAdmin, (req, res) => {
    const { status, search } = req.query as { status?: string; search?: string };
    const orders = db.getOrders({ status, search });
    res.json(orders);
  });

  app.get('/api/admin/orders/:orderId', requireAdmin, (req, res) => {
    const order = db.getOrderById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.post('/api/admin/orders/:orderId/approve-payment', requireAdmin, (req, res) => {
    const { deliveredCards, deliveryNotes } = req.body || {};
    const order = db.approveOrderPayment(req.params.orderId, { deliveredCards, deliveryNotes });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Payment approved. Card information successfully delivered to client.', order });
  });

  app.post('/api/admin/orders/:orderId/reject-payment', requireAdmin, (req, res) => {
    const { reason } = req.body;
    const order = db.rejectOrderPayment(req.params.orderId, reason || 'Transaction could not be verified on TRC20 network');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Payment rejected.', order });
  });

  app.put('/api/admin/orders/:orderId/status', requireAdmin, (req, res) => {
    const { paymentStatus, orderStatus } = req.body;
    const order = db.updateOrderStatus(req.params.orderId, { paymentStatus, orderStatus });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const p = req.body;
    if (!p.name || !p.price || !p.value) {
      return res.status(400).json({ error: 'Product name, value, and price are required' });
    }
    const newProduct: Product = {
      id: 'prod_' + Math.random().toString(36).substring(2, 9),
      name: p.name,
      brand: p.brand || 'Visa',
      category: p.category || 'Visa',
      cardType: p.cardType || 'Standard',
      value: parseFloat(p.value),
      price: parseFloat(p.price),
      region: p.region || 'US',
      image: p.image || '/cards/visa-100.png',
      description: p.description || '',
      terms: p.terms || 'Standard prepaid card terms apply.',
      availability: p.availability || 'in_stock',
      stockCount: parseInt(p.stockCount, 10) || 50,
      seller: p.seller || 'CardVault Official',
      rating: parseFloat(p.rating) || 4.9,
      ratingCount: parseInt(p.ratingCount, 10) || 10,
      createdAt: new Date().toISOString()
    };
    const created = db.createProduct(newProduct);
    res.status(201).json(created);
  });

  app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const success = db.deleteProduct(req.params.id);
    if (!success) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  });

  app.get('/api/admin/inventory', requireAdmin, (req, res) => {
    const inv = db.getInventory();
    res.json(inv);
  });

  app.post('/api/admin/inventory/add', requireAdmin, (req, res) => {
    const { productId, tokens } = req.body;
    const product = db.getProductById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!tokens || !Array.isArray(tokens)) return res.status(400).json({ error: 'Tokens array is required' });

    const entries = tokens.map((token: string) => ({
      productId,
      productName: product.name,
      tokenReference: token.trim()
    }));

    db.addInventoryTokens(entries);
    res.json({ message: `${entries.length} reference tokens added successfully` });
  });

  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const users = db.getUsers();
    res.json(users);
  });

  app.put('/api/admin/users/:id/status', requireAdmin, (req, res) => {
    const { status } = req.body;
    const ok = db.updateUserStatus(req.params.id, status);
    if (!ok) return res.status(404).json({ error: 'User not found' });
    res.json({ message: `User status updated to ${status}` });
  });

  app.get('/api/admin/settings', requireAdmin, (req, res) => {
    res.json(db.getSettings());
  });

  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  });

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
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
    console.log(`CardVault server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
