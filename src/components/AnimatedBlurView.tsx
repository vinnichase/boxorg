import React, { ReactNode, useEffect } from 'react';
import { ViewStyle } from 'react-native';
import { BlurView, BlurViewProps } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

// Create an animated version of BlurView
const AnimatedBlurViewComponent = Animated.createAnimatedComponent(BlurView);

type AnimatedBlurViewProps = BlurViewProps & {
    children?: ReactNode;
    style?: ViewStyle;
    intensity: number;
};

const AnimatedBlurView: React.FC<AnimatedBlurViewProps> = ({ children, style, intensity, ...rest }) => {
    const sharedIntensity = useSharedValue(intensity);

    useEffect(() => {
        sharedIntensity.value = withTiming(intensity, { duration: 300 });
    }, [intensity]);

    const animatedProps = useAnimatedProps(() => {
        console.log('sharedIntensity.value', sharedIntensity.value);
        return {
            intensity: sharedIntensity.value,
        };
    });

    console.log(animatedProps);

    return (
        <AnimatedBlurViewComponent animatedProps={animatedProps} tint="prominent" style={style} {...rest}>
            {children}
        </AnimatedBlurViewComponent>
    );
};

export default AnimatedBlurView;
