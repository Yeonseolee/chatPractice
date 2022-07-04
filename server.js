
console.log("hello world");


const express = require("express");
var moment = require("moment");
var WebSocketServer = require('websocket').server; 
var app = express();
const http = require('http');
const { url } = require("inspector");



const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
    console.log("on Request");
    var connection = request.accept(null, request.origin);
    connection.on('message', function(message) {
        console.log(message);
    });
    connection.send("check");
});


const messages = [];

app.use(express.json());
app.use(express.urlencoded({extended: true })); 
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static("static")); 



app.get("/", (request, response) => {
    response.render("index");
}); 


// app.post("/api/geturl", (req,res) => {
    
//     messages.push( {
//         room: req.body.room,
//         url: req.body.url
//         // nick: req.body.nick,
//         // date: req.body.date,
//         // message: req.body.message
//     }) 
//     console.log("geturl 확인용", messages[0]);
//     res.json();
// });


// app.get('/api/:messages[0].url', (req, res) => {
//     res.render('index');
// });



app.post("/api/send", (req, res) => {
    console.log("api test",req.body.room, req.body.nick, req.body.message);

    messages.push( {
        room: req.body.room,
        date: new Date().getTime(),
        nick: req.body.nick,
        message: req.body.message
    });

    res.json({});

    wsServer.connections.forEach(c => c.send('check')); 
});



app.get("/api/messages", (req,res) => {
    res.json(messages);
});



app.post("/api/pull", (req,res) => {

    var newMessages = messages.filter(data => (data.date > req.body.date));
    res.json(newMessages);
});




httpServer.listen(8080);

