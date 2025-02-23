import React, { useEffect, useState } from 'react';
import { Animated, ImageBackground, Keyboard, SafeAreaView, TextInput, TouchableOpacity, View } from 'react-native';
import { BLACK, PURPLE_DARK, RED, WHITE } from '../util/constants';
import { AnimatedBlurView } from '../components/AnimatedBlurView';
import { ApertureIcon, BoxIcon, SearchIcon } from '../components/Icons';
import { useObjectDetectionModel } from '../hooks/useObjectDetectionModel';
import { useImage } from '../hooks/useImage';
import { MainInputBox } from '../components/MainInputBox';
import { useSpringSpan } from '../hooks/useSpringSpan';
import { useRouter } from 'expo-router';
import { ObjectDetectionResultAtom } from '../atoms/ObjectDetectionResultAtom';

function App(): JSX.Element {
    const router = useRouter();

    const { image, launchCamera } = useImage();
    const { result, detectObjects } = useObjectDetectionModel('myModel');

    useEffect(() => {
        image && detectObjects(image.uri);
    }, [image]);

    useEffect(() => {
        if (!result || !image) return;
        ObjectDetectionResultAtom.set({ image, objects: result });
        router.push('/collect');
    }, [result]);

    const [blur, setBlur] = useState(0);

    const [animatedSearchShift, shiftSearch, unshiftSearch] = useSpringSpan(0, -350);
    const [animatedSearchHide, hideSearch, showSearch] = useSpringSpan(0.9, 0);

    const [animatedBoxShift, shiftBox, unshiftBox] = useSpringSpan(0, -270);
    const [animatedBoxHide, hideBox, showBox] = useSpringSpan(0.9, 0);

    const [animatedApertureShift, shiftAperture, unshiftAperture] = useSpringSpan(0, -270);
    const [animatedApertureHide, hideAperture, showAperture] = useSpringSpan(0.9, 0);

    const [focus, setFocus] = useState<'search' | 'box' | 'none'>('none');
    const searchTextInput = React.useRef<TextInput>(null);
    const boxTextInput = React.useRef<TextInput>(null);

    useEffect(() => {
        switch (focus) {
            case 'search':
                shiftSearch();
                unshiftBox();
                showSearch();
                hideBox();
                hideAperture();
                searchTextInput.current?.focus();
                blur !== 70 && setBlur(70);
                break;
            case 'box':
                showBox();
                shiftBox();
                shiftAperture();
                unshiftSearch();
                hideSearch();
                boxTextInput.current?.focus();
                blur !== 70 && setBlur(70);
                break;
            case 'none':
                unshiftSearch();
                unshiftBox();
                showSearch();
                showBox();
                showAperture();
                unshiftAperture();
                blur !== 0 && setBlur(0);
                break;
        }
    }, [focus]);

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
                        setFocus('none');
                    }}
                >
                    <View style={{ flex: 2 }}></View>
                    <MainInputBox
                        style={{ transform: [{ translateY: animatedSearchShift }], opacity: animatedSearchHide }}
                        pointerEvents={focus === 'box' ? 'none' : 'auto'}
                    >
                        <SearchIcon color1={PURPLE_DARK} />
                        <TextInput
                            ref={searchTextInput}
                            style={{
                                flex: 1,
                                height: '100%',
                                fontSize: 25,
                                color: PURPLE_DARK,
                            }}
                            onTouchEnd={(e) => e.stopPropagation()}
                            onFocus={() => setFocus('search')}
                        />
                    </MainInputBox>
                    <MainInputBox style={{ transform: [{ translateY: animatedBoxShift }], opacity: animatedBoxHide }}>
                        <BoxIcon color1={PURPLE_DARK} />
                        <TextInput
                            ref={boxTextInput}
                            style={{
                                flex: 1,
                                height: '100%',
                                fontSize: 25,
                                color: PURPLE_DARK,
                            }}
                            onTouchEnd={(e) => e.stopPropagation()}
                            onFocus={() => setFocus('box')}
                        />
                    </MainInputBox>
                    <TouchableOpacity
                        onPressOut={() => {
                            launchCamera();
                            setFocus('none');
                        }}
                    >
                        <Animated.View
                            style={{
                                width: 110,
                                height: 110,
                                marginBottom: 20,
                                padding: 4,
                                backgroundColor: WHITE,
                                boxShadow: `0 0 80px 10px ${BLACK}44`,
                                borderRadius: 55,
                                alignSelf: 'center',
                                overflow: 'hidden',
                                transform: [{ translateY: animatedApertureShift }],
                                opacity: animatedApertureHide,
                            }}
                            onTouchEnd={(e) => e.stopPropagation()}
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
                        </Animated.View>
                    </TouchableOpacity>
                </SafeAreaView>
            </AnimatedBlurView>
        </ImageBackground>
    );
}

export default App;
