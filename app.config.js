module.exports = () => {
    const isDev = process.env.BUILD_PROFILE === 'dev';

    console.log('Building for profile:', isDev ? 'dev' : 'prod');

    return {
        expo: {
            name: isDev ? 'boxorg-dev' : 'boxorg',
            slug: isDev ? 'boxorg-dev' : 'boxorg',
            version: '1.0.0',
            orientation: 'portrait',
            icon: './assets/images/icon.png',
            scheme: 'myapp',
            userInterfaceStyle: 'automatic',
            newArchEnabled: true,
            ios: {
                supportsTablet: true,
                bundleIdentifier: isDev ? 'io.gothub.dev.boxorg' : 'io.gothub.boxorg',
                infoPlist: {
                    ITSAppUsesNonExemptEncryption: false,
                    UISupportsDocumentBrowser: true,
                    UIFileSharingEnabled: true,
                    LSSupportsOpeningDocumentsInPlace: true,
                    UIStatusBarStyle: 'UIStatusBarStyleLightContent',
                    UIViewControllerBasedStatusBarAppearance: false,
                },
            },
            android: {
                adaptiveIcon: {
                    foregroundImage: './assets/images/adaptive-icon.png',
                    backgroundColor: '#442871',
                    borderColor: '#442871',
                },
                package: isDev ? 'io.gothub.dev.boxorg' : 'io.gothub.boxorg',
                statusBar: {
                    barStyle: 'light-content',
                    backgroundColor: '#442871',
                },
            },
            web: {
                bundler: 'metro',
                output: 'static',
                favicon: './assets/images/favicon.png',
            },
            plugins: [
                'expo-router',
                [
                    'expo-splash-screen',
                    {
                        image: './assets/images/splash-icon.png',
                        imageWidth: 200,
                        resizeMode: 'contain',
                        backgroundColor: '#442871',
                    },
                ],
                'expo-sqlite',
                'expo-font',
            ],
            experiments: {
                typedRoutes: true,
            },
            extra: {
                eas: {
                    projectId: '4f72c64f-5295-4c9a-b616-8fb6127c2eb9',
                },
            },
        },
    };
};
