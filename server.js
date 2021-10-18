const express = require('express');
const PORT = process.env.PORT || 3000;
require('./src/config/db.config').connectDb();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api',require('./src/routes/'));

app.listen(PORT, () => {
    console.log(` === server started running on ${PORT} ===`);
})


module.exports = app;