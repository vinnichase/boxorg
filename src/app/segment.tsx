import React, { useEffect, useRef, useState } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, TouchableOpacity, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BLACK, RED, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { useRouter } from 'expo-router';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { ArrowLeftIcon, CrossIcon, SegmentNextIcon } from '../components/Icons';
import { CollectObjectsAtom } from '../atoms/CollectObjectsAtom';
import { setPath } from '../util/setPath';
import { cropImage } from '../util/cropImage';

const HEADER_BUTTON_SIZE = 70;
const HEADER_BUTTON_MARGIN = 18;
// the header row (buttons + margins) is reserved above the photo, so the
// buttons stay anchored to the screen and never overlap the drawing area
const HEADER_HEIGHT = HEADER_BUTTON_SIZE + 2 * HEADER_BUTTON_MARGIN;

const headerButtonStyle: ViewStyle = {
    margin: HEADER_BUTTON_MARGIN,
    padding: 14,
    width: HEADER_BUTTON_SIZE,
    height: HEADER_BUTTON_SIZE,
    backgroundColor: `${WHITE}33`,
    borderRadius: HEADER_BUTTON_SIZE / 2,
};

const GHOST_IDLE_MS = 3000;
const GHOST_GROW_MS = 1400;
const GHOST_HOLD_MS = 400;
const GHOST_FADE_MS = 500;

type GhostFrameHintProps = {
    imageWidth: number;
    imageHeight: number;
    onDone: () => void;
};

// a sample frame draws itself once: a fingertip dot drags upwards while the
// frame grows around it, then everything fades — explains the draw gesture
// without words
const GhostFrameHint = ({ imageWidth, imageHeight, onDone }: GhostFrameHintProps) => {
    const progress = useSharedValue(0);
    const fade = useSharedValue(1);

    const size = Math.min(imageWidth, imageHeight) * 0.45;
    const centerX = imageWidth * 0.5;
    const centerY = imageHeight * 0.45;

    useEffect(() => {
        progress.value = withTiming(1, { duration: GHOST_GROW_MS, easing: Easing.out(Easing.cubic) });
        fade.value = withDelay(
            GHOST_GROW_MS + GHOST_HOLD_MS,
            withTiming(0, { duration: GHOST_FADE_MS }, () => {
                scheduleOnRN(onDone);
            }),
        );
    }, [progress, fade, onDone]);

    const frameAnimatedStyle = useAnimatedStyle(() => ({
        opacity: fade.value * interpolate(progress.value, [0, 0.15], [0, 0.9]),
        transform: [{ scale: interpolate(progress.value, [0, 1], [0.15, 1]) }],
    }));

    const dotAnimatedStyle = useAnimatedStyle(() => ({
        opacity: fade.value * interpolate(progress.value, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]),
        transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -size * 0.4]) }],
    }));

    return (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
            <Animated.View
                style={[
                    frameStyle,
                    {
                        left: centerX - size / 2,
                        top: centerY - size / 2,
                        width: size,
                        height: size,
                    },
                    frameAnimatedStyle,
                ]}
            />
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        left: centerX - 14,
                        top: centerY + size * 0.15,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: `${WHITE}cc`,
                        shadowColor: BLACK,
                        shadowOpacity: 0.6,
                        shadowRadius: 8,
                    },
                    dotAnimatedStyle,
                ]}
            />
        </View>
    );
};

function App(): React.ReactElement {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();

    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    const { image, objects } = useAtom(CollectObjectsAtom);
    const hasFrames = objects.length > 0;

    // the draw-gesture hint plays after 3s without any touch (and on tapping
    // the dimmed continue button) for as long as no frame exists
    const [ghostTick, setGhostTick] = useState(0);
    const ghostPlayingRef = useRef(false);
    const lastActivityRef = useRef(Date.now());

    const playGhost = () => {
        if (ghostPlayingRef.current || hasFrames) return;
        ghostPlayingRef.current = true;
        setGhostTick((t) => t + 1);
    };

    const stopGhost = () => {
        ghostPlayingRef.current = false;
        setGhostTick(0);
        lastActivityRef.current = Date.now();
    };

    useEffect(() => {
        if (hasFrames || !image) return;

        const interval = setInterval(() => {
            if (!ghostPlayingRef.current && Date.now() - lastActivityRef.current >= GHOST_IDLE_MS) {
                playGhost();
            }
        }, 250);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasFrames, image]);

    // fit the photo below the header row: full width, but never taller than
    // the remaining space (matters on iPad / letterboxed formats)
    const availableHeight = windowHeight - insets.top - insets.bottom - HEADER_HEIGHT;
    const imageMaxWidth = image ? Math.min(windowWidth, availableHeight * (image.width / image.height)) : windowWidth;

    return (
        <View
            onTouchStart={stopGhost}
            style={{
                flex: 1,
                backgroundColor: '#000',
                shadowColor: `${BLACK}aa`,
                shadowOpacity: 0.5,
                shadowRadius: 50,
                paddingTop: insets.top + HEADER_HEIGHT,
                paddingBottom: insets.bottom,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {image && (
                <View style={{ width: '100%', maxWidth: imageMaxWidth }}>
                    <Image
                        source={{ uri: image.uri }}
                        style={{ width: '100%', aspectRatio: image.width / image.height }}
                        onLayout={(e) =>
                            setImageSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
                        }
                    />
                    <Segmentator width={imageSize.width} height={imageSize.height} image={image} />
                    {ghostTick > 0 && !hasFrames && imageSize.width > 0 && (
                        <GhostFrameHint
                            key={ghostTick}
                            imageWidth={imageSize.width}
                            imageHeight={imageSize.height}
                            onDone={stopGhost}
                        />
                    )}
                </View>
            )}
            <SafeAreaView
                edges={['top']}
                pointerEvents="box-none"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <TouchableOpacity style={headerButtonStyle} onPress={() => router.back()}>
                    <ArrowLeftIcon color1={WHITE} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[headerButtonStyle, !hasFrames && { opacity: 0.35 }]}
                    onPress={() => {
                        if (!hasFrames) {
                            playGhost();
                            return;
                        }
                        router.push('/collect');
                    }}
                >
                    <SegmentNextIcon color1={WHITE} />
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
