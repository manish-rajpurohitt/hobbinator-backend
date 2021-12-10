const mongoose = require("mongoose");

const connectDb = async () => {
    await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log("Mongo db Connected...");
}

module.exports = connectDb;