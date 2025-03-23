// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts
    .push
    // Adds support for `.tflite` files for TFLite models
    // 'tflite',
    // 'onnx',
    ();

module.exports = config;
