/**
 * @command /ping
 * @category Hỗ trợ
 * @author tnt
 * @date 2025-03-01
 * @usage /ping
 * @description Kiểm tra tốc độ phản hồi của bot.
 */

module.exports = (bot) => {
    bot.onText(/\/ping/, async (msg) => {
        const chatId = msg.chat.id;
        const startTime = Date.now();

        const sentMessage = await bot.sendMessage(chatId, '🏓 Đang kiểm tra...');
        const endTime = Date.now();
        const ping = endTime - startTime;

        bot.editMessageText(`🏓 *Pong!* \n⏱️ Tốc độ phản hồi: \`${ping}ms\``, {
            chat_id: chatId,
            message_id: sentMessage.message_id,
            parse_mode: 'Markdown'
        });
    });
};
