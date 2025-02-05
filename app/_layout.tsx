import { Stack } from 'expo-router';
import {
    AssetRecord,
    RNMLKitCustomObjectDetectorOptions,
    useObjectDetectionModels,
} from '@infinitered/react-native-mlkit-object-detection';

type ModelInfo = {
    model: number;
    options?: RNMLKitCustomObjectDetectorOptions;
};

const MODELS: AssetRecord = {
    // the name you'll use to refer to the model
    myModel: {
        // the relative path to the model file
        model: require('../assets/models/model.tflite'),
        options: {
            // the options you want to use for this model
            shouldEnableMultipleObjects: true,
            shouldEnableClassification: true,
            detectorMode: 'singleImage',
        },
    },
};

export default function RootLayout() {
    const { ObjectDetectionModelContextProvider } = useObjectDetectionModels({
        // loadDefaultModel: true,
        assets: MODELS,
        defaultModelOptions: {
            shouldEnableMultipleObjects: true,
            shouldEnableClassification: true,
            detectorMode: 'singleImage',
        },
    });
    return (
        <ObjectDetectionModelContextProvider>
            <Stack />
        </ObjectDetectionModelContextProvider>
    );
}
