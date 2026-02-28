/**
 * @command /weather
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /weather <tên thành phố>
 * @description Xem thời tiết tại các tỉnh thành.
 */
const axios = require('axios');

module.exports = (bot) => {
    bot.onText(/\/weather (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const city = match[1];
        // Hiển thị trạng thái "đang soạn tin nhắn" (typing...)
        bot.sendChatAction(chatId, 'typing');

        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=895284fb2d2c1d877c724822b7485ed2&units=metric&lang=vi`);
            const data = response.data;

            const weatherInfo = `
🌡️ *Thời tiết tại ${data.name}, ${data.sys.country}*

☁️ *Trạng thái:* ${data.weather[0].description}
🌡️ *Nhiệt độ:* ${data.main.temp}°C (Cảm giác: ${data.main.feels_like}°C)
💧 *Độ ẩm:* ${data.main.humidity}%
💨 *Tốc độ gió:* ${data.wind.speed} m/s
🌅 *Bình minh:* ${new Date(data.sys.sunrise * 1000).toLocaleTimeString('vi-VN')}
🌇 *Hoàng hôn:* ${new Date(data.sys.sunset * 1000).toLocaleTimeString('vi-VN')}
            `;

            bot.sendMessage(chatId, weatherInfo, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Lỗi khi lấy thời tiết:', error.message);
            bot.sendMessage(chatId, '❌ Không tìm thấy thông tin thời tiết cho thành phố này. Vui lòng kiểm tra lại tên thành phố.');
        }
    });
};
