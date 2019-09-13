const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    googleId:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    image: {
        type: String
    }
})

mongoose.model('users', userSchema)