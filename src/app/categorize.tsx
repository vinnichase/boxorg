import React from 'react';
import { Image, TextInput, useWindowDimensions, View } from 'react-native';
import { BLACK, PURPLE_DARK, PURPLE_LIGHT, PURPLE_MID, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { EditObjectsAtom } from '../atoms/EditObjectsAtom';

function App(): JSX.Element {
    const { width } = useWindowDimensions();
    const { index, objects } = useAtom(EditObjectsAtom);
    const object = objects[index];

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
            <View
                style={{
                    flex: 1,
                    overflow: 'hidden',
                }}
            >
                <View
                    style={{
                        shadowColor: `${PURPLE_LIGHT}`,
                        shadowOpacity: 1,
                        shadowRadius: 100,
                        gap: 18,
                    }}
                >
                    <Image
                        source={{ uri: object?.uri }}
                        style={{
                            width,
                            height: width,
                        }}
                    ></Image>
                    {object?.tags?.map((tag, i) => (
                        <View
                            key={i}
                            style={{
                                height: 45,
                                marginHorizontal: 18,
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
                    ))}
                </View>
            </View>
        </View>
    );
}

export default App;
