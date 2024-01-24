const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB:', uri);
        await mongoose.connect(uri, {
            useNewUrlParser: true,
        });
        console.log('MongoDB Connected');
    }
    catch (error) {
        console.log('MongoDB Connection Error:', error.message);
        console.error('MongoDB Connection Error:', error.message);
        //console.error('Error Details:', error);
    }
}

module.exports = connectDB;