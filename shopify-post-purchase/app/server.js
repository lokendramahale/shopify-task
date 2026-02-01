import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import {connectDB} from './db.server';
import Shop from './models/Shop.js';

// Connect to MongoDB
connectDB();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static('frontend'));

// ============================================
// INSTALLATION ROUTES
// ============================================

/**
 * GET /auth
 * Simulates the OAuth installation flow
 * In production, this would redirect to Shopify's OAuth page
 */
app.get('/auth', async (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' });
  }
  
  // In a real app, you'd redirect to Shopify OAuth here
  // For this demo, we'll simulate installation
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Install App</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        button { background: #5c6ac4; color: white; border: none; padding: 12px 24px; font-size: 16px; cursor: pointer; border-radius: 4px; }
        button:hover { background: #4959bd; }
      </style>
    </head>
    <body>
      <h1>Install Post-Purchase App</h1>
      <p>Shop: <strong>${shop}</strong></p>
      <button onclick="install()">Install App</button>
      
      <script>
        async function install() {
          const response = await fetch('/auth/callback?shop=${shop}');
          const data = await response.json();
          if (data.success) {
            alert('App installed successfully!');
            window.location.href = '/admin?shop=${shop}';
          }
        }
      </script>
    </body>
    </html>
  `);
});

/**
 * GET /auth/callback
 * Handles the OAuth callback and saves shop info
 */
app.get('/auth/callback', async (req, res) => {
  const { shop } = req.query;
  
  try {
    // Check if shop already exists
    let shopRecord = await Shop.findOne({ shopDomain: shop });
    
    if (!shopRecord) {
      // Create new shop record
      shopRecord = new Shop({
        shopDomain: shop,
        installedAt: new Date(),
        message: "Thank you for your purchase! You'll receive a special discount code via email for your next order."
      });
      await shopRecord.save();
      console.log(`✅ New shop installed: ${shop}`);
    } else {
      console.log(`ℹ️  Shop already exists: ${shop}`);
    }
    
    res.json({ success: true, shop: shopRecord });
  } catch (error) {
    console.error('Error during installation:', error);
    res.status(500).json({ error: 'Installation failed', details: error.message });
  }
});

// ============================================
// ADMIN API ROUTES
// ============================================

/**
 * GET /api/message
 * Retrieves the saved message for a shop
 */
app.get('/api/message', async (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' });
  }
  
  try {
    const shopRecord = await Shop.findOne({ shopDomain: shop });
    
    if (!shopRecord) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    res.json({ 
      message: shopRecord.message,
      shopDomain: shopRecord.shopDomain,
      installedAt: shopRecord.installedAt
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message', details: error.message });
  }
});

/**
 * POST /api/message
 * Updates the post-purchase message for a shop
 */
app.post('/api/message', async (req, res) => {
  const { shop, message } = req.body;
  
  if (!shop || !message) {
    return res.status(400).json({ error: 'Shop and message are required' });
  }
  
  try {
    const shopRecord = await Shop.findOneAndUpdate(
      { shopDomain: shop },
      { message: message },
      { new: true }
    );
    
    if (!shopRecord) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    console.log(`✅ Message updated for shop: ${shop}`);
    res.json({ 
      success: true, 
      message: shopRecord.message,
      shopDomain: shopRecord.shopDomain 
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message', details: error.message });
  }
});

// ============================================
// EXTENSION API ROUTES
// ============================================

/**
 * GET /api/extension/message
 * Used by the post-purchase extension to fetch the message
 * This endpoint would be called from the Shopify checkout extension
 */
app.get('/api/extension/message', async (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    // Return default message if no shop specified
    return res.json({ 
      message: "Thank you for your purchase!" 
    });
  }
  
  try {
    const shopRecord = await Shop.findOne({ shopDomain: shop });
    
    if (!shopRecord) {
      return res.json({ 
        message: "Thank you for your purchase!" 
      });
    }
    
    res.json({ 
      message: shopRecord.message 
    });
  } catch (error) {
    console.error('Error fetching extension message:', error);
    // Return default message on error
    res.json({ 
      message: "Thank you for your purchase!" 
    });
  }
});

// ============================================
// WEBHOOK ROUTES (Optional - for uninstall)
// ============================================

/**
 * POST /webhooks/app/uninstalled
 * Handles app uninstallation
 */
app.post('/webhooks/app/uninstalled', async (req, res) => {
  const { shop_domain } = req.body;
  
  try {
    await Shop.findOneAndDelete({ shopDomain: shop_domain });
    console.log(`🗑️  Shop uninstalled and removed: ${shop_domain}`);
    res.status(200).send();
  } catch (error) {
    console.error('Error handling uninstall:', error);
    res.status(500).send();
  }
});

// ============================================
// ADMIN DASHBOARD ROUTE
// ============================================

/**
 * GET /admin
 * Serves the admin dashboard
 */
app.get('/admin', (req, res) => {
  const { shop } = req.query;
  res.sendFile(new URL('../frontend/index.html', import.meta.url).pathname);
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

// ============================================
// ROOT ROUTE
// ============================================

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Shopify Post-Purchase App</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #5c6ac4; }
        .card { background: #f6f6f7; padding: 20px; margin: 20px 0; border-radius: 8px; }
        a { color: #5c6ac4; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>Shopify Post-Purchase App</h1>
      <div class="card">
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/auth?shop=example-store.myshopify.com">Install App (Demo)</a></li>
          <li><a href="/admin?shop=example-store.myshopify.com">Admin Dashboard</a></li>
          <li><a href="/health">Health Check</a></li>
        </ul>
      </div>
      <div class="card">
        <h2>API Endpoints</h2>
        <ul>
          <li>GET /api/message?shop=example-store.myshopify.com</li>
          <li>POST /api/message (body: {shop, message})</li>
          <li>GET /api/extension/message?shop=example-store.myshopify.com</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI}`);
});

export default app;