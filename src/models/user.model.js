const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    userName: {
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
},{
    collection:'users',
    timestamps:{
        createdAt:'createdAt',
        updatedAt:'updatedAt'
    }
})

module.exports = mongoose.model('User', User);