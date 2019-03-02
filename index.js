const express = require("express");
const http = require("http");
const SerialPort = require("serialport");
const SocketIO = require("socket.io");

const config = require("./config");

const app = express();
const httpServer = http.createServer(app);
httpServer.listen(3000, "127.0.0.1", () => {
    console.log("Demo server runs on 127.0.0.1:3000");
});
app.use(express.static("public"));

const io = SocketIO(httpServer);

io.on("connection", socket => {
	//console.log("conn",socket.id);

	socket.on("addScanRequest",() => {
		reqestScanMech();
	});

	socket.on("downloadPCLRequest",() => {
		// console.log("request a download PCL!!");
	});

	// socket.on("disconnect", () => {
	// 	console.log("disconn", socket.id);
	// });
});

//----------------Serial--------------------//
const baudRate = 9600;
const lineEnding = '\n';
let busyBlocker = false;

let MCUPort = undefined;

const searchPort = () =>{
	console.log("Start looking for available port.")
	SerialPort.list( (err, ports) => {
		if(err){
			console.log(err);
			return;
		}
	
		let portName = undefined;
		ports.some( port => {
			// console.log(port.comName);
			for(const choice of config.portChoices){
				if(port.comName === choice){
					portName = port.comName;
					return true;
				}
			}
		});
	
		console.log( portName? `Initial connection to: ${portName}`: `No desired port founded.`)
	
		if(!portName){
			startRetrySearchPort();
			return;
		}
		setupSerialConnection(portName, baudRate, lineEnding);
	});	
}

const setupSerialConnection = (inputPortName, inputBaudRate, inputLineEnding) =>{
	MCUPort = new SerialPort(inputPortName, {baudRate:inputBaudRate});
	const parser = new SerialPort.parsers.Readline(inputLineEnding);
	MCUPort.pipe(parser);

	// serial events:
	MCUPort.on('open', data=>{showPortOpen(MCUPort)});
	MCUPort.on('close', msg => {showPortClose(msg, MCUPort.path)});
	MCUPort.on('error', showError);
	parser.on('data', data=>{readSerialData(data, MCUPort)});
}

const showPortOpen = (port) => {
	console.log('port open. Data rate: ' + port.baudRate);
	setTimeout(()=>{
		port.write(config.commands.resetAll);
	},2000); // initial the handshake
}

const readSerialData = (data, port) => {
		console.log(`serial data ==> ${data}`);
		switch(data){
			case 'pitch_cycle_done':
				busyBlocker = false;
				break;
		}
		// sendData = sendData.map(()=>{
		// 		return Math.round(Math.random()*300);
		// })
		// port.write(
		// 		`${sendData.length},${sendData.toString()},`
		// );
}

const showPortClose = (msg, comName) => {
	console.log(`Port closed: ${comName},\nwith message: ${msg}`);
	startRetrySearchPort();
}

const showError = (error) => {
	console.log('Serial port error: ' + error);
}

const startRetrySearchPort = () => {
	setTimeout(searchPort,1000);
}

// Kick off
searchPort();

const reqestScanMech = () => {
	if(!MCUPort || busyBlocker){return;}
	console.log("request a new scan!!");
	MCUPort.write(config.commands.startScan);
	busyBlocker = true;
}

const resetScannerMech = () => {
	if(!MCUPort){return;}
	MCUPort.write(config.commands.resetAll);
}