import React, { useEffect, useState } from 'react';
import { Animated, ImageBackground, Keyboard, SafeAreaView, TextInput, TouchableOpacity, View } from 'react-native';
import { BLACK, PURPLE_DARK, PURPLE_MID, RED, WHITE } from '../util/constants';
import AnimatedBlurView from '../components/AnimatedBlurView';
import { ApertureIcon, BoxIcon, SearchIcon } from '../components/Icons';
import { useObjectDetectionModel } from '../hooks/useObjectDetectionModel';
import { useImage } from '../hooks/useImage';
import { MainInputBox } from '../components/MainInputBox';
import { useSpringSpan } from '../hooks/useSpringSpan';

function App(): JSX.Element {
    const { image, launchCamera } = useImage();
    const { detectObjects } = useObjectDetectionModel('myModel');

    useEffect(() => {
        image && detectObjects(image.uri);
    }, [image]);

    const [blur, setBlur] = useState(0);

    const [animatedSearchShift, shiftSearch, unshiftSearch] = useSpringSpan(0, -350);
    const [animatedBoxShift, shiftBox, unshiftBox] = useSpringSpan(0, -350);

    console.log('App rendered');

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
                        setBlur(0);
                    }}
                >
                    <View style={{ flex: 2 }}></View>
                    <MainInputBox style={{ transform: [{ translateY: animatedSearchShift }] }}>
                        <SearchIcon color1={PURPLE_DARK} />
                        <TextInput
                            style={{
                                flex: 1,
                                height: '100%',
                                fontSize: 25,
                                color: PURPLE_DARK,
                            }}
                            onTouchEnd={(e) => {
                                e.stopPropagation();
                            }}
                            onFocus={() => {
                                setBlur(30);
                                shiftSearch();
                            }}
                            onBlur={() => {
                                unshiftSearch();
                            }}
                        />
                    </MainInputBox>
                    <MainInputBox style={{ transform: [{ translateY: animatedBoxShift }] }}>
                        <BoxIcon color1={PURPLE_DARK} />
                        <TextInput
                            style={{
                                flex: 1,
                                height: '100%',
                                fontSize: 25,
                                color: PURPLE_DARK,
                            }}
                            onTouchEnd={(e) => {
                                e.stopPropagation();
                            }}
                            onFocus={() => {
                                setBlur(30);
                                shiftBox();
                            }}
                            onBlur={() => {
                                unshiftBox();
                            }}
                        />
                    </MainInputBox>
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
