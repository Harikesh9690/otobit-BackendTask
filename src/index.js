const express = require('express');
const mongoose = require('mongoose');
const route = require('./routes/route.js')
const app = express();

mongoose.connect("mongodb+srv://projects94:E35tUpfux9D87GOj@cluster0.m1ousdd.mongodb.net/user", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route)

app.listen(process.env.PORT || 3000, () => { console.log('Express app running on port ' + (process.env.PORT || 3000))})