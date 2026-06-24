const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Data folder
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Initialize files
if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, '[]');
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');

// Helpers
function readJSON(fp) {
    try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
    catch(e) { return []; }
}

function writeJSON(fp, data) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
}

// Add sample products if empty
function initSamples() {
    const products = readJSON(PRODUCTS_FILE);
    if (products.length === 0) {
        const samples = [
            {id:Date.now(),name:"Trendy Crossbody Bag",category:"Bags",gender:"Female",price:850,stock:10,description:"Stylish crossbody bag perfect for everyday use.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Crossbody+Bag"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+1,name:"Classic Leather Wallet",category:"Bags",gender:"Male",price:450,stock:15,description:"Genuine leather wallet with multiple card slots.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Wallet"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+2,name:"Elegant Evening Dress",category:"Clothes",gender:"Female",price:1200,stock:5,description:"Beautiful evening dress for special occasions.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Evening+Dress"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+3,name:"Casual Linen Shirt",category:"Clothes",gender:"Male",price:650,stock:12,description:"Comfortable linen shirt for casual wear.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Linen+Shirt"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+4,name:"Gold Plated Necklace Set",category:"Jewelry",gender:"Female",price:950,stock:7,description:"Elegant gold plated necklace with matching earrings.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Necklace+Set"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+5,name:"Silver Chain Bracelet",category:"Jewelry",gender:"Unisex",price:550,stock:20,description:"Classic silver chain bracelet for any occasion.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Bracelet"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+6,name:"Arabian Oud Classic",category:"Perfumes",gender:"Unisex",price:750,stock:10,description:"Premium Arabian oud perfume. Long-lasting fragrance.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Oud"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+7,name:"Rose Gold Perfume",category:"Perfumes",gender:"Female",price:480,stock:15,description:"Delicate rose gold perfume. Elegant and feminine.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Rose+Perfume"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+8,name:"Wireless Earbuds Pro",category:"Electronics",gender:"Unisex",price:1500,stock:8,description:"Premium wireless earbuds with crystal clear sound.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Earbuds"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+9,name:"Fast Charging Cable",category:"Electronics",gender:"Unisex",price:350,stock:30,description:"High-speed charging cable compatible with all devices.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Charger"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+10,name:"Crystal Phone Case",category:"Others",gender:"Female",price:280,stock:25,description:"Sparkling crystal phone case. Available for all models.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Phone+Case"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+11,name:"Premium Keychain Set",category:"Others",gender:"Unisex",price:180,stock:40,description:"Stylish keychain set. Perfect gift for anyone.",images:["https://placehold.co/400x400/AA7C11/F9F6F0?text=Keychain"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()}
        ];
        writeJSON(PRODUCTS_FILE, samples);
        console.log('✅ 12 sample products added');
    }
}

initSamples();

// ==================== PRODUCTS ====================
app.get('/api/products', (req, res) => {
    const products = readJSON(PRODUCTS_FILE);
    res.json({ products: products.filter(p => !p.is_hidden) });
});

app.post('/api/products', (req, res) => {
    const products = readJSON(PRODUCTS_FILE);
    const np = { id: Date.now(), ...req.body, created_at: new Date().toISOString() };
    products.push(np);
    writeJSON(PRODUCTS_FILE, products);
    res.json(np);
});

app.put('/api/products/:id', (req, res) => {
    const products = readJSON(PRODUCTS_FILE);
    const i = products.findIndex(p => p.id === parseInt(req.params.id));
    if (i !== -1) {
        if (req.body.stock_increment) {
            products[i].stock += req.body.stock_increment;
            if (products[i].stock > 0) products[i].is_sold = false;
        } else {
            products[i] = { ...products[i], ...req.body };
        }
        writeJSON(PRODUCTS_FILE, products);
        res.json(products[i]);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    let products = readJSON(PRODUCTS_FILE);
    products = products.filter(p => p.id !== parseInt(req.params.id));
    writeJSON(PRODUCTS_FILE, products);
    res.json({ success: true });
});

// ==================== ORDERS ====================
app.post('/api/orders', (req, res) => {
    const orders = readJSON(ORDERS_FILE);
    const { customer_id, customer_name, customer_username, items } = req.body;
    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    
    const no = {
        id: 'ORD-' + Date.now(),
        customer_id: String(customer_id),
        customer_name,
        customer_username,
        items,
        total,
        status: 'pending',
        payment_method: 'Telebirr',
        created_at: new Date().toISOString()
    };
    
    orders.push(no);
    writeJSON(ORDERS_FILE, orders);
    
    // Update stock
    const products = readJSON(PRODUCTS_FILE);
    items.forEach(item => {
        const p = products.find(x => x.id === item.product_id);
        if (p) {
            p.stock = Math.max(0, p.stock - item.quantity);
            if (p.stock === 0) p.is_sold = true;
        }
    });
    writeJSON(PRODUCTS_FILE, products);
    
    res.json({ order_id: no.id, total });
});

app.get('/api/orders', (req, res) => {
    const orders = readJSON(ORDERS_FILE);
    const { customer_id, all } = req.query;
    
    if (all === 'true') {
        res.json(orders);
    } else if (customer_id) {
        res.json(orders.filter(o => String(o.customer_id) === String(customer_id)));
    } else {
        res.status(400).json({ error: 'customer_id required' });
    }
});

app.put('/api/orders/:id/status', (req, res) => {
    const orders = readJSON(ORDERS_FILE);
    const o = orders.find(x => x.id === req.params.id);
    if (o) {
        o.status = req.body.status;
        writeJSON(ORDERS_FILE, orders);
        res.json(o);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// ==================== ADMIN ====================
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === (process.env.ADMIN_PASSWORD || 'sadmin')) {
        res.json({ token: 'admin_' + Date.now() });
    } else {
        res.status(401).json({ error: 'Wrong password' });
    }
});

// ==================== HEALTH ====================
app.get('/health', (req, res) => {
    const p = readJSON(PRODUCTS_FILE);
    const o = readJSON(ORDERS_FILE);
    res.json({ status: 'OK', products: p.length, orders: o.length });
});

app.listen(PORT, () => console.log(`✅ GEMAX Backend on port ${PORT}`));
