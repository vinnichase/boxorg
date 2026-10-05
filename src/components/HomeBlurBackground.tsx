import { useEffect, type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAtom } from '@gothub-team/got-atom';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';
import { SearchPullDownGestureAtom } from '../atoms/PullDownGestureAtom';
import { usePullDownBehavior } from '../hooks/usePullDownBehavior';
import { useBlurTarget } from '../hooks/useBlurTarget';
import { PURPLE_DARK } from '../util/constants';
import { AnimatedBlurView } from './AnimatedBlurView';

type HomeBlurBackgroundProps = {
    children: ReactNode;
};

const HOME_BLUR_OPEN_INTENSITY = 70;

export const HomeBlurBackground = ({ children }: HomeBlurBackgroundProps) => {
    const focus = useAtom(HomeFocusAtom);
    const blur = focus === 'search' ? HOME_BLUR_OPEN_INTENSITY : 0;
    const animatedBlur = useSharedValue(0);
    const searchPullDownBehavior = usePullDownBehavior(SearchPullDownGestureAtom);
    // worklets copy whole captured objects, so only the shared value may be closed over
    const searchPullDownProgress = searchPullDownBehavior.progress;
    const { blurTargetRef, blurTarget } = useBlurTarget();

    useEffect(() => {
        animatedBlur.value = withTiming(blur, { duration: 300 });
    }, [animatedBlur, blur]);

    const controlledBlurIntensity = useDerivedValue(() => {
        return animatedBlur.value * (1 - searchPullDownProgress.value);
    });

    return (
        <View style={{ flex: 1, backgroundColor: PURPLE_DARK }}>
            {/* the background image is what the blur softens; Android blurs only
                what a BlurTargetView contains, so the image sits in one behind the blur */}
            <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
                <Image
                    source={require('../../assets/images/background.png')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
            </BlurTargetView>
            <AnimatedBlurView
                blurMethod="dimezisBlurView"
                blurTarget={blurTarget}
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
        </View>
    );
};
