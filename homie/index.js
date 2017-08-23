const FACEBOOK_ACCESS_TOKEN = 'EAADEBDVAF8gBAPST3yxYK40FIcgAyIR33CPo9OVmnIheg8FZCFZCWtQkjYs1JcDuvpcYjx8JJFIFYwvqT8OPZB60b6pynKPTwWGfZBsZAl88khs5fYdpNVWltCAHD5DMal9evthjaJXnPbjEWzcfpG76kh4zYRB1fEA8cpougZAlxmGMKXimKh';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const rp = require('request-promise');
const {serverURL} = require('./config');
const verificationController = require('./controllers/verification');
const messageWebhookController = require('./controllers/messageWebhook');
const roomSearchController = require('./controllers/roomSearch');
const calendarController = require('./controllers/calendar');

const API_AI_TOKEN = '4036d350690641c084c476af4bff024f';
const apiAiClient = require('apiai')(API_AI_TOKEN);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', verificationController);
app.post('/', messageWebhookController);
app.post('/room-search',roomSearchController);
app.get('/calendar', calendarController);
app.listen(5000, () => {
    console.log('Webhook server is listening, port 5000')
    whitelist();
});
    
let whitelist = () => {
    rp({
        url: "https://graph.facebook.com/v2.6/me/messenger_profile",
        qs: { access_token: FACEBOOK_ACCESS_TOKEN},
        method: 'POST',
        json: {
            whitelisted_domains: [
                serverURL
            ]
        }
    }).then(setHomeURL);
}

let setHomeURL = (result) => {
    console.log('result: ', result);
    rp({
        url: "https://graph.facebook.com/v2.6/me/messenger_profile",
        qs: { access_token: FACEBOOK_ACCESS_TOKEN},
        method: 'POST',
        json: {
           home_url : {
                url: serverURL,
                webview_height_ratio: "tall",
                in_test:true
           } 
        }
    }).then(setGettingStartedButton)
}

let setGettingStartedButton = (result) => {
    console.log('result: ', result);
    rp({
        url: "https://graph.facebook.com/v2.6/me/messenger_profile",
        qs: { access_token: FACEBOOK_ACCESS_TOKEN},
        method: 'POST',
        json: {
            payload: "Let's get started!"
        }
    }).then(resetContexts);
}

let resetContexts = () => {
    //const req = apiAiClient.deleteContextsRequest( {sessionId: 'homie_session'});
    rp({
        url: "https://api.api.ai/v1/contexts?sessionId=homie_session",
        headers: {
            Authorization: 'Bearer ' + API_AI_TOKEN
        },
        method: 'DELETE',
        json: true
    }).then((result) => {
        console.log('clear session result: ', result);
    }).catch((err) => {
        console.log('clear sessioned failed: ', err);
    })
}

