const express = require("express");
const http = require("http");
const SerialPort = require("serialport");

const config = require("./config");

const app = express();
const httpServer = http.createServer(app);
httpServer.listen(3000, "127.0.0.1", () => {
    console.log("Demo server runs on 127.0.0.1:3000");
});
app.use(express.static("public"));

//----------------Serial--------------------//
const baudRate = 9600;
const lineEnding = '\n';
let sendData = [0,0,0,0,0,0];

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
	const myPort = new SerialPort(inputPortName, {baudRate:inputBaudRate});
	const parser = new SerialPort.parsers.Readline(inputLineEnding);
	myPort.pipe(parser);

	// serial events:
	myPort.on('open', ()=>{showPortOpen(myPort)});
	myPort.on('close', msg => {showPortClose(msg, myPort.path)});
	myPort.on('error', showError);
	parser.on('data', data=>{readSerialData(data,myPort)});

}

const showPortOpen = (port) => {
	console.log('port open. Data rate: ' + port.baudRate);
	setTimeout(()=>{
		port.write(`${sendData.length},${sendData.toString()},`);
	},2000); // initial the handshake
}

const readSerialData = (data, port) => {
		console.log(`serial data ==> ${data}`);
		sendData = sendData.map(()=>{
				return Math.round(Math.random()*300);
		})
		port.write(
				`${sendData.length},${sendData.toString()},`
		);
}

const showPortClose = (msg, comName) => {
	console.log(`Port closed: ${comName},\nwith message:${msg}`);
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

const resetScannerMech = () => {
	// port Send reset code
}