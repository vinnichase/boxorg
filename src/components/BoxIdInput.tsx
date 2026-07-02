import { useEffect, useRef } from 'react';
import { Keyboard, Platform, TextInput } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAtom } from '@gothub-team/got-atom';
import { CollectObjectsAtom } from '../atoms/CollectObjectsAtom';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';
import { SearchPullDownGestureAtom } from '../atoms/PullDownGestureAtom';
import { usePullDownBehavior } from '../hooks/usePullDownBehavior';
import { setPath } from '../util/setPath';
import { PURPLE_DARK } from '../util/constants';
import { BoxIcon } from './Icons';
import { MainInputBox } from './MainInputBox';

const CONTROL_VISIBLE_OPACITY = 0.9;
const KEYBOARD_SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

export const BoxIdInput = () => {
    const inputRef = useRef<TextInput>(null);
    const focus = useAtom(HomeFocusAtom);
    const searchPullDownBehavior = usePullDownBehavior(SearchPullDownGestureAtom);
    const visibility = useSharedValue(CONTROL_VISIBLE_OPACITY);
    const shift = useSharedValue(0);

    useEffect(() => {
        if (focus !== 'box') {
            inputRef.current?.blur();
            return;
        }

        const frame = requestAnimationFrame(() => inputRef.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, [focus]);

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
        <MainInputBox
            pointerEvents={focus === 'search' ? 'none' : 'auto'}
            style={useAnimatedStyle(() => {
                const fadeInProgress = Math.min(
                    Math.max((searchPullDownBehavior.progress.value - 0.3) / (1 - 0.3), 0),
                    1,
                );

                return {
                    transform: [{ translateY: shift.value }],
                    opacity: focus === 'search' ? fadeInProgress : visibility.value,
                };
            })}
        >
            <BoxIcon color1={PURPLE_DARK} />
            <TextInput
                ref={inputRef}
                keyboardType="number-pad"
                style={{
                    flex: 1,
                    height: '100%',
                    fontSize: 25,
                    color: PURPLE_DARK,
                    textAlignVertical: 'center',
                    paddingVertical: 0,
                }}
                autoComplete="off"
                spellCheck={false}
                onTouchEnd={(e) => e.stopPropagation()}
                onFocus={() => HomeFocusAtom.set('box')}
                onChange={(e) => CollectObjectsAtom.set((a) => setPath(['boxId'], parseInt(e.nativeEvent.text), a))}
            />
        </MainInputBox>
    );
};
