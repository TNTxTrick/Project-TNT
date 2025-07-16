/**
 * @command /locket
 * @category Tools
 * @author tnt
 * @usage
 * /locket spam [url] [số luồng] [tin nhắn]
 * /locket delete
 */
const axios = require('axios');

// Biến quản lý trạng thái hội thoại cho chức năng delete
const conversationState = {};

module.exports = (bot) => {
    const LOCKET_SPAM_API = 'https://locket-api-c4ji.onrender.com/spam_friend_request';
    const LOCKET_DELETE_API = 'https://locket-api-c4ji.onrender.com/delete_friend_request';

    bot.onText(/\/locket(?: (.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const args = match[1] ? match[1].split(' ') : [];
        const subcommand = args.shift()?.toLowerCase();

        if (!subcommand) {
            const usageText = `
🔑 **Hướng dẫn sử dụng lệnh Locket:**

1️⃣ **Spam kết bạn (dùng trong nhóm hoặc riêng):**
   \`\`\`/locket spam [url] [số luồng] [tin nhắn]\`\`\`
   *-* \`url\`: Link Locket của người bạn muốn spam.
   *-* \`số luồng\`: Số luồng chạy (ví dụ: 50).
   *-* \`tin nhắn\`: Lời nhắn bạn muốn gửi.

2️⃣ **Xóa lời mời kết bạn (chỉ dùng khi nhắn riêng bot):**
   \`\`\`/locket delete\`\`\`
   Bot sẽ hỏi bạn thông tin tài khoản để tiến hành xóa.
            `;
            return bot.sendMessage(chatId, usageText, { parse_mode: 'Markdown' });
        }

        switch (subcommand) {
            case 'spam':
                await handleSpam(chatId, args);
                break;
            case 'delete':
                // Bắt buộc phải chat riêng
                if (msg.chat.type !== 'private') {
                    return bot.sendMessage(chatId, '🗑️ Để bảo mật, vui lòng **nhắn tin riêng** cho bot để sử dụng chức năng xóa lời mời kết bạn.');
                }
                // Bắt đầu cuộc hội thoại để lấy thông tin
                conversationState[userId] = { step: 'delete_email', data: {} };
                bot.sendMessage(chatId, 'Vui lòng nhập **email** tài khoản Locket của bạn:', { parse_mode: 'Markdown' });
                break;
            default:
                bot.sendMessage(chatId, 'Lệnh không hợp lệ. Gõ `/locket` để xem hướng dẫn.');
                break;
        }
    });

    // Hàm xử lý tin nhắn trong cuộc hội thoại (cho chức năng delete)
    bot.on('message', async (msg) => {
        const userId = msg.from.id.toString();
        const text = msg.text;

        if (!conversationState[userId] || text.startsWith('/')) return;
        
        const state = conversationState[userId];
        const chatId = msg.chat.id;

        try {
            switch (state.step) {
                case 'delete_email':
                    state.data.email = text;
                    state.step = 'delete_password';
                    bot.sendMessage(chatId, 'Vui lòng nhập **mật khẩu** của bạn:', { parse_mode: 'Markdown' });
                    break;
                case 'delete_password':
                    state.data.password = text;
                    state.step = 'delete_limit';
                    bot.sendMessage(chatId, 'Nhập **số lượng** lời mời muốn xóa (ví dụ: 50):', { parse_mode: 'Markdown' });
                    break;
                case 'delete_limit':
                    if (isNaN(parseInt(text))) return bot.sendMessage(chatId, 'Vui lòng nhập một con số hợp lệ.');
                    state.data.limit = parseInt(text);
                    state.step = 'delete_threads';
                    bot.sendMessage(chatId, 'Nhập **số luồng** để chạy (ví dụ: 3):', { parse_mode: 'Markdown' });
                    break;
                case 'delete_threads':
                    if (isNaN(parseInt(text))) return bot.sendMessage(chatId, 'Vui lòng nhập một con số hợp lệ.');
                    state.data.num_threads = parseInt(text);
                    // Kết thúc hội thoại và gọi API
                    delete conversationState[userId];
                    await handleDelete(chatId, state.data); // Gọi hàm handleDelete đã được thêm vào
                    break;
            }
        } catch (error) {
            delete conversationState[userId];
            console.error(error);
            bot.sendMessage(chatId, 'Đã có lỗi xảy ra trong quá trình xử lý.');
        }
    });

    // --- CÁC HÀM XỬ LÝ API ---

    async function handleSpam(chatId, args) {
        if (args.length < 3) {
            return bot.sendMessage(chatId, '❌ Sai cú pháp! Dùng: `/locket spam [url] [số luồng] [tin nhắn]`');
        }

        const target_url = args[0];
        const num_threads = parseInt(args[1]);
        const custom_username = args.slice(2).join(' ');

        if (isNaN(num_threads)) {
            return bot.sendMessage(chatId, '❌ Số luồng phải là một con số.');
        }

        const payload = {
            target_url,
            custom_username,
            use_emoji: true,
            num_threads
        };

        bot.sendMessage(chatId, '🚀 Đang gửi yêu cầu spam (phiên bản nâng cao), vui lòng chờ...');

        try {
            const response = await axios.post(LOCKET_SPAM_API, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
                }
            });

            const data = response.data;

            if (data.status === 'success') {
                const message = data.message;
                const totalProxies = data.proxy_info.total_proxies;
                const refreshTime = data.proxy_info.next_proxy_refresh;

                const resultText = `
✅ **${message}**

- **Tổng số proxy có sẵn:** \`${totalProxies}\`
- **Thời gian làm mới proxy:** ${refreshTime}
                `;
                bot.sendMessage(chatId, resultText, { parse_mode: 'Markdown' });
            } else {
                bot.sendMessage(chatId, `⚠️ Có lỗi xảy ra: ${data.message || 'API không báo thành công.'}`);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể kết nối đến server API.';
            bot.sendMessage(chatId, `❌ Lỗi: ${errorMessage}`);
        }
    }

    // --- HÀM BỊ THIẾU ĐÃ ĐƯỢC BỔ SUNG ---
    async function handleDelete(chatId, data) {
        bot.sendMessage(chatId, '🗑️ Đang gửi yêu cầu xóa lời mời, vui lòng chờ...');

        try {
            const response = await axios.post(LOCKET_DELETE_API, {
                email: data.email,
                password: data.password,
                limit: data.limit,
                num_threads: data.num_threads
            }, {
                // Thêm header cho chắc chắn, đề phòng API này cũng kiểm tra User-Agent
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
                }
            });

            // Gửi thông báo từ API về cho người dùng
            bot.sendMessage(chatId, `📢 **Thông báo từ API:**\n${response.data.message}`);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể kết nối đến server API.';
            bot.sendMessage(chatId, `❌ **Lỗi:** ${errorMessage}`);
        }
    }
};
