import React from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { BLACK, GREEN_LIGHT, PURPLE_DARK, PURPLE_LIGHT, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';

import { CrossIcon } from '../components/Icons';
import { setPath } from '../util/setPath';
import { EditObjectAtom } from '../atoms/EditObjectAtom';

function App(): JSX.Element {
    const { width } = useWindowDimensions();
    const object = useAtom(EditObjectAtom);

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
                >
                    <View
                        style={{
                            width,
                            height: '50%',
                            maxHeight: width,
                        }}
                        onTouchEnd={() => Keyboard.dismiss()}
                    >
                        <Image
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            source={{ uri: object ? FileSystem.documentDirectory + object.thumb_path : undefined }}
                        ></Image>
                    </View>
                    <ScrollView style={{ flex: 1 }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                margin: 18,
                                marginBottom: 0,
                                padding: 10,
                                paddingHorizontal: 18,
                                backgroundColor: PURPLE_LIGHT,
                                opacity: 0.9,
                                borderRadius: 14,
                            }}
                        >
                            <Text style={{ marginRight: 10, color: WHITE, fontSize: 25 }}>box</Text>
                            <TextInput
                                keyboardType="number-pad"
                                style={{
                                    flex: 1,
                                    height: '100%',
                                    color: WHITE,
                                    fontSize: 25,
                                    fontWeight: 'bold',
                                }}
                                autoComplete="off"
                                spellCheck={false}
                                defaultValue={object.box_id.toString() ?? ''}
                                onChange={(e) => {
                                    EditObjectAtom.set((a) => setPath(['box_id'], Number(e.nativeEvent.text), a));
                                }}
                            />
                        </View>
                        <View
                            style={{
                                flex: 1,
                                gap: 18,
                                marginVertical: 18,
                            }}
                            onTouchEnd={(e) => e.stopPropagation()}
                        >
                            {object.tags.map((tag, i) => (
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
                                            EditObjectAtom.set((a) =>
                                                setPath(
                                                    ['tags'],
                                                    object.tags.filter((_, j) => i !== j),
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
                                            padding: 10,
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
                                            }}
                                            autoComplete="off"
                                            spellCheck={false}
                                            defaultValue={tag}
                                            onChange={(e) => {
                                                EditObjectAtom.set((a) =>
                                                    setPath(['tags', i], e.nativeEvent.text.toUpperCase(), a),
                                                );
                                            }}
                                        />
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity
                                style={{ width: '100%', alignItems: 'center' }}
                                onPress={() => {
                                    EditObjectAtom.set((a) => setPath(['tags', object.tags.length ?? 0], '', a));
                                }}
                            >
                                <View style={{ height: 25, transform: [{ rotate: '45deg' }] }}>
                                    <CrossIcon color1={GREEN_LIGHT}></CrossIcon>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

export default App;
