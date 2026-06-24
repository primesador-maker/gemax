const TelegramBot = require('node-telegram-bot-api');
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
const BACKEND_URL = process.env.BACKEND_URL || 'https://gem-cart-backend.onrender.com';
const PAYMENT_PHONE = '+251990066832';
const PAYMENT_NAME = 'Biruk';
const SUPPORT_USERNAME = 'gem_core';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 GEMAX Bot starting...');

// /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username ? '@' + msg.from.username : 'Customer';
    
    const welcomeMessage = `💎 *Welcome to GEMAX Store, ${username}!*\n\n` +
        `✨ Quality to the Max\n` +
        `🛍️ Bags, Clothes, Jewelry, Perfumes & more\n` +
        `💳 Pay easily with Telebirr\n\n` +
        `👇 Click below to start shopping:`;
    
    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '💎 OPEN GEMAX STORE', web_app: { url: MINI_APP_URL } }],
                [{ text: '📞 Contact Support', url: `https://t.me/${SUPPORT_USERNAME}` }]
            ]
        }
    });
});

// /help command
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id,
        `💎 *GEMAX Store Help*\n\n` +
        `✨ Quality to the Max\n\n` +
        `🛍️ *How to Shop:*\n` +
        `• Click OPEN GEMAX STORE button\n` +
        `• Browse products by category\n` +
        `• Add items to your cart\n` +
        `• Place your order\n\n` +
        `💳 *Payment:* Telebirr\n` +
        `📱 ${PAYMENT_PHONE}\n` +
        `👤 ${PAYMENT_NAME}\n\n` +
        `📞 Support: @${SUPPORT_USERNAME}`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🛒 START SHOPPING', web_app: { url: MINI_APP_URL } }]
                ]
            }
        }
    );
});

// 🔔 ORDER NOTIFICATIONS
bot.on('message', async (msg) => {
    if (msg.web_app_data) {
        try {
            const data = JSON.parse(msg.web_app_data.data);
            
            if (data.type === 'new_order') {
                const order = data.order;
                const now = new Date();
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                // Send to ADMIN (YOU)
                const adminMessage = `🔔 *NEW ORDER!*\n\n` +
                    `🆔 #${order.id}\n` +
                    `👤 ${order.customer_username}\n` +
                    `📱 ID: \`${order.customer_id}\`\n\n` +
                    `📦 *Items:*\n${order.items.map(i => `• ${i.name} ×${i.quantity} = ${i.price * i.quantity} Birr`).join('\n')}\n\n` +
                    `💰 *Total: ${order.total} Birr*\n\n` +
                    `🕐 ${timeStr}, ${dateStr}\n\n` +
                    `💳 Telebirr: ${PAYMENT_PHONE}\n` +
                    `👤 ${PAYMENT_NAME}\n\n` +
                    `⏳ Status: Pending`;
                
                await bot.sendMessage(ADMIN_ID, adminMessage, { parse_mode: 'Markdown' });
                console.log('✅ Admin notified:', order.id);
                
                // Send to CUSTOMER
                const customerMessage = `✅ *Order Confirmed!*\n\n` +
                    `Order #${order.id}\n` +
                    `Total: ${order.total} Birr\n\n` +
                    `💳 *Pay via Telebirr:*\n` +
                    `📱 ${PAYMENT_PHONE}\n` +
                    `👤 ${PAYMENT_NAME}\n\n` +
                    `📞 Support: @${SUPPORT_USERNAME}\n\n` +
                    `Thank you for shopping with GEMAX Store! ✨`;
                
                await bot.sendMessage(msg.chat.id, customerMessage, { parse_mode: 'Markdown' });
                console.log('✅ Customer notified:', order.id);
            }
        } catch (e) {
            console.error('Order error:', e.message);
        }
    }
});

// Error handling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});

console.log('✅ GEMAX Store Bot ready!');
console.log('💎 Quality to the Max');
