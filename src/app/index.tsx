import React, { useState } from 'react';
import { ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RNMLKitObjectDetectionObject, useObjectDetector } from '@infinitered/react-native-mlkit-object-detection';
import CropImage from '../components/CropImage';

function App(): JSX.Element {
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>();
    const [result, setResult] = useState<RNMLKitObjectDetectionObject[]>([]);

    const model = useObjectDetector('myModel');

    const [modelLoaded, setModelLoaded] = useState(model?.isLoaded() ?? false);

    React.useEffect(() => {
        // Loading models is done asynchronously, so in a useEffect we need to wrap it in an async function
        async function loadModel() {
            if (!model || modelLoaded) return;
            // load the model
            await model.load();
            // set the model loaded state to true
            setModelLoaded(true);
        }

        loadModel();
    }, [model, modelLoaded]);

    async function detectObjects(img: ImagePicker.ImagePickerResult) {
        if (!img.assets?.[0].uri) return;
        const result = await model?.detectObjects(img.assets?.[0].uri);
        result && setResult(result);
    }

    const chooseFile = async () => {
        const { status } = await ImagePicker.getCameraPermissionsAsync();
        if (status !== 'granted') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
                return;
            }
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }

        detectObjects(result);
    };

    return (
        <ImageBackground
            source={require('../../assets/images/background.png')} // Replace with your image
            style={{
                flex: 1,
                backgroundColor: '#23153a',
            }}
            resizeMode="cover"
        >
            <SafeAreaView
                style={{
                    flex: 1,
                }}
            >
                <ScrollView>
                    {image &&
                        result.map((obj, index) => (
                            <View key={index}>
                                <CropImage
                                    key={index}
                                    image={image}
                                    rect={[obj.frame.origin.x, obj.frame.origin.y, obj.frame.size.x, obj.frame.size.y]}
                                />
                                <Text>{obj.labels.map((l) => l.text).join(',')}</Text>
                            </View>
                        ))}
                </ScrollView>
                <TouchableOpacity
                    style={{
                        width: 100,
                        height: 100,
                        margin: 20,
                        padding: 5,
                        backgroundColor: 'white',
                        alignSelf: 'center',
                        borderRadius: '100%',
                        overflow: 'hidden',
                    }}
                    onPress={chooseFile}
                >
                    <View
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '100%',
                            borderColor: 'red',
                            borderWidth: 1,
                        }}
                    ></View>
                </TouchableOpacity>
            </SafeAreaView>
        </ImageBackground>
    );
}

export default App;
