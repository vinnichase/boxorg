import { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { BoxTagsDrawerState } from '../hooks/useBoxTagsDrawer';

type BoxTagsDrawerProps = {
    drawer: BoxTagsDrawerState;
    children: ReactNode;
};

// collapsible strip below the header's title row that slides the box tag
// editor out; its content keeps its natural height and is clipped while closed
export const BoxTagsDrawer = ({ drawer, children }: BoxTagsDrawerProps) => {
    // worklets copy whole captured objects, so only the shared values may be closed over
    const progress = drawer.progress;
    const contentHeight = drawer.contentHeight;

    return (
        <Animated.View
            style={[{ overflow: 'hidden' }, useAnimatedStyle(() => ({ height: progress.value * contentHeight.value }))]}
        >
            {/* absolute, so the clipped strip does not constrain the content's
                measurement: yoga would measure the chips against the zero height */}
            <View
                style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                onLayout={(e) => contentHeight.set(e.nativeEvent.layout.height)}
            >
                {children}
            </View>
        </Animated.View>
    );
};
