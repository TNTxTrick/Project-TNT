const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const sendAutoDeleteMessage = require('./functions/sendAutoDeleteMessage');
const setupAutoNoti = require('./functions/autonoti');
const sendUptime = require('./functions/uptime');

// Thông tin cấu hình
const config = {
    token: "8730247511:AAHZbpWnUrO3t5yJal6T4O4Yyn09yrbJz2Q",
    adminId: "6602753350", // Giữ nguyên adminId cũ hoặc bạn có thể cập nhật sau
    groupId: "-1002394487171"
};

// Khởi tạo bot với token
const bot = new TelegramBot(config.token, { polling: true });

// Tự động import tất cả các module trong thư mục "mdl/"
const mdlPath = path.join(__dirname, 'mdl');
fs.readdirSync(mdlPath).forEach((file) => {
    if (file.endsWith('.js')) {
        try {
            const module = require(`./mdl/${file}`);
            if (typeof module === 'function') {
                module(bot, config);
            }
        } catch (error) {
            console.error(`Lỗi khi load module ${file}:`, error.message);
        }
    }
});

// Lắng nghe lệnh /start
bot.onText(/\/start/, (msg) => {
    sendAutoDeleteMessage(bot, msg.chat.id, '🌟 Chào mừng bạn đến với Project-TNT Bot!\n\nTôi là bot đa năng hỗ trợ quản lý nhóm, AI, Game và nhiều tiện ích khác.\n\nSử dụng /menu để xem danh sách lệnh.');
});

bot.onText(/\/uptime/, (msg) => {
    sendUptime(bot, msg.chat.id);
});

// Gửi thông báo khi bot khởi động
console.log('Bot đang khởi động...');
bot.getMe().then((me) => {
    console.log(`Bot đã sẵn sàng: @${me.username}`);
    // Gửi thông báo cho admin nếu cần
    // sendAutoDeleteMessage(bot, config.adminId, '🚀 Bot đã khởi động và sẵn sàng hoạt động!');
}).catch(err => {
    console.error('Lỗi khởi động bot:', err.message);
});

setupAutoNoti(bot, config.groupId);

// Xử lý lỗi polling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.code, error.message);
});
