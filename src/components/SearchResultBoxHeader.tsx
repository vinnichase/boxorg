import { Text } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { SearchResultGroup, SearchResultsAtom } from '../atoms/SearchAtom';
import { saveBoxTags } from '../service/boxTags';
import { WHITE } from '../util/constants';
import { BoxTagsEditor } from './BoxTagsEditor';

export type HeaderLayouts = Record<number, { y: number; height: number }>;

type SearchResultBoxHeaderProps = {
    group: SearchResultGroup;
    nextBoxId?: number;
    // the results list starts at the top of the screen; headers stick at this offset
    stickyTop: number;
    blurIntensity: number;
    verticalPadding: number;
    scrollY: SharedValue<number>;
    // content-relative layout of every header, keyed by box id; written by each
    // header itself so the previous one knows when it gets pushed away
    headerLayouts: SharedValue<HeaderLayouts>;
};

// box heading plus editable box tags; sticks below the search field while its
// rows scroll underneath and is pushed away by the next box's header
export const SearchResultBoxHeader = ({
    group,
    nextBoxId,
    stickyTop,
    blurIntensity,
    verticalPadding,
    scrollY,
    headerLayouts,
}: SearchResultBoxHeaderProps) => {
    const boxId = group.boxId;

    return (
        <Animated.View
            onLayout={(e) => {
                const { y, height } = e.nativeEvent.layout;
                // all headers lay out in one JS tick; merging on the UI thread
                // keeps every entry (set() would read a stale record and lose them)
                headerLayouts.modify((layouts) => {
                    'worklet';
                    return { ...layouts, [boxId]: { y, height } };
                });
            }}
            style={[
                { zIndex: 1 },
                useAnimatedStyle(() => {
                    const layouts = headerLayouts.get();
                    const layout = layouts[boxId];
                    if (!layout) return { transform: [{ translateY: 0 }] };

                    let translateY = Math.max(0, scrollY.get() - (layout.y - stickyTop));
                    const next = nextBoxId === undefined ? undefined : layouts[nextBoxId];
                    const pushDistance = next ? next.y - layout.y - layout.height : undefined;
                    if (pushDistance !== undefined && pushDistance >= 0) {
                        translateY = Math.min(translateY, pushDistance);
                    }

                    return { transform: [{ translateY }] };
                }),
            ]}
        >
            {/* rows scroll underneath the stuck header, so it blurs them */}
            <BlurView
                intensity={blurIntensity}
                tint="dark"
                blurMethod="dimezisBlurView"
                style={{ paddingHorizontal: 30, paddingVertical: verticalPadding }}
            >
                {/* no save button here, so box tag edits are written right away */}
                <BoxTagsEditor
                    tags={group.boxTags}
                    onChange={(tags) => {
                        SearchResultsAtom.set((gs) => gs.map((g) => (g.boxId === boxId ? { ...g, boxTags: tags } : g)));
                        saveBoxTags(boxId, tags);
                    }}
                >
                    <Text style={{ color: WHITE, fontSize: 26, fontWeight: 300, opacity: 0.9 }}>box</Text>
                    <Text style={{ color: WHITE, fontSize: 26, fontWeight: 'bold', marginRight: 4 }}>{boxId}</Text>
                </BoxTagsEditor>
            </BlurView>
        </Animated.View>
    );
};
