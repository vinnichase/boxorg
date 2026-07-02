# Code Conventions

This document captures design conventions for BoxOrg code changes. It is meant to guide future refactors and feature work, especially around React Native UI composition, atoms, gestures, and animations.

## Screen Composition

- Screen files in `src/app` should primarily compose feature components and route-level layout.
- Do not let a screen become the central controller for all child UI behavior.
- Move concrete behavior into concrete components when the behavior belongs to a visible UI element or overlay.
- A screen-level component may coordinate page structure, background, safe area layout, and navigation boundaries.

Good shape:

```tsx
<HomeBlurBackground>
    <BoxKeyboardDismissOverlay />
    <SafeAreaView>
        <BoxIdInput />
        <CaptureButton />
    </SafeAreaView>
</HomeBlurBackground>
<SearchResults />
<SearchInput />
<KeyboardToolbarSearch />
```

Avoid a screen that directly owns all refs, keyboard handlers, search visibility, blur timing, and child animations.

## Concrete Components

- Prefer concrete feature components for concrete feature UI.
- Reusable components should be truly atomic or broadly reusable primitives.
- Do not create generic-looking components that are effectively singletons for one feature.
- Keep `MainInputBox`-style components generic only when they are real UI primitives.
- Concrete components may subscribe to atoms and behavior hooks directly when that keeps ownership local.

Examples:

- `SearchInput` owns search text input focus, query updates, keyboard type, and search pull-down gesture.
- `SearchResults` owns when search results are loaded, shown, faded, and tapped.
- `HomeBlurBackground` owns only the blur background behavior.
- `BoxKeyboardDismissOverlay` owns the box-keyboard dismissal tap target.

## Component Ownership

- Put writes next to the component that owns the behavior.
- A component that renders a UI state should usually decide how that state changes.
- A parent should not write into a child feature atom just because it knows about the child.
- A visual wrapper should not write into unrelated feature state.

Examples:

- `SearchResults` may write `SearchAtom.show`; `HomeBlurBackground` should not.
- `SearchInput` may reset or complete search pull-down behavior; `HomeBlurBackground` should not.
- `BoxKeyboardDismissOverlay` may set `HomeFocusAtom` to `none`; `HomeBlurBackground` should not.

## Atoms

- Use atoms for shared state that multiple components genuinely need to observe or update.
- Do not use atoms as event buses, command channels, or request queues.
- Do not put refs, transient callbacks, or one-off imperative requests into atoms.
- Avoid global state for values that a concrete component can keep locally.
- Shared atoms should describe state, not implementation mechanics.

Good atom examples:

- `HomeFocusAtom`: shared focus mode that multiple components react to.
- `SearchPullDownGestureAtom`: shared pull-down progress read by multiple components.
- `SearchAtom`: search query and result visibility for the search feature.

Avoid:

- `HomeInputRefsAtom`
- `HomeInputRequestAtom`
- `HomeControlsAnimationAtom`
- global blur state when only the blur component needs it

## Refs And Focus

- Components that render `TextInput` should own their own refs.
- Focus and blur should be triggered locally in response to shared state, such as `HomeFocusAtom`.
- Do not pass input refs through parent screens unless the parent truly owns the input.
- Do not create atom-based request systems just to focus or blur a specific input.

## Behavior Hooks

- Behavior hooks should expose narrow behavior state and actions.
- A behavior hook should not become a hidden controller for many unrelated UI elements.
- Prefer one or two shared values over a broad object of feature-specific animation outputs.
- Let consuming components decide how they visually react to shared behavior.

For pull-down behavior:

- The shared atom stores progress.
- The controller component owns the gesture.
- Consumers read progress and map it to their own opacity, translation, or pointer behavior.

## Gestures

- Gesture objects belong to the concrete controller component or hook instance used by a `GestureDetector`.
- Share gesture state, not gesture objects.
- Do not put `Gesture.Pan()` objects into atoms via effects.
- `Gesture.Pan()` can be constructed during render; it is a declarative object, not a side effect.
- Use `useMemo` only when it materially reduces churn or clarifies dependency behavior. Do not add memoization by default.
- Avoid creating disabled gestures in read-only consumers.

## Animated Styles

- Keep animated style cause and effect close together.
- Inline `useAnimatedStyle(...)` at the `style` prop where the animated value is applied when practical.
- Keep static layout style as normal style objects near the component.
- Do not move static layout styles into animated style hooks just to reduce a style array.
- Do not extract a `const somethingStyle = useAnimatedStyle(...)` when it is used once and the inline version is clearer.
- Avoid conditional hook calls. If a component must hide, use opacity or pointer events instead of returning before hooks.

Good pattern:

```tsx
<Animated.View
    style={[
        {
            width: 110,
            height: 110,
        },
        useAnimatedStyle(() => ({
            opacity: searchPullDownBehavior.progress.value,
        })),
    ]}
/>
```

Avoid moving `width`, `height`, padding, colors, or static layout into `useAnimatedStyle` unless they are actually animated.

## Constants

- Prefer module-local constants for values that only shape one screen, hook, or component.
- Keep module-local constants at the top of the module, near related types and helper functions.
- Inline simple numeric thresholds when the local expression is clearer than a named constant.
- Use `src/util/constants.ts` only for values that are truly shared across modules or represent global theme/layout tokens.
- Do not add global constants just because two files coincidentally use the same number.

## Naming

- Name behavior hook results as behavior objects, such as `searchPullDownBehavior`.
- Avoid vague names for controlled state. Prefer names that describe ownership and direction.
- Concrete components should name the feature first when that improves scanning, for example `KeyboardToolbarSearch` and `KeyboardToolbarDismiss`.

## Refactor Discipline

- Prefer the smallest API that supports the current concrete components.
- Remove prop drilling by moving ownership down, not by introducing broad global atoms.
- Before adding a new atom, ask whether a component can own the state locally.
- Before adding a new reusable component, ask whether it is truly reusable or just one concrete feature surface.
- Before adding a new behavior hook output, ask whether consumers can derive their own UI reaction from a shared value.

## Edit Cycle Review

- After every edit cycle, review the changed code against this document before calling the work done.
- Treat this review as separate from `tsc`, formatting, and `git diff --check`.
- Check ownership first: writes, refs, atoms, gestures, and animated styles should live in the component or hook that owns the behavior.
- If a change violates a convention, either revise the code or make the exception explicit in the final handoff.
