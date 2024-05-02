const { HttpUtil } = require("../Utils/HttpUtil.js");
const { TelegramNotiUtil } = require("../Utils/TelegramNotiUtil.js");

class Oracle {
  static async getMetadata() {
    let result = {};
    try {
      const params = HttpUtil.buildParams(`oracle`, `/opc/v2/instance/`);
      let res = await HttpUtil.httpRequest(params);
      res = JSON.parse(res);

      result[`instance-id`] = res.id;
      result[`region`] = res.region;
      result[`name`] = res.hostname;
      result[`tags`] = res.freeformTags;
      result[`platformType`] = 5;
      return { data: result };
    } catch (err) {
      TelegramNotiUtil.postToTelegram(
        `GCP Err: ${JSON.stringify(result)} - ${err.message}`
      );

      return { error: JSON.stringify(err) };
    }
  }
}
exports.Oracle = Oracle;
