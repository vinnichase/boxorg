import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { BLACK, PURPLE_DARK, PURPLE_LIGHT, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { CollectObjectsAtom } from '../atoms/CollectObjectsAtom';
import { ObjectTile } from '../components/ObjectTile';
import { BlurView } from 'expo-blur';
import { BoxIcon, SaveIcon } from '../components/Icons';
import { setPath } from '../util/setPath';
import { useRouter } from 'expo-router';
import { saveObjects } from '../service/saveObjects';

const HEADER_HEIGHT = 90;
const TILE_GAP = 18;
const TILE_COLUMNS = 2;

function App(): JSX.Element {
    const router = useRouter();

    const { width } = useWindowDimensions();
    const TILE_WIDTH = (width - TILE_GAP * (TILE_COLUMNS + 1)) / TILE_COLUMNS;

    const { image, boxId, objects } = useAtom(CollectObjectsAtom);

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
            <SafeAreaView />
            <ScrollView style={{ marginTop: HEADER_HEIGHT, overflow: 'visible' }}>
                <View
                    style={{
                        gap: TILE_GAP,
                        padding: TILE_GAP,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        shadowColor: `${PURPLE_LIGHT}`,
                        shadowOpacity: 1,
                        shadowRadius: 50,
                    }}
                >
                    {!image || !objects || objects.length === 0 ? (
                        <Text style={{ marginTop: 40, marginHorizontal: 20, color: WHITE, fontSize: 20 }}>
                            No Results. Get Back!
                        </Text>
                    ) : (
                        objects.map(({ deleted, tags, uri }, i) => {
                            console.log('URI', uri);
                            return (
                                <ObjectTile
                                    key={i}
                                    imageUri={uri}
                                    tags={tags.filter(Boolean)}
                                    width={TILE_WIDTH}
                                    deleted={deleted}
                                    onDeleted={(deleted) =>
                                        CollectObjectsAtom.set((a) => setPath(['objects', i, 'deleted'], deleted, a))
                                    }
                                    onEdit={() => {
                                        CollectObjectsAtom.set((a) => setPath(['index'], i, a));
                                        router.push('/label');
                                    }}
                                />
                            );
                        })
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
                    <View
                        style={{
                            height: HEADER_HEIGHT,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 20,
                            padding: 20,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <BoxIcon color2={`${WHITE}44`} />
                            <Text style={{ color: WHITE, fontSize: 35, fontWeight: 300, opacity: 0.9 }}>
                                box {boxId}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                boxId && saveObjects(boxId, objects);
                                CollectObjectsAtom.set({ index: 0, boxId, objects: [] });
                                router.dismissTo('/');
                            }}
                        >
                            <SaveIcon color1={`${WHITE}`} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </BlurView>
        </View>
    );
}

export default App;
