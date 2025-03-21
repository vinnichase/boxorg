import { Stack } from 'expo-router';
import { AssetRecord, useObjectDetectionModels } from '@infinitered/react-native-mlkit-object-detection';

// const MODELS: AssetRecord = {
//     myModel: {
//         model: require('../../assets/models/model.tflite'),
//         options: {
//             shouldEnableMultipleObjects: true,
//             shouldEnableClassification: true,
//             detectorMode: 'singleImage',
//         },
//     },
// };

export default function RootLayout() {
    // const { ObjectDetectionModelContextProvider } = useObjectDetectionModels({ assets: MODELS });
    return (
        // <ObjectDetectionModelContextProvider>
        <Stack screenOptions={{ headerShown: false }} />
        // </ObjectDetectionModelContextProvider>
    );
}
