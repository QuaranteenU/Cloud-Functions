# Cloud Functions
Repo for QU's GCP cloud functions.

## checkEmail
Describes an HTTP Cloud Function, receives POST request with body like so:
```
{
  "email": "someone@gmail.com",
  "event": "QU" // also accepts "QUA"
}
```
Depending on the value of "event", the function will check whether the email is signed up/RSVP'd in either the QU or QUA spreadsheets, returning a response like so:
```
{
  signedUp,   // whether the email is signed up
  signUpInfo, // if the above is true, what info we have
  rsvpd,      // whether the email rsvp'd
  rsvpdNew    // for QU only, whether the email rsvp'd through the new form
}
```
Requires the existence of `api_key.json` and `credentials.json` (service account credentials) in the `functions` folder. Create them in the GCP Console: APIS & Services -> Credentials. Make sure the API Key has access to the Google Sheets API. Last step is granting access to the email of the service account to the Google Sheets you'd like to read from (click Share on the sheets and add the service account with Read permissions).