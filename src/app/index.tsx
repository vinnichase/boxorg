import React from 'react';
import { ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAtom } from '@gothub-team/got-atom';
import { PURPLE_DARK } from '../util/constants';
import { SearchResults } from '../components/SearchResults';
import { BoxIdInput } from '../components/BoxIdInput';
import { CaptureButton } from '../components/CaptureButton';
import { SearchCloseCaret } from '../components/SearchCloseCaret';
import { SearchInput } from '../components/SearchInput';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';
import { HomeBlurBackground } from '../components/HomeBlurBackground';
import { BoxKeyboardDismissOverlay } from '../components/BoxKeyboardDismissOverlay';

function App(): React.ReactElement {
    const focus = useAtom(HomeFocusAtom);

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
                <BoxKeyboardDismissOverlay />
                <SafeAreaView
                    pointerEvents={focus === 'box' ? 'box-none' : 'auto'}
                    style={{
                        height: '100%',
                        width: '100%',
                        gap: 50,
                    }}
                >
                    <View style={{ flex: 2 }}></View>
                    <BoxIdInput />
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
