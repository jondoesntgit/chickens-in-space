var express = require('express');
var cors = require('cors');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);

var chickens = [];
var ships = {
/*"Hello": {
    "clientId":"Hello",
    "xcoord": 50,
    "ycoord": 200,
    "xvel": 10,
    "yvel": 30
},
"Yo": {
    "clientId":"Yo",
    "xcoord": 150,
    "ycoord": 400,
    "xvel": -10,
    "yvel": 30
}*/
};

server.listen(3000);

app.use(cors());
app.use(bodyParser.json());

app.post('/chicken', function(req, res) {
    console.log(req);
    res.json('Hello');
});

app.get('/', function(req, res) {
    var randomX = Math.random();
    var randomY = Math.random();
    res.json({"x": randomX, "y": randomY});
});

app.get('/ship', function(req, res) {
    res.json(ships)
})

app.delete('/ship/:clientId', function(req, res) {
    for(var i = 0; i < ships.length; i++) {
        if(ships[i].clientId == req.params.clientId) {
        ships.splice(i, 1);
        break;
        }
    }
    res.json(ships)
})

app.post('/ship', function(req, res) {
    ships[req.body.clientId] = req.body;
    ships[req.body.clientId].updated = Date.now();
    var modifiedShips = JSON.parse(JSON.stringify(ships));;
    console.log(modifiedShips);
    delete modifiedShips[req.body.clientId];
    console.log(modifiedShips);
    res.json(modifiedShips)
})

io.on('connection', function (socket) {
    io.emit('new user', {clientId: Math.floor(Math.random()*1000) });
    console.log('New user');

    socket.on('fire', function(socket) {
        console.log('Fired');
    });
})
