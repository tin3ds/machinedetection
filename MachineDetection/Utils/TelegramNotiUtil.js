class TelegramNotiUtil {
  static postToTelegram(message) {
    console.log("posting");
    const axios = require("axios");
    axios
      .post(
        "https://notifications.eagle3dstreaming.com/message_sent",
        {
          input_chat_id: -4145896683,
          message: message,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log("message sent:" + message);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
exports.TelegramNotiUtil = TelegramNotiUtil;
