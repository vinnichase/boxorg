import { useAtom } from '@gothub-team/got-atom';
import { LegacyRef, useEffect, useState } from 'react';
import { InferenceSessionsAtom } from '../atoms/InferenceSessionsAtom';
import { ImageManipulator, ImageResult } from 'expo-image-manipulator';
import { SegmentImageAtom } from '../atoms/SegmentImageAtom';
import { Image } from 'react-native';

export const useSegmentation = (imageRef: LegacyRef<Image>) => {
    const { encoder } = useAtom(InferenceSessionsAtom);
    const image = useAtom(SegmentImageAtom);
    // const manipulator = useImageManipulator(image?.uri ?? '');
    const [result, setResult] = useState<ImageResult | null>(null);

    useEffect(() => {
        if (!encoder || !image) return;
        const manipulator = ImageManipulator.manipulate(image.uri);
        const context = manipulator.resize(image.height > image.width ? { height: 1024 } : { width: 1024 });

        context.renderAsync().then(async (image) => {
            const saved = await image.saveAsync({ base64: true });

            // const tensors = await preprocessImage(saved);

            // if (!tensors?.pixel_values) return;

            // try {
            //     const result = await encoder.run({ pixel_values: tensors?.pixel_values });
            //     console.log(result);
            // } catch (e) {
            //     console.error(e);
            // }
        });

        // fetch(image.uri)
        //     .then(async (res) => {
        //         const blob = await res.blob();

        //         const a = await blobToOnnxTensor(blob);
        //         // encoder.run(InferenceSession.)
        //         return blob;
        //     })
        //     .catch(console.error);
    }, [image, encoder]);

    return result;
};
