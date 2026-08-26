const { withAppBuildGradle } = require('expo/config-plugins');

// IzzyOnDroid flags Google's encrypted dependency-info block in the APK
// signing metadata as unverifiable, so the izzy build strips it
const withNoDependencyInfo = (config) =>
    withAppBuildGradle(config, (gradleConfig) => {
        if (!gradleConfig.modResults.contents.includes('dependenciesInfo')) {
            gradleConfig.modResults.contents = gradleConfig.modResults.contents.replace(
                /^android \{/m,
                'android {\n    dependenciesInfo {\n        includeInApk = false\n        includeInBundle = false\n    }\n',
            );
        }
        return gradleConfig;
    });

module.exports = withNoDependencyInfo;
