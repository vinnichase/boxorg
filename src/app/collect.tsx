import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { PURPLE_DARK, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { ObjectDetectionResultAtom } from '../atoms/ObjectDetectionResultAtom';
import { ObjectTile } from '../components/ObjectTile';
import { BlurView } from 'expo-blur';

function App(): JSX.Element {
    const { image, objects } = useAtom(ObjectDetectionResultAtom);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: PURPLE_DARK,
            }}
        >
            <SafeAreaView />
            <ScrollView style={{ marginTop: 100, overflow: 'visible' }}>
                <View
                    style={{
                        gap: 50,
                        padding: 50,
                    }}
                >
                    {!objects || !image || objects.length === 0 ? (
                        <Text style={{ marginTop: 40, marginHorizontal: 20, color: WHITE, fontSize: 20 }}>
                            No Results. Get Back!
                        </Text>
                    ) : (
                        objects.map(({ frame }, i) => (
                            <ObjectTile
                                key={i}
                                image={image}
                                rect={[frame.origin.x, frame.origin.y, frame.size.x, frame.size.y]}
                            ></ObjectTile>
                        ))
                    )}
                </View>
            </ScrollView>
            <SafeAreaView />
            <BlurView
                intensity={80}
                tint="regular"
                style={{
                    position: 'absolute',
                    width: '100%',
                    left: 0,
                    top: 0,
                    borderBottomColor: `${WHITE}22`,
                    borderBottomWidth: 1,
                }}
            >
                <SafeAreaView style={{ backgroundColor: `${PURPLE_DARK}33` }}>
                    <View style={{ height: 100 }}></View>
                </SafeAreaView>
            </BlurView>
        </View>
    );
}

export default App;
