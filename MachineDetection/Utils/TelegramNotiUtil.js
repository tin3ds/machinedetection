const { HttpUtil } = require('./HttpUtil');

class TelegramNotiUtil {
  static async postToTelegram(message) {
    console.log("posting");
    await HttpUtil.httpsRequest(
      {
        hostname: "notifications.eagle3dstreaming.com",
        path: "/message_sent",
        port: 443,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      JSON.stringify({
        input_chat_id: -4151990773,
        message: message,
      })
    );
  }
}
exports.TelegramNotiUtil = TelegramNotiUtil;
