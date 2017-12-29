const express = require("express");
const app = express();
const google = require('googleapis');
const Session = require('express-session');
const plus = google.plus('v1');
const OAuth2 = google.auth.OAuth2;
const ClientId = "Client ID";
const ClientSecret = "Client Secrect";
const RedirectionUrl = "http://localhost:3000/googleapi";

function getOAuthClient () {
    return new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
}

const oauth2Client = getOAuthClient();

function getAuthUrl () {
    const scopes = [ 
        'https://www.googleapis.com/auth/plus.me' 
    ]; 
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes // If you only need one scope you can pass it as string
    });
    return url;
}

app.get('/', (req, res) => { 
    const url = getAuthUrl();
    res.send(`<a href="${url}">Login</a>`);
});

app.use("/googleapi", function (req, res) {
    oauth2Client.getToken(req.query.code, function(err, tokens) {
        oauth2Client.credentials = tokens;
        const p = new Promise(function (resolve, reject) {
        plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
            resolve(response || err);
        });
        }).then(function (data) {
        res.send(`
            <img src=${data.image.url} />
            <h3>Hello ${data.displayName}</h3>
        `);
        })
    });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
