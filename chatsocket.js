const express = require('express');
const redis = require('redis');
const ws = require('ws');
const { v4: uuidv4 } = require('uuid');

const client = redis.createClient();
const subscriber = redis.createClient();
const publisher = redis.createClient();

const wss = new ws.Server({ port: 3012 })

//const channel = 'chat1 channel' (can generate channel name as `${user1req.socket.remoteIP}:${user2req.socket.remoteIP}`)

wss.on('connection', function connection(websocket, req) {

  //when a client connects subscribe them to 'chat1 channel'/channel
  subscriber.subscribe('chat1 channel');

  //when a user writes a message in chat (when a subscribed channel receives a published message) trigger the below callback function
  //NOTE message IS SAME AS key
  subscriber.on('message', (channel, message) => {
    //get Redis hash object containing the chat message data
    client.HGETALL(message, (err, value) => {
      //send the Redis hash object containing the chat message data as a string structured 
      //...as a JSON object that will be parsed into a JSON object on the client side
      websocket.send(JSON.stringify({
        id: message,
        time: value.time, 
        user: value.user,
        message: value.message
      }))
    })
  })

  //trigger a callback function when a message is received by the websocket
  websocket.on('message', function incoming(data) {
    //create a unique random string by using uuid to use as the key name for the message data
    let key = uuidv4();

    //create (set) a Redis hash (h) object which is similar in structure to JSON objects
    client.HSET(key, 
      'time', new Date(), 
      'user', req.socket.remoteAddress, 
      'message', data.toString()
    );
    //delete (expire) the Redis hash object after 120 seconds
    client.EXPIRE(key, '5')
    

    //PUBLISH THE MESSAGE KEY
    publisher.publish('chat1 channel', key)

    //PUBLISH the key to channel (do i need to send it via web socket before or after)
  })
})
