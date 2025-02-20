import React, { useState } from 'react';
import {
    Animated,
    ImageBackground,
    Keyboard,
    SafeAreaView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RNMLKitObjectDetectionObject, useObjectDetector } from '@infinitered/react-native-mlkit-object-detection';
import CropImage from '../components/CropImage';
import { BLACK, NONE, PURPLE_DARK, PURPLE_MID, RED, WHITE } from '../util/constants';
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import AnimatedBlurView from '../components/AnimatedBlurView';

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
                            <View>
                                <Svg
                                    style={{
                                        opacity: 0.9,
                                        aspectRatio: 1,
                                        // borderWidth: 1,
                                    }}
                                    viewBox="-1 -1 31.71 31.71"
                                >
                                    <Path
                                        fill={NONE}
                                        strokeWidth={2}
                                        stroke={PURPLE_DARK}
                                        d="M30.21,30.21l-9.47-9.47"
                                    />
                                    <Circle
                                        fill={NONE}
                                        strokeWidth={2}
                                        stroke={PURPLE_DARK}
                                        cx="12.85"
                                        cy="12.85"
                                        r="11.35"
                                    />
                                    <Path
                                        fill={NONE}
                                        strokeWidth={1}
                                        stroke={PURPLE_DARK}
                                        d="M12.85,20.21c-4.05,0-7.35-3.3-7.35-7.35s3.3-7.35,7.35-7.35,7.35,3.3,7.35,7.35-3.3,7.35-7.35,7.35Z"
                                    />
                                </Svg>
                            </View>
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
                            <View>
                                <Svg
                                    style={{
                                        opacity: 0.9,
                                        aspectRatio: 1,
                                    }}
                                    viewBox="-3 -3 73.32 73.32"
                                >
                                    <Rect
                                        fill={NONE}
                                        stroke={PURPLE_DARK}
                                        strokeWidth={3.8}
                                        x="7.21"
                                        y="43.18"
                                        width="24.14"
                                        height="24.14"
                                        rx="6.09"
                                        ry="6.09"
                                    />
                                    <Rect
                                        fill={NONE}
                                        stroke={PURPLE_DARK}
                                        strokeWidth={3.8}
                                        x="7.21"
                                        y="14.43"
                                        width="24.14"
                                        height="24.14"
                                        rx="6.09"
                                        ry="6.09"
                                    />
                                    <Rect
                                        fill={NONE}
                                        stroke={PURPLE_DARK}
                                        strokeWidth={3.8}
                                        x="35.96"
                                        y="14.43"
                                        width="24.14"
                                        height="52.89"
                                        rx="6.09"
                                        ry="6.09"
                                    />
                                    <Path
                                        fill={NONE}
                                        stroke={PURPLE_DARK}
                                        strokeWidth={3.8}
                                        d="M58.86,0H8.46C3.79,0,0,3.79,0,8.46v4.25s0,.04,0,.06c.02,2.09,2.82,2.79,3.94,1.02,1.52-2.39,4.19-3.98,7.23-3.98h16.22c1.88,0,3.61.61,5.02,1.63.74.54,1.74.54,2.48,0,1.41-1.03,3.15-1.63,5.02-1.63h16.23c3.04,0,5.71,1.59,7.23,3.98,1.12,1.76,3.92,1.07,3.94-1.02,0-.02,0-.04,0-.06v-4.25c0-4.67-3.79-8.46-8.46-8.46Z"
                                    />
                                </Svg>
                            </View>
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
                                <Line
                                    stroke={PURPLE_DARK}
                                    strokeWidth={3}
                                    x1="80.64"
                                    y1="13.53"
                                    x2="33.26"
                                    y2="36.35"
                                />
                                <Line stroke={PURPLE_DARK} strokeWidth={3} x1="95.88" y1="51.83" x2="48.5" y2="29.01" />
                                <Line
                                    stroke={PURPLE_DARK}
                                    strokeWidth={3}
                                    x1="75.44"
                                    y1="87.62"
                                    x2="63.74"
                                    y2="36.35"
                                />
                            </Svg>
                        </View>
                    </TouchableOpacity>
                </SafeAreaView>
            </AnimatedBlurView>
        </ImageBackground>
    );
}

export default App;
