const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, '[]');
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');

function readJSON(fp) {
    try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
    catch(e) { return []; }
}

function writeJSON(fp, data) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
}

console.log('✅ GEMAX Backend Ready');

// PRODUCTS
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

// ORDERS
app.post('/api/orders', (req, res) => {
    const orders = readJSON(ORDERS_FILE);
    const { customer_id, customer_name, customer_username, items, timestamp } = req.body;
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
        timestamp: timestamp || new Date().toISOString(),
        created_at: new Date().toISOString()
    };
    
    orders.push(no);
    writeJSON(ORDERS_FILE, orders);
    
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

// ADMIN
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === (process.env.ADMIN_PASSWORD || 'sadmin')) {
        res.json({ token: 'admin_' + Date.now() });
    } else {
        res.status(401).json({ error: 'Wrong password' });
    }
});

// HEALTH
app.get('/health', (req, res) => {
    const p = readJSON(PRODUCTS_FILE);
    const o = readJSON(ORDERS_FILE);
    res.json({ status: 'OK', products: p.length, orders: o.length });
});

app.listen(PORT, () => console.log(`✅ GEMAX Backend on port ${PORT}`));h
