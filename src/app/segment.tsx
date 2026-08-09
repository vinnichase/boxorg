import React, { useEffect, useRef, useState } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BLACK, RED, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { ArrowLeftIcon, CrossIcon, SegmentIcon } from '../components/Icons';
import { CollectObjectsAtom } from '../atoms/CollectObjectsAtom';
import { setPath } from '../util/setPath';
import { cropImage } from '../util/cropImage';

function App(): React.ReactElement {
    const router = useRouter();

    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    const { image } = useAtom(CollectObjectsAtom);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#000',
                shadowColor: `${BLACK}aa`,
                shadowOpacity: 0.5,
                shadowRadius: 50,
                justifyContent: 'center',
                alignItems: 'stretch',
            }}
        >
            {image && (
                <>
                    <Image
                        source={{ uri: image.uri }}
                        style={{ aspectRatio: image.width / image.height }}
                        onLayout={(e) =>
                            setImageSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
                        }
                    />
                    <Segmentator width={imageSize.width} height={imageSize.height} image={image} />
                </>
            )}
            <SafeAreaView
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            >
                <TouchableOpacity
                    style={{
                        margin: 18,
                        padding: 14,
                        width: 70,
                        height: 70,
                        backgroundColor: `${WHITE}33`,
                        borderRadius: 35,
                    }}
                    onPress={() => {
                        router.back();
                    }}
                >
                    <ArrowLeftIcon color1={WHITE} />
                </TouchableOpacity>
            </SafeAreaView>
            <SafeAreaView
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                }}
            >
                <TouchableOpacity
                    style={{
                        margin: 18,
                        padding: 14,
                        width: 70,
                        height: 70,
                        backgroundColor: `${WHITE}33`,
                        borderRadius: 35,
                    }}
                    onPress={() => {
                        router.push('/collect');
                    }}
                >
                    <SegmentIcon color1={WHITE} />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

// draw mode: (x, y) is the gesture origin, i.e. the center of the square
const translateRect = (x: number, y: number, w: number, maxW: number, maxH: number) => {
    'worklet';
    return [Math.min(maxW - w, Math.max(0, x - w / 2)), Math.min(maxH - w, Math.max(0, y - w / 2)), w];
};

// clamps a top-left position so the square stays inside the image bounds
const clampRectPosition = (x: number, y: number, w: number, maxW: number, maxH: number) => {
    'worklet';
    return [Math.min(maxW - w, Math.max(0, x)), Math.min(maxH - w, Math.max(0, y))];
};

const FRAME_BORDER_WIDTH = 5;
const DRAW_START_SIZE = 10;
const DELETE_BUTTON_SIZE = 23;
const DELETE_BUTTON_PADDING = 8;
const DELETE_TOUCHABLE_SIZE = DELETE_BUTTON_SIZE + 2 * DELETE_BUTTON_PADDING;

const frameStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    borderColor: `${WHITE}99`,
    borderWidth: FRAME_BORDER_WIDTH,
    borderRadius: 3,
};

// centers the badge on the frame's outer top-right corner (absolute children
// are positioned relative to the area inside the border)
const badgeCornerStyle: ViewStyle = {
    position: 'absolute',
    top: -(DELETE_TOUCHABLE_SIZE / 2 + FRAME_BORDER_WIDTH),
    right: -(DELETE_TOUCHABLE_SIZE / 2 + FRAME_BORDER_WIDTH),
    padding: DELETE_BUTTON_PADDING,
};

const DeleteBadge = () => (
    <View
        style={{
            width: DELETE_BUTTON_SIZE,
            height: DELETE_BUTTON_SIZE,
            padding: 4,
            borderRadius: 7,
            backgroundColor: WHITE,
            opacity: 0.9,
        }}
    >
        <CrossIcon color1={RED} />
    </View>
);

type RectData = {
    id: string;
    x: number;
    y: number;
    w: number;
    uri: string;
};

type DraggableRectFrameProps = {
    rect: RectData;
    maxW: number;
    maxH: number;
    onMove: (x: number, y: number) => void;
    onDelete: () => void;
};

// owns its position on the UI thread: the pan gesture drags the frame (and its
// badge) directly, only the final position is committed back to React state.
// the mount position is plain layout style (left/top), so the frame can never
// flash at 0/0 before the first animated style lands; drags accumulate as a
// transform offset on top of it and are never reset
const DraggableRectFrame = ({ rect, maxW, maxH, onMove, onDelete }: DraggableRectFrameProps) => {
    const [initial] = useState(() => ({ x: rect.x, y: rect.y }));
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const gripX = useSharedValue(0);
    const gripY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onBegin((e) => {
            gripX.value = offsetX.value - e.absoluteX;
            gripY.value = offsetY.value - e.absoluteY;
        })
        .onUpdate((e) => {
            const [nextX, nextY] = clampRectPosition(
                initial.x + e.absoluteX + gripX.value,
                initial.y + e.absoluteY + gripY.value,
                rect.w,
                maxW,
                maxH,
            );
            offsetX.value = nextX - initial.x;
            offsetY.value = nextY - initial.y;
        })
        .onEnd(() => {
            scheduleOnRN(onMove, initial.x + offsetX.value, initial.y + offsetY.value);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
    }));

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View
                style={[
                    frameStyle,
                    { left: initial.x, top: initial.y, width: rect.w, height: rect.w },
                    animatedStyle,
                ]}
            >
                <TouchableOpacity style={badgeCornerStyle} onPress={onDelete}>
                    <DeleteBadge />
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
};

type SegmentatorProps = {
    width: number;
    height: number;
    image: {
        uri: string;
        width: number;
        height: number;
    };
};

const Segmentator = ({ width, height, image }: SegmentatorProps) => {
    const [rects, setRects] = useState<RectData[]>([]);
    // the gesture start point; also the layout mount position of the preview
    const [drawOrigin, setDrawOrigin] = useState<{ x: number; y: number } | null>(null);
    const drawGeneration = useRef(0);

    useEffect(() => {
        CollectObjectsAtom.set((a) =>
            setPath(
                ['objects'],
                rects.map(({ uri }) => ({ deleted: false, tags: [''], uri })),
                a,
            ),
        );
    }, [rects]);

    const cropRect = (x: number, y: number, w: number) =>
        cropImage(image, [
            (x / width) * image.width,
            (y / height) * image.height,
            (w / width) * image.width,
            (w / width) * image.width,
        ]);

    const startDraw = (x: number, y: number) => {
        drawGeneration.current += 1;
        setDrawOrigin({ x, y });
    };

    const addRect = async (x: number, y: number, w: number) => {
        const generation = drawGeneration.current;
        const cropped = await cropRect(x, y, w);
        setRects((prev) => [...prev, { id: cropped.uri, x, y, w, uri: cropped.uri }]);
        // keep the preview mounted if a newer draw gesture is already running
        if (drawGeneration.current === generation) {
            setDrawOrigin(null);
        }
    };

    const moveRect = async (id: string, x: number, y: number) => {
        const rect = rects.find((r) => r.id === id);
        if (!rect) return;

        setRects((prev) => prev.map((r) => (r.id === id ? { ...r, x, y } : r)));

        const cropped = await cropRect(x, y, rect.w);
        // only apply the crop if no newer move has been committed meanwhile
        setRects((prev) => prev.map((r) => (r.id === id && r.x === x && r.y === y ? { ...r, uri: cropped.uri } : r)));
    };

    const deleteRect = (id: string) => {
        setRects((prev) => prev.filter((r) => r.id !== id));
    };

    // the frame being drawn; (x, y) is the gesture origin (square center)
    const drawX = useSharedValue(0);
    const drawY = useSharedValue(0);
    const drawW = useSharedValue(0);

    // the preview mounts at the gesture start point via plain layout style; the
    // animated style only carries the delta from there, so no frame can ever
    // render it anywhere else — the base style stays invisible until the first
    // updater frame lands with correct values
    const animatedDrawStyle = useAnimatedStyle(() => {
        if (!drawOrigin) {
            return { opacity: 0 };
        }

        // dragging down accumulates a negative size; render the absolute value
        // so the square grows the same way in both directions
        const [x, y, w] = translateRect(drawX.value, drawY.value, Math.abs(drawW.value), width, height);
        return {
            opacity: 1,
            width: w,
            height: w,
            transform: [{ translateX: x - drawOrigin.x }, { translateY: y - drawOrigin.y }],
        };
    });

    const drawGesture = Gesture.Pan()
        .onBegin((e) => {
            drawX.value = e.x;
            drawY.value = e.y;
            drawW.value = DRAW_START_SIZE;
            scheduleOnRN(startDraw, e.x, e.y);
        })
        .onUpdate((e) => {
            drawW.value = drawW.value - e.velocityY / 100;
        })
        .onEnd(() => {
            const [x, y, w] = translateRect(drawX.value, drawY.value, Math.abs(drawW.value), width, height);
            scheduleOnRN(addRect, x, y, w);
        });

    return (
        <GestureHandlerRootView
            style={{
                position: 'absolute',
                width,
                height,
            }}
        >
            <GestureDetector gesture={drawGesture}>
                <View style={{ width, height }} />
            </GestureDetector>
            {rects.map((rect) => (
                <DraggableRectFrame
                    key={rect.id}
                    rect={rect}
                    maxW={width}
                    maxH={height}
                    onMove={(x, y) => moveRect(rect.id, x, y)}
                    onDelete={() => deleteRect(rect.id)}
                />
            ))}
            {drawOrigin && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        frameStyle,
                        { left: drawOrigin.x, top: drawOrigin.y, width: 0, height: 0, opacity: 0 },
                        animatedDrawStyle,
                    ]}
                >
                    <View style={badgeCornerStyle}>
                        <DeleteBadge />
                    </View>
                </Animated.View>
            )}
        </GestureHandlerRootView>
    );
};

export default App;
