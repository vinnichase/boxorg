import React, { useEffect, useState } from 'react';
import {
    Animated,
    ImageBackground,
    Keyboard,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { BLACK, PURPLE_DARK, RED, WHITE } from '../util/constants';
import { AnimatedBlurView } from '../components/AnimatedBlurView';
import { ApertureIcon, BoxIcon, CloseDownIcon, SearchIcon } from '../components/Icons';
import { useImage } from '../hooks/useImage';
import { MainInputBox } from '../components/MainInputBox';
import { useSpringSpan } from '../hooks/useSpringSpan';
import { useRouter } from 'expo-router';
import { CollectObjectsAtom } from '../atoms/CollectObjectsAtom';
import { setPath } from '../util/setPath';
import { SearchResults } from '../components/SearchResults';
import { SearchAtom } from '../atoms/SearchAtom';
import { SegmentImageAtom } from '../atoms/SegmentImageAtom';

function App(): JSX.Element {
    const router = useRouter();

    const { width: windowWidth } = useWindowDimensions();
    const { image, launchCamera } = useImage();

    useEffect(() => {
        image &&
            image.base64 &&
            SegmentImageAtom.set({ base64: image.base64, uri: image.uri, height: image.height, width: image.width });
        image && router.push('/segment');
    }, [image]);

    // useEffect(() => {
    //     if (!result || !image) return;
    //     router.push('/collect');
    //     collectObjects(image, result).then((objects) => CollectObjectsAtom.set((a) => ({ ...a, index: 0, objects })));
    // }, [result]);

    const [blur, setBlur] = useState(0);

    const [animatedSearchShift, shiftSearch, unshiftSearch] = useSpringSpan(0, -350);
    const [animatedSearchHide, hideSearch, showSearch] = useSpringSpan(1, 0);

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
                SearchAtom.set((a) => setPath(['show'], true, a));
                shiftSearch();
                unshiftBox();
                showSearch();
                hideBox();
                hideAperture();
                searchTextInput.current?.focus();
                blur !== 70 && setBlur(70);
                break;
            case 'box':
                SearchAtom.set((a) => setPath(['show'], false, a));
                showBox();
                shiftBox();
                shiftAperture();
                unshiftSearch();
                hideSearch();
                boxTextInput.current?.focus();
                blur !== 70 && setBlur(70);
                break;
            case 'none':
                SearchAtom.set((a) => setPath(['show'], false, a));
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
                    width: '100%',
                    height: '100%',
                }}
                intensity={blur}
            >
                <SafeAreaView
                    style={{
                        height: '100%',
                        width: '100%',
                        gap: 50,
                    }}
                    onTouchEnd={() => {
                        Keyboard.dismiss();
                        setFocus('none');
                    }}
                >
                    <View style={{ flex: 2 }}></View>
                    <MainInputBox style={{ transform: [{ translateY: animatedBoxShift }], opacity: animatedBoxHide }}>
                        <BoxIcon color1={PURPLE_DARK} />
                        <TextInput
                            ref={boxTextInput}
                            keyboardType="number-pad"
                            style={{
                                flex: 1,
                                height: '100%',
                                fontSize: 25,
                                color: PURPLE_DARK,
                            }}
                            autoComplete="off"
                            spellCheck={false}
                            onTouchEnd={(e) => e.stopPropagation()}
                            onFocus={() => setFocus('box')}
                            onChange={(e) =>
                                CollectObjectsAtom.set((a) => setPath(['boxId'], parseInt(e.nativeEvent.text), a))
                            }
                        />
                    </MainInputBox>
                    <TouchableOpacity
                        onPressOut={() => {
                            if (CollectObjectsAtom.get().boxId) {
                                setFocus('none');
                                Keyboard.dismiss();
                                launchCamera();
                            }
                        }}
                    >
                        <Animated.View
                            style={{
                                width: 110,
                                height: 110,
                                marginBottom: 20,
                                padding: 4,
                                backgroundColor: WHITE,
                                shadowColor: `${BLACK}`,
                                shadowOpacity: 1,
                                shadowRadius: 30,
                                elevation: 5,
                                borderRadius: 55,
                                alignSelf: 'center',
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
            <SearchResults />
            <MainInputBox
                style={{
                    position: 'absolute',
                    width: windowWidth - 60,
                    top: 420,
                    transform: [{ translateY: animatedSearchShift }],
                    opacity: animatedSearchHide,
                }}
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
                    autoComplete="off"
                    spellCheck={false}
                    onTouchEnd={(e) => e.stopPropagation()}
                    onFocus={() => {
                        setFocus('search');
                    }}
                    onChange={(e) => SearchAtom.set((a) => setPath(['query'], e.nativeEvent.text, a))}
                />
            </MainInputBox>
            {focus === 'search' && (
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 0,
                        width: '100%',
                        height: 70,
                        alignItems: 'center',
                        opacity: 0.6,
                    }}
                    onPress={() => {
                        setFocus('none');
                        Keyboard.dismiss();
                    }}
                >
                    <CloseDownIcon color1={WHITE} />
                </TouchableOpacity>
            )}
        </ImageBackground>
    );
}

export default App;
