import React, { useEffect, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BLACK, KEYBOARD_TOOLBAR_HEIGHT, PURPLE_DARK, PURPLE_LIGHT, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { CollectObjectsAtom, loadCollectBoxTags } from '../atoms/CollectObjectsAtom';
import { BoxTagsDrawer } from '../components/BoxTagsDrawer';
import { BoxTagsEditor } from '../components/BoxTagsEditor';
import { BoxTagsToggle } from '../components/BoxTagsToggle';
import { useBoxTagsDrawer } from '../hooks/useBoxTagsDrawer';
import { useBlurTarget } from '../hooks/useBlurTarget';
import { KeyboardToolbarDismiss } from '../components/KeyboardToolbarDismiss';
import { ObjectTile } from '../components/ObjectTile';
import { BlurTargetView, BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ArrowLeftIcon, SaveIcon } from '../components/Icons';
import { setPath } from '../util/setPath';
import { useRouter } from 'expo-router';
import { saveObjects } from '../service/saveObjects';

const HEADER_HEIGHT = 90;
const TILE_GAP = 18;
const TILE_COLUMNS = 2;

function App(): React.ReactElement {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    // the scrolled content is the blur target, so the header blurs whatever passes underneath it;
    // a blur view must not sit inside its own target, so the header stays outside of it
    const { blurTargetRef, blurTarget } = useBlurTarget();

    const { width } = useWindowDimensions();
    const TILE_WIDTH = (width - TILE_GAP * (TILE_COLUMNS + 1)) / TILE_COLUMNS;

    const { image, boxId, objects, boxTags } = useAtom(CollectObjectsAtom);
    const boxInputRef = useRef<TextInput>(null);
    const currentBoxTags = boxId === undefined ? [] : (boxTags[boxId] ?? []);
    const drawer = useBoxTagsDrawer(currentBoxTags.length > 0, boxId !== undefined);
    // worklets copy whole captured objects, so only the shared values may be closed over
    const drawerProgress = drawer.progress;
    const drawerContentHeight = drawer.contentHeight;
    const headerOffset = HEADER_HEIGHT + insets.top;

    // the box number must be assigned consciously on every collect run, so the
    // field starts empty instead of inheriting the previous run's number; the
    // box tag drafts go with it
    useEffect(() => {
        CollectObjectsAtom.set((a) => ({ ...a, boxId: undefined, boxTags: {} }));
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
            {/* the list spans the screen and starts below the header via padding, so
                it scrolls underneath the blur; keyboard aware so the tiles stay
                reachable while the box number or box tags are being typed */}
            <KeyboardAwareScrollView
                bottomOffset={KEYBOARD_TOOLBAR_HEIGHT + TILE_GAP}
                extraKeyboardSpace={KEYBOARD_TOOLBAR_HEIGHT}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: insets.bottom }}
                scrollIndicatorInsets={{ top: headerOffset }}
            >
                {/* keeps the content below the header, following the box tag drawer */}
                <Animated.View
                    style={useAnimatedStyle(() => ({
                        height: headerOffset + drawerProgress.value * drawerContentHeight.value,
                    }))}
                />
                <BlurTargetView
                    ref={blurTargetRef}
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
                </BlurTargetView>
            </KeyboardAwareScrollView>
            <BlurView
                intensity={80}
                tint="dark"
                blurMethod="dimezisBlurView"
                blurTarget={blurTarget}
                style={{
                    position: 'absolute',
                    width: '100%',
                    left: 0,
                    top: 0,
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
                            borderBottomColor: `${WHITE}22`,
                            borderBottomWidth: 1,
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
                                    if (!Number.isNaN(nextBoxId)) loadCollectBoxTags(nextBoxId);
                                }}
                            />
                        </View>
                        <BoxTagsToggle drawer={drawer} />
                        <TouchableOpacity
                            onPress={() => {
                                if (!boxId) {
                                    boxInputRef.current?.focus();
                                    return;
                                }

                                saveObjects(boxId, objects, boxTags);
                                CollectObjectsAtom.set({ index: 0, objects: [], boxTags: {} });
                                router.dismissTo('/');
                            }}
                        >
                            <SaveIcon color1={`${WHITE}`} />
                        </TouchableOpacity>
                    </View>
                    <BoxTagsDrawer drawer={drawer}>
                        <View style={{ margin: TILE_GAP }}>
                            <BoxTagsEditor
                                key={boxId}
                                tags={currentBoxTags}
                                disabled={boxId === undefined}
                                onChange={(tags) => {
                                    if (boxId === undefined) return;
                                    CollectObjectsAtom.set((a) => setPath(['boxTags', boxId], tags, a));
                                }}
                            />
                        </View>
                    </BoxTagsDrawer>
                </SafeAreaView>
            </BlurView>
            <KeyboardToolbarDismiss />
        </View>
    );
}

export default App;
