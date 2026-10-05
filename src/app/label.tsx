import React from 'react';
import { Image, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurTargetView, BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { BLACK, GREEN_LIGHT, KEYBOARD_TOOLBAR_HEIGHT, PURPLE_DARK, PURPLE_LIGHT, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { CollectObjectsAtom, loadCollectBoxTags } from '../atoms/CollectObjectsAtom';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon, CrossIcon } from '../components/Icons';
import { BoxTagsDrawer } from '../components/BoxTagsDrawer';
import { BoxTagsEditor } from '../components/BoxTagsEditor';
import { BoxTagsToggle } from '../components/BoxTagsToggle';
import { useBoxTagsDrawer } from '../hooks/useBoxTagsDrawer';
import { useBlurTarget } from '../hooks/useBlurTarget';
import { KeyboardToolbarDismiss } from '../components/KeyboardToolbarDismiss';
import { setPath } from '../util/setPath';

const HEADER_HEIGHT = 90;

function App(): React.ReactElement {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    // the scrolled content is the blur target, so the header blurs whatever passes underneath it;
    // a blur view must not sit inside its own target, so the header stays outside of it
    const { blurTargetRef, blurTarget } = useBlurTarget();
    const { width, height: windowHeight } = useWindowDimensions();
    const { index, objects, boxId, boxTags } = useAtom(CollectObjectsAtom);
    const object = objects[index];
    const objectBoxId = object?.boxId ?? boxId;
    const objectBoxTags = objectBoxId === undefined ? [] : (boxTags[objectBoxId] ?? []);
    const drawer = useBoxTagsDrawer(objectBoxTags.length > 0, objectBoxId !== undefined);
    // worklets copy whole captured objects, so only the shared values may be closed over
    const drawerProgress = drawer.progress;
    const drawerContentHeight = drawer.contentHeight;
    const headerOffset = HEADER_HEIGHT + insets.top;

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
            <KeyboardAwareScrollView
                bottomOffset={KEYBOARD_TOOLBAR_HEIGHT + 18}
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
                        gap: 18,
                        paddingBottom: 18,
                        shadowColor: `${PURPLE_LIGHT}`,
                        shadowOpacity: 1,
                        shadowRadius: 100,
                    }}
                    onTouchEnd={(e) => e.stopPropagation()}
                >
                    <Image
                        source={{ uri: object?.uri }}
                        style={{ width, height: Math.min(windowHeight / 2, width) }}
                    />
                    {object?.tags?.map((tag, i) => (
                        <View
                            key={i}
                            style={{
                                height: 45,
                                flexDirection: 'row',
                                gap: 18,
                                marginHorizontal: 18,
                            }}
                        >
                            <TouchableOpacity
                                style={{ paddingVertical: 10 }}
                                onPress={() => {
                                    CollectObjectsAtom.set((a) =>
                                        setPath(
                                            ['objects', index, 'tags'],
                                            object?.tags?.filter((_, j) => i !== j),
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
                                    padding: 4,
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
                                        textAlignVertical: 'center',
                                        paddingVertical: 0,
                                    }}
                                    autoComplete="off"
                                    spellCheck={false}
                                    defaultValue={tag}
                                    onChange={(e) => {
                                        CollectObjectsAtom.set((a) =>
                                            setPath(
                                                ['objects', index, 'tags', i],
                                                e.nativeEvent.text.toUpperCase().trim(),
                                                a,
                                            ),
                                        );
                                    }}
                                />
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity
                        style={{ width: '100%', alignItems: 'center' }}
                        onPress={() => {
                            CollectObjectsAtom.set((a) =>
                                setPath(['objects', index, 'tags', object?.tags?.length ?? 0], '', a),
                            );
                        }}
                    >
                        <View style={{ height: 25, transform: [{ rotate: '45deg' }] }}>
                            <CrossIcon color1={GREEN_LIGHT}></CrossIcon>
                        </View>
                    </TouchableOpacity>
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
                                keyboardType="number-pad"
                                maxLength={2}
                                placeholder="Nr."
                                placeholderTextColor={`${WHITE}66`}
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
                                defaultValue={objectBoxId?.toString() ?? ''}
                                onChange={(e) => {
                                    const nextBoxId = parseInt(e.nativeEvent.text);
                                    CollectObjectsAtom.set((a) =>
                                        setPath(
                                            ['objects', index, 'boxId'],
                                            Number.isNaN(nextBoxId) ? undefined : nextBoxId,
                                            a,
                                        ),
                                    );
                                    if (!Number.isNaN(nextBoxId)) loadCollectBoxTags(nextBoxId);
                                }}
                            />
                        </View>
                        <BoxTagsToggle drawer={drawer} />
                    </View>
                    <BoxTagsDrawer drawer={drawer}>
                        <View style={{ margin: 18 }}>
                            <BoxTagsEditor
                                key={objectBoxId}
                                tags={objectBoxTags}
                                disabled={objectBoxId === undefined}
                                onChange={(tags) => {
                                    if (objectBoxId === undefined) return;
                                    CollectObjectsAtom.set((a) => setPath(['boxTags', objectBoxId], tags, a));
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
