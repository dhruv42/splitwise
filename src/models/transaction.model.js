const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Transaction = new Schema({},{
    strict:false,
    collection:'transactions',
    timestamps:{
        createdAt:'createdAt',
        updatedAt:'updatedAt'
    }
})

module.exports = mongoose.model('Transaction', Transaction);