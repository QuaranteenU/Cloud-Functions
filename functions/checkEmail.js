const {google} = require('googleapis');

exports.handler = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  }

  const jwt = getJwt();
  const apiKey = getApiKey();

  const signUpSheetId = '13axut8BiM4KwYqUI7IX1xLRXPttZKbbQrnrMQVVQM5k';
  let signUps = await getSheetData(jwt, apiKey, signUpSheetId, 'B2:F');
  signUps = signUps.data.values.filter(v => v.length === 5).map(v => {
    return {
      name: `${v[0]} ${v[1]}`,
      email: v[2],
      timezone: v[3],
      role: v[4],
    }
  });
  const signUpEmails = signUps.map(s => s.email);
  const signedUp = signUpEmails.includes(req.body.email);

  const rsvpSheetId = '1GGdJ8K_MMXoflcuNDslYw75_jzd6F14MIm62hFIYK5k';
  let rsvps = await getSheetData(jwt, apiKey, rsvpSheetId, 'B2:B');
  rsvps = rsvps.data.values.filter(v => v.length === 1).map(v => v[0]);
  const rsvpd = rsvps.includes(req.body.email);
  res.send({
    signedUp,
    signUpInfo: signUps.find(s => s.email === req.body.email),
    rsvpd,
  });
};

const getJwt = () => {
  const credentials = require("./credentials.json");
  return new google.auth.JWT(
    credentials.client_email, null, credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
}

const getApiKey = () => {
  const apiKeyFile = require("./api_key.json");
  return apiKeyFile.key;
}

const getSheetData = async (jwt, apiKey, spreadsheetId, range) => {
  const sheets = google.sheets({version: 'v4'});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: range,
    auth: jwt,
  });
  return res;
}