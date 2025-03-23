import React, { useRef, useState } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, View } from 'react-native';
import { BLACK, WHITE } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { useRouter } from 'expo-router';
import { SegmentImageAtom } from '../atoms/SegmentImageAtom';
import Svg, { Rect } from 'react-native-svg';
import { runOnJS } from 'react-native-reanimated';
import Animated, { useSharedValue, useAnimatedProps } from 'react-native-reanimated';

// creates the animated component
const AnimatedRect = Animated.createAnimatedComponent(Rect);

function App(): JSX.Element {
    const router = useRouter();

    const imageRef = useRef<Image>(null);

    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    const segmentImage = useAtom(SegmentImageAtom);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: BLACK,
                shadowColor: `${BLACK}aa`,
                shadowOpacity: 0.5,
                shadowRadius: 50,
                justifyContent: 'center',
                alignItems: 'stretch',
            }}
        >
            {segmentImage && (
                <>
                    <Image
                        ref={imageRef}
                        source={{ uri: segmentImage.uri }}
                        style={{ aspectRatio: segmentImage.width / segmentImage.height }}
                        onLayout={(e) =>
                            setImageSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
                        }
                    />
                    <Segmentator width={imageSize.width} height={imageSize.height} />
                </>
            )}
        </View>
    );
}

const translateRect = (x: number, y: number, w: number) => {
    'worklet';
    return [x - w / 2, y - w / 2, w];
};

type SegmentatorProps = {
    width: number;
    height: number;
};
const Segmentator = ({ width, height }: SegmentatorProps) => {
    const [rects, setRects] = useState<{ x: number; y: number; w: number }[]>([]);
    const [currentRect, setCurrentRect] = useState<boolean>(false);

    const animatedRect = {
        x: useSharedValue(0),
        y: useSharedValue(0),
        w: useSharedValue(0),
    };

    const animatedProps = useAnimatedProps(() => {
        const [x, y, w] = translateRect(animatedRect.x.value, animatedRect.y.value, animatedRect.w.value);
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
            animatedRect.w.value = 80;
        })
        .onUpdate((e) => {
            animatedRect.w.value = animatedRect.w.value - e.velocityY / 100;
        })
        .onEnd((e) => {
            const [x, y, w] = translateRect(animatedRect.x.value, animatedRect.y.value, animatedRect.w.value);
            runOnJS(setRects)([...rects, { x, y, w }]);

            runOnJS(setCurrentRect)(false);
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
