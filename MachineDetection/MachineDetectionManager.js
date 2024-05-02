const fs = require(`fs`).promises
const path = require(`path`)
const logging = require('../logging.js');

//NOTE: added for nexe
const {AWS} =  require('./Clouds/AWS.js');
const {Azure} =  require('./Clouds/Azure.js');
const {GCP} =  require('./Clouds/GCP.js');
const {Oracle} =  require('./Clouds/Oracle.js');
const {Coreweave} =  require('./Clouds/Coreweave.js');
const cloudModules = [AWS, Azure, GCP, Oracle, Coreweave];

const { EventEmitter } = require('events');
class MachineDetectionManager {
    static #emitter = new EventEmitter();
    static async detect(instanceId, computerName) {

        return new Promise(async (resolve, reject) => {
            try {
                let isResolved = false;
				//NOTE: commented out for nexe
                //const cloudFolderPath = path.join(__dirname, `Clouds`);
                //const files = await fs.readdir(cloudFolderPath);

				let tasks = [];

				//NOTE: added for nexe
				for(const cloudModule of cloudModules){
					if (typeof cloudModule.getMetadata === `function`) {
                        tasks.push(cloudModule.getMetadata);
                    } else {
                        console.logColor(logging.Red, `ERROR: No getMetadata function found in ${file}`);
                    }
				}

				//NOTE: commented out for nexe
                /*for (const file of files) {
                    if (path.extname(file) === `.js`) {
                        const fileName = file.split(`.`)[0];
                        const modulePath = path.join(cloudFolderPath, file);
                        const cloudModule = require(modulePath)[fileName];
                        //console.logColor(logging.Blue, `Invoking ${fileName} detection check at ${new Date().toISOString()}`)
                        if (typeof cloudModule.getMetadata === `function`) {
                            tasks.push(cloudModule.getMetadata);
                        } else {
                            console.logColor(logging.Red, `ERROR: No getMetadata function found in ${file}`);
                        }
                    }
                }*/
                const tasksLength = tasks.length;
                let tasksExecutedCount = 0;

                if (!tasksLength) {
                    return resolve({ data: { tags: [], platformType: 1 } });
                }


                const resolveEventName = `resolve`;
                const rejectEventName = `reject`;
                MachineDetectionManager.#emitter.once(resolveEventName, (data) => {
                    isResolved = true;
                    tasksExecutedCount++;
                    MachineDetectionManager.#emitter.removeAllListeners(rejectEventName);
                    return resolve({ data });
                })

                MachineDetectionManager.#emitter.on(rejectEventName, (error) => {
                    //console.log(`error: ${error}`)
                    //console.log(`rejectEventName: ${rejectEventName}`);
                    tasksExecutedCount++;
                    if (isResolved) {
                        console.log(`isResolved: ${isResolved}`);
                        return MachineDetectionManager.#emitter.removeAllListeners(rejectEventName);
                    }
                    if (tasksExecutedCount >= tasksLength) {
                        //console.log(`tasksExecutedCount: ${tasksExecutedCount}`);
                       // console.log(`tasksLength: ${tasksLength}`);
                        MachineDetectionManager.#emitter.removeAllListeners(resolveEventName);
                        MachineDetectionManager.#emitter.removeAllListeners(rejectEventName);
                        return resolve({ data: { tags: [], platformType: 1 } })
                    }
                })

                MachineDetectionManager.handleTasksResponses(tasks, resolveEventName, rejectEventName, instanceId, computerName);
                // if (responses.length > 1) {
                //     return { error: `Multiple Clouds Detected`, meta: responses }
                // }

            } catch (err) {
                return resolve({ error: `Critical error while detecting machine`, meta: err.toString() });
            }
        })

    }

    static isExe(){
        return process.argv[0].endsWith(`EL.exe`);
    }

    // should be private
    static handleTasksResponses(tasks, resolveEventName, rejectEventName, instanceId, computerName) {
        tasks.forEach((task, index) => {
            task()
                .then((result) => {
                    const { data, error } = result;
                    if (data) {
                        return MachineDetectionManager.#emitter.emit(resolveEventName, data);
                    }else{
                        console.warn("WARNING:\n-------------");
                        console.dir(error);
                        console.warn("-------------")

                        if(!MachineDetectionManager.isExe()){
                            if(typeof error === `string` && (error.search(`EACCES`)>-1 ||error.search(`ENOTFOUND`)>-1 || error.search(`ENETUNREACH`)>-1)){
                                MachineDetectionManager.postToTelegram(instanceId, computerName, error);
                                setInterval(()=>{
                                    MachineDetectionManager.postToTelegram(instanceId, computerName, error)
                                }, 300000)
                            }

                            if(error.constructor === {}.constructor && error.message.search("not found") > -1){
                                MachineDetectionManager.postToTelegram(instanceId, computerName,JSON.stringify(error));
                                setInterval(()=>{
                                    MachineDetectionManager.postToTelegram(instanceId, computerName,JSON.stringify(error));
                                }, 300000)
                            }
                        }
                        return MachineDetectionManager.#emitter.emit(rejectEventName, error);
                    }
                })
                .catch((error) => {
                    return MachineDetectionManager.#emitter.emit(rejectEventName, error);
                })
        });
    }

    // NOTE : should be private
    static printEventList() {
        const eventNames = MachineDetectionManager.#emitter.eventNames();
        console.logColor(logging.Yellow, `Event List: `);

        if (!eventNames.length) {
            console.logColor(logging.Yellow,` - Empty `)
        }
        for (const eventName of eventNames) {
            const listeners = MachineDetectionManager.#emitter.listeners(eventName);
            console.logColor(logging.Yellow,` - name: ${eventName} | listeners: ${listeners.length}`)
        }
    }

    static postToTelegram(instanceId, computerName, message) {
        console.log("posting")
        const axios = require('axios')
        axios.post("https://notifications.eagle3dstreaming.com/message_sent",
            {
                "input_chat_id": -4145896683,
                "message": instanceId + " : " + computerName + " -> " + message
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((res) => {
                console.log("message sent:" + message);

            })
            .catch(err => {
                console.error(err);
            });
    }
}
exports.MachineDetectionManager = MachineDetectionManager;
