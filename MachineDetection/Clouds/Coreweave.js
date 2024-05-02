const { HttpUtil } = require("../Utils/HttpUtil.js");
const fs = require("fs");
const os = require("os");
const path = require("path");

class Coreweave {
  static async getMetadata() {
    let vmName = ``;
    let namespace = ``;
    try {
      //C:\Users\fiswat-win10\Desktop
      //path.join(os.userInfo().homedir, "Desktop", "vm-name.txt")
      //const data = fs.readFileSync("C:\\Users\\e3ds\\Desktop\\vm-name.txt", "utf8");
      const data = fs.readFileSync(
        path.join(os.userInfo().homedir, "Desktop", "vm-name.txt"),
        "utf8"
      );
      //const data = fs.readFileSync("C:\\Users\\fiswat-win10\\Desktop\\vm-name.txt", "utf8");

      const arr = data.split(",");
      vmName = arr[0];
      namespace = arr[1];

      const res = await HttpUtil.httpsRequest(
        {
          hostname: "new-azure-vm-api.eaglepixelstreaming.com",
          path: "/api/v1/coreweave/get-tags",
          port: 443,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
        JSON.stringify({
          instanceName: vmName,
          namespace: namespace,
        })
      );

      const jsonRes = JSON.parse(res);
      //console.log("jsonRes:", jsonRes);
      //console.dir( jsonRes);
      const resData = jsonRes.data;
      if (!resData) {
        return { error: jsonRes };
      }
      //console.log("resData:", resData);
      console.dir(resData);
      let result = {};

      result[`instance-id`] = vmName;
      result[`region`] = null;
      result[`name`] = vmName;
      result[`namespace`] = namespace;
      result[`platformType`] = 6;
      result[`tags`] = resData.tags;
      result[`region`] = resData.region;
      result[`regionName`] = resData.regionName;

      console.log("====== THIS Coreweave MACHINE =======");
      console.log("namespace:", namespace);
      console.log("instanName:", vmName);
      console.log("tags:", resData.tags);

      async function sleep(time) {
        return new Promise((resolve) => {
          setTimeout(resolve, time);
        });
      }
      //await sleep(30000);
      return { data: result };
    } catch (err) {
      console.log("Coreweave error: ");
      if (
        err &&
        err.message &&
        typeof err.message == "string" &&
        err.message.length &&
        err.message.startsWith(`Request timed out after`)
      ) {
        let result = {};
        result[`instance-id`] = vmName;
        result[`region`] = null;
        result[`name`] = vmName;
        result[`namespace`] = namespace;
        result[`platformType`] = 6;
        result[`tags`] = {};
        console.log("SENDING HALF RESPONSE");
        return { data: result };
      }
      //console.log(JSON.stringify(err))
      //console.dir(err)
      //console.log(err.toString())
      //console.log(err.stack)
      return { error: JSON.stringify(err) };
    }
  }
}
exports.Coreweave = Coreweave;
