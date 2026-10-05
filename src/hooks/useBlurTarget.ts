import { RefObject, useLayoutEffect, useRef, useState } from 'react';
import { View } from 'react-native';

// Android blurs only what a BlurTargetView contains, and expo-blur's BlurView
// re-resolves its `blurTarget` solely when the ref object's `current` differs
// between renders; so once the target has mounted it is handed out as a fresh
// ref object, which also reaches blur views rendered before or inside the target
export const useBlurTarget = () => {
    const blurTargetRef = useRef<View>(null);
    const [blurTarget, setBlurTarget] = useState<RefObject<View | null>>({ current: null });

    useLayoutEffect(() => {
        setBlurTarget({ current: blurTargetRef.current });
    }, []);

    return { blurTargetRef, blurTarget };
};
