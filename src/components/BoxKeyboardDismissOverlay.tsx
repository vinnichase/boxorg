import { Keyboard, Pressable } from 'react-native';
import { useAtom } from '@gothub-team/got-atom';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';

export const BoxKeyboardDismissOverlay = () => {
    const focus = useAtom(HomeFocusAtom);

    if (focus !== 'box') return null;

    return (
        <Pressable
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            }}
            onPress={() => {
                Keyboard.dismiss();
                HomeFocusAtom.set('none');
            }}
        />
    );
};
