import { type RNMLKitObjectDetectionObject, useObjectDetector } from '@infinitered/react-native-mlkit-object-detection';
import { useEffect, useState } from 'react';

export const useObjectDetectionModel = (name: string) => {
    const [result, setResult] = useState<RNMLKitObjectDetectionObject[] | null>(null);

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
        result ? setResult(result) : setResult(null);
    }

    return { result, detectObjects };
};
