const { HttpUtil } = require('../Utils/HttpUtil.js');

class AWS {
    // NOTE: should be private
    static urls = [
        {
            path: `/latest/meta-data/instance-id`,
            field: `instance-id`,
        },
        {
            path: `/latest/meta-data/placement/region`,
            field: `region`,
        },
    ];

    static async getMetadata() {
        try {
            let result = {};
            for (const url of AWS.urls) { // promise parallel
                const params = HttpUtil.buildParams(`aws`, url.path);
                const res = await HttpUtil.httpRequest(params);
                result[url.field] = res;
            }

            let { data, error } = await AWS.getTags();

            if (error) {
                result[`tags`] = [];
                result[`platformType`] = 2;
                console.error(`Err: ${JSON.stringify(result)} - ${error}`);
                return { data: result };
            }
            result[`tags`] = data;
            result[`platformType`] = 2;
            return { data: result };
        } catch (err) {
            return { error: JSON.stringify(err) }
        }
    }

    // NOTE: should be private
    static async getTags() {
        try {
            // Detect Allow tags in instance metadata is checked
            try {
                const params = HttpUtil.buildParams(`aws`, `/latest/meta-data/tags/`);
                await HttpUtil.httpRequest(params);
            } catch (error) {
                return { error: 'AWS Metadata tag is not allowed, file /MachineDetection/Clouds/AWS.js' };
            }

            const params = HttpUtil.buildParams(`aws`, `/latest/meta-data/tags/instance/`);
            const res = await HttpUtil.httpRequest(params);
            const tagKeys = res.split(`\n`);
            const result = {};

            for (const tagKey of tagKeys) {
                const params = HttpUtil.buildParams(
                    `aws`,
                    `/latest/meta-data/tags/instance/${tagKey}`
                );

                result[tagKey] = await HttpUtil.httpRequest(params);
            }
            return { data: result };
        } catch (err) {
            return { error: JSON.stringify(err) }
        }
    }
}

exports.AWS = AWS;
