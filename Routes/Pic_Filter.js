const express = require('express');
const router = express.Router();
const verifytoken = require("../auth/VerifyToken");
const picschema = require("../models/picschema");

router.get("/getimgs", verifytoken, (req, res) => {
    picschema.find({ subject: req.query.valuez }, (err, result) => {
      if (err) {
        console.log("error in imgfetchinge", err);
        res.end();
      }
      res.send(result);
    });
  });

  router.get("/filterdata", verifytoken, (req, res) => {
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

module.exports = router;