// const messages = require("../../src/utils/messages")

const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $locationbutton = document.querySelector('#send-location')


const $messages = document.querySelector('#messages')

///templates
const messagetemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message
    const $newMessage = $messages.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin //total height of message
    //visible height

    const vissibleheight = $messages.offsetHeight
    //height of messages container

    const containerHeight = $messages.scrollHeight

// how far has been scrolled
    const scrolloffset = $messages.scrollTop + vissibleheight

    if(containerHeight - newMessageHeight <= scrolloffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (message)=>{
    console.log(message)
    // this compiles
    const html = Mustache.render(messagetemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    //disable form
    $messageFormButton.setAttribute('disabled', 'disabled')
    
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error)=>{
        //re enable form
    $messageFormButton.removeAttribute('disabled')
        $messageFormInput.focus()
        $messageFormInput.value = ''
        if (error) {
            console.log(error)
        }
        console.log('message delivered')
    })

})

$locationbutton.addEventListener('click', ()=>{
    if(!navigator.geolocation) {
        return alert('Geoclocation not supported')
    }
    // disable button for location
    $locationbutton.setAttribute('disabled', 'disabled')


    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)

        const latitude = position.coords.latitude
        
        const longitude = position.coords.longitude
        
        const location = [latitude, longitude]

        
        socket.emit('sendLocation', location, ()=>{
            console.log('Location shared to the console')

            $locationbutton.removeAttribute('disabled')
        })

    })


})

socket.emit('join', {username, room}, (error)=>{
    if (error) {
        alert(error)
        location.href = '/'
    }  
})