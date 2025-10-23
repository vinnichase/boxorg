import { atom } from '@gothub-team/got-atom';
import { ObjectWithTags } from '../db/accessLayer';

export const EditObjectAtom = atom<ObjectWithTags>({ id: 0, box_id: 0, thumb_path: '', tags: [] });
