const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');

const sendAutoDeleteMessage = require('./functions/sendAutoDeleteMessage');
const setupAutoNoti = require('./functions/autonoti');
const sendUptime = require('./functions/uptime');

// Thông tin cấu hình
const config = {
    token: "8730247511:AAHZbpWnUrO3t5yJal6T4O4Yyn09yrbJz2Q",
    adminId: "6602753350",
    groupId: "-1002394487171"
};

// Hiển thị chữ nghệ thuật Project-TNT phong cách Neon khi khởi động
console.clear();
console.log(
    chalk.cyan(
        figlet.textSync('Project-TNT', { horizontalLayout: 'full' })
    )
);
console.log(chalk.magenta('===================================================='));
console.log(chalk.green('🚀 Bot đang khởi động và sẵn sàng hoạt động...'));
console.log(chalk.magenta('====================================================\n'));

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
            console.error(chalk.red(`❌ Lỗi khi load module ${file}:`), error.message);
        }
    }
});

// Hệ thống Log tin nhắn người dùng phong cách Neon
bot.on('message', (msg) => {
    if (!msg.text) return; // Chỉ log tin nhắn văn bản

    const time = new Date().toLocaleString('vi-VN');
    const userId = msg.from.id;
    const userName = msg.from.first_name || msg.from.username || 'Ẩn danh';
    const chatTitle = msg.chat.title || 'Chat riêng';
    const text = msg.text;

    console.log(
        chalk.yellow(`[${time}] `) +
        chalk.cyan(`ID: ${userId} `) +
        chalk.magenta(`| User: ${userName} `) +
        chalk.blue(`| Chat: ${chatTitle}`)
    );
    console.log(chalk.white(`💬 Nội dung: `) + chalk.greenBright(text));
    console.log(chalk.gray('----------------------------------------------------'));
});

// Lắng nghe lệnh /start
bot.onText(/\/start/, (msg) => {
    sendAutoDeleteMessage(bot, msg.chat.id, '🌟 Chào mừng bạn đến với Project-TNT Bot!\n\nTôi là bot đa năng hỗ trợ quản lý nhóm, AI, Game và nhiều tiện ích khác.\n\nSử dụng /menu để xem danh sách lệnh.');
});

bot.onText(/\/uptime/, (msg) => {
    sendUptime(bot, msg.chat.id);
});

// Gửi thông báo khi bot khởi động thành công
bot.getMe().then((me) => {
    console.log(chalk.yellow(`🤖 Bot đã sẵn sàng: `) + chalk.cyan(`@${me.username}`));
    console.log(chalk.magenta('====================================================\n'));
}).catch(err => {
    console.error(chalk.red('❌ Lỗi khởi động bot:'), err.message);
});

setupAutoNoti(bot, config.groupId);

// Xử lý lỗi polling
bot.on('polling_error', (error) => {
    // console.error(chalk.red('Polling error:'), error.code, error.message);
});
