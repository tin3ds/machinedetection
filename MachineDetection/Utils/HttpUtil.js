const http = require(`http`);
const https = require(`https`);

class HttpUtil {
    // NOTE: should be private
    static headers = {
        aws: {},
        azure: {
            Metadata: `true`,
        },
        gcp: {
            "Metadata-Flavor": `Google`,
        },
        oracle: {
            "Authorization": "Bearer Oracle"
        },
        coreweave: {},
    };

    static buildParams(cloudProvider, path) {
        return {
            hostname: `169.254.169.254`,
            path: path,
            headers: HttpUtil.headers[cloudProvider],
        };
    };

    static httpRequest(params) {
        return new Promise(function (resolve, reject) {
            const request = http.request({ ...params }, function (res) {
                let data = ``;

                res.on(`data`, (chunk) => {
                    data += chunk;
                });

                res.on(`end`, () => {
                    if (res.statusCode === 200) {
                        return resolve(data);
                    } else if (res.statusCode === 404) {
                        return reject({message: `Tag with field name not found.`, params});
                    } else {
                        return reject({message: `Error retrieving VM information. Status code: ${res.statusCode}`, params});
                    }
                });
            });

            request.on(`error`, (error) => {
                return reject({message: `Error retrieving VM information: ${error.message}`, params});
            });

            // Set a timeout for the request
            const timeout = setTimeout(() => {
                request.destroy(); // Destroy the request if it takes longer than 5 seconds
                return reject({message: `Request timed out after 15 seconds`, params});
            }, 15000);

            request.on(`response`, (res) => {
                clearTimeout(timeout); // Clear the timeout if the response is received
            });

            request.end();
        });
    }

    static httpsRequest(params, postBody) {
        return new Promise(function (resolve, reject) {
          const request = https.request(params, function (res) {
            let data = "";
      
            res.on("data", (chunk) => {
              data += chunk;
            });
      
            res.on("end", () => {
              if (res.statusCode === 200) {
                return resolve(data);
              } else if (res.statusCode === 404) {
                return reject({message: `Tag with field name not found.`, params});
              } else {
                return reject({message: `Error retrieving VM information. Status code: ${res.statusCode}`, params});
              }
            });
          });
      
          request.write(postBody);
      
          request.on("error", (error) => {
            return reject({message: `Error retrieving VM information: ${error.message}`, params});
          });

          // Set a timeout for the request
          const timeout = setTimeout(() => {
            request.destroy(); // Destroy the request if it takes longer than 5 seconds
            return reject({message: `Request timed out after 15 seconds`, params});
        }, 15000);

        request.on(`response`, (res) => {
            clearTimeout(timeout); // Clear the timeout if the response is received
        });
      
          request.end();
        });
      }

}
exports.HttpUtil = HttpUtil;