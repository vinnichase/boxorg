import React, { useReducer } from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { BLACK, PURPLE_DARK, PURPLE_LIGHT, RED, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { EditObjectsAtom } from '../atoms/EditObjectsAtom';
import { CrossIcon } from '../components/Icons';
import { setPath } from '../util/setPath';

function App(): JSX.Element {
    const { width } = useWindowDimensions();
    const { index, objects } = useAtom(EditObjectsAtom);
    const [, forceUpdate] = useReducer(() => ({}), {});
    const object = objects[index];

    console.log(object?.tags);

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
            <KeyboardAvoidingView
                behavior="height"
                style={{
                    flex: 1,
                    overflow: 'hidden',
                }}
            >
                <View
                    style={{
                        flex: 1,
                        shadowColor: `${PURPLE_LIGHT}`,
                        shadowOpacity: 1,
                        shadowRadius: 100,
                    }}
                    onTouchEnd={() => Keyboard.dismiss()}
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
                                            EditObjectsAtom.set((a) =>
                                                setPath(
                                                    ['objects', index, 'tags'],
                                                    object?.tags?.filter((_, j) => i !== j),
                                                    a,
                                                ),
                                            );
                                            forceUpdate();
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
                                            style={{
                                                flex: 1,
                                                height: '100%',
                                                fontSize: 20,
                                                color: WHITE,
                                            }}
                                            defaultValue={tag}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

export default App;
