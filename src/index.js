const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage}= require('./utils/messages')
const {addUser, removeUser, getUser, getUsersinRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)  //making use of the created server


const port = 3000 || process.env.PORT
const publicpath = path.join(__dirname, '../public')

app.use(express.static(publicpath))





io.on('connection', (socket)=>{
    console.log('new web socket connection')
    

    socket.on('join', (options, callback)=>{

        const {error, user} = addUser({id: socket.id, ...options})
        if(error) {
            return callback(error)
        }


        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joinned`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersinRoom(user.room)
        })

        callback()
    })


    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('Bad words')
        }
        const {username, room} = getUser(socket.id)

        io.to(room).emit('message', generateMessage(username, message))
        callback()
        // callback('Delivered')
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }

        
    })

    socket.on('sendLocation', (location, callback)=>{
        
        const {username, room} = getUser(socket.id)
        io.to(room).emit('locationMessage', generateLocationMessage(username, `https://google.com/maps?q=${location[0]},${location[1]}`))
        callback()
    })
})




server.listen(port, ()=>{
    console.log('server is up on port '+ port)
})