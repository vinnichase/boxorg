import { ReactNode, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WHITE } from '../util/constants';
import { CrossIcon } from './Icons';

const CHIP_HEIGHT = 36;
const CHIP_FONT = { fontSize: 16, fontWeight: 500 as const };

const normalizeTag = (text: string) => text.toUpperCase().trim();

type BoxTagsEditorProps = {
    tags: string[];
    onChange: (tags: string[]) => void;
    // no box number yet: chips are shown dimmed and nothing can be added
    disabled?: boolean;
    // rendered at the start of the chip flow, so a heading can share the
    // first line with the chips and the chips wrap after it
    children?: ReactNode;
};

// chip editor for the descriptive tags of one box; the caller owns the tags
// (a screen draft or the search result group) and decides when they are saved
export const BoxTagsEditor = ({ tags, onChange, disabled, children }: BoxTagsEditorProps) => {
    // text of the chip being renamed right now; handed over on blur
    const [renaming, setRenaming] = useState<{ index: number; text: string }>();
    const [draft, setDraft] = useState('');

    const commitTags = (nextTags: string[]) => {
        // normalize, drop emptied chips and keep the first of any duplicates
        onChange(nextTags.map(normalizeTag).filter((tag, i, all) => tag && all.indexOf(tag) === i));
    };

    const commitRename = () => {
        if (!renaming) return;
        setRenaming(undefined);
        commitTags(tags.map((t, j) => (j === renaming.index ? renaming.text : t)));
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
                opacity: disabled ? 0.5 : 1,
            }}
        >
            {children}
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
                            value={renaming?.index === i ? renaming.text : tag}
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
                            onChangeText={(text) => setRenaming({ index: i, text })}
                            onBlur={commitRename}
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
                editable={!disabled}
                placeholder={disabled ? 'box tag (Nr. fehlt)' : '+ box tag'}
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
