# BoxOrg Architecture Documentation

## Mandatory Editing Gate: Code Conventions

Before making or reviewing any code edit in this repository, load and follow [`docs/code-conventions.md`](docs/code-conventions.md).

This is not optional and not a final-summary-only check:

- Read the conventions before choosing an implementation shape.
- Keep the conventions active while editing.
- After every edit cycle, review the changed code against the conventions before considering the work complete.
- Treat this review as a required gate alongside type checks and `git diff --check`.
- If a change intentionally violates a convention, call out the exception explicitly.

---

## Project Overview

**BoxOrg** is a React Native mobile application built with Expo that helps users organize objects in boxes by capturing images, segmenting them into individual items, tagging them, and storing them in a SQLite database with search capabilities.

**Tech Stack:**
- Framework: Expo (React Native 0.81.5)
- Navigation: Expo Router (file-based routing)
- State Management: Got-Atom (reactive state library)
- Database: SQLite (expo-sqlite)
- Animations: React Native Reanimated, React Native Animated
- Image Processing: React Native Community Image Editor
- Gesture Handling: React Native Gesture Handler

---

## Source Directory Structure (`/src`)

### 1. `/src/app` - Navigation & Screens

**Purpose:** Implements the main user workflows through file-based routing with Expo Router.

#### Key Files:

- **`_layout.tsx`** - Root stack navigator setup, initializes StatusBar and gesture handlers
- **`index.tsx`** - Home/Dashboard screen with box ID input, search interface, and camera trigger
- **`segment.tsx`** - Interactive image segmentation screen where users draw rectangles around objects
- **`collect.tsx`** - Grid view of segmented objects with tagging and deletion capabilities
- **`label.tsx`** - Tag management for newly segmented objects during collection workflow
- **`edit.tsx`** - Tag management for existing database objects

#### Navigation Flow:
```
Home (/)
  ├─→ Capture Image (via camera)
  ├─→ /segment (Segmentation)
  ├─→ /collect (Review)
  ├─→ /label (Tag new objects)
  └─→ Search Results
       └─→ /edit (Tag existing objects)
```

---

### 2. `/src/atoms` - State Management

**Purpose:** Global reactive state management using Got-Atom - central data store for application state.

#### State Atoms:

**`CollectObjectsAtom.ts`** - Manages object collection workflow
```typescript
{
  boxId?: number;           // Current box being organized
  image?: {
    uri: string;            // Full image URI from camera
    width: number;
    height: number;
  };
  index: number;            // Current object being edited
  objects: EditObject[];    // Array of segmented objects
}
```

**`SearchAtom.ts`** - Manages search functionality with reactive subscription
```typescript
{
  show: boolean;            // Toggle search UI visibility
  query: string;            // Current search query
}
```
- Auto-executes search when atom changes
- Populates `SearchResultsAtom` with database results

**`EditObjectAtom.ts`** - Current object being edited from database
```typescript
{
  id: number;               // Database object ID
  box_id: number;           // Box assignment
  thumb_path: string;       // Thumbnail path in documents
  tags: string[];           // Current tags
}
```

---

### 3. `/src/components` - Reusable UI Components

**Purpose:** Consistent, reusable UI elements across the application.

- **`MainInputBox.tsx`** - Styled animated container for input fields (white rounded box with purple border)
- **`ObjectTile.tsx`** - Grid item displaying segmented/saved objects with image, tags, and delete button
- **`AnimatedBlurView.tsx`** - Reanimated wrapper for expo-blur with smooth intensity transitions
- **`SearchResults.tsx`** - Full-screen overlay showing search results with tap-to-edit functionality
- **`Icons.tsx`** - SVG icon library (SearchIcon, BoxIcon, ApertureIcon, CrossIcon, SaveIcon, etc.)

---

### 4. `/src/hooks` - Custom React Hooks

**Purpose:** Reusable logic extracted into custom hooks.

- **`useImage.ts`** - Camera/image picker hook with permission management
- **`useSpringSpan.ts`** - Spring-based animation hook (shift/unshift pattern)
- **`useTimingSpan.ts`** - Duration-based animation hook (configurable timing)

---

### 5. `/src/db` - Database Layer

**Purpose:** Data persistence and query layer - single file with all database operations.

#### File: `accessLayer.ts`

**Schema Design:**

1. **`objects`** table - Stores object metadata
   - `id`, `img_path`, `thumb_path`, `box_id`

2. **`tags`** table - Unique tags
   - `id`, `tag` (UNIQUE, indexed)

3. **`object_tags`** junction table - Many-to-many relationships
   - `object_id`, `tag_id` (composite primary key, cascading deletes)

**Core Operations:**

- Objects CRUD: `createObject`, `getObjectById`, `updateObject`, `deleteObject`
- Tags CRUD: `createTag`, `getTagByName`, `updateTag`, `deleteTag`
- Tag Assignments: `assignTagToObject`, `removeTagFromObject`, `getObjectTags`
- Queries: `getObjects`, `searchObjects`, `getTags`

**Type Exports:**
- `ObjectRecord`, `TagRecord`, `ObjectTagRecord`, `ObjectWithTags`

---

### 6. `/src/service` - Business Logic

**Purpose:** Bridge between UI and database - handles complex save operations.

**`saveObjects.ts`** - Batch save for newly segmented objects
```
For each non-deleted object:
  1. Create object record in DB
  2. Assign box ID
  3. For each tag: Create/assign tag to object
  4. Copy image file from cache to app documents
```

**`saveObject.ts`** - Update existing database object
```
1. Update box_id in database
2. Calculate tag differences (new vs removed)
3. Assign new tags
4. Remove deleted tags
```

**Integration:** Both services use `accessLayer.ts` functions and manage database connections (`openDb()` → operations → `closeSync()`).

---

### 7. `/src/util` - Utilities

**Purpose:** Pure utility functions and constants.

- **`constants.ts`** - Color theme constants (PURPLE_DARK, PURPLE_MID, PURPLE_LIGHT, GREEN_LIGHT, RED, etc.)
- **`setPath.ts`** - Type-safe immutable nested object update utility
- **`getPath.ts`** - Type-safe nested property lookup with fallback
- **`getSquareDimensions.ts`** - Calculates square crop from rectangular selection (ensures consistent thumbnails)
- **`cropImage.ts`** - Wrapper around React Native Community Image Editor (crops and downsamples to 1000x1000)
- **`sql.ts`** - SQL template tag for syntax highlighting

---

### 8. `/src/test` - Unit Tests

**Purpose:** Test coverage for utility functions.

- **`getSquareDimensions.test.ts`** - Tests square dimension calculation with 5 edge cases

---

## Key Architectural Patterns

### State Management Flow
```
User Action (UI)
  → Updates Atom (CollectObjectsAtom, SearchAtom, EditObjectAtom)
  → Component re-renders via useAtom hook
  → Atom subscribers trigger side effects (search)
  → User navigates between screens
```

### Data Lifecycle - New Objects
```
Capture Image (useImage hook)
  ↓ [CollectObjectsAtom.image]
Segment objects (segment.tsx)
  ↓ [CollectObjectsAtom.objects + cropped URIs]
Label objects (label.tsx)
  ↓ [CollectObjectsAtom.objects + tags]
Save to DB (saveObjects service)
  ↓ [Database + File System]
Reset atom state → Back to home
```

### Data Lifecycle - Existing Objects
```
Search query (SearchAtom)
  ↓ [Triggers executeSearch() subscription]
Query database (searchObjects)
  ↓ [SearchResultsAtom populated]
Tap result → EditObjectAtom set
Edit in /edit screen
Save (saveObject service) → Database updated
Refresh search → Back to home
```

### Component-Atom Bindings
```
index.tsx (Home)
  ├─ CollectObjectsAtom (read/write)
  ├─ SearchAtom (read/write)
  └─ SearchResultsAtom (subscribe for display)

SearchResults.tsx
  ├─ SearchAtom (read show state)
  ├─ SearchResultsAtom (read results)
  └─ EditObjectAtom (write on selection)

segment.tsx → CollectObjectsAtom (write objects)
collect.tsx → CollectObjectsAtom (read all)
label.tsx → CollectObjectsAtom (read current object by index)
edit.tsx → EditObjectAtom (read/write)
```

### Database Integration
- **saveObjects service** → `createObject`, `updateObject`, `assignTagToObject`
- **saveObject service** → `updateObjectBoxId`, `getObjectTags`, `assignTagToObject`, `removeTagFromObject`
- **SearchAtom subscriber** → `searchObjects`, `openDb`

### File System Integration
- **useImage hook** → expo-image-picker (camera/library)
- **segment.tsx** → cropImage → @react-native-community/image-editor
- **saveObjects service** → expo-file-system (copies cropped images to app documents as `{objectId}.jpg`)

---

## Integration Summary

### How the Folders Work Together

1. **User Interface** (`/app` + `/components`)
   - Screen components in `/app` compose reusable UI from `/components`
   - Screens use custom hooks from `/hooks` for complex logic

2. **State Management** (`/atoms`)
   - Screens read/write to atoms for reactive state
   - Atoms trigger side effects (search auto-execution)
   - Provides single source of truth across navigation

3. **Data Persistence** (`/service` + `/db`)
   - Service layer handles business logic (file operations + database transactions)
   - Database layer provides type-safe CRUD operations
   - Service layer bridges UI state (atoms) and persistent storage

4. **Utilities** (`/util`)
   - Pure functions used throughout all layers
   - Constants ensure consistent theming
   - Image processing utilities enable segmentation workflow

5. **Animation Layer**
   - Hooks provide reusable animation logic
   - Components use Reanimated for performance
   - Home screen orchestrates multiple simultaneous animations

---

## Key Architectural Decisions

1. **Single Atom Pattern** - Uses Got-Atom instead of Redux for simpler reactive state
2. **Immutable Updates** - `setPath` utility ensures immutable state transitions
3. **Lazy DB Connections** - `openDb/closeSync` pattern prevents connection leaks
4. **Service Layer** - Separates business logic from UI components
5. **Junction Table** - Proper many-to-many relationship for object-tag associations
6. **File-Based Routing** - Expo Router matches folder structure to navigation
7. **Cropped Thumbnails** - Aggressive compression (0.3 quality) for database storage
8. **Custom Hooks** - Encapsulates complex logic (animations, permissions)
9. **SVG Icons** - Vector icons scale without quality loss
10. **Gesture Detection** - Segment screen uses pan gestures for intuitive drawing

---

## Code Design Conventions

- Detailed code conventions live in [`docs/code-conventions.md`](docs/code-conventions.md).
- After every edit cycle, review changed code against those conventions before considering the work complete.
- Prefer reusable components only for atomic UI primitives with a broad, clear purpose.
- Keep concrete feature UI in concrete named components, even when they subscribe to atoms or shared behavior hooks directly.
- Do not hide feature-specific singleton behavior inside generic-looking reusable components; keep it in concrete feature components or explicit screen orchestration.
- For concrete sibling components that share feature UI state, prefer small feature atoms/hooks over broad prop APIs and prop drilling.
- Prefer module-local constants for values that only shape one screen, hook, or component.
- Keep module-local constants at the top of the module, near related types and helper functions.
- Add constants to `src/util/constants.ts` only when they are truly shared across modules or represent reusable global theme/layout values.

---

## Development Workflow

### Adding a New Feature

1. **Define State** - Add/modify atoms in `/src/atoms` if global state is needed
2. **Create/Modify Screen** - Add screen file to `/src/app` (auto-registers route)
3. **Add UI Components** - Build reusable components in `/src/components`
4. **Database Changes** - Update schema and operations in `/src/db/accessLayer.ts`
5. **Business Logic** - Add service functions in `/src/service` for complex operations
6. **Utilities** - Extract pure functions to `/src/util` for reusability

### Testing Strategy

- Unit tests for utility functions in `/src/test`
- Test geometric calculations (`getSquareDimensions`)
- End-to-end and release smoke testing are defined in [`docs/e2e.md`](docs/e2e.md)
- Manual testing should use EAS development/preview builds for native-device flows

---

## Common Patterns

### Atom Updates (Immutable)
```typescript
import { setPath } from '@/util/setPath';

// Update nested property
setCollectObjects(setPath(['boxId'], 123, collectObjects));
setCollectObjects(setPath(['objects', index, 'tags'], newTags, collectObjects));
```

### Database Operations
```typescript
import { openDb, createObject, closeSync } from '@/db/accessLayer';

const db = await openDb();
try {
  const objectId = createObject(db, boxId);
  // ... more operations
} finally {
  await closeSync(db);
}
```

### Navigation
```typescript
import { router } from 'expo-router';

router.push('/segment');
router.back();
```

### Animations
```typescript
const [animValue, shift, unshift] = useSpringSpan(0, 1);

// Trigger animation
shift(); // Animates from 0 to 1
unshift(); // Animates back from 1 to 0
```

---

## File Naming Conventions

- **Screens**: `kebab-case.tsx` (matches route path: `segment.tsx` → `/segment`)
- **Components**: `PascalCase.tsx` (e.g., `ObjectTile.tsx`, `SearchResults.tsx`)
- **Atoms**: `PascalCaseAtom.ts` (e.g., `CollectObjectsAtom.ts`)
- **Utilities**: `camelCase.ts` (e.g., `cropImage.ts`, `setPath.ts`)
- **Services**: `camelCase.ts` (e.g., `saveObjects.ts`)
- **Database**: `camelCase.ts` (e.g., `accessLayer.ts`)
- **Tests**: `*.test.ts` pattern

---


