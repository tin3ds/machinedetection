const { HttpUtil } = require("../Utils/HttpUtil.js");

class Azure {
  static async getMetadata() {
    let result = {};
    try {
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
      return { error: JSON.stringify(err) };
    }
  }
}
exports.Azure = Azure;
