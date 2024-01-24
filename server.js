require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

// Parse request of content-type: application/json
app.use(bodyParser.json());

// Connect with mongoDB
connectDB();

// Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/products', require('./routes/api/products'));

// Define a simple rout
app.get('/', (req, res) => {
    res.json({message: 'welcome to my application'});
})



// Start the server
const port = 6000;
app.listen(port, () => {
    console.log(`server is running on port: ${port}`);
})