import React, { useEffect, useState } from 'react';
import { Animated, ImageBackground, Keyboard, SafeAreaView, TextInput, TouchableOpacity, View } from 'react-native';
import { BLACK, PURPLE_DARK, PURPLE_MID, RED, WHITE } from '../util/constants';
import AnimatedBlurView from '../components/AnimatedBlurView';
import { ApertureIcon, BoxIcon, LoopIcon } from '../components/Icons';
import { useObjectDetectionModel } from '../hooks/useObjectDetectionModel';
import { useImage } from '../hooks/useImage';

function App(): JSX.Element {
    const { image, launchCamera } = useImage();
    const { result, detectObjects } = useObjectDetectionModel('myModel');

    console.log('RESULT', result);

    useEffect(() => {
        image && detectObjects(image.uri);
    }, [image]);

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
                        onPress={launchCamera}
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
