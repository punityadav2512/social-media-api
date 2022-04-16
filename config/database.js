const mongoose = require('mongoose');

exports.connectDatabase = () => {
    mongoose.connect(process.env.MONGODB_URL).then(() => {
        console.log("connected to database");
    }).catch(error => {
        console.log(error.message);
    })
}