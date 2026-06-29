const http = require('http');
const fs = require('fs');
const path = require('path');

// HTTP server for Render Web Service
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>💎 GEMAX Store Bot Running</h1><p>Quality to the Max</p>');
}).listen(PORT, () => console.log(`🌐 Web server on port ${PORT}`));

// BOT CONFIG
const BOT_TOKEN = process.env.BOT_TOKEN || '8798527679:AAGsF2R0m_iV_ThurVTf2CN9VecoCAV2rcU';
const ADMIN_ID = 7715442708;
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://primesador-maker.github.io/gemax/';
const PAYMENT_PHONE = '+251990066832';
const PAYMENT_NAME = 'Biruk';
const SUPPORT_USERNAME = 'gem_core';
const CHANNEL = '@Gemax_shopping';

const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
let lastUpdateId = 0;

// Store user IDs
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const USERS_FILE = path.join(DATA_DIR, 'users.json');
let userIds = new Set();
if (fs.existsSync(USERS_FILE)) {
    try { userIds = new Set(JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))) } catch(e) {}
}
function saveUsers() { fs.writeFileSync(USERS_FILE, JSON.stringify([...userIds]), 'utf8') }

async function getUpdates() {
    try {
        const res = await fetch(`${BASE_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`);
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

async function sendMessage(chatId, text, opts = {}) {
    try {
        const body = { chat_id: chatId, text: text };
        if (opts.reply_markup) body.reply_markup = JSON.stringify(opts.reply_markup);
        const response = await fetch(`${BASE_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        if (!result.ok) console.error('Send error:', result.description);
        else console.log('✅ Message sent');
        return result.ok;
    } catch (e) { console.error('Send error:', e.message); return false }
}

async function handleUpdate(update) {
    if (update.message) {
        const msg = update.message;
        const chatId = msg.chat.id;
        const text = msg.text || '';
        const username = msg.from?.username ? '@' + msg.from.username : 'Customer';
        const userId = msg.from?.id;

        if (userId) { userIds.add(userId); saveUsers() }
        console.log('📩 Message:', text, 'from', username);

        // /start
        if (text === '/start' || text === '/Start' || text === 'start') {
            const welcomeMsg = '💎 Welcome to GEMAX Store, ' + username + '!\n\n✨ Quality to the Max\n\n🛍️ Browse & order in Telegram\n⏱️ Processing: 15-25 days\n💳 Pay via Telebirr\n🤝 Meetup after payment\n\n📢 Channel: ' + CHANNEL + '\n\n👇 Start shopping:';
            
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

        // /help
        if (text === '/help' || text === '/Help' || text === 'help') {
            const helpMsg = '💎 GEMAX Store Help\n\n✨ Quality to the Max\n\n🛍️ How to Order:\n• Click OPEN GEMAX STORE\n• Browse products\n• Add to cart\n• Place order\n\n⏱️ Processing: 15-25 days\n💳 Pay via Telebirr to confirm\n🤝 Meetup after payment\n\n💳 Payment:\n📱 ' + PAYMENT_PHONE + '\n👤 ' + PAYMENT_NAME + '\n\n📞 Support: @' + SUPPORT_USERNAME + '\n📢 Channel: ' + CHANNEL;
            
            sendMessage(chatId, helpMsg, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🛒 START SHOPPING', web_app: { url: MINI_APP_URL } }]
                    ]
                }
            });
            return;
        }

        // TEXT BROADCAST (Admin only)
        if (text.startsWith('/broadcast ') && String(userId) === String(ADMIN_ID)) {
            const broadcastMsg = text.replace('/broadcast ', '');
            let sent = 0;
            for (const uid of userIds) {
                try {
                    const ok = await sendMessage(uid, '📢 GEMAX Store\n\n' + broadcastMsg);
                    if (ok) sent++;
                    await new Promise(r => setTimeout(r, 200));
                } catch(e) {}
            }
            sendMessage(chatId, '✅ Broadcast sent to ' + sent + '/' + userIds.size + ' users!');
            return;
        }

        // PHOTO BROADCAST (Admin forwards photo)
        if (msg.photo && String(userId) === String(ADMIN_ID)) {
            const caption = msg.caption || '';
            const fileId = msg.photo[msg.photo.length - 1].file_id;
            let sent = 0;
            for (const uid of userIds) {
                try {
                    const body = { chat_id: uid, photo: fileId, caption: caption ? '📢 GEMAX Store\n\n' + caption : '📢 GEMAX Store' };
                    const r = await fetch(`${BASE_URL}/sendPhoto`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if ((await r.json()).ok) sent++;
                    await new Promise(r => setTimeout(r, 300));
                } catch(e) {}
            }
            sendMessage(chatId, '✅ Photo sent to ' + sent + '/' + userIds.size + ' users!');
            return;
        }

        // VIDEO BROADCAST (Admin forwards video)
        if (msg.video && String(userId) === String(ADMIN_ID)) {
            const caption = msg.caption || '';
            const fileId = msg.video.file_id;
            let sent = 0;
            for (const uid of userIds) {
                try {
                    const body = { chat_id: uid, video: fileId, caption: caption ? '📢 GEMAX Store\n\n' + caption : '📢 GEMAX Store' };
                    const r = await fetch(`${BASE_URL}/sendVideo`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if ((await r.json()).ok) sent++;
                    await new Promise(r => setTimeout(r, 300));
                } catch(e) {}
            }
            sendMessage(chatId, '✅ Video sent to ' + sent + '/' + userIds.size + ' users!');
            return;
        }

        // USER COUNT (Admin only)
        if (text === '/count' && String(userId) === String(ADMIN_ID)) {
            sendMessage(chatId, '📊 Total bot users: ' + userIds.size);
            return;
        }
    }

    // ORDER NOTIFICATIONS
    if (update.message?.web_app_data) {
        try {
            const data = JSON.parse(update.message.web_app_data.data);
            if (data.type === 'new_order') {
                const order = data.order;
                const ts = order.timestamp || new Date().toLocaleString();
                
                let itemsList = '';
                for (const i of order.items) {
                    itemsList += '• ' + i.name + ' ×' + i.quantity + ' = ' + (i.price * i.quantity) + ' Birr\n';
                }

                // Notify Admin
                const adminMsg = '🔔 NEW ORDER!\n\n🆔 #' + order.id + '\n👤 ' + order.customer_username + '\n📱 ID: ' + order.customer_id + '\n\n📦 Items:\n' + itemsList + '\n💰 Total: ' + order.total + ' Birr\n\n🕐 ' + ts + '\n\n⏱️ Processing: 15-25 days\n💳 Telebirr: ' + PAYMENT_PHONE + ' (' + PAYMENT_NAME + ')\n\n⏳ Status: Pending';
                
                await sendMessage(ADMIN_ID, adminMsg);
                console.log('✅ Admin notified');

                // Notify Customer
                const custMsg = '✅ Order Confirmed!\n\n🆔 #' + order.id + '\n💰 Total: ' + order.total + ' Birr\n🕐 ' + ts + '\n\n⏱️ Processing: 15-25 days\n💳 Pay via Telebirr to confirm:\n📱 ' + PAYMENT_PHONE + '\n👤 ' + PAYMENT_NAME + '\n🤝 Meetup after payment\n\n📞 Questions? @' + SUPPORT_USERNAME + '\n📢 Channel: ' + CHANNEL + '\n\nThank you for shopping with GEMAX Store! ✨';
                
                await sendMessage(update.message.chat.id, custMsg);
                console.log('✅ Customer notified');
            }
        } catch (e) { console.error('Order error:', e.message) }
    }
}

console.log('🤖 GEMAX Bot starting...');
getUpdates();
console.log('✅ GEMAX Store Bot ready!');
console.log('💎 Quality to the Max');
console.log('📢 Broadcast: Text + Photo + Video');
console.log('🔔 Notifications: ON');
