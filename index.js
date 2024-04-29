const {MachineDetectionManager} = require("./MachineDetection/MachineDetectionManager");

async function  main(){
    const response= await MachineDetectionManager.detect();
    console.dir(response)
    console.log(JSON.stringify(response))
}

main();