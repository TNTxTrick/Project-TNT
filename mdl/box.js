/**
 * @command /box
 * @category Hỗ trợ
 * @author tnt
 * @date 2025-03-01
 * @usage /rename <tên> | /setphoto (reply ảnh) | /clear
 * @description Quản lý nhóm: Đổi tên, ảnh đại diện, xóa tin nhắn.
 */
const fs = require('fs');
const path = require('path');
 
module.exports = (bot, config) => {
  // 📝 Lệnh đổi tên nhóm
  bot.onText(/\/rename (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const newTitle = match[1]; // Lấy tên mới từ lệnh

    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, 'Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    try {
      await bot.setChatTitle(chatId, newTitle);
      bot.sendMessage(chatId, `✅ Tên nhóm đã được đổi thành: *${newTitle}*`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Không thể đổi tên nhóm:', err);
      bot.sendMessage(chatId, '❌ Không thể đổi tên nhóm. Hãy kiểm tra quyền quản trị viên của bot.');
    }
  });

  // 📸 Lệnh đổi ảnh đại diện nhóm
  bot.onText(/\/setphoto/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, 'Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    if (!msg.reply_to_message || !msg.reply_to_message.photo) {
      bot.sendMessage(chatId, '📌 Vui lòng **reply** vào một ảnh và nhập lệnh /setphoto.');
      return;
    }

    const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];  
    const fileId = photo.file_id;

    try {
      // Lấy đường dẫn file từ Telegram
      const file = await bot.getFile(fileId);
      const filePath = file.file_path;
      const url = `https://api.telegram.org/file/bot${config.token}/${filePath}`;

      // Tải ảnh về
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Lỗi tải ảnh: ${response.statusText}`);
      
      // Lưu ảnh vào thư mục tạm
      const tempPath = path.join(__dirname, 'group_photo.jpg');
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(tempPath, Buffer.from(buffer));

      // Đặt ảnh đại diện nhóm
      await bot.setChatPhoto(chatId, fs.createReadStream(tempPath));
      bot.sendMessage(chatId, '✅ Ảnh đại diện nhóm đã được cập nhật.');

      // Xóa file sau khi đổi xong
      fs.unlinkSync(tempPath);
    } catch (err) {
      console.error('Không thể đổi ảnh đại diện:', err);
      bot.sendMessage(chatId, '❌ Không thể đổi ảnh đại diện. Đảm bảo bot có quyền quản trị viên.');
    }
  });

  // 🗑️ Lệnh xóa lịch sử chat
  bot.onText(/\/clear/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, 'Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    try {
      const messages = await bot.getChatHistory(chatId, { limit: 100 });

      for (const message of messages) {
        try {
          await bot.deleteMessage(chatId, message.message_id);
        } catch (err) {
          console.error('Không thể xóa tin nhắn:', err);
        }
      }

      bot.sendMessage(chatId, '✅ Đã xóa lịch sử chat.');
    } catch (err) {
      console.error('Không thể lấy lịch sử chat:', err);
      bot.sendMessage(chatId, '❌ Không thể xóa lịch sử chat.');
    }
  });
};