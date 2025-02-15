import React, { useState } from 'react';
import { ImageBackground, Keyboard, SafeAreaView, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RNMLKitObjectDetectionObject, useObjectDetector } from '@infinitered/react-native-mlkit-object-detection';
import CropImage from '../components/CropImage';
import { BLACK, NONE, PURPLE_DARK, PURPLE_MID, RED, WHITE } from '../util/constants';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

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
            source={require('../../assets/images/background.png')}
            style={{
                flex: 1,
                backgroundColor: PURPLE_DARK,
            }}
            resizeMode="cover"
        >
            <SafeAreaView
                style={{
                    flex: 1,
                    gap: 50,
                }}
                onTouchEnd={() => Keyboard.dismiss()}
            >
                {/* <ScrollView>
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
                </ScrollView> */}
                <View style={{ flex: 2 }}></View>
                <View
                    style={{
                        height: 65,
                        marginHorizontal: 30,
                        padding: 4,
                        backgroundColor: WHITE,
                        opacity: 0.9,
                        boxShadow: `0 0 100px 10px ${BLACK}44`,
                        borderRadius: 20,
                    }}
                >
                    <View
                        style={{
                            width: '100%',
                            height: '100%',
                            padding: 10,
                            borderRadius: 16,
                            borderColor: `${PURPLE_MID}dd`,
                            borderWidth: 1,
                        }}
                    >
                        <TextInput
                            style={{
                                height: '100%',
                                fontSize: 25,
                                color: PURPLE_DARK,
                            }}
                            onTouchEnd={(e) => e.stopPropagation()}
                        />
                    </View>
                </View>
                <View
                    style={{
                        height: 65,
                        marginHorizontal: 30,
                        padding: 4,
                        backgroundColor: WHITE,
                        opacity: 0.9,
                        boxShadow: `0 0 100px 10px ${BLACK}44`,
                        borderRadius: 20,
                    }}
                >
                    <View
                        style={{
                            width: '100%',
                            height: '100%',
                            padding: 10,
                            borderRadius: 16,
                            borderColor: `${PURPLE_MID}dd`,
                            borderWidth: 1,
                        }}
                    >
                        <TextInput
                            style={{
                                height: '100%',
                                fontSize: 25,
                                color: PURPLE_DARK,
                            }}
                            onTouchEnd={(e) => e.stopPropagation()}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={{
                        width: 110,
                        height: 110,
                        marginBottom: 20,
                        padding: 4,
                        backgroundColor: WHITE,
                        boxShadow: `0 0 80px 10px ${BLACK}44`,
                        borderRadius: '100%',
                        opacity: 0.9,
                        alignSelf: 'center',
                        overflow: 'hidden',
                    }}
                    onPress={chooseFile}
                >
                    <View
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '100%',
                            borderColor: RED,
                            borderWidth: 1,
                            padding: 13,
                        }}
                    >
                        <Svg style={{}} viewBox="-2 -2 101 101">
                            <Circle stroke={PURPLE_DARK} strokeWidth={3} fill={NONE} cx="48.5" cy="48.5" r="47.5" />
                            <Polygon
                                fill={PURPLE_DARK}
                                points="48.5 29.01 33.26 36.35 29.5 52.84 40.04 66.06 56.96 66.06 67.5 52.84 63.74 36.35 48.5 29.01"
                            />
                            <Line stroke={PURPLE_DARK} strokeWidth={3} x1="34.77" y1="93.88" x2="67.5" y2="52.84" />
                            <Line stroke={PURPLE_DARK} strokeWidth={3} x1="4.35" y1="66.06" x2="56.96" y2="66.06" />
                            <Line stroke={PURPLE_DARK} strokeWidth={3} x1="7.25" y1="24.94" x2="40.04" y2="66.06" />
                            <Line stroke={PURPLE_DARK} strokeWidth={3} x1="41.2" y1="1.56" x2="29.5" y2="52.84" />
                            <Line stroke={PURPLE_DARK} strokeWidth={3} x1="80.64" y1="13.53" x2="33.26" y2="36.35" />
                            <Line stroke={PURPLE_DARK} strokeWidth={3} x1="95.88" y1="51.83" x2="48.5" y2="29.01" />
                            <Line stroke={PURPLE_DARK} strokeWidth={3} x1="75.44" y1="87.62" x2="63.74" y2="36.35" />
                        </Svg>
                    </View>
                </TouchableOpacity>
            </SafeAreaView>
        </ImageBackground>
    );
}

export default App;
