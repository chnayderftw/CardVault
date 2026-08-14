import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { authenticate, optionalAuthenticate, requireAdmin, generateToken, AuthRequest } from './server/auth';
import { Product, Order, OrderItem, Payment } from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      store: 'CardVault'
    });
  });

  // Settings (Public)
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await db.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to load settings' });
    }
  });

  // Categories (Public)
  app.get('/api/categories', (req, res) => {
    const categories = db.getCategories();
    res.json(categories);
  });

  // Products (Public)
  app.get('/api/products', async (req, res) => {
    try {
      const { category, search, brand } = req.query as { category?: string; search?: string; brand?: string };
      const products = await db.getProducts({ category, search, brand });
      res.json(products);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await db.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (err: any) {
      console.error('Error fetching product details:', err);
      res.status(500).json({ error: 'Failed to fetch product details' });
    }
  });

  // QR Code generator for USDT TRC20 payment
  app.get('/api/payment/qr', async (req, res) => {
    try {
      const settings = await db.getSettings();
      const address = (req.query.address as string) || settings.usdtTrc20Address;
      const amount = req.query.amount as string;
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

  // Authentication: Register / Signup
  const handleRegister = async (req: express.Request, res: express.Response) => {
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

      const existing = await db.findUserByEmail(email);
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

      const safeUser = await db.createUser(newUser);
      const token = generateToken(safeUser);

      res.status(201).json({ user: safeUser, token });
    } catch (err: any) {
      console.error('Signup error:', err);
      res.status(500).json({ error: err.message || 'Signup failed' });
    }
  };

  app.post('/api/auth/signup', handleRegister);
  app.post('/api/auth/register', handleRegister);

  // Authentication: Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
      }

      const userRecord = await db.findUserByEmail(email);
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

  // Authentication: Get Current User
  app.get('/api/auth/me', authenticate, (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // Orders: Create Order Handler
  const handleCreateOrder = async (req: AuthRequest, res: express.Response) => {
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
        const product = await db.getProductById(it.productId);
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

      const settings = await db.getSettings();
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

      const created = await db.createOrder(newOrder);
      res.status(201).json(created);
    } catch (err: any) {
      console.error('Create order error:', err);
      res.status(500).json({ error: err.message || 'Failed to create order' });
    }
  };

  app.post('/api/orders/create', optionalAuthenticate, handleCreateOrder);
  app.post('/api/orders', optionalAuthenticate, handleCreateOrder);

  // Orders: Get User's Orders
  const handleGetMyOrders = async (req: AuthRequest, res: express.Response) => {
    try {
      const orders = await db.getOrders({ userId: req.user!.id });
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch user orders' });
    }
  };

  app.get('/api/orders/my-orders', authenticate, handleGetMyOrders);
  app.get('/api/orders', authenticate, handleGetMyOrders);

  // Orders: Get Single Order
  app.get('/api/orders/:orderId', optionalAuthenticate, async (req: AuthRequest, res) => {
    try {
      const order = await db.getOrderById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  // Submit TXID
  app.post('/api/orders/:orderId/submit-txid', async (req, res) => {
    try {
      const { txHash } = req.body;
      if (!txHash || txHash.trim().length < 10) {
        return res.status(400).json({ error: 'Please provide a valid TRON transaction hash (TXID)' });
      }

      const order = await db.submitTransactionHash(req.params.orderId, txHash.trim());
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        message: 'Transaction hash submitted successfully. Payment is now Pending Verification.',
        order
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to submit transaction hash' });
    }
  });

  // Payments: Create Payment Record
  app.post('/api/payments', optionalAuthenticate, async (req: AuthRequest, res) => {
    try {
      const { orderId, amount, currency, network, paymentAddress, transactionHash } = req.body;
      if (!orderId || !amount || !paymentAddress) {
        return res.status(400).json({ error: 'orderId, amount, and paymentAddress are required' });
      }

      const payment: Payment = {
        id: 'pay_' + Math.random().toString(36).substring(2, 10),
        orderId,
        userId: req.user ? req.user.id : undefined,
        amount: parseFloat(amount),
        currency: currency || 'USDT',
        network: network || 'TRC20',
        paymentAddress,
        transactionHash: transactionHash || undefined,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json(payment);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to record payment' });
    }
  });

  // Payments: Get Payment Status
  app.get('/api/payments/:id', optionalAuthenticate, async (req: AuthRequest, res) => {
    try {
      const payment = await db.getPaymentByOrderId(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json(payment);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to get payment status' });
    }
  });

  app.get('/api/payments/order/:orderId', optionalAuthenticate, async (req: AuthRequest, res) => {
    try {
      const payment = await db.getPaymentByOrderId(req.params.orderId);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json(payment);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to get payment' });
    }
  });

  // Admin APIs
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const stats = await db.getAdminStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to load stats' });
    }
  });

  app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
      const { status, search } = req.query as { status?: string; search?: string };
      const orders = await db.getOrders({ status, search });
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to load admin orders' });
    }
  });

  app.get('/api/admin/orders/:orderId', requireAdmin, async (req, res) => {
    try {
      const order = await db.getOrderById(req.params.orderId);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to load order' });
    }
  });

  app.post('/api/admin/orders/:orderId/approve-payment', requireAdmin, async (req, res) => {
    try {
      const { deliveredCards, deliveryNotes } = req.body || {};
      const order = await db.approveOrderPayment(req.params.orderId, { deliveredCards, deliveryNotes });
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json({ message: 'Payment approved. Card credentials successfully delivered to client.', order });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to approve payment' });
    }
  });

  app.post('/api/admin/orders/:orderId/reject-payment', requireAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      const order = await db.rejectOrderPayment(req.params.orderId, reason || 'Transaction could not be verified on TRC20 network');
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json({ message: 'Payment rejected.', order });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to reject payment' });
    }
  });

  app.put('/api/admin/orders/:orderId/status', requireAdmin, async (req, res) => {
    try {
      const { paymentStatus, orderStatus } = req.body;
      const order = await db.updateOrderStatus(req.params.orderId, { paymentStatus, orderStatus });
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Admin: View Payment Records
  app.get('/api/admin/payments', requireAdmin, async (req, res) => {
    try {
      const { status, search } = req.query as { status?: string; search?: string };
      const payments = await db.getPayments({ status, search });
      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to load payments' });
    }
  });

  // Admin: Create Product
  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    try {
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
        terms: p.terms || 'Standard card terms apply.',
        availability: p.availability || 'in_stock',
        stockCount: parseInt(p.stockCount, 10) || 50,
        seller: p.seller || 'CardVault Official',
        rating: parseFloat(p.rating) || 4.9,
        ratingCount: parseInt(p.ratingCount, 10) || 10,
        createdAt: new Date().toISOString()
      };
      const created = await db.createProduct(newProduct);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  // Admin: Update Product
  app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const updated = await db.updateProduct(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // Admin: Delete / Hide Product
  app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const success = await db.deleteProduct(req.params.id);
      if (!success) return res.status(404).json({ error: 'Product not found' });
      res.json({ message: 'Product removed successfully' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Admin: Inventory
  app.get('/api/admin/inventory', requireAdmin, async (req, res) => {
    try {
      const inv = await db.getInventory();
      res.json(inv);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to load inventory' });
    }
  });

  app.post('/api/admin/inventory/add', requireAdmin, async (req, res) => {
    try {
      const { productId, tokens } = req.body;
      const product = await db.getProductById(productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (!tokens || !Array.isArray(tokens)) return res.status(400).json({ error: 'Tokens array is required' });

      const entries = tokens.map((token: string) => ({
        productId,
        productName: product.name,
        tokenReference: token.trim()
      }));

      await db.addInventoryTokens(entries);
      res.json({ message: `${entries.length} reference tokens added successfully` });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to add inventory tokens' });
    }
  });

  // Admin: Users
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await db.getUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to load users' });
    }
  });

  app.put('/api/admin/users/:id/status', requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const ok = await db.updateUserStatus(req.params.id, status);
      if (!ok) return res.status(404).json({ error: 'User not found' });
      res.json({ message: `User status updated to ${status}` });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  // Admin: Settings
  app.get('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const s = await db.getSettings();
      res.json(s);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to load settings' });
    }
  });

  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const updated = await db.updateSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
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
