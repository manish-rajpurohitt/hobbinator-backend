require('dotenv').config();
const express = require('express');
const connectDb = require("./config/db");
const errorHandler = require("./middleware/error");
const cors = require("cors");
const bodyParser = require('body-parser')

//connect to db
connectDb();

const corsOpts = {
    origin: '*',
  
    methods: [
      'GET',
      'POST',
    ],
  
    allowedHeaders: [
      'Content-Type',
    ],
  };
  var jsonParser = bodyParser.json();

const app = express();
app.use(cors(corsOpts));
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/api/auth',jsonParser, require('./routes/auth'));
app.use('/api/user',jsonParser, require("./routes/authorizedAccess"));
app.use('/api/setUpHobbylist', require("./routes/setupHobbyList"));


app.use(errorHandler);
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, ()=>console.log(`Server started running on PORT : ${PORT}`));

process.on("unhandledRejection", (error, promise)=>{
    console.log("Logged error :" + error);
    server.close(()=>process.exit(1));
})