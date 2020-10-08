const express = require('express');
const router = express.Router();
const SubjectList = require("../models/subjectList");
const verifytoken = require("../auth/VerifyToken");


router.get("/all", async (req, res) => {
    try {
      let subLst;
      subLst = await SubjectList.find({}, { Subject: 1, _id: 0 });
      return res.status(200).send({ data: subLst });
    } catch (err) {
      return res.status(400).send({ data: "Error Occured" });
    }
  });
  
  router.get("/sem_branch", verifytoken, async (req, res) => {
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
            _id: 0,
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
            _id: 0,
          }
        );
      return res.status(200).send({ data: subLst });
    } catch (err) {
      return res.status(400).send({ data: "Error Occured" });
    }
  });
  
  router.get("/semester", verifytoken, async (req, res) => {
    try {
      const { semester } = req.query;
      let subLst;
      subLst = await SubjectList.find(
        { Semester: semester },
        { Subject: 1, _id: 0 }
      );
      return res.status(200).send({ data: subLst });
    } catch (err) {
      return res.status(400).send({ data: "Error Occured" });
    }
  });

  

module.exports = router;

