const users = []

//add user, remove user, getUser, getUsersinRoom

const addUser = ({id, username, room})=> {
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room) {
        return {
            error: 'username and room are required'
        }
    }

    //check for existing user in a room

    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    // validate username 
    if (existingUser) {
        return {
            error: 'username is in use'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id === id)

    if (index !==-1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) =>{
    return users.find((user)=> user.id ===id )
}

const getUsersinRoom = (room) =>{
    return users.filter((user)=>user.room === room)
}


module.exports= {
    addUser,
    removeUser,
    getUser,
    getUsersinRoom
}

