const { google } = require("googleapis");

exports.handler = async (req, res) => {
  // allow access from other origins
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  }

  // load our credentials
  const jwt = getJwt();
  const apiKey = getApiKey();

  // make sure the request is properly formatted
  if (!req.body.hasOwnProperty('email')) {
    res.status(400).send(`Request body requires 'email' property!`);
    return;
  }
  if (!req.body.hasOwnProperty('event')) {
    res.status(400).send(`Request body requires 'event' property!`);
    return;
  }

  // notice the braces in the case statements, they're required to scope the const variables. otherwise the engine will complain that they've already been defined
  switch (req.body.event) {
    case 'QU': {
      // check if the user has signed up
      const signUpSheetId = "13axut8BiM4KwYqUI7IX1xLRXPttZKbbQrnrMQVVQM5k";
      let signUps = await getSheetData(jwt, apiKey, signUpSheetId, "B2:F");
      signUps = signUps.data.values ? signUps.data.values
        .filter(v => v.length === 5)
        .map(v => {
          return {
            name: `${v[0]} ${v[1]}`,
            email: v[2],
            timezone: v[3],
            role: v[4],
          };
        }) : [];
      const signUpEmails = signUps.map(s => s.email);
      const signedUp = signUpEmails.includes(req.body.email);

      // check if the user has rsvp'd
      const rsvpSheetId = "1GGdJ8K_MMXoflcuNDslYw75_jzd6F14MIm62hFIYK5k";
      let rsvps = await getSheetData(jwt, apiKey, rsvpSheetId, "B2:B");
      rsvps = rsvps.data.values ? rsvps.data.values.filter(v => v.length === 1).map(v => v[0]) : [];
      const rsvpd = rsvps.includes(req.body.email);

      // check if the user has rsvp'd in the new form (QU only)
      const newRSVPSheetId = "1NqC5gnSiyBNDmPYg28mY7EbVojmYYOypdh5TzXys4WE";
      let newRSVPs = await getSheetData(jwt, apiKey, newRSVPSheetId, "P2:P");
      newRSVPs = newRSVPs.data.values ? newRSVPs.data.values.filter(v => v.length === 1).map(v => v[0]) : [];
      const rsvpdNew = newRSVPs.includes(req.body.email);

      res.send({
        signedUp,
        signUpInfo: signUps.find(s => s.email === req.body.email),
        rsvpd,
        rsvpdNew,
      });
      } break;
    case 'QUA': {
      // check if the user has signed up
      const signUpSheetId = "1jq1U5FoR47OvSKtZkQ_E2euWYWOm5kbvopGfU3wY39E";
      let signUps = await getSheetData(jwt, apiKey, signUpSheetId, "B2:F");
      signUps = signUps.data.values ? signUps.data.values
        .filter(v => v.length === 5)
        .map(v => {
          return {
            name: `${v[0]} ${v[1]}`,
            email: v[2],
            timezone: v[3],
            role: v[4],
          };
        }) : [];
      const signUpEmails = signUps.map(s => s.email);
      const signedUp = signUpEmails.includes(req.body.email);

      // check if the user has rsvp'd
      const rsvpSheetId = "1A3wrDiaC7SICy8fs4S8qNvzpx28UsfNn8NLfpOmPtD8";
      let rsvps = await getSheetData(jwt, apiKey, rsvpSheetId, "B2:B");
      rsvps = rsvps.data.values ? rsvps.data.values.filter(v => v.length === 1).map(v => v[0]) : [];
      const rsvpd = rsvps.includes(req.body.email);

      res.send({
        signedUp,
        signUpInfo: signUps.find(s => s.email === req.body.email),
        rsvpd,
      });
      } break;
    default:
      // catch bad request
      res.status(400).send(`Unknown value for 'event': ${req.body.event}`);
      break;
  }
};

// retrieve JWT to read the spreadsheets
const getJwt = () => {
  const credentials = require("./credentials.json");
  return new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
};

// retrieve API key. unused as of yet as we need it for writing, not for reading
const getApiKey = () => {
  const apiKeyFile = require("./api_key.json");
  return apiKeyFile.key;
};

// load the given spreadsheet by id and range, then return the result
const getSheetData = async (jwt, apiKey, spreadsheetId, range) => {
  const sheets = google.sheets({ version: "v4" });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
    auth: jwt,
  });
  return res;
};
