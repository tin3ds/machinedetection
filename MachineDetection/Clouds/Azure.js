const { HttpUtil } = require("../Utils/HttpUtil.js");
const { TelegramNotiUtil } = require('../Utils/TelegramNotiUtil.js');

class Azure {
  static async getMetadata() {
    try {
      let result = {};
      const params = HttpUtil.buildParams(
        `azure`,
        `/metadata/instance?api-version=2021-02-01`
      );
      const res = await HttpUtil.httpRequest(params);
      const jsonRes = JSON.parse(res);
      const { vmId, location, tagsList } = jsonRes.compute;

      result[`instance-id`] = vmId;
      result[`region`] = location;
      result[`tags`] = {};
      console.log("tagsList");
      console.dir(tagsList);
      for (const elem of tagsList) {
        result[`tags`][elem.name] = elem.value;
      }
      result[`platformType`] = 4;
      return { data: result };
    } catch (err) {
      TelegramNotiUtil.postToTelegram(`GCP Err: ${JSON.stringify(result)} - ${err.message}`);
      return { error: JSON.stringify(err) };
    }
  }
}
exports.Azure = Azure;
