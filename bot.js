const http = require('http');

// HTTP server for Render Web Service
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>💎 GEMAX Store Bot Running</h1><p>Quality to the Max</p>');
}).listen(PORT, () => console.log(`🌐 Web server on port ${PORT}`));

// BOT CONFIGURATION
const BOT_TOKEN = process.env.BOT_TOKEN || '8798527679:AAGsF2R0m_iV_ThurVTf2CN9VecoCAV2rcU';
const ADMIN_ID = 7715442708;
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://primesador-maker.github.io/gemax/';
const BACKEND_URL = process.env.BACKEND_URL || 'https://gemax-backend.onrender.com';
const PAYMENT_PHONE = '+251990066832';
const PAYMENT_NAME = 'Biruk';
const SUPPORT_USERNAME = 'gem_core';

// Use fetch-based Telegram API (no package needed!)
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
let lastUpdateId = 0;

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
    } catch (e) {
        console.error('Polling error:', e.message);
    }
    setTimeout(getUpdates, 500);
}

async function sendMessage(chatId, text, options = {}) {
    try {
        const body = { chat_id: chatId, text, ...options };
        if (options.reply_markup) body.reply_markup = JSON.stringify(options.reply_markup);
        if (options.parse_mode) body.parse_mode = options.parse_mode;
        await fetch(`${BASE_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (e) {
        console.error('Send error:', e.message);
    }
}

function handleUpdate(update) {
    if (update.message) {
        const msg = update.message;
        const chatId = msg.chat.id;
        const text = msg.text || '';
        const username = msg.from?.username ? '@' + msg.from.username : 'Customer';

        if (text === '/start') {
            sendMessage(chatId,
                `💎 *Welcome to GEMAX Store, ${username}!*\n\n✨ Quality to the Max\n🛍️ Bags, Clothes, Jewelry, Perfumes & more\n💳 Pay easily with Telebirr\n\n👇 Click below to start shopping:`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '💎 OPEN GEMAX STORE', web_app: { url: MINI_APP_URL } }],
                            [{ text: '📞 Contact Support', url: `https://t.me/${SUPPORT_USERNAME}` }]
                        ]
                    }
                }
            );
        } else if (text === '/help') {
            sendMessage(chatId,
                `💎 *GEMAX Store Help*\n\n✨ Quality to the Max\n\n🛍️ *How to Shop:*\n• Click OPEN GEMAX STORE\n• Browse by category\n• Add to cart\n• Place order\n\n💳 *Payment:* Telebirr\n📱 ${PAYMENT_PHONE}\n👤 ${PAYMENT_NAME}\n\n📞 Support: @${SUPPORT_USERNAME}`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🛒 START SHOPPING', web_app: { url: MINI_APP_URL } }]
                        ]
                    }
                }
            );
        }
    }

    // Handle web_app_data
    if (update.message?.web_app_data) {
        try {
            const data = JSON.parse(update.message.web_app_data.data);
            if (data.type === 'new_order') {
                const order = data.order;
                const now = new Date();
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                // Notify Admin
                sendMessage(ADMIN_ID,
                    `🔔 *NEW ORDER!*\n\n🆔 #${order.id}\n👤 ${order.customer_username}\n📱 ID: \`${order.customer_id}\`\n\n📦 *Items:*\n${order.items.map(i => `• ${i.name} ×${i.quantity} = ${i.price * i.quantity} Birr`).join('\n')}\n\n💰 *Total: ${order.total} Birr*\n\n🕐 ${timeStr}, ${dateStr}\n\n💳 Telebirr: ${PAYMENT_PHONE}\n👤 ${PAYMENT_NAME}\n\n⏳ Status: Pending`,
                    { parse_mode: 'Markdown' }
                );

                // Notify Customer
                sendMessage(update.message.chat.id,
                    `✅ *Order Confirmed!*\n\nOrder #${order.id}\nTotal: ${order.total} Birr\n\n💳 *Pay via Telebirr:*\n📱 ${PAYMENT_PHONE}\n👤 ${PAYMENT_NAME}\n\n📞 Support: @${SUPPORT_USERNAME}\n\nThank you for shopping with GEMAX Store! ✨`,
                    { parse_mode: 'Markdown' }
                );

                console.log('✅ Order processed:', order.id);
            }
        } catch (e) {
            console.error('Order error:', e.message);
        }
    }
}

console.log('🤖 GEMAX Bot starting...');
getUpdates();
console.log('✅ GEMAX Store Bot ready!');
console.log('💎 Quality to the Max');
