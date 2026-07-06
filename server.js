const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

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

// Initialize with YOUR 50 products
function initProducts() {
    const products = readJSON(PRODUCTS_FILE);
    if (products.length === 0) {
        const myProducts = [
            {id:Date.now(),name:"JBL tune 510BT",category:"Electronics",gender:"Unisex",price:7200,stock:999,description:"40 hours battery life, 5 minute charge = 2 hours of use",images:["https://i.ibb.co/tpB9PhZ5/Gemini-Generated-Image-1pl06t1pl06t1pl0.png"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+1,name:"Apex magnetic chess",category:"Others",gender:"Unisex",price:3800,stock:999,description:"Magnetic board game",images:["https://i.ibb.co/mrD9kh5P/Gemini-Generated-Image-ab011oab011oab01.png"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+2,name:"Nike Vapor 12 Mercurial soccer cleats",category:"Shoes",gender:"Male",price:6400,stock:999,description:"Slightly used, size 43 EU",images:["https://i.ibb.co/s9knrPZd/Gemini-Generated-Image-gkho2jgkho2jgkho.png"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+3,name:"Pablo Raez men watch",category:"Watches",gender:"Male",price:3990,stock:999,description:"Heavy and high quality",images:["https://i.ibb.co/chcQcR48/photo-2026-06-27-18-52-07.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+4,name:"Purse",category:"Bags",gender:"Female",price:3200,stock:999,description:"Fabulous design",images:["https://i.ibb.co/jv3vbdhj/photo-2026-06-25-11-07-13.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+5,name:"Purse",category:"Bags",gender:"Female",price:3200,stock:999,description:"Fabulous design",images:["https://i.ibb.co/C3mxXz4n/photo-2026-06-25-11-10-06.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+6,name:"Purse",category:"Bags",gender:"Female",price:3200,stock:999,description:"Fabulous design",images:["https://i.ibb.co/Rkyf92dG/photo-2026-06-25-11-07-18.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+7,name:"Short sleeve crew neck T-shirt",category:"Clothes",gender:"Female",price:5200,stock:999,description:"Elongation > 10%",images:["https://i.ibb.co/rRVq9G1F/photo-2026-06-30-12-45-56.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+8,name:"Geneva men watch",category:"Watches",gender:"Male",price:2750,stock:999,description:"Men's Wrist Watch With Calendar Function, Fashionable Round Dial, Quartz Movement, PU Strap",images:["https://i.ibb.co/GQQHg7ff/Gemini-Generated-Image-9kft8m9kft8m9kft.png"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+9,name:"Watch",category:"Watches",gender:"Male",price:2100,stock:999,description:"Men Watch 3 Accessories, Minimalist Design, Suitable For Formal And Daily Occasions",images:["https://i.ibb.co/Q32qBHYD/Gemini-Generated-Image-ooo10rooo10rooo1.png"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+10,name:"Hand bag for women",category:"Bags",gender:"Female",price:3950,stock:999,description:"Available in different materials and colors DM us",images:["https://i.ibb.co/4vvXdpm/photo-2026-06-29-18-32-01.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+11,name:"Tote bag for women",category:"Bags",gender:"Female",price:3850,stock:999,description:"Available in different design",images:["https://i.ibb.co/dsbZXBbW/photo-2026-06-30-12-48-29.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+12,name:"Necklace and earrings",category:"Jewelry",gender:"Female",price:1800,stock:999,description:"Necklace comes with free matching earrings",images:["https://i.ibb.co/Ndpgybyb/photo-2026-06-27-19-19-37.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+13,name:"Necklace and earrings",category:"Jewelry",gender:"Female",price:1800,stock:999,description:"Necklace comes with free matching earrings",images:["https://i.ibb.co/XZcD1MM4/photo-2026-06-27-19-19-42.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+14,name:"Necklace and earrings",category:"Jewelry",gender:"Female",price:1800,stock:999,description:"Necklace comes with free matching earrings",images:["https://i.ibb.co/bjnbsDcx/photo-2026-06-27-19-19-44.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+15,name:"Necklace and earrings",category:"Jewelry",gender:"Female",price:1800,stock:999,description:"Necklace with free earrings",images:["https://i.ibb.co/fzvj9Msg/photo-2026-06-27-19-19-47.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+16,name:"Earrings",category:"Jewelry",gender:"Female",price:700,stock:999,description:"Stainless steel",images:["https://i.ibb.co/hR8rcqgv/photo-2026-06-30-15-20-18.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+17,name:"Earrings",category:"Jewelry",gender:"Female",price:700,stock:999,description:"Stainless steel",images:["https://i.ibb.co/hFG3jZdj/photo-2026-06-30-15-20-24.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+18,name:"Earrings",category:"Jewelry",gender:"Female",price:700,stock:999,description:"Stainless steel",images:["https://i.ibb.co/cSqvjbYz/photo-2026-06-30-15-20-27.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+19,name:"Earrings",category:"Jewelry",gender:"Female",price:700,stock:999,description:"Stainless steel",images:["https://i.ibb.co/5XhYnLMT/photo-2026-06-30-15-20-31.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+20,name:"Earrings",category:"Jewelry",gender:"Female",price:700,stock:999,description:"Stainless steel",images:["https://i.ibb.co/x8KzsJsT/photo-2026-06-30-15-20-37.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+21,name:"Pablo raez men watch",category:"Watches",gender:"Male",price:3999,stock:999,description:"Long battery life",images:["https://i.ibb.co/s91nvQvz/Gemini-Generated-Image-vpyy0yvpyy0yvpyy.png"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+22,name:"Hand fan",category:"Electronics",gender:"Unisex",price:2999,stock:999,description:"Portable hand fan",images:["https://i.ibb.co/NbYM1fG/photo-2026-06-26-11-19-38.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+23,name:"Women knight wear",category:"Clothes",gender:"Female",price:3750,stock:999,description:"Full set top and bottom",images:["https://i.ibb.co/HymzLhb/photo-2026-06-25-11-19-29.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+24,name:"Men watch",category:"Watches",gender:"Male",price:3999,stock:999,description:"Comes with adjusting tool",images:["https://i.ibb.co/DHQW77R1/photo-2026-06-27-19-01-55.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+25,name:"Earrings and necklace",category:"Jewelry",gender:"Female",price:1700,stock:999,description:"Casual and fashion design",images:["https://i.ibb.co/BV414tNz/photo-2026-06-27-19-19-03.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+26,name:"Earrings",category:"Jewelry",gender:"Female",price:1650,stock:999,description:"3 pcs choose your favorite",images:["https://i.ibb.co/gLBHWrZT/photo-2026-06-27-19-19-07.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+27,name:"Bag for women",category:"Bags",gender:"Female",price:3950,stock:999,description:"Recommended for women",images:["https://i.ibb.co/Fqjw9WHQ/photo-2026-06-27-19-20-36.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+28,name:"Bracelet set",category:"Jewelry",gender:"Female",price:1600,stock:999,description:"3 pcs bracelet set",images:["https://i.ibb.co/KpbL3DfT/photo-2026-06-27-19-22-28.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+29,name:"Phone case",category:"Others",gender:"Female",price:1850,stock:999,description:"Mirror back",images:["https://i.ibb.co/8Lnqtvzz/photo-2026-06-30-12-45-34.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+30,name:"GRVTY Visions beany",category:"Clothes",gender:"Unisex",price:2300,stock:999,description:"Drip style",images:["https://i.ibb.co/NgQ71ztK/photo-2026-06-30-12-47-57.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+31,name:"Women's bag",category:"Bags",gender:"Female",price:3950,stock:999,description:"Casual style",images:["https://i.ibb.co/jkhpHBwy/photo-2026-06-30-12-48-33.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+32,name:"Hair clip",category:"Others",gender:"Female",price:2000,stock:999,description:"20 pcs",images:["https://i.ibb.co/QjDj91WM/photo-2026-06-30-15-25-18.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+33,name:"Sweat pants",category:"Clothes",gender:"Female",price:3950,stock:999,description:"Wide leg sweat pants. Available in blue and different designs",images:["https://i.ibb.co/Kzy1brwg/photo-2026-07-01-10-26-01.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+34,name:"Men's watch",category:"Watches",gender:"Male",price:2950,stock:999,description:"Comes with Bracelet",images:["https://i.ibb.co/Wj9zpfN/photo-2026-06-30-15-21-08.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+35,name:"Men's watch",category:"Watches",gender:"Male",price:3100,stock:999,description:"Comes with watch and 4 bracelets",images:["https://i.ibb.co/zVZb3Gg7/photo-2026-06-30-15-21-11.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+36,name:"Men's watch",category:"Watches",gender:"Male",price:3100,stock:999,description:"Comes with watch and 4 bracelets",images:["https://i.ibb.co/C52V4Fn0/photo-2026-06-30-15-21-14.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+37,name:"Men's Jewelry set",category:"Jewelry",gender:"Male",price:2950,stock:999,description:"4 in 1 Ring, Watch, Necklace and Bracelet",images:["https://i.ibb.co/fztjbBty/photo-2026-06-30-15-21-17.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+38,name:"Men's Jewelry set",category:"Jewelry",gender:"Male",price:2950,stock:999,description:"4 in 1 Ring, Watch, Necklace and Bracelet",images:["https://i.ibb.co/WJRFPJ9/photo-2026-06-30-15-21-22.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+39,name:"Bracelet",category:"Jewelry",gender:"Male",price:1800,stock:999,description:"3 pcs of bracelet",images:["https://i.ibb.co/Q3mCMG6R/photo-2026-06-30-15-21-47.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+40,name:"Bracelet",category:"Jewelry",gender:"Male",price:2400,stock:999,description:"3 pcs of bracelet",images:["https://i.ibb.co/SZBwmMT/photo-2026-06-30-15-22-00.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+41,name:"Bracelet",category:"Jewelry",gender:"Male",price:1800,stock:999,description:"4 pcs of bracelet",images:["https://i.ibb.co/5g915NFh/photo-2026-06-30-15-22-04.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+42,name:"Watch",category:"Watches",gender:"Male",price:2850,stock:999,description:"Comes with additional 3 bracelets",images:["https://i.ibb.co/CKRgRVnY/photo-2026-06-30-15-18-51.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+43,name:"Women's watch and jewelry set",category:"Watches",gender:"Female",price:2200,stock:999,description:"Comes with necklace, ring, earrings, bracelet and watch. Highly recommended for mother's day",images:["https://i.ibb.co/HMVtXdG/photo-2026-06-30-15-26-20.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+44,name:"Women's watch",category:"Watches",gender:"Female",price:2999,stock:999,description:"Comes with 4 bracelets",images:["https://i.ibb.co/xKKrZx0B/photo-2026-06-29-18-44-26.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+45,name:"Women's jewelry set",category:"Jewelry",gender:"Female",price:2999,stock:999,description:"Comes with bracelet, watch, necklace and earrings",images:["https://i.ibb.co/MbDcBH2/photo-2026-06-30-15-17-06.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+46,name:"2pcs of men watch",category:"Watches",gender:"Male",price:4200,stock:999,description:"Comes with two watches and two bracelets",images:["https://i.ibb.co/zVvLjWdG/photo-2026-06-30-15-18-56.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+47,name:"Eyelash curler",category:"Others",gender:"Female",price:950,stock:999,description:"Manual not electrical",images:["https://i.ibb.co/LdtbT7BL/photo-2026-06-30-15-17-22.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+48,name:"Foam Clogs (Crocs)",category:"Shoes",gender:"Unisex",price:3000,stock:999,description:"ITEM MAY NOT BE LIKE THE PICTURE. DM for more",images:["https://i.ibb.co/Y4YYcZk1/Gemini-Generated-Image-k5pp6bk5pp6bk5pp.png"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+49,name:"Belt",category:"Clothes",gender:"Male",price:2300,stock:999,description:"Available in different design. DM for more info",images:["https://i.ibb.co/1fP97KXy/photo-2026-06-30-15-21-31.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()}
        ];
        writeJSON(PRODUCTS_FILE, myProducts);
        console.log('✅ 50 products loaded');
    }
}

initProducts();

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
    } else res.status(404).json({ error: 'Not found' });
});

app.delete('/api/products/:id', (req, res) => {
    let products = readJSON(PRODUCTS_FILE);
    products = products.filter(p => p.id !== parseInt(req.params.id));
    writeJSON(PRODUCTS_FILE, products);
    res.json({ success: true });
});

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
    res.json({ order_id: no.id, total });
});

app.get('/api/orders', (req, res) => {
    const orders = readJSON(ORDERS_FILE);
    const { customer_id, all } = req.query;
    if (all === 'true') res.json(orders);
    else if (customer_id) res.json(orders.filter(o => String(o.customer_id) === String(customer_id)));
    else res.status(400).json({ error: 'customer_id required' });
});

app.put('/api/orders/:id/status', (req, res) => {
    const orders = readJSON(ORDERS_FILE);
    const o = orders.find(x => x.id === req.params.id);
    if (o) { o.status = req.body.status; writeJSON(ORDERS_FILE, orders); res.json(o); }
    else res.status(404).json({ error: 'Not found' });
});

app.post('/api/admin/login', (req, res) => {
    if (req.body.password === (process.env.ADMIN_PASSWORD || 'sadmin')) {
        res.json({ token: 'admin_' + Date.now() });
    } else res.status(401).json({ error: 'Wrong password' });
});

app.get('/health', (req, res) => {
    const p = readJSON(PRODUCTS_FILE);
    const o = readJSON(ORDERS_FILE);
    res.json({ status: 'OK', products: p.length, orders: o.length });
});

app.listen(PORT, () => console.log('✅ GEMAX Backend on port ' + PORT));
