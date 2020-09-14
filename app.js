const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors"); // addition we make
const fileUpload = require("express-fileupload"); //addition we make
const mongoose = require("mongoose");
const config = require("./config");
const picschema = require("./models/picschema");
const feedbackschema = require("./models/feedback");
const port = 4000;
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt = require("bcrypt");
const User1 = require("./models/userdetail");
const verifytoken = require("./auth/VerifyToken");
const verifytoken1 = require("./auth/VerifyToken1");
const SubjectList = require("./models/subjectList");
const path = require("path");

//MongoDb Connections
mongoose.connect(config.url, { useNewUrlParser: true });

mongoose.connection.once("open", function () {
  console.log("Database connection opened");
});

mongoose.connection.on("error", function (error) {
  console.log("Database connection error %s", error);
});

//
mongoose.connection.on("reconnected", function () {
  console.log("Database reconnected");
});
//
mongoose.connection.on("disconnected", function () {
  console.log("Database disconnected");
  mongoose.connect(config.url, { useNewUrlParser: true });
});

app.use("/public", express.static("public"));

app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Use CORS and File Upload modules here
app.use(fileUpload());

app.post(
  "/upload",
  verifytoken1,
  (req, res, next) => {
    // console.log(req)
    try {
      var size = req.rawHeaders[5];
      var size1 = parseInt(size);
      console.log(size1);
      if (size1 > 30000000) {
        res.json({
          status: 413,
          msg: "File size exceeded, please upload file with size <30mb",
        });
      } else {
        next();
      }
    } catch (err) {
      res.json({
        status: 500,
        msg: "Internal server error, please try again",
      });
    }
  },
  (req, res, next) => {
    if (
      req.files === null ||
      req.body.subject === "" ||
      req.body.semester === "" ||
      req.body.branch === ""
    ) {
      res.json({ status: 422, msg: "Missing Required Parameters" });
    } else if (
      req.files.file.mimetype === "image/jpeg" ||
      req.files.file.mimetype === "image/png" ||
      req.files.file.mimetype === "application/pdf"
    )
      next();
    else {
      res.json({ status: 415, msg: "file format not supported error" });
    }
    // ||req.files.file.mimetype==='application/x-zip-compressed'
    // ||req.files.file.mimetype==='application/msword'
    // ||req.files.file.mimetype==='application/vnd.ms-powerpoint'
  },
  (req, res, next) => {
    let imageFile = req.files.file;

    imageFile.mv(`${__dirname}/public/${req.files.file.name}`, (err) => {
      if (err) {
        return res.json({ status: 500, msg: err });
      } else {
        entry = new picschema();
        entry.imageurl = `public/${req.files.file.name}`;
        entry.subject = `${req.body.subject}`;
        entry.semester = `${req.body.semester}`;
        entry.branch = `${req.body.branch}`;
        if (req.body.year != null || req.body.year != undefined)
          entry.year = `${req.body.year}`;
        entry.mimetype = `${req.files.file.mimetype}`;
        // console.log(req.user.uploads)
        User1.updateOne(
          { _id: req.userId },
          { $inc: { uploads: 1 } },
          (err, reslt) => {
            if (err) {
              res.json({
                status: 500,
                msg: "Internal server error, please try again",
              });
            } else {
              entry.save((err, succ) => {
                if (err) {
                  res.json({
                    status: 500,
                    msg: "Internal server error, please try again",
                  });
                }
                res.json({ status: 200, msg: "success" });
              });
            }
          }
        );
      }
    });
  }
);

//images fetching of buttons

app.get("/getimgs", (req, res) => {
  picschema.find({ subject: req.query.valuez }, (err, result) => {
    if (err) {
      console.log("error in imgfetchinge", err);
      res.end();
    }
    res.send(result);
  });
});

//download api

app.get("/download", (req, res) => {
  // console.log(req.query.file)
  res.json({ link: `./${req.query.file}` });
});

//search bar api

app.get("/filterdata", (req, res) => {
  if (req.query.subject === "") {
    res.json({ status: 422, msg: "Missing Required Parameters" });
  } else {
    subject = req.query.subject;

    picschema.find({ subject: subject }, (err, user) => {
      if (err) res.end("error!!");
      else {
        res.send(user);
      }
    });
  }
});

//feedback api

app.post("/feedback", verifytoken, (req, res) => {
  if (req.body.suggestion === "") {
    res.json({ status: 422, msg: "Missing Required Parameters" });
  } else {
    feedback = new feedbackschema();
    (feedback.name = `${req.body.name}`),
      (feedback.branch = `${req.body.branch}`),
      (feedback.suggestion = `${req.body.suggestion}`),
      (feedback.email = `${req.body.email}`);

    feedback.save((err, result) => {
      if (err) {
        console.log(err);
        res.json({ msg: "something wrong happened" });
      }

      res.json({ msg: "Thanx for the suggestion" });
    });
  }
});

//user signup
app.post(
  "/signup",
  (req, res, next) => {
    User1.findOne(
      {
        $or: {
          email_id: req.body.email,
          ip: req.connection.remoteAddress,
        },
      },
      (err, user) => {
        if (err)
          return res.json({ status: 500, message: "error on the server" });
        else if (user)
          return res.json({
            status: 404,
            message: "A user already exists with same email id",
          });
        else {
          next();
        }
      }
    );
  },
  // },(req,res,next)=>{
  // 	User1.findOne({ip:req.connection.remoteAddress},(err,user)=>{
  // 		if(err)
  // 		return res.json({status:500 ,message:"error on the server"})
  // 		else if(user)
  // 		return res.json({status:404 , message:"Duplicate account detected , try contacting the admin or mail us at shivanshsinha2598@gmail.com"})
  // 		else
  // 		{
  // 			next();
  // 		}
  // 	})

  function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordconf) {
      res.json({ status: 401, message: "passwords dont match" });
    }
    // else if(req.connection.remoteAddress.substr(0,10)!="::ffff:192")
    // {
    // 	res.json({status:401 , message:"proxy network detected , please connect to lan and use laptop "});
    // }
    else if (
      req.body.email &&
      req.body.name &&
      req.body.password &&
      req.body.passwordconf &&
      req.body.roll
    ) {
      var hashedPassword = bcrypt.hashSync(req.body.password, 8);

      User1.create(
        {
          name: req.body.name,
          email_id: req.body.email,
          pass: hashedPassword,
          roll: req.body.roll,
          year: req.body.year,
          ip: req.connection.remoteAddress,
        },
        function (err, user) {
          if (err)
            return res.json({
              status: 500,
              message: "There was a problem registering the user.",
            });
          // create a token
          else {
            var token = jwt.sign({ id: user._id }, config.secret, {
              //jwt sign encodes payload and secret
              expiresIn: 86400, // expires in 24 hours
            });
            res.json({ status: 200, auth: true, token: token });
          }
        }
      );
    } else {
      res.json({ status: 404, message: "missing required value" });
    }
  }
);

//user login
app.post("/login", (req, res) => {
  User1.findOne({ email_id: req.body.email }, (err, user) => {
    if (err) return res.json({ status: 500, message: "error on the server" });
    if (!user) return res.json({ status: 404, message: "no user found" });

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.pass);

    if (!passwordIsValid)
      return res.json({
        status: 401,
        auth: false,
        token: null,
        message: "Incorrect password , try again",
      });

    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400, // expires in 24 hours
    });

    res.json({ status: 200, auth: true, token: token, value: 1 });
  });
});

//verifytoken

app.get("/verifytoken", (req, res) => {
  var token = req.headers["x-access-token"];
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });
  jwt.verify(token, config.secret, function (err, decoded) {
    if (err)
      return res.status(500).send({
        auth: false,
        message: "Failed to authenticate token.",
        value: 0,
      });
    // if everything good, save to request for use in other routes
    else {
      // User1.findOne({_id:decoded.id},(err,user)=>{
      // 		if(err)
      // 		{

      // 		return res.status(500).send({ auth: false, message: 'Failed to authenticate token.',value:0 });
      // 		}
      // 		else
      // 		{
      // 			if((user.ip).substr(0,14)===req.connection.remoteAddress.substr(0,14))
      // 			{
      // 				return res.status(200).send({ auth: true, message: 'Token Authenticated' });
      // 			}
      // 			else
      // 			{
      // 				return res.status(500).send({ auth: false, message: 'Failed to authenticate token.',value:0 });
      // 			}
      // 		}
      // })
      return res
        .status(200)
        .send({ auth: true, message: "Token Authenticated" });
    }
  });
});
app.get("/subjects/all", async (req, res) => {
  try {
    let subLst;
	subLst = await SubjectList.find({}, { Subject: 1, _id: 0 });
    return res.status(200).send({ data: subLst });
  } catch (err) {
    return res.status(400).send({ data: "Error Occured" });
  }
});

app.get("/subjects/sem_branch", verifytoken, async (req, res) => {
  try {
    const { semester, branch } = req.query;
    let subLst;
    if (semester == 1 || semester == 2)
      subLst = await SubjectList.find(
        {
          Semester: semester,
        },
        {
          Subject: 1, //Projecting the required data
          _id : 0
        }
      );
    else
      subLst = await SubjectList.find(
        {
          Semester: semester,
          Branch: branch,
        },
        {
          Subject: 1,
          _id : 0
        }
      );
    return res.status(200).send({ data: subLst });
  } catch (err) {
    return res.status(400).send({ data: "Error Occured" });
  }
});

app.get('/subjects/semester', verifytoken, async (req, res) => {
  try {
    const { semester } = req.query;
    let subLst;
	subLst = await SubjectList.find({Semester : semester}, { Subject: 1, _id: 0 });
    return res.status(200).send({ data: subLst });
  } catch (err) {
    return res.status(400).send({ data: "Error Occured" });
  }

})

app.listen(port);

// module.exports = app;
