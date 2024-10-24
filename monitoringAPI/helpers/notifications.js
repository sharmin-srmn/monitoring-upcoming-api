//IMPORT DEPENEDENCIES
const https = require("https");
const { twilio } = require("./environments.js");
const querystring = require("querystring");

const notifications = {};

notifications.sendTwilioSms = (phone, msg, callback) => {
  const userphone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;
  const usermsg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (phone && msg) {
    //
    const payload = {
      From: twilio.from,
      To: `+88${userphone}`,
      Body: usermsg,
    };
    // console.log(twilio.from);
    // console.log(userphone);
    // console.log(usermsg);
    //STRINGIFY PAYLOAD
    const strungifyPayload = querystring.stringify(payload);

    const requestDetails = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    // console.log(twilio.accountSid);
    // console.log(twilio.authToken);

    const req = https.request(requestDetails, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const status = res.statusCode;
        if (status === 200 || status === 201) {
          callback(false);
        } else {
          callback(`Error: ${status} - ${data}`); // Log response data for debugging
        }
      });
    });

    req.on("error", (e) => {
      callback(e);
    });

    req.write(strungifyPayload);
    req.end();
  } else {
    callback("Given parameters are missing");
  }
};

module.exports = notifications;
