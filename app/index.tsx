import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RNMLKitObjectDetectionObject, useObjectDetector } from '@infinitered/react-native-mlkit-object-detection';
import CropImage from './CropImage';
import { db } from '../db/setup';
import { sql } from '../util/sql';

db.execSync(sql`
    CREATE TABLE IF NOT EXISTS objects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        img_path TEXT,
        thumb_path TEXT
    );
`);

// db.execSync(sql`
//     INSERT INTO objects (img_path, thumb_path) VALUES ('/path/to/image.jpg', '/path/to/thumb.jpg');
// `);

// fetch all objects
const objects = db.getAllSync(sql`SELECT * FROM objects`);
console.log(objects);

function App(): JSX.Element {
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>();
    const [result, setResult] = useState<RNMLKitObjectDetectionObject[]>([]);

    const model = useObjectDetector('myModel');

    const [modelLoaded, setModelLoaded] = useState(model?.isLoaded() ?? false);

    React.useEffect(() => {
        // Loading models is done asynchronously, so in a useEffect we need to wrap it in an async function
        async function loadModel() {
            if (!model || modelLoaded) return;
            // load the model
            await model.load();
            // set the model loaded state to true
            setModelLoaded(true);
        }

        loadModel();
    }, [model, modelLoaded]);

    async function detectObjects(img: ImagePicker.ImagePickerResult) {
        if (!img.assets?.[0].uri) return;
        const result = await model?.detectObjects(img.assets?.[0].uri);
        result && setResult(result);
    }

    const chooseFile = async () => {
        const { status } = await ImagePicker.getCameraPermissionsAsync();
        if (status !== 'granted') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
                return;
            }
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        } else {
            alert('You did not select any image.');
        }

        detectObjects(result);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.textStyle}>Object Detection</Text>
            <ScrollView>
                {image &&
                    result.map((obj, index) => (
                        <View key={index}>
                            <CropImage
                                key={index}
                                image={image}
                                rect={[obj.frame.origin.x, obj.frame.origin.y, obj.frame.size.x, obj.frame.size.y]}
                            />
                            <Text>{obj.labels.map((l) => l.text).join(',')}</Text>
                        </View>
                    ))}
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonStyle} onPress={chooseFile}>
                    <Text style={styles.buttonLabelStyle}>Camera</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
