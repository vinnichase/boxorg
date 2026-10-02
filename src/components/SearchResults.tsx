import { useEffect, useRef, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Image, Keyboard, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView, KeyboardController } from 'react-native-keyboard-controller';
import { PURPLE_LIGHT, KEYBOARD_TOOLBAR_HEIGHT, WHITE } from '../util/constants';
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
import { BoxTagsEditor } from './BoxTagsEditor';
import { saveBoxTags } from '../service/boxTags';

const MARGIN_TOP = 160;
const BOTTOM_SPACER_HEIGHT = KEYBOARD_TOOLBAR_HEIGHT * (2 / 3);
const SEARCH_RESULTS_LOAD_DELAY = 300;
const GROUP_GAP = 30;
const ROW_GAP = 10;

export const SearchResults = () => {
    const { show } = useAtom(SearchAtom);
    const groups = useAtom(SearchResultsAtom);
    const focus = useAtom(HomeFocusAtom);
    const searchPullDownBehavior = usePullDownBehavior(SearchPullDownGestureAtom);
    // worklets copy whole captured objects, so only the shared value may be closed over
    const searchPullDownProgress = searchPullDownBehavior.progress;
    const [acceptsTouches, setAcceptsTouches] = useState(false);

    const sharedOpacity = useSharedValue(0);
    const previousResultCount = useRef(0);

    useEffect(() => {
        if (focus !== 'search') {
            if (show) {
                SearchAtom.set((a) => setPath(['show'], false, a));
            }
            return;
        }

        if (show) return;

        const timeout = setTimeout(() => {
            SearchAtom.set((a) => setPath(['show'], true, a));
        }, SEARCH_RESULTS_LOAD_DELAY);

        return () => clearTimeout(timeout);
    }, [focus, show]);

    useAnimatedReaction(
        () => show && searchPullDownProgress.value < 0.3,
        (nextAcceptsTouches, previousAcceptsTouches) => {
            if (nextAcceptsTouches !== previousAcceptsTouches) {
                scheduleOnRN(setAcceptsTouches, nextAcceptsTouches);
            }
        },
        [show],
    );

    useEffect(() => {
        const currentResultCount = groups.length;

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
    }, [groups.length, show]);

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
                        const fadeProgress = Math.min(Math.max(searchPullDownProgress.value / 0.3, 0), 1);

                        return {
                            opacity: sharedOpacity.value * (1 - fadeProgress),
                        };
                    })}
                >
                    <View
                        style={{
                            gap: GROUP_GAP,
                            paddingHorizontal: 30,
                            paddingBottom: 30,
                            shadowColor: `${PURPLE_LIGHT}`,
                            shadowOpacity: 1,
                            shadowRadius: 20,
                        }}
                    >
                        {groups.map((group) => (
                            <View key={group.boxId} style={{ gap: ROW_GAP }}>
                                {/* no save button here, so box tag edits are written right away */}
                                <BoxTagsEditor
                                    tags={group.boxTags}
                                    onChange={(tags) => {
                                        SearchResultsAtom.set((gs) =>
                                            gs.map((g) => (g.boxId === group.boxId ? { ...g, boxTags: tags } : g)),
                                        );
                                        saveBoxTags(group.boxId, tags);
                                    }}
                                >
                                    <Text style={{ color: WHITE, fontSize: 26, fontWeight: 300, opacity: 0.9 }}>
                                        box
                                    </Text>
                                    <Text style={{ color: WHITE, fontSize: 26, fontWeight: 'bold', marginRight: 4 }}>
                                        {group.boxId}
                                    </Text>
                                </BoxTagsEditor>
                                {group.objects.map((record) => (
                                    <TouchableOpacity
                                        key={record.id}
                                        delayPressIn={16}
                                        style={{ height: 100, flexDirection: 'row', gap: 20 }}
                                        onPress={() => {
                                            void KeyboardController.dismiss({ keepFocus: false });
                                            Keyboard.dismiss();
                                            EditObjectAtom.set({
                                                ...record,
                                                boxTags: { [group.boxId]: group.boxTags },
                                            });
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
                                                overflow: 'hidden',
                                                alignItems: 'baseline',
                                                flexDirection: 'row',
                                            }}
                                        >
                                            {record.tags.map((tag) => (
                                                <View
                                                    key={tag}
                                                    style={{
                                                        padding: 5,
                                                        backgroundColor: `${WHITE}22`,
                                                        borderRadius: 5,
                                                    }}
                                                >
                                                    <Text style={{ color: WHITE }}>{tag}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </View>
                    <View style={{ height: BOTTOM_SPACER_HEIGHT }} />
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
