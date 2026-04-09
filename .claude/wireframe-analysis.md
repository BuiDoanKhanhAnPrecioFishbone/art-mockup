# Wireframe Analysis: Skills & Labels Management Flow

## Overview

The "Keywords & Labels" wireframe describes a two-part flow:

1. **Skill Library Management** (Settings context) -- admin CRUD for a master keyword/skill library, including pending approval workflows (merge, approve, reject).
2. **Skills & Labels Field** (Job Vacancy context) -- a form section inside "Jobs / New Job Vacancy" where users browse, search, drag-drop, AI-extract, and create skills inline.

## 1. Screens / Views

**1.1 Skill Library -- Master Library (AREA 1)**
- Route: `/flows/skill-library`
- Breadcrumb: Settings / Skill Library
- Title: "Skill Library" with "?" help tooltip
- Two tabs: "Master Library" (active), "Pending Approvals"
- Search bar + filter dropdown + "Add New" primary button
- Table columns: Keyword Name, Category, Synonyms, Action (edit/delete icons)
- 8 sample rows: ReactJS, TypeScript, Node.js, Docker, .NET Ecosystem, ASP.NET Core, Microsoft Solution Framework, Project Management

**1.2 Skill Library -- After Delete State (AREA 4)**
- Same as 1.1 but with row selection checkboxes for batch operations, some rows removed

**1.3 Skill Library -- Pending Approvals Empty (AREA 5)**
- "Pending Approvals" tab active, empty state: "No pending approvals at the moment"

**1.4 Skill Library -- Pending Approvals With Data (AREA 6)**
- Table columns: Keyword info, Status, Category, Action/Creator, merge/approve/reject buttons

**1.5 Skills & Labels Section -- Default State (AREA 15)**
- Embedded in "Jobs / New Job Vacancy" page, skill tag chips grouped by category, "Insert skills" action

**1.6 Skills & Labels Section -- After AI Auto-Extract (AREA 11)**
- "AI Auto-extract" button triggers extraction, new tags appended with visual distinction

**1.7 Skills & Labels Section -- Create New Inline (AREA 16)**
- Inline text input to type new skill name, add on Enter

**1.8 Skills & Labels Section -- Final State (AREA 17)**
- All skills populated, tags with categories, fully editable

## 2. UI Components Inventory

### Shared Primitives (new ones needed)
- `Input` -- text input field
- `Textarea` -- multi-line input
- `Select` / `Dropdown` -- category/filter dropdowns
- `Table` -- data table with header, rows, optional checkboxes
- `Tabs` -- two-tab component
- `Modal` / `Dialog` -- overlay with title, close, body, footer
- `Toast` -- success/error notification
- `SearchBar` -- input with search icon + optional filter
- `EmptyState` -- illustration + message
- `Breadcrumb` -- path navigation
- `Tooltip` -- for help icon
- `Checkbox` -- row selection
- `DragHandle` -- grip icon for drag-and-drop
- `Spinner` / `Loader` -- analyzing state

### Composite / Widget Components
- `SkillLibraryPage` (app layer) -- page shell with breadcrumb, title, tabs
- `MasterLibraryTab` (widgets) -- search + filter + Add New + SkillTable
- `PendingApprovalsTab` (widgets) -- search + PendingTable or EmptyState
- `SkillTable` (widgets/features) -- table with inline edit/delete actions
- `PendingApprovalsTable` (widgets/features) -- table with merge/approve/reject
- `EditSkillModal` (features) -- add/edit form modal
- `MergeKeywordDialog` (features) -- multi-step merge flow
- `ApproveSkillDialog` (features) -- confirmation dialog
- `RejectSkillDialog` (features) -- dialog with reason textarea
- `SkillCard` Active/Normal (entities) -- two visual states
- `SkillsLabelsSection` (widgets) -- full Skills & Labels form section
- `KeywordLibraryBrowser` (features) -- modal for browsing/selecting skills
- `SkillTagList` (features) -- tag chips with drag-drop, remove
- `AIAutoExtractButton` (features) -- AI extraction trigger

## 3. Data Models

```ts
interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  synonyms: string[];
  description: string;
  status: "active" | "pending" | "rejected";
  createdBy?: string;
  createdAt?: string;
  usageCount?: number;
}

type SkillCategory = "Techniques" | "Products" | "Uncategorized" | string;

interface PendingApproval {
  id: string;
  skill: Skill;
  status: "pending" | "approved" | "rejected" | "merged";
  submittedBy: string;
  submittedAt: string;
  rejectionReason?: string;
  mergedIntoSkillId?: string;
}

interface MergeCandidate {
  id: string;
  name: string;
  similarity: number;
  category: SkillCategory;
}

interface SkillTag {
  skillId: string;
  name: string;
  category: SkillCategory;
  source: "manual" | "library" | "ai-extracted";
  order: number;
}
```

## 4. Interactive Elements

### Buttons
- "Add New" (primary) -- opens EditSkillModal in create mode
- Edit icon (ghost) -- opens EditSkillModal in edit mode
- Delete icon (ghost destructive) -- triggers delete confirmation
- "Save" / "Cancel" in EditSkillModal
- Merge/Approve/Reject icons in pending table rows
- "Approve" (primary) / "Reject" (destructive) in confirmation dialogs
- "AI Auto-extract" (secondary with sparkle icon)
- "Insert skills" (link/ghost) -- opens KeywordLibraryBrowser
- "Apply" in library browser footer
- Tag remove (X) on skill chips

### Inputs
- Search bars (Master Library, Pending Approvals, Library Browser)
- Filter dropdown (category filter)
- Name (text), Category (dropdown), Description (textarea) in EditSkillModal
- Rejection reason (textarea) in RejectSkillDialog
- Inline new skill input in Skills & Labels section

### Tabs
- "Master Library" / "Pending Approvals"

### Checkboxes
- Row selection in Master Library table (batch delete)
- Row selection in KeywordLibraryBrowser (select skills to add)
- Select-all in table headers

### Drag and Drop
- From KeywordLibraryBrowser to Skills & Labels section
- Reorder within SkillTagList via drag handles

## 5. Modal / Dialog Inventory

**5.1 Edit Skill Modal** -- Title: "Edit Skill" / "Add New Skill"; Fields: Name, Category, Description; Buttons: Save, Cancel

**5.2 Merge Keyword Dialog (3 steps)** -- Step 1: analyzing spinner; Step 2: candidate list with similarity scores; Step 3: confirm merge target selection

**5.3 Approve Skill Dialog** -- Confirmation text, Approve/Cancel buttons

**5.4 Reject Skill Dialog** -- Warning icon, reason textarea (required), Reject/Cancel buttons

**5.5 Keyword Library Browser** -- Large modal with search, table (checkbox, name, category, usage), Apply/Cancel buttons, drag support

**5.6 Delete Confirmation** (implied) -- "Are you sure?" with Delete/Cancel

## 6. Toast Notifications
- Approval success, Rejection success, Skill saved, Skill deleted, Merge complete, AI extraction done

## 7. Skill Card States (AREA 3)
- **Active**: expanded with name, category badge, description, edit/deactivate actions
- **Normal**: compact with name and category badge only

## 8. API Routes Needed
- `GET/POST /api/skill-library` -- list/create skills
- `GET/PUT/DELETE /api/skill-library/[id]` -- single skill CRUD
- `DELETE /api/skill-library/batch` -- batch delete
- `GET /api/skill-library/pending` -- list pending approvals
- `POST /api/skill-library/[id]/approve` -- approve
- `POST /api/skill-library/[id]/reject` -- reject (body: reason)
- `POST /api/skill-library/[id]/merge` -- merge (body: targetSkillId)
- `POST /api/skill-library/[id]/analyze-merge` -- get merge candidates
- `POST /api/skill-library/ai-extract` -- AI extraction

## 9. Fixture Data Needed
File: `shared/fixtures/skills.ts` -- 8-12 master skills, 3-5 pending approvals, category list, merge candidate mock data

## 10. Navigation & Routing
- `/flows/skill-library` -- Master Library tab (default)
- `/flows/skill-library?tab=pending` -- Pending Approvals tab
- `/flows/job-vacancy/new` -- Job Vacancy page with Skills & Labels section

## 11. Implementation Priority
1. Shared primitives (Input, Textarea, Select, Table, Tabs, Modal, Toast, etc.)
2. Entities layer (Skill types, fixtures)
3. API routes with mock data
4. Features layer (all modals, browser, tag list, AI button)
5. Widgets layer (MasterLibraryTab, PendingApprovalsTab, SkillsLabelsSection)
6. App layer (page routing, job vacancy integration)
7. Enhancements (drag-and-drop, card view, batch operations)
