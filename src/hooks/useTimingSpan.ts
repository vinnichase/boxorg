import { useState } from 'react';
import { Animated } from 'react-native';

export const useTimingSpan = (from: number, to: number, duration = 250) => {
    const [animatedValue] = useState(new Animated.Value(from));
    const shift = () => {
        Animated.timing(animatedValue, {
            toValue: to,
            useNativeDriver: true,
            duration,
        }).start();
    };
    const unshift = () => {
        Animated.timing(animatedValue, {
            toValue: from,
            useNativeDriver: true,
            duration,
        }).start();
    };

    return [animatedValue, shift, unshift] as const;
};
