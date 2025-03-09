import React from 'react';
import { Image, useWindowDimensions, View } from 'react-native';
import { BLACK, PURPLE_DARK, PURPLE_LIGHT } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { EditObjectsAtom } from '../atoms/EditObjectsAtom';

function App(): JSX.Element {
    const { width } = useWindowDimensions();
    const { index, objects } = useAtom(EditObjectsAtom);

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
                    }}
                >
                    <Image
                        source={{ uri: objects[index]?.uri }}
                        style={{
                            width,
                            height: width,
                        }}
                    ></Image>
                </View>
            </View>
        </View>
    );
}

export default App;
