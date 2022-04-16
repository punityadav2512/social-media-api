const express = require('express');
const { connectDatabase } = require('./config/database');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 8800;
const postRoute = require('./routes/post');
const userRoute = require('./routes/user');

const app = express();



if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


// Implementing Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// Implementing Routes
app.use('/api/v1', postRoute);
app.use('/api/v1', userRoute);



// Database Connection
connectDatabase();


// Server setup
app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});