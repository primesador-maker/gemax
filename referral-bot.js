const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.writeHead(200); res.end('Ethio Business Winners Bot'); }).listen(PORT, () => console.log('🌐 Web server on port ' + PORT));

const BOT_TOKEN = process.env.BOT_TOKEN || '8716776993:AAGWaKMdrfw1AdbZ-WeMcQN6YL9VMZ3B-Hw';
const MAIN_BOT = '@Gemax_shopping_bot';
const CHANNEL = '@Gemax_shopping';
const BASE_URL = 'https://api.telegram.org/bot' + BOT_TOKEN;
let lastUpdateId = 0;

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const REFERRALS_FILE = path.join(DATA_DIR, 'referrals.json');
const WINNERS_FILE = path.join(DATA_DIR, 'winners.json');

let referrals = {};
let pastWinners = [];
if (fs.existsSync(REFERRALS_FILE)) { try { referrals = JSON.parse(fs.readFileSync(REFERRALS_FILE, 'utf8')) } catch(e) {} }
if (fs.existsSync(WINNERS_FILE)) { try { pastWinners = JSON.parse(fs.readFileSync(WINNERS_FILE, 'utf8')) } catch(e) {} }
function saveRefs() { fs.writeFileSync(REFERRALS_FILE, JSON.stringify(referrals), 'utf8') }
function saveWinners() { fs.writeFileSync(WINNERS_FILE, JSON.stringify(pastWinners), 'utf8') }

async function apiCall(method, body) {
    try {
        const r = await fetch(BASE_URL + '/' + method, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        return await r.json();
    } catch(e) { return null }
}

async function getUpdates() {
    try {
        const r = await fetch(BASE_URL + '/getUpdates?offset=' + (lastUpdateId + 1) + '&timeout=10');
        const d = await r.json();
        if (d.ok && d.result.length > 0) { for (const u of d.result) { lastUpdateId = u.update_id; handleUpdate(u); } }
    } catch(e) {}
    setTimeout(getUpdates, 500);
}

function generateRefLink(userId) {
    return 'https://t.me/EthioBusinessWinners_bot?start=ref' + userId;
}

function hidePhone(phone) {
    if (!phone || phone.length < 10) return '+2519*****887';
    return phone.substring(0, 6) + '*****' + phone.substring(phone.length - 3);
}

async function checkUserJoinedMainBot(userId) {
    try {
        const r = await fetch('https://api.telegram.org/bot' + process.env.MAIN_BOT_TOKEN + '/getChatMember?chat_id=' + userId + '&user_id=' + userId);
        return false;
    } catch(e) { return true }
}

function handleUpdate(update) {
    if (!update.message) return;
    var msg = update.message;
    var chatId = msg.chat.id;
    var text = msg.text || '';
    var userId = String(msg.from.id);
    var firstName = msg.from.first_name || 'User';

    // Initialize user
    if (!referrals[userId]) {
        referrals[userId] = { name: firstName, referrals: 0, referredBy: null, phone: null, joinedMain: false, joinedChannel: false };
        saveRefs();
    }

    // Handle deep link with referrer
    if (text.startsWith('/start ')) {
        var parts = text.split(' ');
        if (parts[1] && parts[1].startsWith('ref')) {
            var refId = parts[1].replace('ref', '');
            if (refId !== userId && referrals[refId] && !referrals[userId].referredBy) {
                referrals[userId].referredBy = refId;
                referrals[refId].referrals++;
                saveRefs();
                apiCall('sendMessage', { chat_id: refId, text: '🎉 Someone joined via your link! You now have ' + referrals[refId].referrals + ' Dinar!' });
            }
        }
    }

    // /start command
    if (text === '/start' || text.startsWith('/start ')) {
        var msg2 = '🏆 *Ethio Business Winners* 🏆\n\n';
        msg2 += 'Refer friends and win CASH prizes!\n\n';
        msg2 += '📋 *Rules:*\n';
        msg2 += '• Share your referral link\n';
        msg2 += '• Friends must join our bots & channel\n';
        msg2 += '• 1 friend = 1 Dinar\n';
        msg2 += '• 10 Dinar = 100 Birr\n';
        msg2 += '• 20 Dinar = 200 Birr\n';
        msg2 += '• 50 Dinar = 500 Birr\n';
        msg2 += '• Winner announced every Sunday 8PM\n\n';
        msg2 += '👇 Get your referral link:';
        
        apiCall('sendMessage', {
            chat_id: chatId, text: msg2, parse_mode: 'Markdown',
            reply_markup: JSON.stringify({ inline_keyboard: [
                [{ text: '🔗 Get My Referral Link', callback_data: 'myref' }],
                [{ text: '📊 My Dinar', callback_data: 'dinar' }],
                [{ text: '🏆 Leaderboard', callback_data: 'leaderboard' }]
            ]})
        });
        return;
    }

    // /myref command
    if (text === '/myref') {
        var refLink = generateRefLink(userId);
        apiCall('sendMessage', { chat_id: chatId, text: '🔗 *Your Referral Link*\n\nShare this link:\n' + refLink + '\n\nWhen friends join, you earn Dinar!', parse_mode: 'Markdown' });
        return;
    }

    // /dinar command
    if (text === '/dinar') {
        var d = referrals[userId] ? referrals[userId].referrals : 0;
        var birr = d * 10;
        apiCall('sendMessage', { chat_id: chatId, text: '💰 *Your Dinar*\n\n🏅 Dinar: ' + d + '\n💵 Value: ' + birr + ' Birr\n\nNeed ' + (10 - d) + ' more for 100 Birr!' });
        return;
    }

    // /leaderboard command
    if (text === '/leaderboard') {
        var sorted = Object.entries(referrals).filter(x => x[1].referrals >= 5 && pastWinners.indexOf(x[0]) === -1).sort((a, b) => b[1].referrals - a[1].referrals).slice(0, 10);
        var lb = '🏆 *Leaderboard* 🏆\n\n';
        if (sorted.length === 0) { lb += 'No one qualified yet. Minimum 5 referrals!\n'; }
        else { sorted.forEach((x, i) => { lb += (i + 1) + '. ' + x[1].name + ' - ' + x[1].referrals + ' Dinar\n'; }); }
        apiCall('sendMessage', { chat_id: chatId, text: lb, parse_mode: 'Markdown' });
        return;
    }

    // /rules command
    if (text === '/rules') {
        apiCall('sendMessage', { chat_id: chatId, text: '📋 *RULES*\n\n1. Share your referral link\n2. Friends must join all channels\n3. 1 referral = 1 Dinar\n4. 5 minimum to qualify\n5. Winner picked randomly from qualified\n6. Draw every Sunday 8PM\n7. Phone shown as +2519*****887' });
        return;
    }

    // Handle button clicks
    if (msg.photo) {
        if (!referrals[userId].phone) {
            referrals[userId].phone = '+2519*****887';
            saveRefs();
        }
    }
}

// Handle callback queries (button clicks)
async function handleCallbacks() {
    try {
        const r = await fetch(BASE_URL + '/getUpdates?offset=' + (lastUpdateId + 1) + '&timeout=10&allowed_updates=["callback_query"]');
        const d = await r.json();
        if (d.ok && d.result.length > 0) {
            for (const u of d.result) {
                if (u.callback_query) {
                    var cb = u.callback_query;
                    var chatId = cb.message.chat.id;
                    var userId = String(cb.from.id);
                    if (!referrals[userId]) { referrals[userId] = { name: cb.from.first_name || 'User', referrals: 0, referredBy: null, phone: null }; saveRefs(); }
                    
                    if (cb.data === 'myref') {
                        apiCall('sendMessage', { chat_id: chatId, text: '🔗 *Your Referral Link*\n\n' + generateRefLink(userId) + '\n\nShare this! Each friend = 1 Dinar 💰' });
                    }
                    if (cb.data === 'dinar') {
                        var d = referrals[userId].referrals;
                        apiCall('sendMessage', { chat_id: chatId, text: '💰 Dinar: ' + d + ' | Value: ' + (d * 10) + ' Birr\nNeed ' + Math.max(0, 5 - d) + ' more to qualify!' });
                    }
                    if (cb.data === 'leaderboard') {
                        var sorted = Object.entries(referrals).filter(x => x[1].referrals >= 5).sort((a, b) => b[1].referrals - a[1].referrals).slice(0, 10);
                        var lb = '🏆 *Leaderboard*\n\n';
                        sorted.forEach((x, i) => { lb += (i + 1) + '. ' + x[1].name + ' - ' + x[1].referrals + ' Dinar\n'; });
                        apiCall('sendMessage', { chat_id: chatId, text: lb || 'No qualifiers yet!' });
                    }
                    lastUpdateId = u.update_id;
                }
            }
        }
    } catch(e) {}
    setTimeout(handleCallbacks, 500);
}

// Weekly winner announcement (Sunday 8PM)
function checkSunday() {
    var now = new Date();
    if (now.getDay() === 0 && now.getHours() === 20 && now.getMinutes() === 0) {
        var qualified = Object.entries(referrals).filter(x => x[1].referrals >= 5 && pastWinners.indexOf(x[0]) === -1);
        if (qualified.length > 0) {
            var winner = qualified[Math.floor(Math.random() * qualified.length)];
            pastWinners.push(winner[0]);
            saveWinners();
            var phone = winner[1].phone || '+2519*****887';
            var hiddenPhone = hidePhone(phone);
            var prize = winner[1].referrals >= 50 ? 500 : winner[1].referrals >= 20 ? 200 : 100;
            
            Object.keys(referrals).forEach(uid => {
                apiCall('sendMessage', { chat_id: uid, text: '🏆 *ETHIO BUSINESS WINNERS* 🏆\n\n🎉 Winner: ' + hiddenPhone + '\n💰 Prize: ' + prize + ' Birr\n📊 Dinar: ' + winner[1].referrals + '\n\nNext draw: Sunday 8PM\n\nRefer friends to win!' });
            });
            referrals[winner[0]].referrals = 0;
            saveRefs();
        }
    }
}

console.log('🏆 Ethio Business Winners Bot starting...');
getUpdates();
handleCallbacks();
setInterval(checkSunday, 60000);
console.log('✅ Bot ready!');
