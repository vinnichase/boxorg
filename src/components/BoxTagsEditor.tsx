import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loadBoxTags, saveBoxTags } from '../service/boxTags';
import { WHITE } from '../util/constants';
import { CrossIcon } from './Icons';

const CHIP_HEIGHT = 36;
const CHIP_FONT = { fontSize: 16, fontWeight: 500 as const };

const normalizeTag = (text: string) => text.toUpperCase().trim();

type BoxTagsEditorProps = { boxId?: number };

// descriptive tags for the box number currently entered on the screen; they
// are written to the database right away, independent of any object save
export const BoxTagsEditor = (props: BoxTagsEditorProps) => (
    // keying by box id remounts the chips, so each box loads its tags fresh
    <BoxTagChips key={props.boxId ?? 'none'} {...props} />
);

const BoxTagChips = ({ boxId }: BoxTagsEditorProps) => {
    // chip texts as currently typed; renames are persisted when a chip loses focus
    const [tags, setTags] = useState<string[]>(() => (boxId === undefined ? [] : loadBoxTags(boxId)));
    const [draft, setDraft] = useState('');

    const commitTags = (nextTags: string[]) => {
        if (boxId === undefined) return;
        // normalize, drop emptied chips and keep the first of any duplicates
        const cleanTags = nextTags.map(normalizeTag).filter((tag, i, all) => tag && all.indexOf(tag) === i);
        setTags(cleanTags);
        saveBoxTags(boxId, cleanTags);
    };

    const addDraft = () => {
        setDraft('');
        if (!normalizeTag(draft)) return;
        commitTags([...tags, draft]);
    };

    return (
        <View
            style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 8,
                opacity: boxId === undefined ? 0.5 : 1,
            }}
        >
            {tags.map((tag, i) => (
                <View
                    key={i}
                    style={{
                        height: CHIP_HEIGHT,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingLeft: 12,
                        paddingRight: 6,
                        borderRadius: CHIP_HEIGHT / 2,
                        backgroundColor: `${WHITE}33`,
                    }}
                >
                    {/* the invisible text sizes the chip to its content, the input lies on top */}
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={{ ...CHIP_FONT, color: WHITE, opacity: 0 }}>{tag || ' '}</Text>
                        <TextInput
                            autoCapitalize="characters"
                            autoComplete="off"
                            spellCheck={false}
                            returnKeyType="done"
                            value={tag}
                            style={{
                                ...CHIP_FONT,
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                                padding: 0,
                                color: WHITE,
                                textAlignVertical: 'center',
                            }}
                            onChangeText={(text) => setTags(tags.map((t, j) => (j === i ? text : t)))}
                            onBlur={() => commitTags(tags)}
                        />
                    </View>
                    <TouchableOpacity
                        style={{ width: 24, height: 24, padding: 5 }}
                        onPress={() => commitTags(tags.filter((_, j) => j !== i))}
                    >
                        <CrossIcon color1={`${WHITE}aa`} />
                    </TouchableOpacity>
                </View>
            ))}
            <TextInput
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                editable={boxId !== undefined}
                placeholder={boxId === undefined ? 'box tag (Nr. fehlt)' : '+ box tag'}
                placeholderTextColor={`${WHITE}66`}
                returnKeyType="done"
                submitBehavior="submit"
                value={draft}
                style={{
                    ...CHIP_FONT,
                    flexGrow: 1,
                    minWidth: 120,
                    height: CHIP_HEIGHT,
                    paddingHorizontal: 12,
                    paddingVertical: 0,
                    borderRadius: CHIP_HEIGHT / 2,
                    borderWidth: 1,
                    borderColor: `${WHITE}33`,
                    color: WHITE,
                    textAlignVertical: 'center',
                }}
                onChangeText={setDraft}
                onSubmitEditing={addDraft}
                onBlur={addDraft}
            />
        </View>
    );
};
