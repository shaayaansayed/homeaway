const FACEBOOK_ACCESS_TOKEN = 'EAADEBDVAF8gBAPST3yxYK40FIcgAyIR33CPo9OVmnIheg8FZCFZCWtQkjYs1JcDuvpcYjx8JJFIFYwvqT8OPZB60b6pynKPTwWGfZBsZAl88khs5fYdpNVWltCAHD5DMal9evthjaJXnPbjEWzcfpG76kh4zYRB1fEA8cpougZAlxmGMKXimKh';

const API_AI_TOKEN = '4036d350690641c084c476af4bff024f';
const apiAiClient = require('apiai')(API_AI_TOKEN);

const request = require('request');
const {serverURL} = require('../config');

const sendImage = (senderId, imageUri) => {
    return request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                attachment: {
                    type: 'image',
                    payload: { url: imageUri }
                }
            }
        }
    });
};


const sendTextMessage = (senderId, text) => {
    console.log('sending text message: ', text);
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: { text },
        }
    });
};


const sendBookingCalendarQuestion = (senderId, response) => {
    const parameters = response.result.parameters;
    if(parameters.location === ""){
        //ask for location
        console.log('asking for location');
        sendTextMessage(senderId, response.result.fulfillment.speech);
    } else if(parameters.startDate === ""){
        //ask for start date
        console.log('asking for start date');
        request({
            url: "https://graph.facebook.com/v2.6/me/messages",
            qs: { access_token: FACEBOOK_ACCESS_TOKEN},
            method: 'POST',
            json: {
                recipient: {id: senderId},
                message:{
                    "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Select Start Date",
                        "buttons":[
                          {
                            "type":"web_url",
                            "url": serverURL + "/calendar",
                            "title":"Show Website"
                          },
                          {
                            "type":"postback",
                            "title":"Start Chatting",
                            "payload":"USER_DEFINED_PAYLOAD"
                          }
                        ]
                      }
                    }
                }
            }
        })
    } else if(parameters.endDate === ""){
        //ask for end date;
        console.log('asking end date');
    } else {
        console.log('booking ended');
    }
    
};

const sendBookingQuestion = (senderId, response) => {
    sendTextMessage(senderId, response.result.fulfillment.speech);
    console.log('image uri : ', serverURL + '/static/images/main.jpg');
    request({
            url: "https://graph.facebook.com/v2.6/me/messages",
            qs: { access_token: FACEBOOK_ACCESS_TOKEN},
            method: 'POST',
            json: {
                recipient: {id: senderId},
                message:{
                    "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"generic",
                        "elements": [
                            {
                                title: 'Exterior',
                                subtitle: 'Welcome to A Cut Above! We hope you enjoy your stay!',
                                "image_url": 'https://odis.homeaway.com/odis/listing/90378eae-98f3-46c5-a181-4c42efff00ba.c10.jpg'
                            },
                            {
                                title: 'Living Room',
                                subtitle: 'Living and Dining Room with a Wonderful View Right Outside Your Window!',
                                "image_url": 'https://odis.homeaway.com/odis/listing/5fa0fdfd-d0f7-4b33-b7a9-8e2b8e838a9d.c10.jpg'
                            },
                            {
                                title: 'Kitchen',
                                subtitle: 'Fully Stocked Kitchen',
                                "image_url": 'https://odis.homeaway.com/odis/listing/dec7e75e-f07c-4c44-bb14-648f3582e5c5.c10.jpg'
                            },
                            {
                                title: 'Amenities',
                                subtitle: 'Sherwood Forest Pool ',
                                "image_url": 'https://odis.homeaway.com/odis/listing/5bb83760-0a23-4d8c-9edd-e2be7cbc35b5.c10.jpg'
                            },
                            
                        ]
                      }
                    }
                }
            }
        })
}

const sendSpecific = (senderId, response) => {
    sendTextMessage(senderId, response.result.fulfillment.speech);
    sendImage(senderId,"https://e17d14e6.ngrok.io/static/images/bedroom.jpg");
    sendImage(senderId,"https://e17d14e6.ngrok.io/static/images/bedroom2.jpg");
}



module.exports = (event) => {
    const senderId = event.sender.id;
    const message = event.message.text;

    const apiaiSession = apiAiClient.textRequest(message, {sessionId: 'homie_session'});

    apiaiSession.on('response', (response) => {
        console.log(JSON.stringify(response));
        const result = response.result.fulfillment.speech;
        const intentName = response.result.metadata.intentName;
        const reply = response.result.fulfillment.speech;
        console.log('intentName:  ', intentName);
        switch(intentName) {
		    case 'homie.images': {
		      sendImage(senderId, result);
		      break;
            }
            case 'homie.booking': {
                sendTextMessage(senderId, reply);    
                break;
            }
            case 'homie.question1': {
                sendBookingQuestion(senderId, response);
                break;
            }
            case 'homie.question2': {
                sendSpecific(senderId, response);
                break;
            }
            case 'homie.question3': {
                sendTextMessage(senderId, reply);
                break;
            }
            default: {
                console.log('sending default');
                sendTextMessage(senderId, result);
                break;
            }
	   }
        
    });

    apiaiSession.on('error', error => console.log(error));
    apiaiSession.end();
};
