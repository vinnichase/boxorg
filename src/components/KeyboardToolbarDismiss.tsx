import { Keyboard, TouchableOpacity, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PURPLE_DARK, KEYBOARD_TOOLBAR_HEIGHT, WHITE } from '../util/constants';
import { KeyboardDownIcon } from './Icons';

export const KeyboardToolbarDismiss = () => {
    const insets = useSafeAreaInsets();

    return (
        <KeyboardStickyView
            offset={{ closed: KEYBOARD_TOOLBAR_HEIGHT, opened: 0 }}
            pointerEvents="box-none"
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: KEYBOARD_TOOLBAR_HEIGHT,
            }}
        >
            <View
                pointerEvents="box-none"
                style={{
                    height: KEYBOARD_TOOLBAR_HEIGHT,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingLeft: 16 + insets.left,
                    paddingRight: 16 + insets.right,
                }}
            >
                <TouchableOpacity
                    accessibilityLabel="Dismiss keyboard"
                    style={{
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        backgroundColor: `${WHITE}CC`,
                    }}
                    onPress={() => Keyboard.dismiss()}
                >
                    <View
                        style={{
                            width: 28,
                            height: 28,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <KeyboardDownIcon color1={PURPLE_DARK} />
                    </View>
                </TouchableOpacity>
            </View>
        </KeyboardStickyView>
    );
};
