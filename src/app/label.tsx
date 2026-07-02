import React from 'react';
import {
    Image,
    ScrollView,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';
import { BLACK, GREEN_LIGHT, PURPLE_DARK, PURPLE_LIGHT, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { CollectObjectsAtom } from '../atoms/CollectObjectsAtom';
import { CrossIcon } from '../components/Icons';
import { KeyboardToolbarDismiss } from '../components/KeyboardToolbarDismiss';
import { setPath } from '../util/setPath';

const KEYBOARD_SHIFT_REFERENCE_HEIGHT = 844;

function App(): React.ReactElement {
    const { width, height: windowHeight } = useWindowDimensions();
    const { index, objects } = useAtom(CollectObjectsAtom);
    const object = objects[index];
    const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
    const keyboardShiftScale = Math.min(windowHeight / KEYBOARD_SHIFT_REFERENCE_HEIGHT, 1);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: PURPLE_DARK,
                shadowColor: `${BLACK}aa`,
                shadowOpacity: 0.5,
                shadowRadius: 50,
            }}
        >
            <Reanimated.View
                style={[
                    {
                        flex: 1,
                        overflow: 'hidden',
                    },
                    useAnimatedStyle(() => ({
                        transform: [{ translateY: (keyboardHeight.value / 2) * keyboardShiftScale }],
                    })),
                ]}
            >
                <View
                    style={{
                        flex: 1,
                        shadowColor: `${PURPLE_LIGHT}`,
                        shadowOpacity: 1,
                        shadowRadius: 100,
                    }}
                >
                    <Image
                        source={{ uri: object?.uri }}
                        style={{
                            width,
                            height: '50%',
                            maxHeight: width,
                        }}
                    ></Image>
                    <ScrollView style={{ flex: 1 }}>
                        <View
                            style={{
                                flex: 1,
                                gap: 18,
                                marginVertical: 18,
                            }}
                            onTouchEnd={(e) => e.stopPropagation()}
                        >
                            {object?.tags?.map((tag, i) => (
                                <View
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: 45,
                                        flexDirection: 'row',
                                        gap: 18,
                                        marginHorizontal: 18,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={{ paddingVertical: 10 }}
                                        onPress={() => {
                                            CollectObjectsAtom.set((a) =>
                                                setPath(
                                                    ['objects', index, 'tags'],
                                                    object?.tags?.filter((_, j) => i !== j),
                                                    a,
                                                ),
                                            );
                                        }}
                                    >
                                        <CrossIcon color1={PURPLE_LIGHT}></CrossIcon>
                                    </TouchableOpacity>
                                    <View
                                        style={{
                                            flex: 1,
                                            padding: 4,
                                            paddingHorizontal: 18,
                                            backgroundColor: PURPLE_LIGHT,
                                            opacity: 0.9,
                                            borderRadius: 14,
                                        }}
                                    >
                                        <TextInput
                                            autoCapitalize="characters"
                                            style={{
                                                flex: 1,
                                                height: '100%',
                                                fontSize: 20,
                                                color: WHITE,
                                                textAlignVertical: 'center',
                                                paddingVertical: 0,
                                            }}
                                            autoComplete="off"
                                            spellCheck={false}
                                            defaultValue={tag}
                                            onChange={(e) => {
                                                CollectObjectsAtom.set((a) =>
                                                    setPath(
                                                        ['objects', index, 'tags', i],
                                                        e.nativeEvent.text.toUpperCase().trim(),
                                                        a,
                                                    ),
                                                );
                                            }}
                                        />
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity
                                style={{ width: '100%', alignItems: 'center' }}
                                onPress={() => {
                                    CollectObjectsAtom.set((a) =>
                                        setPath(['objects', index, 'tags', object?.tags?.length ?? 0], '', a),
                                    );
                                }}
                            >
                                <View style={{ height: 25, transform: [{ rotate: '45deg' }] }}>
                                    <CrossIcon color1={GREEN_LIGHT}></CrossIcon>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Reanimated.View>
            <KeyboardToolbarDismiss />
        </View>
    );
}

export default App;
