import React, { useEffect, useRef, useState } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { BLACK, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { useRouter } from 'expo-router';
import Svg, { Rect } from 'react-native-svg';
import { runOnJS } from 'react-native-reanimated';
import Animated, { useSharedValue, useAnimatedProps } from 'react-native-reanimated';
import { SegmentIcon } from '../components/Icons';
import { CollectObjectsAtom } from '../atoms/CollectObjectsAtom';
import { setPath } from '../util/setPath';
import { cropImage } from '../util/cropImage';

// creates the animated component
const AnimatedRect = Animated.createAnimatedComponent(Rect);

function App(): JSX.Element {
    const router = useRouter();

    const imageRef = useRef<Image>(null);

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
                        ref={imageRef}
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

const translateRect = (x: number, y: number, w: number, maxW: number, maxH: number) => {
    'worklet';
    return [Math.min(maxW - w, Math.max(0, x - w / 2)), Math.min(maxH - w, Math.max(0, y - w / 2)), w];
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
    const [rects, setRects] = useState<{ x: number; y: number; w: number; uri: string }[]>([]);
    const [currentRect, setCurrentRect] = useState<boolean>(false);

    useEffect(() => {
        CollectObjectsAtom.set((a) =>
            setPath(
                ['objects'],
                rects.map(({ uri }) => ({ deleted: false, tags: [''], uri })),
                a,
            ),
        );
    }, [rects]);

    const addRect = async (x: number, y: number, w: number) => {
        const cropped = await cropImage(image, [
            (x / width) * image.width,
            (y / height) * image.height,
            (w / width) * image.width,
            (w / width) * image.width,
        ]);
        setRects([...rects, { x, y, w, uri: cropped.uri }]);
        setCurrentRect(false);
    };

    const animatedRect = {
        x: useSharedValue(0),
        y: useSharedValue(0),
        w: useSharedValue(0),
    };

    const animatedProps = useAnimatedProps(() => {
        const [x, y, w] = translateRect(
            animatedRect.x.value,
            animatedRect.y.value,
            animatedRect.w.value,
            width,
            height,
        );
        return { x, y, width: w, height: w };
    });

    const panGesture = Gesture.Pan()
        .onBegin((e) => {
            const existingIndex = rects.findIndex((r) => e.y > r.y && e.y < r.y + r.w && e.x > r.x && e.x < r.x + r.w);
            if (existingIndex > -1) {
                runOnJS(setRects)(rects.filter((_, i) => i !== existingIndex));
            }
            runOnJS(setCurrentRect)(true);
            animatedRect.x.value = e.x;
            animatedRect.y.value = e.y;
            animatedRect.w.value = 10;
        })
        .onUpdate((e) => {
            animatedRect.w.value = animatedRect.w.value - e.velocityY / 100;
        })
        .onEnd(async () => {
            const [x, y, w] = translateRect(
                animatedRect.x.value,
                animatedRect.y.value,
                Math.abs(animatedRect.w.value),
                width,
                height,
            );

            console.log(x, y, w);

            runOnJS(addRect)(x, y, w);
        });

    return (
        <GestureHandlerRootView
            style={{
                position: 'absolute',
                // backgroundColor: '#ff000044',
                width,
                height,
            }}
        >
            <GestureDetector gesture={panGesture}>
                <Svg viewBox={`0 0 ${width} ${height}`}>
                    {rects.map(({ x, y, w }, i) => (
                        <Rect
                            key={i}
                            fill="none"
                            stroke={`${WHITE}99`}
                            strokeLinejoin="round"
                            strokeWidth={5}
                            x={x}
                            y={y}
                            width={w}
                            height={w}
                        />
                    ))}
                    {currentRect && (
                        <AnimatedRect
                            fill="none"
                            stroke={`${WHITE}99`}
                            strokeLinejoin="round"
                            strokeWidth={5}
                            animatedProps={animatedProps}
                        />
                    )}
                </Svg>
            </GestureDetector>
        </GestureHandlerRootView>
    );
};

export default App;
