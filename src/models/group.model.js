const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Group = new Schema({
    name: {
        type:String,
        required:true
    },
    description:{
        type:String,
        required:false
    },
    users: {
        type:Array
    },
    totalExpense : {
        type:Number,
        default:0,
    }
},{
    collection:'groups',
    timestamps:{
        createdAt:'createdAt',
        updatedAt:'updatedAt'
    }
})

module.exports = mongoose.model('Group', Group);