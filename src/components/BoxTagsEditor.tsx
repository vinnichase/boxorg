import { ReactNode, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { WHITE } from '../util/constants';
import { CrossIcon, TagPlusIcon } from './Icons';

const CHIP_HEIGHT = 36;
const CHIP_FONT = { fontSize: 16, fontWeight: 500 as const };
// the add button grows from a circle into a pill over the remaining line width
const ADD_TRANSITION_DURATION = 200;
// the icon keeps this size and position whether the add button is a circle or open
const ADD_ICON_SIZE = 24;
const ADD_ICON_PADDING = (CHIP_HEIGHT - 2 - ADD_ICON_SIZE) / 2;

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
    // the add button is open as a text field until it loses focus
    const [adding, setAdding] = useState(false);

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
            {tags.map((tag, i) => {
                const chipText = renaming?.index === i ? renaming.text : tag;
                return (
                    <View
                        key={i}
                        style={{
                            maxWidth: '100%',
                            minHeight: CHIP_HEIGHT,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingLeft: 12,
                            paddingRight: 6,
                            paddingVertical: 6,
                            borderRadius: CHIP_HEIGHT / 2,
                            backgroundColor: `${WHITE}33`,
                        }}
                    >
                        {/* the invisible text sizes the chip to its content and wraps long tags onto
                        further lines; the multiline input on top wraps at the same width */}
                        <View style={{ flexShrink: 1, justifyContent: 'center' }}>
                            <Text style={{ ...CHIP_FONT, color: WHITE, opacity: 0 }}>{chipText || ' '}</Text>
                            <TextInput
                                autoCapitalize="characters"
                                autoComplete="off"
                                spellCheck={false}
                                multiline
                                scrollEnabled={false}
                                returnKeyType="done"
                                submitBehavior="blurAndSubmit"
                                value={chipText}
                                style={{
                                    ...CHIP_FONT,
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                    padding: 0,
                                    paddingTop: 0,
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
                );
            })}
            <Animated.View
                layout={LinearTransition.duration(ADD_TRANSITION_DURATION)}
                style={{
                    height: CHIP_HEIGHT,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: CHIP_HEIGHT / 2,
                    borderWidth: 1,
                    borderColor: `${WHITE}33`,
                    ...(adding
                        ? { flexGrow: 1, minWidth: 120, paddingLeft: ADD_ICON_PADDING, paddingRight: 12 }
                        : { width: CHIP_HEIGHT, justifyContent: 'center' }),
                }}
            >
                {adding ? (
                    <>
                        <View style={{ width: ADD_ICON_SIZE, height: ADD_ICON_SIZE }}>
                            <TagPlusIcon color1={`${WHITE}aa`} />
                        </View>
                        <TextInput
                            autoFocus
                            autoCapitalize="characters"
                            autoComplete="off"
                            spellCheck={false}
                            returnKeyType="done"
                            submitBehavior="submit"
                            value={draft}
                            style={{
                                ...CHIP_FONT,
                                flex: 1,
                                height: '100%',
                                paddingHorizontal: 8,
                                paddingVertical: 0,
                                color: WHITE,
                                textAlignVertical: 'center',
                            }}
                            onChangeText={setDraft}
                            onSubmitEditing={addDraft}
                            onBlur={() => {
                                addDraft();
                                setAdding(false);
                            }}
                        />
                    </>
                ) : (
                    <TouchableOpacity
                        disabled={disabled}
                        style={{ width: CHIP_HEIGHT - 2, height: CHIP_HEIGHT - 2, padding: ADD_ICON_PADDING }}
                        onPress={() => setAdding(true)}
                    >
                        <TagPlusIcon color1={`${WHITE}aa`} />
                    </TouchableOpacity>
                )}
            </Animated.View>
        </View>
    );
};
