import { useEffect, useRef, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Image, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView, KeyboardController } from 'react-native-keyboard-controller';
import { PURPLE_LIGHT, KEYBOARD_TOOLBAR_HEIGHT, WHITE } from '../util/constants';
import Animated, {
    useAnimatedReaction,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useAtom } from '@gothub-team/got-atom';
import { SearchAtom, SearchResultsAtom } from '../atoms/SearchAtom';
import { EditObjectAtom } from '../atoms/EditObjectAtom';
import { router } from 'expo-router';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';
import { SearchPullDownGestureAtom } from '../atoms/PullDownGestureAtom';
import { usePullDownBehavior } from '../hooks/usePullDownBehavior';
import { setPath } from '../util/setPath';
import { BlurView } from 'expo-blur';
import { HeaderLayouts, SearchResultBoxHeader } from './SearchResultBoxHeader';

const MARGIN_TOP = 160;
const BOTTOM_SPACER_HEIGHT = KEYBOARD_TOOLBAR_HEIGHT * (2 / 3);
const SEARCH_RESULTS_LOAD_DELAY = 300;
const GROUP_GAP = 45;
// shared by the top band behind the search field and the sticky box headers
const BLUR_INTENSITY = 50;
// the top band ends with the same hairline as the other screen headers
const BAND_HAIRLINE = `${WHITE}22`;
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
    const scrollY = useSharedValue(0);
    const headerLayouts = useSharedValue<HeaderLayouts>({});
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
                top: 0,
                bottom: 0,
                width: '100%',
            }}
            pointerEvents={acceptsTouches ? 'auto' : 'none'}
        >
            <Animated.View
                style={[
                    { flex: 1 },
                    useAnimatedStyle(() => {
                        const fadeProgress = Math.min(Math.max(searchPullDownProgress.value / 0.3, 0), 1);

                        return {
                            opacity: sharedOpacity.value * (1 - fadeProgress),
                        };
                    }),
                ]}
            >
                {/* the list spans the whole screen and starts below the search field via
                    padding, so scrolled-away rows pass underneath the blurred top band */}
                <Animated.ScrollView
                    automaticallyAdjustKeyboardInsets={false}
                    automaticallyAdjustsScrollIndicatorInsets={false}
                    contentInsetAdjustmentBehavior="never"
                    keyboardShouldPersistTaps="handled"
                    scrollIndicatorInsets={{ top: MARGIN_TOP, bottom: BOTTOM_SPACER_HEIGHT }}
                    contentContainerStyle={{ paddingTop: MARGIN_TOP }}
                    onScroll={useAnimatedScrollHandler((e) => {
                        scrollY.set(e.contentOffset.y);
                    })}
                    scrollEventThrottle={16}
                    style={{ flex: 1 }}
                >
                    {groups.flatMap((group, i) => [
                        <SearchResultBoxHeader
                            key={`header-${group.boxId}`}
                            group={group}
                            nextBoxId={groups[i + 1]?.boxId}
                            stickyTop={MARGIN_TOP}
                            blurIntensity={BLUR_INTENSITY}
                            verticalPadding={ROW_GAP}
                            scrollY={scrollY}
                            headerLayouts={headerLayouts}
                        />,
                        <View
                            key={`objects-${group.boxId}`}
                            style={{
                                gap: ROW_GAP,
                                paddingHorizontal: 30,
                                // same distance below the blurred header as inside it
                                paddingTop: ROW_GAP,
                                paddingBottom: GROUP_GAP,
                                shadowColor: `${PURPLE_LIGHT}`,
                                shadowOpacity: 1,
                                shadowRadius: 20,
                            }}
                        >
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
                        </View>,
                    ])}
                    <View style={{ height: BOTTOM_SPACER_HEIGHT }} />
                </Animated.ScrollView>
                <BlurView
                    intensity={BLUR_INTENSITY}
                    tint="dark"
                    blurMethod="dimezisBlurView"
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: MARGIN_TOP,
                        justifyContent: 'flex-end',
                    }}
                >
                    {/* a child view instead of a border, which would leave its strip unblurred */}
                    <View style={{ height: 1, backgroundColor: BAND_HAIRLINE }} />
                </BlurView>
            </Animated.View>
        </KeyboardAvoidingView>
    );
};
