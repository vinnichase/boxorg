import { useEffect, useRef, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Image, Keyboard, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView, KeyboardController } from 'react-native-keyboard-controller';
import { BLACK, PURPLE_DARK, PURPLE_LIGHT, KEYBOARD_TOOLBAR_HEIGHT, WHITE } from '../util/constants';
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useAtom } from '@gothub-team/got-atom';
import { SearchAtom, SearchResultsAtom } from '../atoms/SearchAtom';
import { EditObjectAtom } from '../atoms/EditObjectAtom';
import { router } from 'expo-router';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';
import { SearchPullDownGestureAtom } from '../atoms/PullDownGestureAtom';
import { usePullDownBehavior } from '../hooks/usePullDownBehavior';
import { setPath } from '../util/setPath';

const MARGIN_TOP = 160;
const BOTTOM_SPACER_HEIGHT = KEYBOARD_TOOLBAR_HEIGHT * (2 / 3);
const SEARCH_RESULTS_LOAD_DELAY = 300;

export const SearchResults = () => {
    const { show } = useAtom(SearchAtom);
    const results = useAtom(SearchResultsAtom);
    const focus = useAtom(HomeFocusAtom);
    const searchPullDownBehavior = usePullDownBehavior(SearchPullDownGestureAtom);
    const [acceptsTouches, setAcceptsTouches] = useState(false);

    const sharedOpacity = useSharedValue(0);
    const previousResultCount = useRef(0);
    const previousFocus = useRef(focus);

    useEffect(() => {
        const focusBeforeChange = previousFocus.current;
        previousFocus.current = focus;

        if (focus !== 'search') {
            if (show) {
                SearchAtom.set((a) => setPath(['show'], false, a));
            }
            return;
        }

        if (show) return;

        const delay = focusBeforeChange === 'box' ? 0 : SEARCH_RESULTS_LOAD_DELAY;
        const timeout = setTimeout(() => {
            SearchAtom.set((a) => setPath(['show'], true, a));
        }, delay);

        return () => clearTimeout(timeout);
    }, [focus, show]);

    useAnimatedReaction(
        () => show && searchPullDownBehavior.progress.value < 0.3,
        (nextAcceptsTouches, previousAcceptsTouches) => {
            if (nextAcceptsTouches !== previousAcceptsTouches) {
                scheduleOnRN(setAcceptsTouches, nextAcceptsTouches);
            }
        },
        [show],
    );

    useEffect(() => {
        const currentResultCount = results.length;

        if (!show) {
            previousResultCount.current = 0;
            sharedOpacity.value = withTiming(0, { duration: 120 });
            return;
        }

        if (currentResultCount === 0) {
            previousResultCount.current = 0;
            sharedOpacity.value = 0;
            return;
        }

        const didLoadFirstResults = previousResultCount.current === 0;
        previousResultCount.current = currentResultCount;

        if (didLoadFirstResults) {
            sharedOpacity.value = 0;
            sharedOpacity.value = withTiming(1, { duration: 250 });
            return;
        }

        sharedOpacity.value = 1;
    }, [results.length, show]);

    return (
        <KeyboardAvoidingView
            behavior="height"
            style={{
                position: 'absolute',
                top: MARGIN_TOP,
                bottom: 0,
                width: '100%',
                overflow: 'visible',
            }}
            pointerEvents={acceptsTouches ? 'auto' : 'none'}
        >
            <ScrollView
                automaticallyAdjustKeyboardInsets={false}
                automaticallyAdjustsScrollIndicatorInsets={false}
                contentInsetAdjustmentBehavior="never"
                keyboardShouldPersistTaps="handled"
                scrollIndicatorInsets={{ top: 0, bottom: BOTTOM_SPACER_HEIGHT }}
                style={{ flex: 1, overflow: 'visible' }}
            >
                <Animated.View
                    style={useAnimatedStyle(() => {
                        const fadeProgress = Math.min(Math.max(searchPullDownBehavior.progress.value / 0.3, 0), 1);

                        return {
                            opacity: sharedOpacity.value * (1 - fadeProgress),
                        };
                    })}
                >
                    <View
                        style={{
                            gap: 10,
                            paddingHorizontal: 30,
                            paddingBottom: 30,
                            shadowColor: `${PURPLE_LIGHT}`,
                            shadowOpacity: 1,
                            shadowRadius: 20,
                        }}
                    >
                        {results.map((record) => (
                            <TouchableOpacity
                                key={record.id}
                                delayPressIn={16}
                                style={{ height: 100, flexDirection: 'row', gap: 20 }}
                                onPress={() => {
                                    void KeyboardController.dismiss({ keepFocus: false, animated: true });
                                    Keyboard.dismiss();
                                    EditObjectAtom.set(record);
                                    router.push('/edit');
                                }}
                            >
                                <View
                                    style={{
                                        overflow: 'hidden',
                                        borderRadius: 10,
                                        width: 100,
                                        height: 100,
                                        borderWidth: 2,
                                        borderColor: WHITE,
                                    }}
                                >
                                    <Image
                                        source={{ uri: FileSystem.documentDirectory + record.thumb_path }}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        maxWidth: '100%',
                                        flexWrap: 'wrap',
                                        gap: 5,
                                        paddingVertical: 5,
                                        // backgroundColor: `#ff000033`,
                                        overflow: 'hidden',
                                        alignItems: 'baseline',
                                        flexDirection: 'row',
                                    }}
                                >
                                    {record.tags.map((tag) => (
                                        <View
                                            key={tag}
                                            style={{ padding: 5, backgroundColor: `${WHITE}22`, borderRadius: 5 }}
                                        >
                                            <Text style={{ color: WHITE }}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        backgroundColor: `${WHITE}66`,
                                        padding: 5,
                                        aspectRatio: 1,
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        shadowColor: `${BLACK}`,
                                        shadowOpacity: 1,
                                        shadowRadius: 10,
                                    }}
                                >
                                    <Text style={{ fontSize: 25, color: PURPLE_DARK, fontWeight: 600, opacity: 0.9 }}>
                                        {record.box_id}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ height: BOTTOM_SPACER_HEIGHT }} />
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
