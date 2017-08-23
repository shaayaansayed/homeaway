# homeaway

2nd Place at [InternHackAtx 2017]{https://internhackatx-homeaway.devpost.com/}

Prompt: Minimize the time it takes for a customer to find and book a listing of their preference on the HomeAway website. 

For this project, we curated a dataset of 70,000 labeled images of home areas in the following classes: bedroom, living, bathroom, kitchen, exterior, appliances from the much larger [OpenImages dataset.](https://github.com/openimages/dataset) We fine-tuned a CNN image classifier in Keras to distinguish between the different classes. The model was used to organize HomeAway's listing interface to enable a cleaner and more organized user experience. 

Additionally, we used wit.ai and facebook messenger api to create a chatbot named Homie that can interact with customers and react on customer preferences. Further steps include connecting the CNN model with the chatbot so that the images in home listings can be used to target a much richer domain of customer preferences. 

Video, powerpoint pitch, and more information can be found [here](https://devpost.com/software/homie-ai). 
