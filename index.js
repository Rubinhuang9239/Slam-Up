const express = require("express");
const http = require("http");
const app = express();
const httpServer = http.createServer(app);
httpServer.listen(3000, "127.0.0.1", () => {
    console.log("Demo server runs on 127.0.0.1:3000");
});
app.use(express.static("public"));