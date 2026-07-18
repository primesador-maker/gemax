const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ============ BACKEND ============
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, '[]');
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');
function readJSON(fp) { try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch(e) { return []; } }
function writeJSON(fp, data) { fs.writeFileSync(fp, JSON.stringify(data, null, 2)); }

function initProducts() {
    const products = readJSON(PRODUCTS_FILE);
    if (products.length === 0) {
        const myProducts = [
            {id:Date.now(),name:"JBL tune 510BT",category:"Electronics",gender:"Unisex",price:7200,stock:999,description:"40 hours battery life",images:["https://i.ibb.co/tpB9PhZ5/Gemini-Generated-Image-1pl06t1pl06t1pl0.png"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+1,name:"Apex magnetic chess",category:"Others",gender:"Unisex",price:3800,stock:999,description:"Magnetic board game",images:["https://i.ibb.co/mrD9kh5P/Gemini-Generated-Image-ab011oab011oab01.png"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+2,name:"Nike Vapor 12 Mercurial",category:"Shoes",gender:"Male",price:6400,stock:999,description:"Size 43 EU",images:["https://i.ibb.co/s9knrPZd/Gemini-Generated-Image-gkho2jgkho2jgkho.png"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+3,name:"Pablo Raez men watch",category:"Watches",gender:"Male",price:3990,stock:999,description:"Heavy and high quality",images:["https://i.ibb.co/chcQcR48/photo-2026-06-27-18-52-07.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()},
            {id:Date.now()+4,name:"Purse",category:"Bags",gender:"Female",price:3200,stock:999,description:"Fabulous design",images:["https://i.ibb.co/jv3vbdhj/photo-2026-06-25-11-07-13.jpg"],is_sold:false,is_hidden:false,created_at:new Date().toISOString()}
        ];
        writeJSON(PRODUCTS_FILE, myProducts);
        console.log('✅ 5 products loaded');
    }
}
initProducts();

app.get('/api/products', (req, res) => { const p = readJSON(PRODUCTS_FILE); res.json({ products: p.filter(x => !x.is_hidden) }); });
app.post('/api/products', (req, res) => { const p = readJSON(PRODUCTS_FILE); const np = { id: Date.now(), ...req.body, created_at: new Date().toISOString() }; p.push(np); writeJSON(PRODUCTS_FILE, p); res.json(np); });
app.put('/api/products/:id', (req, res) => { const p = readJSON(PRODUCTS_FILE); const i = p.findIndex(x => x.id === parseInt(req.params.id)); if (i !== -1) { if (req.body.stock_increment) { p[i].stock += req.body.stock_increment; if (p[i].stock > 0) p[i].is_sold = false; } else { p[i] = { ...p[i], ...req.body }; } writeJSON(PRODUCTS_FILE, p); res.json(p[i]); } else res.status(404).json({ error: 'Not found' }); });
app.delete('/api/products/:id', (req, res) => { let p = readJSON(PRODUCTS_FILE); p = p.filter(x => x.id !== parseInt(req.params.id)); writeJSON(PRODUCTS_FILE, p); res.json({ success: true }); });
app.post('/api/orders', (req, res) => { const o = readJSON(ORDERS_FILE); const { customer_id, customer_name, customer_username, items, timestamp } = req.body; const total = items.reduce((s, i) => s + (i.price * i.quantity), 0); const no = { id: 'ORD-' + Date.now(), customer_id: String(customer_id), customer_name, customer_username, items, total, status: 'pending', payment_method: 'Telebirr', timestamp: timestamp || new Date().toISOString(), created_at: new Date().toISOString() }; o.push(no); writeJSON(ORDERS_FILE, o); res.json({ order_id: no.id, total }); });
app.get('/api/orders', (req, res) => { const o = readJSON(ORDERS_FILE); const { customer_id, all } = req.query; if (all === 'true') res.json(o); else if (customer_id) res.json(o.filter(x => String(x.customer_id) === String(customer_id))); else res.status(400).json({ error: 'customer_id required' }); });
app.put('/api/orders/:id/status', (req, res) => { const o = readJSON(ORDERS_FILE); const x = o.find(y => y.id === req.params.id); if (x) { x.status = req.body.status; writeJSON(ORDERS_FILE, o); res.json(x); } else res.status(404).json({ error: 'Not found' }); });
app.post('/api/admin/login', (req, res) => { if (req.body.password === (process.env.ADMIN_PASSWORD || 'sadmin')) res.json({ token: 'admin_' + Date.now() }); else res.status(401).json({ error: 'Wrong password' }); });
app.get('/health', (req, res) => { const p = readJSON(PRODUCTS_FILE); const o = readJSON(ORDERS_FILE); res.json({ status: 'OK', products: p.length, orders: o.length }); });

// ============ BOT ============
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const ADMIN_ID = 7715442708;
const MINI_APP_URL = 'https://primesador-maker.github.io/gemax/';
const BACKEND_URL = 'https://gemax-combined.onrender.com';
const BASE_URL = 'https://api.telegram.org/bot' + BOT_TOKEN;
let lastUpdateId = 0;
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTIFIED_FILE = path.join(DATA_DIR, 'notified.json');
let userIds = new Set();
let notifiedOrders = new Set();
if (fs.existsSync(USERS_FILE)) { try { userIds = new Set(JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))) } catch(e) {} }
if (fs.existsSync(NOTIFIED_FILE)) { try { notifiedOrders = new Set(JSON.parse(fs.readFileSync(NOTIFIED_FILE, 'utf8'))) } catch(e) {} }
function saveUsers() { fs.writeFileSync(USERS_FILE, JSON.stringify([...userIds]), 'utf8') }
function saveNotified() { fs.writeFileSync(NOTIFIED_FILE, JSON.stringify([...notifiedOrders]), 'utf8') }

async function apiCall(method, body) { try { const r = await fetch(BASE_URL + '/' + method, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return await r.json(); } catch(e) { return null } }

async function getUpdates() { try { const r = await fetch(BASE_URL + '/getUpdates?offset=' + (lastUpdateId + 1) + '&timeout=10'); const d = await r.json(); if (d.ok && d.result.length > 0) { for (const u of d.result) { lastUpdateId = u.update_id; handleUpdate(u); } } } catch(e) {} setTimeout(getUpdates, 500) }

async function checkNewOrders() { try { const r = await fetch(BACKEND_URL + '/api/orders?all=true'); const orders = await r.json(); for (const order of orders) { if (!notifiedOrders.has(order.id)) { notifiedOrders.add(order.id); saveNotified(); var itemsList = ''; for (var i = 0; i < order.items.length; i++) { var item = order.items[i]; itemsList += '• ' + item.name + ' ×' + item.quantity + ' = ' + (item.price * item.quantity) + ' Birr\n'; } await apiCall('sendMessage', { chat_id: ADMIN_ID, text: '🔔 NEW ORDER!\n\n🆔 #' + order.id + '\n👤 ' + order.customer_username + '\n📱 ID: ' + order.customer_id + '\n\n📦 Items:\n' + itemsList + '\n💰 Total: ' + order.total + ' Birr\n\n🕐 ' + (order.timestamp || 'Just now') + '\n\n⏱️ Arrival: 15-30 days\n💳 Telebirr: +251990066832 (Biruk)\n\n⏳ Status: Pending' }); console.log('✅ Admin notified for order ' + order.id); } } } catch(e) {} setTimeout(checkNewOrders, 10000) }

function handleUpdate(update) { if (update.message) { var msg = update.message; var chatId = msg.chat.id; var text = msg.text || ''; var username = msg.from && msg.from.username ? '@' + msg.from.username : 'Customer'; var userId = msg.from && msg.from.id; if (userId) { userIds.add(userId); saveUsers() } if (text === '/start' || text === '/Start' || text === 'start' || text.startsWith('/start ')) { apiCall('sendMessage', { chat_id: chatId, text: '💎 Welcome to GEMAX Store, ' + username + '!\n\n✨ Quality to the Max\n\n🛍️ Browse 50+ products\n⏱️ Arrival: 15-30 days\n💳 Pay via Telebirr\n🤝 Meetup after payment\n\n📢 Channel: @Gemax_shopping\n\n👇 Start shopping:', reply_markup: JSON.stringify({ inline_keyboard: [[{ text: '💎 OPEN GEMAX STORE', web_app: { url: MINI_APP_URL } }],[{ text: '📞 Contact Support', url: 'https://t.me/gem_core' }]] }) }); return } if (text === '/help' || text === '/Help' || text === 'help') { apiCall('sendMessage', { chat_id: chatId, text: '💎 GEMAX Store Help\n\n✨ Quality to the Max\n\n🛍️ How to Order:\n• Click OPEN GEMAX STORE\n• Browse products\n• Add to cart\n• Place order\n\n⏱️ Arrival: 15-30 days\n💳 Pay via Telebirr\n🤝 Meetup after payment\n\n📞 Support: @gem_core\n📢 Channel: @Gemax_shopping', reply_markup: JSON.stringify({ inline_keyboard: [[{ text: '💎 OPEN GEMAX STORE', web_app: { url: MINI_APP_URL } }]] }) }); return } if (text.startsWith('/broadcast ') && String(userId) === String(ADMIN_ID)) { var bm = text.replace('/broadcast ', ''); var sent = 0; (async function(){ for (var uid of userIds) { try { var r = await apiCall('sendMessage', { chat_id: uid, text: '📢 GEMAX Store\n\n' + bm }); if (r && r.ok) sent++; await new Promise(r => setTimeout(r, 200)); } catch(e) {} } apiCall('sendMessage', { chat_id: chatId, text: '✅ Broadcast sent to ' + sent + '/' + userIds.size + ' users!' }); })(); return } if (text === '/count' && String(userId) === String(ADMIN_ID)) { apiCall('sendMessage', { chat_id: chatId, text: '📊 Total bot users: ' + userIds.size }); return } } }

console.log('🤖 GEMAX Combined Server starting...');
getUpdates();
checkNewOrders();

app.listen(PORT, () => console.log('✅ GEMAX Combined Server on port ' + PORT + ' | Backend + Bot together!'));
