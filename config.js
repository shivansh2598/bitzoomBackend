const mongoose = require("mongoose");
const url = "mongodb://localhost/something";

module.exports = {
  secret: "mysecretisyou",
  captchaSecretKey: "6LddXLgUAAAAAKBtnmu4Izk0JJ3M2N7DOSXoqVP5",
  dbConnection: () => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

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
      mongoose.connect(url, { useNewUrlParser: true });
    });
  },
};
