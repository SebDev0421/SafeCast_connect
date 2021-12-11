'use strict'

const express = require('express'),
      http = require('http'),
      app = express(),
      server = http.createServer(app),
      morgan = require('morgan'),
      port = (process.env.PORT || 3000),
      serial = require('serialport'),
      ReadLine = serial.parsers.Readline,
      io = require('socket.io')(server,{cors:{origin:"*"}});

const parser = new ReadLine({
    delimiter:'\n'
});


const mySerial = new serial('COM10',{
    baudRate:9600
});

mySerial.pipe(parser);

mySerial.on('open',()=>{
    console.log('SafeCast device was connect sucefully')
})
let _timer
let buf = ''

mySerial.on('data',(data)=>{

    clearTimeout(_timer)

    _timer = setTimeout(()=>{
        console.log(buf.toString())
        io.emit('safeCast:data',{
            value:buf.toString()
        })
        buf=''
        console.log('clear buf')
    },200)

    buf = buf + data

})

mySerial.on('error',(err)=>{
    console.log('error in safecast: ',err)
})

app.set('port',port)

app.use(morgan('dev'))

app.use(express.static("public"))


io.on('connection',(socket)=>{
    console.log('a user was connected: ',socket.id);
})

server.listen(app.get('port'),()=>{
    console.log('SERVER SAFECAST Running in port :', app.get('port'))
})