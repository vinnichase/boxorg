import { atom } from '@gothub-team/got-atom';
import { Asset } from 'expo-asset';
import { InferenceSession } from 'onnxruntime-react-native';
import { setPath } from '../util/setPath';

type InferenceSessions = {
    encoder?: InferenceSession;
    decoder?: InferenceSession;
};

export const InferenceSessionsAtom = atom<InferenceSessions>({});

const ENCODER_MODEL = require('../../assets/models/vision_encoder_fp16.onnx');

(async () => {
    const [model] = await Asset.loadAsync(ENCODER_MODEL);
    if (!model?.localUri) return;

    try {
        const session: InferenceSession = await InferenceSession.create(model.localUri, {});
        // session. = { dtype: 'fp32', kv_cache_dtype: undefined };
        InferenceSessionsAtom.set((a) => setPath(['encoder'], session, a));
    } catch (e) {
        console.error(e);
    }
})();

InferenceSessionsAtom.subscribe({ next: console.log });
