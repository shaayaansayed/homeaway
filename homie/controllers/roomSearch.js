const GETTY_IMAGES_API_KEY = '4c3sy5gm7ccxjj974eqhhu9e';

const request = require('request');
const imageCount = 20;
module.exports = (req, res) => {
    if (req.body.result.action === 'room') {
        const roomName = req.body.result.parameters['room_name'];
        const apiUrl = 'https://api.gettyimages.com/v3/search/images?fields=id,title,thumb,referral_destinations&sort_order=best&phrase=' + roomName + '&page_size=' + imageCount;

        request({
            uri: apiUrl,
            methos: 'GET',
            headers: {'Api-Key': GETTY_IMAGES_API_KEY}
        }, (err, response, body) => {
        const imageIndex = Math.floor(Math.random() * (imageCount + 1 ));    
	const image = JSON.parse(body).images[imageIndex];
	const imageUri = image.display_sizes[image.display_sizes.length-1].uri;
            return res.json({
                speech: imageUri,
                displayText: imageUri,
                source: 'image_name'
            });
        })
    }
}
