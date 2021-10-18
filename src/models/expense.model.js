const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Expense = new Schema({
    groupId: {
        type:String,
        default:null
    },
    singleUser:{
        type:Boolean,
        required:true
    },
    userDetails:{
        type:Object
    }
},{
    minimize:false,
    collection:'expenses',
    timestamps:{
        createdAt:'createdAt',
        updatedAt:'updatedAt'
    }
})

module.exports = mongoose.model('Expense', Expense);

// {
//     _id:"",
//     groupId:null,
//     userDetails:{
//         "payeeId" : {
//             "payerId":"amount"
//         }
//     }
// }