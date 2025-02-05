import React, { useState } from 'react';
import { Alert, Image, NativeModules, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { AssetRecord, useObjectDetectionModels } from '@infinitered/react-native-mlkit-object-detection';

type ObjectDetectionResult = {
    labels: {
        label: string;
        confidence: number;
    }[];
    rect: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
}[];

function App(): JSX.Element {
    const [image, setImage] = useState<ImagePicker.ImagePickerResult | null>();
    const [result, setResult] = useState<ObjectDetectionResult | null>(null);
    const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });
    const { ObjectDetectionModelContextProvider } = useObjectDetectionModels({
        loadDefaultModel: true,
        defaultModelOptions: {
            shouldEnableMultipleObjects: true,
            shouldEnableClassification: true,
            detectorMode: 'singleImage',
        },
    });

    const chooseFile = async () => {
        console.log('Choose file');
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result);
        } else {
            alert('You did not select any image.');
        }
        // if (!response.didCancel) {
        //     if (response.assets && response.assets.length > 0) {
        //         try {
        //             const res = await CustomObjectDetectionModule.startCustomObjectDetection(
        //                 response.assets[0].uri,
        //             );
        //             const result = JSON.parse(res) as ObjectDetectionResult;
        //             setImage(response);
        //             setResult(result);
        //         } catch (error) {
        //             console.log(error);
        //             Alert.alert('Error', 'No Object Detected', [{ text: 'OK' }]);
        //             setImage(null);
        //             setResult(null);
        //         }
        //     }
        // } else {
        //     console.log(response.errorMessage);
        // }
        // });
    };

    console.log(imageLayout.width, imageLayout.height);
    console.log(image?.assets?.[0]);

    return (
        <ObjectDetectionModelContextProvider>
            <SafeAreaView style={styles.container}>
                <Text style={styles.textStyle}>Object Detection</Text>
                {true && (
                    <View style={styles.imageContainer}>
                        <Image
                            style={styles.imageStyle}
                            source={{
                                uri: image?.assets?.[0].uri,
                            }}
                            onLayout={(event) => {
                                const { width, height } = event.nativeEvent.layout;
                                console.log(width, height);
                                setImageLayout({ width, height });
                            }}
                        />
                        {/* {result && imageLayout.width > 0 && imageLayout.height > 0 && (
                        <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${imageLayout.width} ${imageLayout.height}`}>
                            {result.map((obj, index) => {
                                console.log(obj, index);
                                return (
                                    <Rect
                                        key={index}
                                        x={obj.rect.x * imageLayout.width} // Scale to true dimensions
                                        y={obj.rect.y * imageLayout.height} // Scale to true dimensions
                                        width={obj.rect.w * imageLayout.width} // Scale to true dimensions
                                        height={obj.rect.h * imageLayout.height} // Scale to true dimensions
                                        stroke="red"
                                        strokeWidth="2"
                                        fill="none"
                                    />
                                );
                            })}
                        </Svg>
                    )} */}
                    </View>
                )}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.buttonStyle} onPress={chooseFile}>
                        <Text style={styles.buttonLabelStyle}>Launch gallery</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ObjectDetectionModelContextProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignContent: 'center',
        padding: 20,
        justifyContent: 'space-between',
    },
    buttonStyle: {
        height: '35%',
        backgroundColor: '#D15060',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderRadius: 7,
    },
    textStyle: {
        color: 'black',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '600',
    },
    imageStyle: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    imageContainer: {
        position: 'relative',
        height: '70%',
        width: '80%',
        alignSelf: 'center',
    },
    buttonContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    buttonLabelStyle: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
});

export default App;
