require('dotenv').config();
const express = require('express');
const connectDb = require("./config/db");
const errorHandler = require("./middleware/error");

//connect to db
connectDb();

const app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require("./routes/authorizedAccess"));
app.use('/api/setUpHobbylist', require("./routes/setupHobbyList"));


app.use(errorHandler);
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, ()=>console.log(`Server started running on PORT : ${PORT}`));

process.on("unhandledRejection", (error, promise)=>{
    console.log("Logged error :" + error);
    server.close(()=>process.exit(1));
})