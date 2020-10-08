const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User1 = require("../models/userdetail");
const jwt = require("jsonwebtoken");
const config = require("../configs");

router.post(
  "/signup",
  (req, res, next) => {
    console.log(req.body);
    User1.findOne(
      {
        email_id: req.body.email,
      },
      (err, user) => {
        if (err) {
          console.log(err);
          return res.json({ status: 500, message: "error on the server" });
        } else if (user)
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

router.post("/login", (req, res) => {
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
      expiresIn: 7200, // expires in 2 hours
    });

    res.json({ status: 200, auth: true, token: token, value: 1 });
  });
});

router.get("/verifytoken", (req, res) => {
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
        // setTimeout(() => {
          return res
            .status(200)
            .send({ auth: true, message: "Token Authenticated" });
        // }, 500);
      }
    });
  });

module.exports = router;
