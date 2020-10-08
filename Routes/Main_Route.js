const express = require('express');
const router = express.Router();
const verifytoken = require("../auth/VerifyToken");
const verifytoken1 = require("../auth/VerifyToken1");
const picschema = require("../models/picschema");
const feedbackschema = require("../models/feedback");
const User1 = require("../models/userdetail");
const path = require("path")

router.post(
    "/upload",
    verifytoken1,
    (req, res, next) => {
      try {
        var size = req.rawHeaders[5];
        var size1 = parseInt(size);
        if (size1 > 30000000) {
          return res.json({
            status: 413,
            msg: "File size exceeded, please upload file with size <30mb",
          });
        } else {
          next();
        }
      } catch (err) {
        return res.json({
          status: 500,
          msg: "Internal server error, please try again",
        });
      }
    },
    (req, res, next) => {
      if (
        req.body.file === null ||
        req.body.file === 'undefined' ||
        req.body.subject === "" ||
        req.body.semester === "" ||
        req.body.branch === ""
      ) {
        return res.json({ status: 422, msg: "Missing Required Parameters" });
      } else if (
        req.files.file.mimetype === "image/jpeg" ||
        req.files.file.mimetype === "image/png" ||
        req.files.file.mimetype === "application/pdf"
      )
        next();
      else {
        return res.json({ status: 415, msg: "file format not supported error" });
      }
      // ||req.files.file.mimetype==='application/x-zip-compressed'
      // ||req.files.file.mimetype==='application/msword'
      // ||req.files.file.mimetype==='application/vnd.ms-powerpoint'
    },
    (req, res) => {

      let imageFile = req.files.file;

      imageFile.mv(path.join(__dirname, '..', 'public', req.files.file.name), (err) => {
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
          
          User1.updateOne(
            { _id: req.userId },
            { $inc: { uploads: 1 } },
            (err, reslt) => {
              if (err) {
                return res.json({
                  status: 500,
                  msg: "Internal server error, please try again",
                });
              } else {
                entry.save((err, succ) => {
                  if (err) {
                    return res.json({
                      status: 500,
                      msg: "Internal server error, please try again",
                    });
                  }
                  return res.json({ status: 200, msg: "success" });
                });
              }
            }
          );
        }
      });
    }
  );
  
  //feedback api
  
  router.post("/feedback", verifytoken, (req, res) => {
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

module.exports = router;


  //download api
  
//   router.get("/download", (req, res) => {
//     // console.log(req.query.file)
//     res.json({ link: `./${req.query.file}` });
//   });