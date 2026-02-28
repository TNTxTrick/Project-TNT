/**
 * @command /spamsms
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /spamsms <số điện thoại>
 * @description Spam SMS đến số điện thoại chỉ định.
 */
const axios = require('axios');

module.exports = (bot) => {
  bot.onText(/\/spamsms (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;

    // Lấy số điện thoại từ lệnh
    const phone = match[1];

    if (!phone) {
      return;
    }

    try {
      // Gọi API spam SMS
      await axios.get(`https://spam-l3qm.onrender.com/spam/${phone}`);

      // Chỉ thông báo thành công, không kiểm tra phản hồi từ API
      bot.sendMessage(chatId, `✅ Đang tiến hành spam sms *${phone}* \nVui lòng đợi 1 phút để spam lại nhé!`, { parse_mode: 'Markdown' });
    } catch (err) {
      // Không thông báo lỗi
    }
  });
};