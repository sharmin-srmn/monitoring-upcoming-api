//IMPORTING DEPENDENCIES
const http = require("http");
const https = require("https");
const url = require("url");
const data = require("./data.js");
const { jsonParse } = require("../helpers/utilities.js");
const { sendTwilioSms } = require("../helpers/notifications.js");

// MODULE SCAFFOLDING
const worker = {};

//MAKE A LUST OF ALL CHECKS
worker.gatherCheckFilesName = () => {
  data.makeList("checks", (error, checkFileNames) => {
    if (!error && checkFileNames && checkFileNames.length > 0) {
      //IF GET THE CHEK FILES THEN
      checkFileNames.forEach((checkFileName) => {
        data.readData(
          "checks",
          checkFileName,
          (errorReading, checkFileDetails) => {
            if (!errorReading && checkFileDetails) {
              worker.validateState(jsonParse(checkFileDetails));
            } else {
              console.log(errorReading);
            }
          }
        );
      });
    } else {
      console.log(
        `There is some issue while listing Check Files Name - ${error} `
      );
    }
  });
};

//VALIDTAE STATE OF INDIVIDUAL CHECK FILE
worker.validateState = (checkFileDetails) => {
  if (checkFileDetails && checkFileDetails.checkID) {
    const state =
      typeof checkFileDetails.state === "string" &&
      ["up", "down"].indexOf(checkFileDetails.state) > -1
        ? checkFileDetails.state
        : "down";

    const lastStatusCheckedTime =
      typeof checkFileDetails.lastStatusCheckedTime === "number" &&
      checkFileDetails.lastStatusCheckedTime > 0
        ? checkFileDetails.lastStatusCheckedTime
        : false;

    //AFTER VALIDATION
    worker.sendCheckRequest(checkFileDetails);
  } else {
    console.log(
      "There is some internal issue. Or Check file details not found."
    );
  }
};

//
worker.sendCheckRequest = (checkFileDetails) => {
  //AT BEGINING , RESPONSE RESULT IS FALSE FOR ALL
  let responseResult = {
    error: false,
    responseCode: false,
  };
  let isSendToProcess = false;

  //PARSE THE URL WHICH WAS GIVEN BY USER
  const parsedUrl = url.parse(
    checkFileDetails.protocol + "://" + checkFileDetails.url,
    true
  );
  const method = checkFileDetails.method.toUpperCase();
  const hostname = parsedUrl.hostname;
  const protocol = parsedUrl.protocol;
  const path = parsedUrl.path;
  const timeout = checkFileDetails.timeCount * 1000;

  //PREPARE REQUEST OBJECT
  const requestObject = {
    protocol,
    hostname,
    path,
    method,
    timeout,
  };

  //PROTOCOL
  const protocolToSend = checkFileDetails.protocol === "http" ? http : https;

  const req = protocolToSend.request(requestObject, (res) => {
    responseResult.responseCode = res.statusCode;
    //IF NOT SEND TO NEXT PROCESS, THEN SEND
    if (!isSendToProcess) {
      worker.process(checkFileDetails, responseResult);
      isSendToProcess = true;
    }
  });

  req.on("error", (e) => {
    responseResult = {
      error: true,
      value: e,
    };
    //IF NOT SEND TO NEXT PROCESS, THEN SEND
    if (!isSendToProcess) {
      worker.process(checkFileDetails, responseResult);
      isSendToProcess = true;
    }
  });

  req.on("timeout", () => {
    responseResult = {
      error: true,
      value: "timeout",
    };
    //IF NOT SEND TO NEXT PROCESS, THEN SEND
    if (!isSendToProcess) {
      worker.process(checkFileDetails, responseResult);
      isSendToProcess = true;
    }
  });

  req.end();
};

//PROCESS THE REQUEST
worker.process = (checkFileDetails, responseResult) => {
  //IF NOT ERROR AND RESPONSE CODE IS OK THEN SET THE STATE UP , OTHERWISE FALSE
  const state =
    !responseResult.error &&
    responseResult.responseCode &&
    checkFileDetails.statusCode.indexOf(responseResult.responseCode) > -1
      ? "up"
      : "down";

  //INITIALLY STATE OF CHECKFILE DETAILS IS DOWN
  //IF THERE IS LASTCHECK TIME RECORD, INTIAL STATE AND AFTER RESPONSE STATE IS NOT SAME THEN
  const isAlertNeeded =
    checkFileDetails.lastStatusCheckedTime && checkFileDetails.state !== state
      ? true
      : false;

  //UPDATE CHECKFILE DETAILS
  let newCheckFileDetails = checkFileDetails;
  newCheckFileDetails.state = state;
  newCheckFileDetails.lastStatusCheckedTime = Date.now();

  data.updateData(
    "checks",
    newCheckFileDetails.checkID,
    newCheckFileDetails,
    (errorUpdating) => {
      if (!errorUpdating) {
        if (isAlertNeeded) {
          worker.sendAlert(newCheckFileDetails);
        } else {
          console.log("No need to send alert as there is no state change.");
          console.log(
            `Because ${newCheckFileDetails.protocol}://${newCheckFileDetails.url} is like previous state = ${newCheckFileDetails.state}.`
          );
        }
      } else {
        console.log("Error Updating File.");
      }
    }
  );
};

//SEND ALERT
worker.sendAlert = (newCheckFileDetails) => {
  const msg = `Alert: your check for ${newCheckFileDetails.method.toUpperCase()} ${
    newCheckFileDetails.protocol
  }://${newCheckFileDetails.url} is currently ${newCheckFileDetails.state}.`;

  sendTwilioSms(newCheckFileDetails.phone, msg, (error) => {
    if (!error) {
      console.log(`Alert is sent to user via SMS: ${msg}`);
    } else {
      console.log(
        `There is a problem while sending notification to user. The error is ${error}`
      );
    }
  });
};

//LOOP "GATHERCHECKFILESNAME" FUNCTION
worker.loop = () => {
  let count = 1;
  setInterval(() => {
    count++;
    console.log(`\n${count}th iteration:`);
    worker.gatherCheckFilesName();
  }, 1000 * 30);
};

worker.init = () => {
  //MAKE A LIST OF ALL CHECKS
  worker.gatherCheckFilesName();

  //LOOP THE
  worker.loop();
};

module.exports = worker;
