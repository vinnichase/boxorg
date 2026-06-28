import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function RootLayout() {
    return (
        <KeyboardProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }} />
        </KeyboardProvider>
    );
}
