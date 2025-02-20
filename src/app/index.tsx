import React, { useState } from 'react';
import { Animated, ImageBackground, Keyboard, SafeAreaView, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RNMLKitObjectDetectionObject, useObjectDetector } from '@infinitered/react-native-mlkit-object-detection';
import { BLACK, NONE, PURPLE_DARK, PURPLE_MID, RED, WHITE } from '../util/constants';
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import AnimatedBlurView from '../components/AnimatedBlurView';
import { ApertureIcon, BoxIcon, LoopIcon } from '../components/Icons';

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

    const [blur, setBlur] = useState(0);

    const [animation] = useState(new Animated.Value(0));
    const onShift = () => {
        setBlur(30);
        Animated.spring(animation, {
            toValue: -350,
            useNativeDriver: true,
        }).start();
    };
    const onUnshift = () => {
        setBlur(0);
        Animated.spring(animation, {
            toValue: 0,
            useNativeDriver: true,
        }).start();
    };
    console.log('BLUR', blur);
    return (
        <ImageBackground
            source={require('../../assets/images/background.png')}
            style={{
                flex: 1,
                backgroundColor: PURPLE_DARK,
            }}
            resizeMode="cover"
        >
            <AnimatedBlurView
                style={{
                    flex: 1,
                }}
                intensity={blur}
            >
                <SafeAreaView
                    style={{
                        flex: 1,
                        gap: 50,
                    }}
                    onTouchEnd={() => {
                        Keyboard.dismiss();
                        onUnshift();
                    }}
                >
                    <View style={{ flex: 2 }}></View>
                    <Animated.View
                        style={{
                            height: 65,
                            marginHorizontal: 30,
                            padding: 4,
                            backgroundColor: WHITE,
                            opacity: 0.9,
                            boxShadow: `0 0 100px 10px ${BLACK}44`,
                            borderRadius: 20,
                            transform: [{ translateY: animation }],
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                width: '100%',
                                height: '100%',
                                padding: 10,
                                borderRadius: 16,
                                borderColor: `${PURPLE_MID}dd`,
                                borderWidth: 1,
                                gap: 10,
                            }}
                        >
                            <LoopIcon color1={PURPLE_DARK} />
                            <TextInput
                                style={{
                                    flex: 1,
                                    height: '100%',
                                    fontSize: 25,
                                    color: PURPLE_DARK,
                                }}
                                onTouchEnd={(e) => {
                                    e.stopPropagation();
                                    onShift();
                                }}
                            />
                        </View>
                    </Animated.View>
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
                                flexDirection: 'row',
                                width: '100%',
                                height: '100%',
                                padding: 10,
                                borderRadius: 16,
                                borderColor: `${PURPLE_MID}dd`,
                                borderWidth: 1,
                                gap: 10,
                            }}
                        >
                            <BoxIcon color1={PURPLE_DARK} />
                            <TextInput
                                style={{
                                    flex: 1,
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
                            borderRadius: 55,
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
                                borderRadius: 50,
                                borderColor: RED,
                                borderWidth: 1,
                                padding: 13,
                            }}
                        >
                            <ApertureIcon color1={PURPLE_DARK} />
                        </View>
                    </TouchableOpacity>
                </SafeAreaView>
            </AnimatedBlurView>
        </ImageBackground>
    );
}

export default App;
