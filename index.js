const express = require("express");
const http = require("http");
const SerialPort = require("serialport");
const app = express();
const httpServer = http.createServer(app);
httpServer.listen(3000, "127.0.0.1", () => {
    console.log("Demo server runs on 127.0.0.1:3000");
});
app.use(express.static("public"));

//----------------Serial--------------------//
const portNameChoice = ["/dev/ttyACM0"];
const baudRate = 9600;
const lineEnding = '\n';
let sendData = [0,0,0,0,0,0];

const searchPort = () =>{
	SerialPort.list( (err, ports) => {
		if(err){
			console.log(err);
			return;
		}
	
		let portName = undefined;
		ports.some( port => {
			console.log(port);
			for(const choice of portNameChoice){
				if(port.comName === choice){
					portName = port.comName;
					return true;
				}
			}
		});
	
		console.log( portName? `Initial connection to: ${portName}`: `No desired port founded.`)
	
		if(portName){
			setupSerialConnection(portName, baudRate, lineEnding);
		}
	});	
}

const setupSerialConnection = (inputPortName, inputBaudRate, inputLineEnding) =>{
	const myPort = new SerialPort(inputPortName, {baudRate:inputBaudRate});// open the port
	const parser = new SerialPort.parsers.Readline(inputLineEnding);	// make instance of Readline parser
	myPort.pipe(parser);													// pipe the serial stream to the parser

	// these are the definitions for the serial events:
	myPort.on('open', ()=>{showPortOpen(myPort)});    // called when the serial port opens
	myPort.on('close', showPortClose);  // called when the serial port closes
	myPort.on('error', showError);   // called when there's an error with the serial port
	parser.on('data', data=>{readSerialData(data,myPort)});  // called when there's new data incoming

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

const showPortClose = (portName) => {
	console.log(`Port closed: ${portName}`);
}

const showError = (error) => {
	console.log('Serial port error: ' + error);
}

// Kick off
searchPort();