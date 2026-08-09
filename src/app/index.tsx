import React from 'react';
import { ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PURPLE_DARK } from '../util/constants';
import { SearchResults } from '../components/SearchResults';
import { CaptureButton } from '../components/CaptureButton';
import { SearchCloseCaret } from '../components/SearchCloseCaret';
import { SearchInput } from '../components/SearchInput';
import { HomeBlurBackground } from '../components/HomeBlurBackground';

function App(): React.ReactElement {
    return (
        <ImageBackground
            source={require('../../assets/images/background.png')}
            style={{
                flex: 1,
                backgroundColor: PURPLE_DARK,
            }}
            resizeMode="cover"
        >
            <HomeBlurBackground>
                <SafeAreaView
                    style={{
                        height: '100%',
                        width: '100%',
                        gap: 50,
                    }}
                >
                    <View style={{ flex: 2 }}></View>
                    <CaptureButton />
                </SafeAreaView>
            </HomeBlurBackground>
            <SearchCloseCaret />
            <SearchResults />
            <SearchInput />
        </ImageBackground>
    );
}

export default App;
