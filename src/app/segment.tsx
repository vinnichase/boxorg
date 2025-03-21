import React, { useRef, useState } from 'react';
import { Image, SafeAreaView, View } from 'react-native';
import { BLACK, PURPLE_DARK } from '../util/constants';
import { useAtom } from '@gothub-team/got-atom';
import { useRouter } from 'expo-router';
import { SegmentImageAtom } from '../atoms/SegmentImageAtom';
import { useSegmentation } from '../hooks/useSegmentation';

function App(): JSX.Element {
    const router = useRouter();

    const imageRef = useRef<Image>(null);

    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    const segmentImage = useAtom(SegmentImageAtom);

    const a = useSegmentation(imageRef);
    console.log(imageSize);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: BLACK,
                shadowColor: `${BLACK}aa`,
                shadowOpacity: 0.5,
                shadowRadius: 50,
            }}
        >
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'stretch' }}>
                {segmentImage && (
                    <Image
                        ref={imageRef}
                        source={{ uri: a?.uri }}
                        style={{ aspectRatio: (a?.width ?? segmentImage.width) / (a?.height ?? segmentImage.height) }}
                        // onLayout={(e) =>
                        //     setImageSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
                        // }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

export default App;
