const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>💎 GEMAX Store Bot Running</h1>');
}).listen(PORT, () => console.log('🌐 Web server on port ' + PORT));

const BOT_TOKEN = process.env.BOT_TOKEN || '8798527679:AAGsF2R0m_iV_ThurVTf2CN9VecoCAV2rcU';
const ADMIN_ID = 7715442708;
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://primesador-maker.github.io/gemax/';
const BACKEND_URL = process.env.BACKEND_URL || 'https://gemax-backend.onrender.com';
const PAYMENT_PHONE = '+251990066832';
const PAYMENT_NAME = 'Biruk';
const SUPPORT_USERNAME = 'gem_core';
const CHANNEL = '@Gemax_shopping';

const BASE_URL = 'https://api.telegram.org/bot' + BOT_TOKEN;
let lastUpdateId = 0;
let lastOrderCheck = Date.now();

// Store users
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTIFIED_FILE = path.join(DATA_DIR, 'notified.json');
let userIds = new Set();
let notifiedOrders = new Set();
if (fs.existsSync(USERS_FILE)) { try { userIds = new Set(JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))) } catch(e) {} }
if (fs.existsSync(NOTIFIED_FILE)) { try { notifiedOrders = new Set(JSON.parse(fs.readFileSync(NOTIFIED_FILE, 'utf8'))) } catch(e) {} }
function saveUsers() { fs.writeFileSync(USERS_FILE, JSON.stringify([...userIds]), 'utf8') }
function saveNotified() { fs.writeFileSync(NOTIFIED_FILE, JSON.stringify([...notifiedOrders]), 'utf8') }

async function getUpdates() {
    try {
        const res = await fetch(BASE_URL + '/getUpdates?offset=' + (lastUpdateId + 1) + '&timeout=10');
        const data = await res.json();
        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                lastUpdateId = update.update_id;
                handleUpdate(update);
            }
        }
    } catch (e) { console.error('Polling error:', e.message) }
    setTimeout(getUpdates, 500);
}

async function checkNewOrders() {
    try {
        const res = await fetch(BACKEND_URL + '/api/orders?all=true');
        const orders = await res.json();
        for (const order of orders) {
            if (!notifiedOrders.has(order.id)) {
                notifiedOrders.add(order.id);
                saveNotified();
                
                // Notify Admin
                var itemsList = '';
                for (var i = 0; i < order.items.length; i++) {
                    var item = order.items[i];
                    itemsList += '• ' + item.name + ' ×' + item.quantity + ' = ' + (item.price * item.quantity) + ' Birr\n';
                }
                var adminMsg = '🔔 NEW ORDER!\n\n🆔 #' + order.id + '\n👤 ' + order.customer_username + '\n📱 ID: ' + order.customer_id + '\n\n📦 Items:\n' + itemsList + '\n💰 Total: ' + order.total + ' Birr\n\n🕐 ' + (order.timestamp || 'Just now') + '\n\n⏱️ Processing: 15-25 days\n💳 Telebirr: ' + PAYMENT_PHONE + ' (' + PAYMENT_NAME + ')\n\n⏳ Status: Pending';
                
                await sendMessage(ADMIN_ID, adminMsg);
                console.log('✅ Admin notified for order ' + order.id);
            }
        }
    } catch (e) { console.error('Order check error:', e.message) }
    setTimeout(checkNewOrders, 10000); // Check every 10 seconds
}

async function sendMessage(chatId, text, opts) {
    try {
        var body = { chat_id: chatId, text: text };
        if (opts && opts.reply_markup) body.reply_markup = JSON.stringify(opts.reply_markup);
        var response = await fetch(BASE_URL + '/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        var result = await response.json();
        if (!result.ok) console.error('Send error:', result.description);
        return result.ok;
    } catch (e) { console.error('Send error:', e.message); return false }
}

async function handleUpdate(update) {
    if (update.message) {
        var msg = update.message;
        var chatId = msg.chat.id;
        var text = msg.text || '';
        var username = msg.from && msg.from.username ? '@' + msg.from.username : 'Customer';
        var userId = msg.from && msg.from.id;

        if (userId) { userIds.add(userId); saveUsers() }

        if (text === '/start' || text === '/Start' || text === 'start') {
            var welcomeMsg = '💎 Welcome to GEMAX Store, ' + username + '!\n\n✨ Quality to the Max\n\n🛍️ Browse & order in Telegram\n⏱️ Processing: 15-25 days\n💳 Pay via Telebirr\n🤝 Meetup after payment\n\n📢 Channel: ' + CHANNEL + '\n\n👇 Start shopping:';
            sendMessage(chatId, welcomeMsg, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '💎 OPEN GEMAX STORE', web_app: { url: MINI_APP_URL } }],
                        [{ text: '📞 Contact Support', url: 'https://t.me/' + SUPPORT_USERNAME }]
                    ]
                }
            });
            return;
        }

        if (text === '/help' || text === '/Help' || text === 'help') {
            var helpMsg = '💎 GEMAX Store Help\n\n✨ Quality to the Max\n\n🛍️ How to Order:\n• Click OPEN GEMAX STORE\n• Browse products\n• Add to cart\n• Place order\n\n⏱️ Processing: 15-25 days\n💳 Pay via Telebirr\n🤝 Meetup after payment\n\n💳 Payment:\n📱 ' + PAYMENT_PHONE + '\n👤 ' + PAYMENT_NAME + '\n\n📞 Support: @' + SUPPORT_USERNAME + '\n📢 Channel: ' + CHANNEL;
            sendMessage(chatId, helpMsg, {
                reply_markup: {
                    inline_keyboard: [[{ text: '🛒 START SHOPPING', web_app: { url: MINI_APP_URL } }]]
                }
            });
            return;
        }

        if (text.startsWith('/broadcast ') && String(userId) === String(ADMIN_ID)) {
            var broadcastMsg = text.replace('/broadcast ', '');
            var sent = 0;
            for (var uid of userIds) {
                try {
                    var ok = await sendMessage(uid, '📢 GEMAX Store\n\n' + broadcastMsg);
                    if (ok) sent++;
                    await new Promise(r => setTimeout(r, 200));
                } catch(e) {}
            }
            sendMessage(chatId, '✅ Broadcast sent to ' + sent + '/' + userIds.size + ' users!');
            return;
        }

        if (msg.photo && String(userId) === String(ADMIN_ID)) {
            var caption = msg.caption || '';
            var fileId = msg.photo[msg.photo.length - 1].file_id;
            var sent = 0;
            for (var uid of userIds) {
                try {
                    var body = { chat_id: uid, photo: fileId, caption: caption ? '📢 GEMAX Store\n\n' + caption : '📢 GEMAX Store' };
                    var r = await fetch(BASE_URL + '/sendPhoto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                    if ((await r.json()).ok) sent++;
                    await new Promise(r => setTimeout(r, 300));
                } catch(e) {}
            }
            sendMessage(chatId, '✅ Photo sent to ' + sent + '/' + userIds.size + ' users!');
            return;
        }

        if (text === '/count' && String(userId) === String(ADMIN_ID)) {
            sendMessage(chatId, '📊 Total bot users: ' + userIds.size);
            return;
        }
    }
}

console.log('🤖 GEMAX Bot starting...');
getUpdates();
checkNewOrders();
console.log('✅ GEMAX Store Bot ready!');
console.log('🔔 Auto-checking orders every 10 seconds');
