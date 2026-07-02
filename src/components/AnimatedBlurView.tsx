import React, { ReactNode, useEffect } from 'react';
import { ViewStyle } from 'react-native';
import { BlurView, BlurViewProps } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

// Create an animated version of BlurView
const AnimatedBlurViewComponent = Animated.createAnimatedComponent(BlurView);

type AnimatedBlurViewProps = BlurViewProps & {
    children?: ReactNode;
    style?: ViewStyle;
    intensity: number;
    controlledIntensity?: SharedValue<number>;
    onIntensityAnimationEnd?: (intensity: number) => void;
};

export const AnimatedBlurView: React.FC<AnimatedBlurViewProps> = ({
    children,
    style,
    intensity,
    controlledIntensity,
    onIntensityAnimationEnd,
    ...rest
}) => {
    const sharedIntensity = useSharedValue(intensity);

    useEffect(() => {
        sharedIntensity.value = withTiming(intensity, { duration: 300 }, (finished) => {
            if (finished && onIntensityAnimationEnd) {
                scheduleOnRN(onIntensityAnimationEnd, intensity);
            }
        });
    }, [intensity, onIntensityAnimationEnd]);

    const animatedProps = useAnimatedProps(() => ({
        intensity: controlledIntensity ? controlledIntensity.value : sharedIntensity.value,
    }));

    return (
        <AnimatedBlurViewComponent animatedProps={animatedProps} style={style} {...rest}>
            {children}
        </AnimatedBlurViewComponent>
    );
};
