from keras.applications.vgg16 import VGG16
from keras.models import Model
from keras.layers import Dense
from keras.optimizers import SGD

vgg16 = VGG16(weights='imagenet')
fc2 = vgg16.get_layer('fc2').output
prediction = Dense(units=6, activation='softmax', name='logit')(fc2)
# model = Model(input=vgg16.input, output=prediction)
model = Model(inputs=vgg16.input, outputs=prediction)

for layer in model.layers:
    if layer.name in ['fc1', 'fc2', 'logit']:
        continue
    layer.trainable = False

sgd = SGD(lr=1e-4, momentum=0.9)
model.compile(optimizer=sgd, loss='categorical_crossentropy', metrics=['accuracy'])

import numpy as np
from keras.preprocessing.image import ImageDataGenerator, array_to_img

def preprocess_input_vgg(x):
    """Wrapper around keras.applications.vgg16.preprocess_input()
    to make it compatible for use with keras.preprocessing.image.ImageDataGenerator's
    `preprocessing_function` argument.
    
    Parameters
    ----------
    x : a numpy 3darray (a single image to be preprocessed)
    
    Note we cannot pass keras.applications.vgg16.preprocess_input()
    directly to to keras.preprocessing.image.ImageDataGenerator's
    `preprocessing_function` argument because the former expects a
    4D tensor whereas the latter expects a 3D tensor. Hence the
    existence of this wrapper.
    
    Returns a numpy 3darray (the preprocessed image).
    
    """
    from keras.applications.vgg16 import preprocess_input
    X = np.expand_dims(x, axis=0)
    X = preprocess_input(X)
    return X[0]

train_datagen = ImageDataGenerator(preprocessing_function=preprocess_input_vgg,
                                   rotation_range=40,
                                   width_shift_range=0.2,
                                   height_shift_range=0.2,
                                   shear_range=0.2,
                                   zoom_range=0.2,
                                   horizontal_flip=True,
                                   fill_mode='nearest')

train_generator = train_datagen.flow_from_directory(directory='/scratch/cluster/vsub/ssayed/homeaway/data/train',
                                                    target_size=[224, 224],
                                                    batch_size=64,
                                                    class_mode='categorical')

validation_datagen = ImageDataGenerator(preprocessing_function=preprocess_input_vgg)

validation_generator = validation_datagen.flow_from_directory(directory='/scratch/cluster/vsub/ssayed/homeaway/data/test',
                                                              target_size=[224, 224],
                                                              batch_size=64,
                                                              class_mode='categorical')

model.fit_generator(train_generator,
                    steps_per_epoch=1000,
                    nb_epoch=3)