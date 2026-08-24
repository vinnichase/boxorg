import React, { useEffect, useRef } from 'react';
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BLACK, PURPLE_DARK, PURPLE_LIGHT, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { CollectObjectsAtom } from '../atoms/CollectObjectsAtom';
import { ObjectTile } from '../components/ObjectTile';
import { BlurView } from 'expo-blur';
import { ArrowLeftIcon, SaveIcon } from '../components/Icons';
import { setPath } from '../util/setPath';
import { useRouter } from 'expo-router';
import { saveObjects } from '../service/saveObjects';

const HEADER_HEIGHT = 90;
const TILE_GAP = 18;
const TILE_COLUMNS = 2;

function App(): React.ReactElement {
    const router = useRouter();

    const { width } = useWindowDimensions();
    const TILE_WIDTH = (width - TILE_GAP * (TILE_COLUMNS + 1)) / TILE_COLUMNS;

    const { image, boxId, objects } = useAtom(CollectObjectsAtom);
    const boxInputRef = useRef<TextInput>(null);

    // the box number must be assigned consciously on every collect run, so the
    // field starts empty instead of inheriting the previous run's number
    useEffect(() => {
        CollectObjectsAtom.set((a) => setPath(['boxId'], undefined, a));
    }, []);

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
            <SafeAreaView>
                <ScrollView
                    style={{
                        marginTop: HEADER_HEIGHT,
                        ...(Platform.OS !== 'android' && { overflow: 'visible' }),
                    }}
                >
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
                            objects.map(({ deleted, tags, uri, boxId: objectBoxId }, i) => (
                                <ObjectTile
                                    key={i}
                                    imageUri={uri}
                                    tags={tags.filter(Boolean)}
                                    width={TILE_WIDTH}
                                    deleted={deleted}
                                    boxId={objectBoxId ?? boxId}
                                    boxIdOverridden={objectBoxId !== undefined}
                                    onResetBoxId={() =>
                                        CollectObjectsAtom.set((a) => setPath(['objects', i, 'boxId'], undefined, a))
                                    }
                                    onDeleted={(deleted) =>
                                        CollectObjectsAtom.set((a) => setPath(['objects', i, 'deleted'], deleted, a))
                                    }
                                    onEdit={() => {
                                        CollectObjectsAtom.set((a) => setPath(['index'], i, a));
                                        router.push('/label');
                                    }}
                                />
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
            <BlurView
                intensity={80}
                tint="dark"
                experimentalBlurMethod="dimezisBlurView"
                style={{
                    position: 'absolute',
                    width: '100%',
                    left: 0,
                    top: 0,
                    borderBottomColor: `${WHITE}22`,
                    borderBottomWidth: 1,
                }}
            >
                <SafeAreaView edges={['top']} style={{ backgroundColor: `${PURPLE_DARK}33` }}>
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
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <ArrowLeftIcon color1={WHITE} />
                            </TouchableOpacity>
                            <Text style={{ color: WHITE, fontSize: 35, fontWeight: 300, opacity: 0.9 }}>box</Text>
                            <TextInput
                                ref={boxInputRef}
                                keyboardType="number-pad"
                                maxLength={2}
                                style={{
                                    flex: 1,
                                    height: '100%',
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    color: WHITE,
                                    fontSize: 35,
                                    fontWeight: 'bold',
                                    borderRadius: 14,
                                    backgroundColor: WHITE + '33',
                                    textAlignVertical: 'center',
                                }}
                                autoComplete="off"
                                spellCheck={false}
                                placeholder="Nr."
                                placeholderTextColor={`${WHITE}66`}
                                onChange={(e) => {
                                    const nextBoxId = parseInt(e.nativeEvent.text);
                                    CollectObjectsAtom.set((a) =>
                                        setPath(['boxId'], Number.isNaN(nextBoxId) ? undefined : nextBoxId, a),
                                    );
                                }}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                if (!boxId) {
                                    boxInputRef.current?.focus();
                                    return;
                                }

                                saveObjects(boxId, objects);
                                CollectObjectsAtom.set({ index: 0, objects: [] });
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
