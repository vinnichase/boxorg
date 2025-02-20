import { useState } from 'react';
import { Animated } from 'react-native';

export const useSpringSpan = (from: number, to: number) => {
    const [animatedValue] = useState(new Animated.Value(from));
    const shift = () => {
        Animated.spring(animatedValue, {
            toValue: to,
            useNativeDriver: true,
        }).start();
    };
    const unshift = () => {
        Animated.spring(animatedValue, {
            toValue: from,
            useNativeDriver: true,
        }).start();
    };

    return [animatedValue, shift, unshift] as const;
};
