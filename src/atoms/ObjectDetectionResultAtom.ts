import { atom } from '@gothub-team/got-atom';
import { RNMLKitObjectDetectionObject } from '@infinitered/react-native-mlkit-object-detection';
import { ImagePickerAsset } from 'expo-image-picker';

type ObjectDetectionResult = {
    image?: ImagePickerAsset;
    objects?: RNMLKitObjectDetectionObject[];
};

export const ObjectDetectionResultAtom = atom<ObjectDetectionResult>({});
