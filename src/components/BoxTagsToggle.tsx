import { TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { BoxTagsDrawerState } from '../hooks/useBoxTagsDrawer';
import { WHITE } from '../util/constants';
import { ChevronLeftIcon, TagsIcon } from './Icons';

const SIZE = 43;
// same dimming as the other greyed-out header buttons
const DISABLED_OPACITY = 0.35;

type BoxTagsToggleProps = {
    drawer: BoxTagsDrawerState;
};

// header button for the box tag drawer: while the drawer opens, both icons turn
// a quarter together and the tags icon fades into the caret, which ends up
// pointing down
export const BoxTagsToggle = ({ drawer }: BoxTagsToggleProps) => {
    // worklets copy whole captured objects, so only the shared value may be closed over
    const progress = drawer.progress;

    return (
        <TouchableOpacity
            onPress={drawer.toggle}
            disabled={!drawer.enabled}
            style={{ width: SIZE, height: SIZE, opacity: drawer.enabled ? 1 : DISABLED_OPACITY }}
        >
            <Animated.View
                style={[
                    { position: 'absolute', top: 0, left: 0, right: 0 },
                    useAnimatedStyle(() => ({
                        opacity: 1 - progress.value,
                        transform: [{ rotate: `${-90 * progress.value}deg` }],
                    })),
                ]}
            >
                <TagsIcon color1={WHITE} />
            </Animated.View>
            <Animated.View
                style={[
                    { position: 'absolute', top: 0, left: 0, right: 0 },
                    useAnimatedStyle(() => ({
                        opacity: progress.value,
                        transform: [{ rotate: `${-90 * progress.value}deg` }],
                    })),
                ]}
            >
                <ChevronLeftIcon color1={WHITE} />
            </Animated.View>
        </TouchableOpacity>
    );
};
