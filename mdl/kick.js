/**
 * @command /kick
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /kick
 * @description Kích thành viên khỏi nhóm.
 */
module.exports = (bot, config) => {
  // Lắng nghe lệnh /kick
  bot.onText(/\/kick/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const replyToMessage = msg.reply_to_message;

    // Kiểm tra xem người dùng có phải là admin không
    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, 'Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    // Kiểm tra xem tin nhắn có được reply không
    if (!replyToMessage) {
      bot.sendMessage(chatId, 'Vui lòng reply (trả lời) tin nhắn và tag người dùng cần kick.');
      return;
    }

    // Lấy thông tin người dùng từ tin nhắn được reply
    const targetUser = replyToMessage.from;
    if (!targetUser) {
      bot.sendMessage(chatId, 'Không tìm thấy người dùng để kick.');
      return;
    }

    const targetUserId = targetUser.id;

    // Kick người dùng (ban rồi unban ngay để kick)
    bot.banChatMember(chatId, targetUserId)
      .then(() => {
        bot.unbanChatMember(chatId, targetUserId);
        bot.sendMessage(chatId, `✅ Người dùng ${targetUser.first_name} đã bị kick khỏi nhóm.`);
      })
      .catch((err) => {
        console.error('Không thể kick người dùng:', err);
        bot.sendMessage(chatId, 'Không thể kick người dùng. Đảm bảo bot có quyền kick thành viên.');
      });
  });
};