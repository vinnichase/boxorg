import { type RNMLKitObjectDetectionObject, useObjectDetector } from '@infinitered/react-native-mlkit-object-detection';
import type { ImagePickerResult } from 'expo-image-picker';
import { useEffect, useState } from 'react';

export const useObjectDetectionModel = (name: string) => {
    const [result, setResult] = useState<RNMLKitObjectDetectionObject[]>([]);

    const model = useObjectDetector(name);

    const [modelLoaded, setModelLoaded] = useState(model?.isLoaded() ?? false);

    useEffect(() => {
        async function loadModel() {
            if (!model || modelLoaded) return;
            await model.load();
            setModelLoaded(true);
        }

        loadModel();
    }, [model, modelLoaded]);

    async function detectObjects(uri: string) {
        const result = await model?.detectObjects(uri);
        result && setResult(result);
    }

    return { result, detectObjects };
};
