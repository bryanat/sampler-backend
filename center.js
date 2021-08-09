const express = require('express');
const redis = require('redis');
const ws = require('ws');
const cors = require('cors')
const hostname = require('./hostname')

let backend = redis.createClient();

let middle = express();
//middle.use(cors())

const hostnameRegex = new RegExp(hostname) //hostname is an IP address string('3.85.145.50'), hostnameRegex is a regex /3.85.145.50/ created to be used in cors configuration options (corsOptions) 
const corsOptions = {
    origin: hostnameRegex //restricts cross origin resource sharing to origins containing the same IP address as the hostname (3.85.145.50) 
}

//beginning of code for creating a websocket server

// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', message => console.log(message));
});

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = middle.listen(3011);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});

//end of code for creating a websocket server




middle.get('/ww', function(req, res, next) {
    res.json('white white');
});

middle.get('/wb', function(req, res, next) {
    res.json('white blue');
});

middle.get('/wy', function(req, res, next) {
    res.json('white yellow');
});

middle.get('/publicipaddress', cors(corsOptions), function(req, res, next) {
  res.json(req.connection.remoteAddress);
})

//middle.get('/albion${item}')
middle.get('/albionitem', cors(corsOptions), function(req, res, next) {
    console.log('fetch request to /albionitem api endpoint')
    res.json({
    id: 'uuid4', //uuid npm
    time: '08-23-23T09:45', //new Date()
    item: 'T6_FIBER_LEVEL1', // ${item} same item as in the route path 
    city: 'Thetford',
    sell: '59',
    buy: '55'
  })
})

/*
//manually with redis-cli "SET Key_wr Value_wr"

//AWS: will be used with frontend to fetch from redis backend
middle.get('/rediswr', function(req, res, next) {
    //will replace this simple redis get command with a set command later 
    backend.get('Key_wr', function(err, obj) {
        res.json(obj); // returns Value_wr
    });
});
*/

middle.listen(3001, function() {
    console.log('Middle express server started listening on port 3001.')
});
