const { HttpUtil } = require('../Utils/HttpUtil.js');
const { TelegramNotiUtil } = require('../Utils/TelegramNotiUtil.js');

class GCP {
    // NOTE: should be private
    static urls = [
        {
            field: `name`,
            path: `http://metadata.google.internal/computeMetadata/v1/instance/name`,
        },
        {
            field: `instance-id`,
            path: `http://metadata.google.internal/computeMetadata/v1/instance/id`,
        },
        {
            field: `zone`,
            path: `http://metadata.google.internal/computeMetadata/v1/instance/zone`,
        },
    ];

    static async getMetadata() {
        let result = {};
        try {
            //return {data: {"instance-id" : 34, region: 'bd-asia', "platformType" : 4, tags: ['apps', 'servers', 'host']  }}
            for (const url of GCP.urls) {
                const params = HttpUtil.buildParams(`gcp`, url.path);
                const res = await HttpUtil.httpRequest(params);
				//console.log("----res");
				//console.dir(res);
                //console.logColor(logging.Yellow, `${url.field}: ${res}`);
                if (url.field === `instance-id`) {
                    result[`instance-id_real`] = res;
                }

                if (url.field === `zone`) {
                    result[`region`] = res;
                }

                if (url.field === `name`) {
                    result[`name`] = res;
					result[`instance-id`] = res;
                }
            }

            let { data, error } = await GCP.getTags();

            if (error) {
                result[`tags`] = [];
                result[`platformType`] = 3;
                console.error(`Err: ${JSON.stringify(result)} - ${error}`);
                TelegramNotiUtil.postToTelegram(`GCP Err: ${JSON.stringify(result)} - ${error}`);
                return { error, data: result };
            }
            //console.logColor(logging.Yellow, `tags: ${JSON.stringify(tags)}`);

            //console.log(`tags:`, tags);
            result[`tags`] = data;
            result[`platformType`] = 3;
            return { data: result };
        } catch (err) {
            TelegramNotiUtil.postToTelegram(`GCP Err: ${JSON.stringify(result)} - ${err.message}`);
            return { error: JSON.stringify(err) }
        }
    }

    // NOTE: should be private
    static async getTags() {
        try {

            //const params = HttpUtil.buildParams(`gcp`, `http://metadata.google.internal/computeMetadata/v1/instance/guest-attributes/e3ds/`);

			//const params = HttpUtil.buildParams(`gcp`, `http://metadata.google.internal/computeMetadata/v1/instance/guest-attributes`);
			const params = HttpUtil.buildParams(`gcp`, `http://metadata.google.internal/computeMetadata/v1/instance/attributes/`);
			//http://metadata.google.internal/computeMetadata/v1/instance/attributes/
			//console.log(" -------params");
			//console.log(JSON.stringify(params))
            const res = await HttpUtil.httpRequest(params);
			//console.log("--- getTags() res");
			//console.log(typeof res);
			//console.log(res.length)
			//console.log(res)
			//const labels = response.data.labels;
            const tagKeys = res.split(`\n`);

            if (!tagKeys.includes('enable-guest-attributes')) {
                return { error: 'GCP Metadata tag is not allowed, file /MachineDetection/Clouds/GCP.js' };
            }

            const result = {};

            for (const tagKey of tagKeys) {
                if (tagKey) {
                    //const params = HttpUtil.buildParams(`gcp`, `http://metadata.google.internal/computeMetadata/v1/instance/guest-attributes/e3ds/${tagKey}`);
					const params = HttpUtil.buildParams(`gcp`, `http://metadata.google.internal/computeMetadata/v1/instance/attributes/${tagKey}`);
                    result[tagKey] = await HttpUtil.httpRequest(params);
                }
            }
            return { data: result };
        } catch (err) {
			console.log("----- getTags() err");
			console.dir(err);
            return { error: JSON.stringify(err) }
        }
    }
}

exports.GCP = GCP;
