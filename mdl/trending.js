/**
 * @command /trending
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /trending
 * @description Xem top video đang thịnh hành trên YouTube Việt Nam.
 */
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = (bot) => {
    bot.onText(/\/trending/, async (msg) => {
        const chatId = msg.chat.id;
        
        // Hiển thị trạng thái typing
        bot.sendChatAction(chatId, 'typing');

        try {
            const url = 'https://kworb.net/youtube/trending/vn.html';
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            const $ = cheerio.load(response.data);
            const trendingVideos = [];

            // Phân tích bảng dữ liệu
            $('table tbody tr').each((index, element) => {
                if (index < 10) { // Lấy top 10 video
                    const titleElement = $(element).find('td.text a');
                    const title = titleElement.text().trim();
                    const href = titleElement.attr('href');
                    // Trích xuất video ID từ href (ví dụ: watch?v=...)
                    const videoId = href ? href.split('v=')[1] : null;
                    const link = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#';
                    
                    // Lấy thông tin views và các chỉ số khác
                    const cells = $(element).find('td');
                    const views = $(cells[2]).text().trim(); // Cột Views
                    const views24h = $(cells[3]).text().trim(); // Cột Views 24h
                    
                    if (title) {
                        trendingVideos.push({
                            rank: index + 1,
                            title: title,
                            link: link,
                            views: views,
                            views24h: views24h
                        });
                    }
                }
            });

            if (trendingVideos.length === 0) {
                return bot.sendMessage(chatId, '❌ Không thể lấy dữ liệu trending lúc này. Vui lòng thử lại sau.');
            }

            let message = '🔥 *TOP 10 YOUTUBE TRENDING VIỆT NAM* 🔥\n\n';
            const keyboard = [];

            trendingVideos.forEach((video, i) => {
                message += `*${video.rank}.* ${video.title}\n`;
                // Tạo hàng nút bấm, mỗi hàng 2 nút
                if (i % 2 === 0) {
                    const row = [
                        { text: `🎬 Top ${video.rank}`, callback_data: `yt_info_${i}` }
                    ];
                    if (trendingVideos[i+1]) {
                        row.push({ text: `🎬 Top ${trendingVideos[i+1].rank}`, callback_data: `yt_info_${i+1}` });
                    }
                    keyboard.push(row);
                }
            });

            message += '\n👉 Nhấn vào các nút bên dưới để xem chi tiết video!';

            // Lưu dữ liệu tạm thời để xử lý callback
            global.trendingCache = trendingVideos;

            bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });

        } catch (error) {
            console.error('Lỗi khi crawl YouTube Trending:', error.message);
            bot.sendMessage(chatId, '❌ Đã xảy ra lỗi khi lấy dữ liệu từ kworb.net. Vui lòng thử lại sau.');
        }
    });

    // Xử lý callback_query
    bot.on('callback_query', (query) => {
        const data = query.data;
        const chatId = query.message.chat.id;

        // Xử lý xem chi tiết video
        if (data.startsWith('yt_info_')) {
            const index = parseInt(data.replace('yt_info_', ''));
            const video = global.trendingCache ? global.trendingCache[index] : null;

            if (!video) {
                return bot.answerCallbackQuery(query.id, { text: '❌ Dữ liệu đã hết hạn, vui lòng gõ lại /trending', show_alert: true });
            }

            const detailMsg = `
📌 *THÔNG TIN VIDEO TOP ${video.rank}*

📺 *Tiêu đề:* ${video.title}
👁️ *Tổng lượt xem:* ${video.views}
📈 *Lượt xem 24h qua:* ${video.views24h}

🔗 [Xem trên YouTube](${video.link})
            `;

            bot.sendMessage(chatId, detailMsg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📺 Xem ngay trên YouTube', url: video.link }],
                        [{ text: '⬅ Quay lại danh sách', callback_data: 'yt_back' }]
                    ]
                }
            });
            bot.answerCallbackQuery(query.id);
        }

        // Xử lý quay lại danh sách
        if (data === 'yt_back') {
            bot.deleteMessage(chatId, query.message.message_id);
            bot.answerCallbackQuery(query.id);
        }
    });
};
