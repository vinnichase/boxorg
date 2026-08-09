import { useEffect, useState, type ReactNode } from 'react';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAtom } from '@gothub-team/got-atom';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';
import { SearchPullDownGestureAtom } from '../atoms/PullDownGestureAtom';
import { usePullDownBehavior } from '../hooks/usePullDownBehavior';
import { AnimatedBlurView } from './AnimatedBlurView';

type HomeBlurBackgroundProps = {
    children: ReactNode;
};

const HOME_BLUR_OPEN_INTENSITY = 70;

export const HomeBlurBackground = ({ children }: HomeBlurBackgroundProps) => {
    const focus = useAtom(HomeFocusAtom);
    const [blur, setBlur] = useState(0);
    const animatedBlur = useSharedValue(0);
    const searchPullDownBehavior = usePullDownBehavior(SearchPullDownGestureAtom);

    useEffect(() => {
        animatedBlur.value = withTiming(blur, { duration: 300 });
    }, [animatedBlur, blur]);

    useEffect(() => {
        switch (focus) {
            case 'search':
                blur !== HOME_BLUR_OPEN_INTENSITY && setBlur(HOME_BLUR_OPEN_INTENSITY);
                break;
            case 'none':
                blur !== 0 && setBlur(0);
                break;
        }
    }, [focus, blur]);

    const controlledBlurIntensity = useDerivedValue(() => {
        return animatedBlur.value * (1 - searchPullDownBehavior.progress.value);
    });

    return (
        <AnimatedBlurView
            experimentalBlurMethod="dimezisBlurView"
            tint="dark"
            style={{
                flex: 1,
                width: '100%',
                height: '100%',
            }}
            intensity={blur}
            controlledIntensity={controlledBlurIntensity}
        >
            {children}
        </AnimatedBlurView>
    );
};
