/**
 * @command /welcome
 * @category Quản trị
 * @author tnt
 * @date 2025-03-01
 * @usage /welcome on/off
 * @description Bật/tắt thông báo chào mừng khi có người mới tham gia.
 */
module.exports = (bot, config) => {
  let welcomeEnabled = true; // Mặc định bật thông báo

  // Lắng nghe lệnh /welcome on|off
  bot.onText(/\/welcome (on|off)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const command = match[1]; // Lấy giá trị on hoặc off

    // Kiểm tra xem người dùng có phải là admin không
    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, 'Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    // Bật/tắt thông báo
    if (command === 'on') {
      welcomeEnabled = true;
      bot.sendMessage(chatId, 'Thông báo khi có người tham gia đã được bật.');
    } else if (command === 'off') {
      welcomeEnabled = false;
      bot.sendMessage(chatId, 'Thông báo khi có người tham gia đã được tắt.');
    }
  });

  // Lắng nghe sự kiện có người tham gia nhóm
  bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;
    const newMembers = msg.new_chat_members;

    // Kiểm tra xem thông báo có được bật không
    if (!welcomeEnabled) return;

    // Duyệt qua từng người dùng mới
    newMembers.forEach((user) => {
      const userId = user.id;
      const userName = user.first_name || user.username || 'Người dùng';
      const userLink = `tg://user?id=${userId}`;
      const groupName = msg.chat.title;
      const joinTime = new Date().toLocaleString();

      // Tạo thông báo
      const welcomeMessage = `
🎉 Chào mừng ${userName} đã tham gia nhóm ${groupName}!
👤 ID: ${userId}
📝 Tên: ${userName}
🔗 Link: ${userLink}
⏰ Thời gian: ${joinTime}
      `;

      // Gửi thông báo
      bot.sendMessage(chatId, welcomeMessage);
    });
  });
};