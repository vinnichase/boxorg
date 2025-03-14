import type { RNMLKitObjectDetectionObject } from '@infinitered/react-native-mlkit-object-detection';
import type { ImagePickerAsset } from 'expo-image-picker';
import { cropImage } from '../util/cropImage';
import { EditObject } from '../atoms/CollectObjectsAtom';

export const collectObjects = async (
    image: ImagePickerAsset,
    objects: RNMLKitObjectDetectionObject[],
): Promise<EditObject[]> => {
    return Promise.all(
        objects.map(async (object) => {
            const { frame } = object;
            const cropped = await cropImage(image, [frame.origin.x, frame.origin.y, frame.size.x, frame.size.y]);
            return {
                deleted: false,
                uri: cropped.uri,
                tags: object.labels.slice(0, 3).map((l) => l.text.toUpperCase()),
            };
        }),
    );
};
