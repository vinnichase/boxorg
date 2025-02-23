import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { PURPLE_DARK, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { ObjectDetectionResultAtom } from '../atoms/ObjectDetectionResultAtom';
import { ObjectTile } from '../components/ObjectTile';

function App(): JSX.Element {
    const { image, objects } = useAtom(ObjectDetectionResultAtom);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: PURPLE_DARK,
            }}
        >
            <SafeAreaView
                style={{
                    flex: 1,
                    gap: 50,
                }}
            >
                {!objects || !image || objects.length === 0 ? (
                    <Text style={{ marginTop: 40, marginHorizontal: 20, color: WHITE, fontSize: 20 }}>
                        No Results. Get Back!
                    </Text>
                ) : (
                    objects.map(({ frame }) => (
                        <ObjectTile
                            image={image}
                            rect={[frame.origin.x, frame.origin.y, frame.size.x, frame.size.y]}
                        ></ObjectTile>
                    ))
                )}
            </SafeAreaView>
        </View>
    );
}

export default App;
