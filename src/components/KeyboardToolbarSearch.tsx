import { Keyboard, TouchableOpacity, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAtom } from '@gothub-team/got-atom';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';
import { SearchAtom } from '../atoms/SearchAtom';
import { setPath } from '../util/setPath';
import { PURPLE_DARK, KEYBOARD_TOOLBAR_HEIGHT, WHITE } from '../util/constants';
import { BoxIcon, KeyboardDownIcon, TextIcon } from './Icons';

export const KeyboardToolbarSearch = () => {
    const insets = useSafeAreaInsets();
    const focus = useAtom(HomeFocusAtom);
    const search = useAtom(SearchAtom);
    const visible = focus === 'search';
    const boxSearchActive = search.query.startsWith('#');

    if (!visible) return null;

    const setSearchQuery = (query: string) => {
        SearchAtom.set((a) => setPath(['query'], query, a));
    };

    const handleBoxSearchPress = () => {
        const query = SearchAtom.get().query;

        if (query.startsWith('#')) {
            setSearchQuery('');
            return;
        }

        const digits = query.replace(/\D/g, '');
        setSearchQuery(`#${digits}`);
    };

    const dismissSearchKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <KeyboardStickyView
            enabled={visible}
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
                    justifyContent: 'space-between',
                    paddingLeft: 16 + insets.left,
                    paddingRight: 16 + insets.right,
                }}
            >
                <TouchableOpacity
                    accessibilityLabel={boxSearchActive ? 'Tag search' : 'Box search'}
                    style={{
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        backgroundColor: `${WHITE}CC`,
                    }}
                    onPress={handleBoxSearchPress}
                >
                    <View style={{ width: 28, height: 28 }}>
                        {boxSearchActive ? <TextIcon color1={PURPLE_DARK} /> : <BoxIcon color1={PURPLE_DARK} />}
                    </View>
                </TouchableOpacity>
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
                    onPress={dismissSearchKeyboard}
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
