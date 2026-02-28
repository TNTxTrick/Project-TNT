/**
 * @command /admin
 * @category Quản trị
 * @author tnt
 * @date 2025-03-01
 * @usage /admin
 * @description Xem thông tin hệ thống và quản lý bot (Chỉ dành cho Admin).
 */
const os = require('os');

module.exports = (bot, config) => {
    bot.onText(/\/admin/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        // Kiểm tra quyền Admin
        if (userId !== config.adminId) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền sử dụng lệnh này.');
        }

        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const memoryUsage = process.memoryUsage();
        const rss = (memoryUsage.rss / 1024 / 1024).toFixed(2);
        const heapTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);

        const systemInfo = `
🛠️ *BẢNG ĐIỀU KHIỂN ADMIN*

⏱️ *Thời gian hoạt động:* ${hours}h ${minutes}m ${seconds}s
💻 *Hệ điều hành:* ${os.type()} ${os.release()}
🧠 *Sử dụng RAM:* ${rss} MB / ${heapTotal} MB
👥 *Admin ID:* \`${config.adminId}\`
📢 *Group ID:* \`${config.groupId}\`

🚀 *Các lệnh quản trị:*
- /broadcast <tin nhắn>: Gửi tin nhắn đến tất cả người dùng (Chưa hỗ trợ)
- /restart: Khởi động lại bot (Chưa hỗ trợ)
- /welcome on/off: Bật/tắt chào mừng
- /rename <tên>: Đổi tên nhóm
        `;

        bot.sendMessage(chatId, systemInfo, { parse_mode: 'Markdown' });
    });
};
