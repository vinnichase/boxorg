import React, { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    ImageBackground,
    Keyboard,
    Platform,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useAtom } from '@gothub-team/got-atom';
import { BLACK, PURPLE_DARK, RED, SEARCH_KEYBOARD_TOOLBAR_HEIGHT, WHITE } from '../util/constants';
import { AnimatedBlurView } from '../components/AnimatedBlurView';
import { ApertureIcon, BoxIcon, CloseDownIcon, KeyboardDownIcon, SearchIcon, TextIcon } from '../components/Icons';
import { useImage } from '../hooks/useImage';
import { MainInputBox } from '../components/MainInputBox';
import { useSpringSpan } from '../hooks/useSpringSpan';
import { useFocusEffect, useRouter } from 'expo-router';
import { CollectObjectsAtom } from '../atoms/CollectObjectsAtom';
import { setPath } from '../util/setPath';
import { SearchResults } from '../components/SearchResults';
import { SearchAtom } from '../atoms/SearchAtom';

// Global focus state to be used in keyboard listeners
let focusGlobal: 'search' | 'box' | 'none' = 'none';

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

function App(): React.ReactElement {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const windowRatio = windowWidth / windowHeight;
    const windowRatioComplement = 1 - windowRatio;

    const { image, launchCamera } = useImage();
    const search = useAtom(SearchAtom);
    const boxSearchActive = search.query.startsWith('#');
    const searchKeyboardType = boxSearchActive ? 'number-pad' : 'default';

    useEffect(() => {
        image &&
            CollectObjectsAtom.set((a) =>
                setPath(['image'], { uri: image.uri, height: image.height, width: image.width }, a),
            );
        image && router.push('/segment');
    }, [image]);

    const [blur, setBlur] = useState(0);

    const handleBlurAnimationEnd = useCallback((intensity: number) => {
        if (intensity === 70 && focusGlobal === 'search') {
            SearchAtom.set((a) => setPath(['show'], true, a));
        }
    }, []);

    const [animatedSearchShift, shiftSearch, unshiftSearch] = useSpringSpan(0);
    const [animatedSearchHide, hideSearch, showSearch] = useSpringSpan(1);

    const [animatedBoxShift, shiftBox, unshiftBox] = useSpringSpan(0);
    const [animatedBoxHide, hideBox, showBox] = useSpringSpan(0.9);

    const [animatedApertureShift, shiftAperture, unshiftAperture] = useSpringSpan(0);
    const [animatedApertureHide, hideAperture, showAperture] = useSpringSpan(0.9);

    const [focus, _setFocus] = useState<'search' | 'box' | 'none'>('none');
    const setFocus = (f: 'search' | 'box' | 'none') => {
        focusGlobal = f;
        _setFocus(f);
    };

    useEffect(() => {
        const keyboardShow = Keyboard.addListener(SHOW_EVENT, (e) => {
            setTimeout(() => {
                if (focusGlobal === 'box') {
                    const keyboardHeight = e.endCoordinates.height;
                    shiftBox(-keyboardHeight);
                    shiftAperture(-keyboardHeight);
                }
            }, 10);
        });

        return () => {
            keyboardShow.remove();
        };
    }, []);

    const searchTextInput = React.useRef<TextInput>(null);
    const boxTextInput = React.useRef<TextInput>(null);

    const requestSearchTextInputFocus = useCallback(() => {
        const frame = requestAnimationFrame(() => searchTextInput.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, []);

    const setSearchQuery = useCallback((query: string) => {
        SearchAtom.set((a) => setPath(['query'], query, a));
    }, []);

    const handleBoxSearchPress = useCallback(() => {
        const query = SearchAtom.get().query;

        if (query.startsWith('#')) {
            setSearchQuery('');
            searchTextInput.current?.focus();
            return;
        }

        const digits = query.replace(/\D/g, '');
        setSearchQuery(`#${digits}`);
        searchTextInput.current?.focus();
    }, [setSearchQuery]);

    const dismissSearchKeyboard = useCallback(() => {
        searchTextInput.current?.blur();
        Keyboard.dismiss();
    }, []);

    const handleSearchChangeText = useCallback(
        (text: string) => {
            if (boxSearchActive || text.startsWith('#')) {
                setSearchQuery(text ? `#${text.replace(/\D/g, '')}` : '');
                return;
            }

            setSearchQuery(text);
        },
        [boxSearchActive, setSearchQuery],
    );

    useEffect(() => {
        if (focus !== 'search') return;
        return requestSearchTextInputFocus();
    }, [boxSearchActive, focus, requestSearchTextInputFocus]);

    useFocusEffect(
        useCallback(() => {
            if (focus !== 'search') return;
            return requestSearchTextInputFocus();
        }, [focus, requestSearchTextInputFocus]),
    );

    useEffect(() => {
        switch (focus) {
            case 'search':
                SearchAtom.set((a) => setPath(['show'], false, a));
                shiftSearch(-(windowHeight * (windowRatioComplement - 0.12)));
                unshiftBox();
                showSearch();
                hideBox(0);
                hideAperture(0);
                searchTextInput.current?.focus();
                blur !== 70 ? setBlur(70) : SearchAtom.set((a) => setPath(['show'], true, a));
                break;
            case 'box':
                SearchAtom.set((a) => setPath(['show'], false, a));
                showBox();
                // shiftBox(); => see keyboard useEffect
                // shiftAperture(); => see keyboard useEffect
                unshiftSearch();
                hideSearch(0);
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
                blurMethod="dimezisBlurView"
                tint="dark"
                style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                }}
                intensity={blur}
                onIntensityAnimationEnd={handleBlurAnimationEnd}
            >
                <SafeAreaView
                    style={{
                        height: '100%',
                        width: '100%',
                        gap: 50,
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
                                textAlignVertical: 'center',
                                paddingVertical: 0,
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
                    top: windowHeight * windowRatioComplement * 0.95,
                    transform: [{ translateY: animatedSearchShift }],
                    opacity: animatedSearchHide,
                }}
                pointerEvents={focus === 'box' ? 'none' : 'auto'}
            >
                <SearchIcon color1={PURPLE_DARK} />
                <TextInput
                    key={searchKeyboardType}
                    ref={searchTextInput}
                    value={search.query}
                    keyboardType={searchKeyboardType}
                    style={{
                        flex: 1,
                        height: '100%',
                        fontSize: 25,
                        color: PURPLE_DARK,
                        textAlignVertical: 'center',
                        paddingVertical: 0,
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    onTouchEnd={(e) => e.stopPropagation()}
                    onFocus={() => {
                        setFocus('search');
                    }}
                    onChangeText={handleSearchChangeText}
                />
            </MainInputBox>
            {focus === 'search' && (
                <KeyboardStickyView
                    enabled={focus === 'search'}
                    offset={{ closed: SEARCH_KEYBOARD_TOOLBAR_HEIGHT, opened: 0 }}
                    pointerEvents="box-none"
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: SEARCH_KEYBOARD_TOOLBAR_HEIGHT,
                    }}
                >
                    <View
                        pointerEvents="box-none"
                        style={{
                            height: SEARCH_KEYBOARD_TOOLBAR_HEIGHT,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingLeft: 16 + insets.left,
                            paddingRight: 16 + insets.right,
                        }}
                    >
                        <TouchableOpacity
                            accessibilityLabel={boxSearchActive ? 'Tag search' : 'Box search'}
                            style={{
                                width: 44,
                                height: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 12,
                                backgroundColor: `${WHITE}CC`,
                            }}
                            onPress={handleBoxSearchPress}
                        >
                            <View style={{ width: 28, height: 28 }}>
                                {boxSearchActive ? (
                                    <TextIcon color1={PURPLE_DARK} />
                                ) : (
                                    <BoxIcon color1={PURPLE_DARK} />
                                )}
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityLabel="Dismiss keyboard"
                            style={{
                                width: 44,
                                height: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 12,
                                backgroundColor: `${WHITE}CC`,
                            }}
                            onPress={dismissSearchKeyboard}
                        >
                            <View
                                style={{
                                    width: 28,
                                    height: 28,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <KeyboardDownIcon color1={PURPLE_DARK} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </KeyboardStickyView>
            )}
            {focus === 'search' && (
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: windowHeight * 0.12 - windowHeight * windowRatioComplement * 0.05 - 50,
                        width: '100%',
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
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
