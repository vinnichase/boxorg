import React from 'react';
import { SafeAreaView, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { BLACK, PURPLE_DARK, PURPLE_LIGHT, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { ObjectDetectionResultAtom } from '../atoms/ObjectDetectionResultAtom';
import { ObjectTile } from '../components/ObjectTile';
import { BlurView } from 'expo-blur';
import { BoxIcon } from '../components/Icons';
import { EditObject, EditObjectsAtom } from '../atoms/EditObjectsAtom';
import { setPath } from '../util/setPath';
import { getPath } from '../util/getPath';
import { useRouter } from 'expo-router';

const HEADER_HEIGHT = 90;
const TILE_GAP = 18;
const TILE_COLUMNS = 2;

function App(): JSX.Element {
    const router = useRouter();

    const { width } = useWindowDimensions();
    const TILE_WIDTH = (width - TILE_GAP * (TILE_COLUMNS + 1)) / TILE_COLUMNS;

    const { image, objects } = useAtom(ObjectDetectionResultAtom);
    const { index, objects: editObjects } = useAtom(EditObjectsAtom);

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
                    {!objects || !image || objects.length === 0 ? (
                        <Text style={{ marginTop: 40, marginHorizontal: 20, color: WHITE, fontSize: 20 }}>
                            No Results. Get Back!
                        </Text>
                    ) : (
                        objects.map(({ frame, labels }, i) => (
                            <ObjectTile
                                key={i}
                                image={image}
                                tags={
                                    getPath(
                                        labels.slice(0, 3).map((l) => l.text),
                                        ['tags'],
                                        editObjects[i],
                                    ) ?? []
                                }
                                width={TILE_WIDTH}
                                rect={[frame.origin.x, frame.origin.y, frame.size.x, frame.size.y]}
                                onDeleted={(deleted) =>
                                    EditObjectsAtom.set((a) => setPath(['objects', i, 'deleted'], deleted, a))
                                }
                                onEdit={(imageUri) => {
                                    EditObjectsAtom.set((a) => setPath(['index'], i, a));
                                    const currentObject = getPath(
                                        undefined as EditObject | undefined,
                                        ['objects', i],
                                        EditObjectsAtom.get(),
                                    );
                                    EditObjectsAtom.set((a) =>
                                        setPath(
                                            ['objects', i],
                                            {
                                                deleted: currentObject?.deleted ?? false,
                                                uri: imageUri,
                                                tags: currentObject?.tags ?? labels.slice(0, 3).map((l) => l.text),
                                            },
                                            a,
                                        ),
                                    );
                                    router.push('/categorize');
                                }}
                            />
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
                    <View
                        style={{
                            height: HEADER_HEIGHT,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 20,
                            padding: 20,
                        }}
                    >
                        <BoxIcon color2={`${WHITE}44`} />
                        <Text style={{ color: WHITE, fontSize: 35, fontWeight: 300, opacity: 0.9 }}>box 12</Text>
                    </View>
                </SafeAreaView>
            </BlurView>
        </View>
    );
}

export default App;
