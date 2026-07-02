import { useSharedValue, withSpring } from 'react-native-reanimated';

export const useSpringSpan = (from: number) => {
    const animatedValue = useSharedValue(from);

    const shift = (to: number) => {
        animatedValue.value = withSpring(to);
    };

    const unshift = () => {
        animatedValue.value = withSpring(from);
    };

    return [animatedValue, shift, unshift] as const;
};
