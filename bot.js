const http = require('http');

// HTTP server for Render Web Service
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>💎 GEMAX Store Bot Running</h1><p>Quality to the Max</p>');
}).listen(PORT, () => console.log(`🌐 Web server on port ${PORT}`));

// BOT CONFIG
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const ADMIN_ID = 7715442708;
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://primesador-maker.github.io/gemax/';
const PAYMENT_PHONE = '+251990066832';
const PAYMENT_NAME = 'Biruk';
const SUPPORT_USERNAME = 'gem_core';
const CHANNEL = '@Gemax_shopping';

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
                `💎 *Welcome to GEMAX Store, ${username}!*\n\n✨ Quality to the Max\n\n🛍️ Browse & order in Telegram\n⏱️ Processing: 15-25 days\n💳 Pay via Telebirr\n🤝 Meetup after payment\n\n📢 Channel: ${CHANNEL}\n\n👇 Start shopping:`,
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
                `💎 *GEMAX Store Help*\n\n✨ Quality to the Max\n\n🛍️ *How to Order:*\n• Click OPEN GEMAX STORE\n• Browse products\n• Add to cart\n• Place order\n\n⏱️ Processing: 15-25 days\n💳 Pay via Telebirr to confirm\n🤝 Meetup after payment\n\n💳 *Payment:*\n📱 ${PAYMENT_PHONE}\n👤 ${PAYMENT_NAME}\n\n📞 Support: @${SUPPORT_USERNAME}\n📢 Channel: ${CHANNEL}`,
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

    // ORDER NOTIFICATIONS
    if (update.message?.web_app_data) {
        try {
            const data = JSON.parse(update.message.web_app_data.data);
            if (data.type === 'new_order') {
                const order = data.order;
                const ts = order.timestamp || new Date().toLocaleString();

                // Notify Admin (YOU)
                sendMessage(ADMIN_ID,
                    `🔔 *NEW ORDER!*\n\n🆔 #${order.id}\n👤 ${order.customer_username}\n📱 ID: \`${order.customer_id}\`\n\n📦 *Items:*\n${order.items.map(i => `• ${i.name} ×${i.quantity} = ${i.price * i.quantity} Birr`).join('\n')}\n\n💰 *Total: ${order.total} Birr*\n\n🕐 ${ts}\n\n⏱️ Processing: 15-25 days\n💳 Telebirr: ${PAYMENT_PHONE} (${PAYMENT_NAME})\n\n⏳ Status: Pending`,
                    { parse_mode: 'Markdown' }
                );

                // Confirm to Customer
                sendMessage(update.message.chat.id,
                    `✅ *Order Confirmed!*\n\n🆔 #${order.id}\n💰 Total: ${order.total} Birr\n🕐 ${ts}\n\n⏱️ Processing: 15-25 days\n💳 Pay via Telebirr to confirm:\n📱 ${PAYMENT_PHONE}\n👤 ${PAYMENT_NAME}\n🤝 Meetup after payment\n\n📞 Questions? @${SUPPORT_USERNAME}\n📢 Channel: ${CHANNEL}\n\nThank you for shopping with GEMAX Store! ✨`,
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
console.log('🔔 Order notifications: ON');
