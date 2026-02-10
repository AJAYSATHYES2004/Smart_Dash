const mongoose = require('mongoose');

const uri = "mongodb+srv://CARDASHBOARD:1234@cardashboard.50hkhz4.mongodb.net/?appName=CARDASHBOARD";

console.log("Attempting to connect to:", uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("Successfully connected to MongoDB Atlas!");
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection failed:", err.message);
        if (err.cause) console.error("Cause:", err.cause);
        process.exit(1);
    });
