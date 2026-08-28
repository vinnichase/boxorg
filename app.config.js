module.exports = () => {
    const isDev = process.env.BUILD_PROFILE === 'dev';
    // IzzyOnDroid forbids apps that fetch executable code on their own, so
    // the izzy build profile ships without OTA updates (repo updates instead)
    const isIzzy = process.env.IZZY_BUILD === '1';

    // Forks can build under their own identity without touching tracked files:
    // set these in a local .env (see README) or the build environment.
    const bundleId = process.env.BOXORG_BUNDLE_ID ?? 'io.gothub.boxorg';
    const devBundleId = process.env.BOXORG_DEV_BUNDLE_ID ?? 'io.gothub.dev.boxorg';
    const appBundleId = isDev ? devBundleId : bundleId;

    console.log('Building for profile:', isDev ? 'dev' : 'prod');

    return {
        expo: {
            name: isDev ? 'boxorg-dev' : 'boxorg',
            slug: isDev ? 'boxorg-dev' : 'boxorg',
            version: '1.0.1',
            runtimeVersion: {
                policy: 'fingerprint',
            },
            updates: isIzzy
                ? { enabled: false }
                : { url: 'https://u.expo.dev/4f72c64f-5295-4c9a-b616-8fb6127c2eb9' },
            orientation: 'portrait',
            icon: './assets/images/icon.png',
            scheme: 'myapp',
            userInterfaceStyle: 'automatic',
            newArchEnabled: true,
            // system dialogs (camera permission, "Foto benutzen"/"Wiederholen")
            // follow the languages the app declares; German is the primary one
            locales: {
                de: './assets/locales/de.json',
                en: './assets/locales/en.json',
            },
            ios: {
                supportsTablet: false,
                bundleIdentifier: appBundleId,
                buildNumber: '10',
                infoPlist: {
                    CFBundleDevelopmentRegion: 'de',
                    CFBundleLocalizations: ['de', 'en'],
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
                package: appBundleId,
                // versionCode lives in git so source builds (F-Droid) get the
                // real value; bump together with version on every release
                versionCode: 5,
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
                [
                    'expo-image-picker',
                    {
                        // fallback; the localized strings live in assets/locales
                        cameraPermission:
                            'boxorg verwendet die Kamera, um ein Foto vom Inhalt einer Kiste aufzunehmen. Anschließend markierst du die Gegenstände auf dem Foto, damit du sie später über ihre Beschriftung oder die Box-Nummer wiederfindest. Die Fotos bleiben ausschließlich auf deinem Gerät.',
                        photosPermission: false,
                        microphonePermission: false,
                    },
                ],
                // IzzyOnDroid caps APKs at ~30 MB; compressing the native libs
                // (legacy packaging) keeps the izzy build under that limit
                ...(isIzzy
                    ? [
                          ['expo-build-properties', { android: { useLegacyPackaging: true } }],
                          './plugins/withNoDependencyInfo',
                      ]
                    : []),
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
