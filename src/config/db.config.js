const mongoose = require('mongoose');
const {dbUrl} = require('../config/config.json');

function connectDb() {
    mongoose.connect(dbUrl,{
        useNewUrlParser:true, useUnifiedTopology:true
    }, (error,db) => {
        if(error) {
            throw error;
        }
        console.log('database connected succussfully');
    })
}

module.exports = {
    connectDb
};