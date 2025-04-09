module.exports = () => {
    const isDev = process.env.BUILD_PROFILE === 'dev';

    return {
        expo: {
            name: isDev ? 'boxorg-dev' : 'boxorg',
            slug: isDev ? 'boxorg-dev' : 'boxorg',
            version: '1.0.0',
            orientation: 'portrait',
            icon: './assets/images/icon.png',
            scheme: 'myapp',
            userInterfaceStyle: 'automatic',
            newArchEnabled: false,
            ios: {
                supportsTablet: true,
                bundleIdentifier: isDev ? 'io.gothub.dev.boxorg' : 'io.gothub.boxorg',
                infoPlist: {
                    ITSAppUsesNonExemptEncryption: false,
                    UISupportsDocumentBrowser: true,
                    UIFileSharingEnabled: true,
                    LSSupportsOpeningDocumentsInPlace: true,
                },
            },
            android: {
                adaptiveIcon: {
                    foregroundImage: './assets/images/adaptive-icon.png',
                    backgroundColor: '#442871',
                },
                package: isDev ? 'io.gothub.dev.boxorg' : 'io.gothub.boxorg',
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
