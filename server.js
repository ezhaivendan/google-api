const express = require("express");
const app = express();
const google = require('googleapis');
const Session = require('express-session');
const googlePlus = google.plus('v1');
const OAuth2 = google.auth.OAuth2;
const clientId = "CLIENT ID";
const clientSecret = "CLIENT SECRET";
const redirectionUrl = "http://localhost:3000/googleapi";

const getOAuthClient = () => new OAuth2(clientId ,  clientSecret, redirectionUrl);

const oauth2Client = getOAuthClient();

const getAuthUrl = () => {
    const scopes = [ 
        'https://www.googleapis.com/auth/plus.me' 
    ]; 
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes // If you only need one scope you can pass it as string
    });
    return authUrl;
}

app.get('/', (req, res) => { 
    const url = getAuthUrl();
    res.send(`<a href="${url}">Login</a>`);
});

app.use("/googleapi", (req, res) => {
    oauth2Client.getToken(req.query.code, (err, tokens) => {
        oauth2Client.credentials = tokens;
        return new Promise(function (resolve, reject) {
            googlePlus.people.get({ userId: 'me', auth: oauth2Client }, (err, response) => {
            resolve(response || err);
        });
        }).then ((data) => {
        res.send(`
            <img src=${data.image.url} />
            <h3>Hello ${data.displayName}</h3>
        `);
        });
    });
});


app.listen(3000, () => console.log('Example app listening on port 3000!'));
