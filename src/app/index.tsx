import React from 'react';
import { ImageBackground, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MAIN_INPUT_HEIGHT, PURPLE_DARK, SEARCH_RESTING_TOP_RATIO } from '../util/constants';
import { SearchResults } from '../components/SearchResults';
import { CaptureButton } from '../components/CaptureButton';
import { SearchCloseCaret } from '../components/SearchCloseCaret';
import { SearchInput } from '../components/SearchInput';
import { HomeBlurBackground } from '../components/HomeBlurBackground';

function App(): React.ReactElement {
    const { height: windowHeight } = useWindowDimensions();
    const searchRestingBottom = windowHeight * SEARCH_RESTING_TOP_RATIO + MAIN_INPUT_HEIGHT;

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
                <SafeAreaView edges={['bottom']} style={{ flex: 1, width: '100%' }}>
                    {/* the capture button splits the space below the resting search input 2:1 */}
                    <View style={{ height: searchRestingBottom }} />
                    <View style={{ flex: 2 }} />
                    <CaptureButton />
                    <View style={{ flex: 1 }} />
                </SafeAreaView>
            </HomeBlurBackground>
            <SearchCloseCaret />
            <SearchResults />
            <SearchInput />
        </ImageBackground>
    );
}

export default App;
