var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var allClients = [];
var messages = [];
var names = [];
io.on('connection', function(socket){
    var name = undefined;
    allClients.push(socket);
    socket.on("name_check", function(data, fn) {
        var value;
            //in future use hash table for faster search (in case many users on)
        var inUse = names.indexOf(data.name);
        (inUse != -1) ? (value = true) : (value = false);
        fn({val: value});
    });
    socket.on('user_on', function(data) {
        name = data.name;
        names.push(data.name);
        console.log("'" + name + "'" + " connected");
    });
    socket.on('message_sent', function(data) {
        if (name === undefined)
            name = data.name;
        messages.push(data);
        socket.broadcast.emit('message', data);
    });
    socket.on('disconnect', function(){
        var i = allClients.indexOf(socket);
        var j = names.indexOf(name);
        if (name != undefined)
            socket.broadcast.emit('message', {name: name, message: "'" + name + "'" + " disconnected"});
        console.log("'" + name + "'" + " disconnected");
        names.splice(j, 1);
        allClients.splice(i, 1);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});