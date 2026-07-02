import { useEffect } from 'react';
import { Keyboard, Platform, TouchableOpacity, View } from 'react-native';
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
const KEYBOARD_SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

export const CaptureButton = () => {
    const router = useRouter();
    const { image, launchCamera } = useImage();
    const focus = useAtom(HomeFocusAtom);
    const searchPullDownBehavior = usePullDownBehavior(SearchPullDownGestureAtom);
    const visibility = useSharedValue(CONTROL_VISIBLE_OPACITY);
    const shift = useSharedValue(0);

    useEffect(() => {
        if (!image) return;

        CollectObjectsAtom.set((a) =>
            setPath(['image'], { uri: image.uri, height: image.height, width: image.width }, a),
        );
        router.push('/segment');
    }, [image, router]);

    useEffect(() => {
        switch (focus) {
            case 'search':
                shift.value = withSpring(0);
                visibility.value = withSpring(0);
                break;
            case 'box':
                visibility.value = withSpring(CONTROL_VISIBLE_OPACITY);
                break;
            case 'none':
                shift.value = withSpring(0);
                visibility.value = withSpring(CONTROL_VISIBLE_OPACITY);
                break;
        }
    }, [focus, shift, visibility]);

    useEffect(() => {
        const keyboardShow = Keyboard.addListener(KEYBOARD_SHOW_EVENT, (event) => {
            setTimeout(() => {
                if (HomeFocusAtom.get() === 'box') {
                    shift.value = withSpring(-event.endCoordinates.height);
                }
            }, 10);
        });

        return () => keyboardShow.remove();
    }, [shift]);

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
                        transform: [{ translateY: shift.value }],
                        opacity: focus === 'search' ? pullDownOpacity : Math.max(visibility.value, pullDownOpacity),
                    };
                }),
            ]}
            onTouchEnd={(e) => e.stopPropagation()}
        >
            <TouchableOpacity
                style={{ width: '100%', height: '100%' }}
                onPressOut={() => {
                    if (CollectObjectsAtom.get().boxId) {
                        HomeFocusAtom.set('none');
                        Keyboard.dismiss();
                        launchCamera();
                    }
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
