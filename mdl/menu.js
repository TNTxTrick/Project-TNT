/**
 * @command /menu
 * @category Hỗ trợ
 * @author tnt
 * @date 2025-03-01
 * @usage /menu
 * @description Xem các lệnh của Bot.
 */
const fs = require('fs');
const path = require('path');

module.exports = (bot) => {
  const moduleDir = path.join(__dirname, '../mdl');

  // Đọc danh sách lệnh từ thư mục mdl/
  function getCommands() {
    let commands = {};
    try {
      const files = fs.readdirSync(moduleDir);
      files.forEach((file) => {
        if (file.endsWith('.js')) {
          const filePath = path.join(moduleDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          const command = fileContent.match(/@command\s+(.+)/)?.[1] || `/${path.basename(file, '.js')}`;
          const category = fileContent.match(/@category\s+(.+)/)?.[1] || "Chưa phân loại";
          const author = fileContent.match(/@author\s+(.+)/)?.[1] || "Không rõ";
          const date = fileContent.match(/@date\s+(.+)/)?.[1] || "Không rõ";
          const usage = fileContent.match(/@usage\s+(.+)/)?.[1] || command;
          const description = fileContent.match(/@description\s+(.+)/)?.[1] || "Không có mô tả.";

          if (!commands[category]) commands[category] = [];
          commands[category].push({ command, author, date, usage, description });
        }
      });
    } catch (err) {
      console.error('Lỗi khi đọc danh sách lệnh:', err);
    }
    return commands;
  }

  // Xử lý khi người dùng nhập /menu
  bot.onText(/\/menu/, (msg) => {
    const chatId = msg.chat.id;
    // Hiển thị trạng thái "đang soạn tin nhắn" (typing...)
    bot.sendChatAction(chatId, 'typing');
    const commands = getCommands();
    const categories = Object.keys(commands);

    if (categories.length === 0) {
      return bot.sendMessage(chatId, '❌ Không có lệnh nào được tìm thấy.');
    }

    // Tạo keyboard chọn loại lệnh
    const keyboard = categories.map(category => [{ text: category, callback_data: `category_${category}` }]);

    bot.sendMessage(chatId, '📂 *Chọn loại lệnh:*', {
      reply_markup: { inline_keyboard: keyboard },
      parse_mode: 'Markdown'
    });
  });

  // Xử lý khi người dùng chọn loại lệnh
  bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const commands = getCommands();

    if (data.startsWith('category_')) {
      const category = data.replace('category_', '');
      if (!commands[category]) return;

      // Tạo nút bấm cho từng lệnh trong loại đó
      const keyboard = commands[category].map(cmd => [{ text: cmd.command, callback_data: `command_${cmd.command}` }]);
      keyboard.push([{ text: '⬅ Quay lại', callback_data: 'back_to_menu' }]);

      bot.editMessageText(`📌 *Danh sách lệnh trong loại: ${category}*`, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: { inline_keyboard: keyboard },
        parse_mode: 'Markdown'
      });
    }

    if (data.startsWith('command_')) {
      const commandName = data.replace('command_', '');
      let commandDetails = null;

      // Tìm thông tin chi tiết của lệnh
      Object.values(commands).forEach(cmdList => {
        cmdList.forEach(cmd => {
          if (cmd.command === commandName) commandDetails = cmd;
        });
      });

      if (!commandDetails) return;

      // Hiển thị chi tiết lệnh
      const detailsMessage = `
📌 *Lệnh:* ${commandDetails.command}
👤 *Tác giả:* ${commandDetails.author}
📅 *Ngày:* ${commandDetails.date}
🔹 *Cách dùng:* \`${commandDetails.usage}\`
📝 *Mô tả:* ${commandDetails.description}
      `;

      bot.editMessageText(detailsMessage, {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: [[{ text: '⬅ Quay lại', callback_data: `category_${data.split('_')[1]}` }]]
        },
        parse_mode: 'Markdown'
      });
    }

    if (data === 'back_to_menu') {
      const categories = Object.keys(commands);
      const keyboard = categories.map(category => [{ text: category, callback_data: `category_${category}` }]);

      bot.editMessageText('📂 *Chọn loại lệnh:*', {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: { inline_keyboard: keyboard },
        parse_mode: 'Markdown'
      });
    }

    bot.answerCallbackQuery(query.id);
  });
};