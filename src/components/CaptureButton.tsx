import { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAtom } from '@gothub-team/got-atom';
import { useRouter } from 'expo-router';
import { CollectObjectsAtom } from '../atoms/CollectObjectsAtom';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';
import { SearchPullDownGestureAtom } from '../atoms/PullDownGestureAtom';
import { useImage } from '../hooks/useImage';
import { usePullDownBehavior } from '../hooks/usePullDownBehavior';
import { setPath } from '../util/setPath';
import { BLACK, PURPLE_DARK, RED, WHITE } from '../util/constants';
import { ApertureIcon } from './Icons';

const CONTROL_VISIBLE_OPACITY = 0.9;

export const CaptureButton = () => {
    const router = useRouter();
    const { image, launchCamera } = useImage();
    const focus = useAtom(HomeFocusAtom);
    const searchPullDownBehavior = usePullDownBehavior(SearchPullDownGestureAtom);
    const visibility = useSharedValue(CONTROL_VISIBLE_OPACITY);

    useEffect(() => {
        if (!image) return;

        CollectObjectsAtom.set((a) =>
            setPath(['image'], { uri: image.uri, height: image.height, width: image.width }, a),
        );
        router.push('/segment');
    }, [image, router]);

    useEffect(() => {
        visibility.value = withSpring(focus === 'search' ? 0 : CONTROL_VISIBLE_OPACITY);
    }, [focus, visibility]);

    return (
        <Reanimated.View
            pointerEvents={focus === 'search' ? 'none' : 'auto'}
            style={[
                {
                    width: 110,
                    height: 110,
                    marginBottom: 20,
                    padding: 4,
                    backgroundColor: WHITE,
                    shadowColor: `${BLACK}`,
                    shadowOpacity: 1,
                    shadowRadius: 30,
                    elevation: 5,
                    borderRadius: 55,
                    alignSelf: 'center',
                },
                useAnimatedStyle(() => {
                    const fadeInProgress = Math.min(
                        Math.max((searchPullDownBehavior.progress.value - 0.3) / (1 - 0.3), 0),
                        1,
                    );
                    const pullDownOpacity = CONTROL_VISIBLE_OPACITY * fadeInProgress;

                    return {
                        opacity: focus === 'search' ? pullDownOpacity : Math.max(visibility.value, pullDownOpacity),
                    };
                }),
            ]}
            onTouchEnd={(e) => e.stopPropagation()}
        >
            <TouchableOpacity
                style={{ width: '100%', height: '100%' }}
                onPressOut={() => {
                    HomeFocusAtom.set('none');
                    launchCamera();
                }}
            >
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 50,
                        borderColor: RED,
                        borderWidth: 1,
                        padding: 13,
                    }}
                >
                    <ApertureIcon color1={PURPLE_DARK} />
                </View>
            </TouchableOpacity>
        </Reanimated.View>
    );
};
