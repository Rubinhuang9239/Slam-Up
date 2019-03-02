const config = {

    portChoices:  ["/dev/ttyACM0", "/dev/tty.usbmodem1412401", "/dev/tty.usbmodem143201"],
    commands:{
        resetAll: "0",
        startScan: "1",
        resetPitch: "2",
        resetYaw: "3",
        statusLed:{
            standby: "4", // yellow
            scanError: "5", // red
            connectionError: "6", // orange
            batteryError: "7"
        }
    }
}
module.exports = config;