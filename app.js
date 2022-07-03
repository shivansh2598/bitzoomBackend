const express = require("express");
const app = express();

const path = require("path")
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors"); // addition we make
const fileUpload = require("express-fileupload"); //addition we make
const port = process.env.PORT;
//sanket

const Main = require('./Routes/Main_Route')
const Auth = require('./Routes/Authentication')
const config = require("./configs");
const Subject_filter = require('./Routes/Subject_Filter')
const Pic_filter = require('./Routes/Pic_Filter')




//MongoDb Connections
config.dbConnection();

//Middlewares
app.use("/public", express.static("public"));
app.use(express.static(path.join(__dirname, 'build')));

app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

//Routes
app.use('/auth', Auth);
app.use('/subjects', Subject_filter)
app.use('/pic', Pic_filter)
app.use('/main', Main)

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//Error
app.get('*', (req, res) => {
  return res.status(404).send("No such route exists!!")
})

// app.listen(port);
module.exports = app;
