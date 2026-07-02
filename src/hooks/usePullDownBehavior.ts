import { useCallback, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { cancelAnimation, useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useAtom } from '@gothub-team/got-atom';
import { SearchPullDownGestureAtom } from '../atoms/PullDownGestureAtom';

type PullDownBehaviorParams = {
    enabled: boolean;
    distance: number;
    onBegin?: () => void;
    onCancel?: () => void;
    onComplete?: () => void;
};

const PULL_DOWN_VELOCITY = 700;
const PULL_DOWN_COMPLETE_PROGRESS = 0.5;
const PULL_DOWN_SPRING = {
    damping: 24,
    stiffness: 220,
    mass: 0.9,
};

const clamp01 = (value: number) => {
    'worklet';

    return Math.min(Math.max(value, 0), 1);
};

type PullDownBehavior = {
    actions: {
        complete: () => void;
        reset: () => void;
        settleProgress: (targetProgress: number, velocity?: number, onSettled?: () => void) => void;
    };
    progress: SharedValue<number>;
};

type PullDownControllerBehavior = PullDownBehavior & {
    gesture: ReturnType<typeof Gesture.Pan>;
};

export function usePullDownBehavior(gestureStateAtom: typeof SearchPullDownGestureAtom): PullDownBehavior;
export function usePullDownBehavior(
    gestureStateAtom: typeof SearchPullDownGestureAtom,
    params: PullDownBehaviorParams,
): PullDownControllerBehavior;
export function usePullDownBehavior(
    gestureStateAtom: typeof SearchPullDownGestureAtom,
    params?: PullDownBehaviorParams,
) {
    const { progress } = useAtom(gestureStateAtom);
    const { enabled = false, distance = 1, onBegin, onCancel, onComplete } = params ?? {};
    const hasController = params !== undefined;
    const gestureStartProgress = useSharedValue(0);
    const pullDistance = Math.max(1, distance);

    const settleProgress = useCallback(
        (targetProgress: number, velocity = 0, onSettled?: () => void) => {
            cancelAnimation(progress);

            const nextProgress = clamp01(targetProgress);
            progress.value = withSpring(
                nextProgress,
                {
                    ...PULL_DOWN_SPRING,
                    velocity,
                },
                (finished) => {
                    if (finished && onSettled) {
                        scheduleOnRN(onSettled);
                    }
                },
            );
        },
        [progress],
    );

    const reset = useCallback(() => {
        settleProgress(0);
    }, [settleProgress]);

    const complete = useCallback(() => {
        settleProgress(1);
    }, [settleProgress]);

    const actions = useMemo(
        () => ({
            complete,
            reset,
            settleProgress,
        }),
        [complete, reset, settleProgress],
    );

    const gesture = useMemo(
        () => {
            if (!hasController) return undefined;

            return Gesture.Pan()
                .enabled(enabled)
                .activeOffsetY([-8, 8])
                .onBegin(() => {
                    cancelAnimation(progress);
                    gestureStartProgress.value = progress.value;

                    if (onBegin) {
                        scheduleOnRN(onBegin);
                    }
                })
                .onUpdate((event) => {
                    const nextProgress = clamp01(gestureStartProgress.value + event.translationY / pullDistance);

                    progress.value = nextProgress;
                })
                .onEnd((event) => {
                    const projectedProgress = progress.value + event.velocityY / 2800;
                    const shouldComplete =
                        event.velocityY > PULL_DOWN_VELOCITY ||
                        (event.velocityY > -PULL_DOWN_VELOCITY && projectedProgress > PULL_DOWN_COMPLETE_PROGRESS);
                    const targetProgress = shouldComplete ? 1 : 0;
                    const settledCallback = shouldComplete ? onComplete : onCancel;

                    progress.value = withSpring(
                        targetProgress,
                        {
                            ...PULL_DOWN_SPRING,
                            velocity: event.velocityY / pullDistance,
                        },
                        (finished) => {
                            if (finished && settledCallback) {
                                scheduleOnRN(settledCallback);
                            }
                        },
                    );
                });
        },
        [enabled, gestureStartProgress, hasController, onBegin, onCancel, onComplete, progress, pullDistance],
    );

    const behavior = {
        actions,
        progress,
    };

    if (!gesture) return behavior;

    return {
        ...behavior,
        gesture,
    };
}
