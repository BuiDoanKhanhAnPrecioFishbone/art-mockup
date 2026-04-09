# Skills & Labels Management -- Flow Analysis

## 1. Route Structure

Following the existing FSD pattern (app/flows/{flow-name}/), the Skills & Labels Management flow requires two route groups:

### A) Skill Library (Settings CRUD)

```
app/flows/skill-library/
  layout.tsx                          # Shared layout with tab navigation
  page.tsx                            # Default: Master Library tab
  master/
    page.tsx                          # Master Library tab -- skills table with CRUD
    _components/
      SkillsTable.tsx                 # Table: Keyword Name, Category, Synonyms, Action columns
      SkillsToolbar.tsx               # Search input + Filter button + Add New button
      EditSkillModal.tsx              # Modal for Add/Edit skill (Name, Category, Description)
      DeleteConfirmDialog.tsx         # Confirmation dialog for delete action
      SkillRow.tsx                    # Single table row with edit/delete action icons
  pending/
    page.tsx                          # Pending Approvals tab -- pending skills table
    _components/
      PendingApprovalsTable.tsx       # Table with Merge/Approve/Reject action columns
      PendingEmptyState.tsx           # Empty state when no pending items
      MergeAnalyzingDialog.tsx        # Analyzing keyword processing dialog
      MergeAnalyzedDialog.tsx         # Analyzed keyword results dialog
      MergeSelectingDialog.tsx        # Selecting keyword merge target picker
      ApproveConfirmDialog.tsx        # Approve Skill confirmation dialog
      RejectDialog.tsx                # Reject Skill dialog with reason textarea
```

### B) Skills & Labels Section (Job Creation Context)

```
app/flows/job-vacancy/
  layout.tsx                          # Job vacancy page layout
  new/
    page.tsx                          # Jobs / New Job Vacancy page
    _components/
      SkillsLabelsSection.tsx         # Main Skills & Labels container section
      SkillTagGroup.tsx               # Group of skill tags organized by category
      SkillTag.tsx                    # Individual skill tag (removable)
      AIAutoExtractButton.tsx         # AI Auto button + extraction logic
      BrowseLibraryPanel.tsx          # Keyword Library browsing panel/modal
      LibraryTable.tsx                # Checkbox table for skill selection within library
      DraggableSkillItem.tsx          # Draggable skill with grip handle
      CreateNewSkillInline.tsx        # Inline skill creation input
      InsertSkillsButton.tsx          # Insert skills action button
```

### API Routes

```
app/api/skills/
  route.ts                            # GET all skills, POST new skill
  [id]/
    route.ts                          # GET/PUT/DELETE single skill
app/api/skills/pending/
  route.ts                            # GET pending approvals
  [id]/
    approve/route.ts                  # POST approve
    reject/route.ts                   # POST reject (with reason body)
    merge/route.ts                    # POST merge (with target skill id)
    analyze/route.ts                  # POST trigger merge analysis
```

### Shared Types & Fixtures

```
shared/types/skill.ts                 # Skill, PendingSkill, SkillCategory types
shared/fixtures/skills.ts             # Mock skill library data
shared/fixtures/pending-skills.ts     # Mock pending approvals data
shared/fixtures/skill-categories.ts   # Skill category definitions
```

---

## 2. Complete User Flow Map

### Flow A: Skill Library -- Master Library Tab

#### A1. View Skills List
1. User navigates to /flows/skill-library (or /flows/skill-library/master)
2. Page fetches GET /api/skills
3. Loading state: skeleton rows displayed (3-5 rows, matching existing pattern)
4. Table renders with columns: Keyword Name, Category, Synonyms, Action
5. Each row shows edit icon (PencilLine) and delete icon (Trash2) in Action column
6. Skills may display as Active or Normal card states (visual badge difference)

#### A2. Search/Filter Skills
1. User types in search input in toolbar
2. Table filters client-side by keyword name (and optionally category/synonyms)
3. If no results, empty state row: No skills found matching your search.
4. Filter button opens a dropdown/popover for category-based filtering

#### A3. Add New Skill
1. User clicks Add New button in toolbar
2. EditSkillModal opens in **create mode** (empty fields)
3. Modal fields: Name (text input), Category (dropdown), Description (textarea)
4. User fills fields and clicks Save
5. POST /api/skills with skill data
6. On success: modal closes, table refreshes with new row at top, optional success toast
7. On cancel: modal closes, no changes

#### A4. Edit Existing Skill
1. User clicks edit icon on a table row
2. EditSkillModal opens in **edit mode** (fields pre-filled with existing data)
3. User modifies fields and clicks Save
4. PUT /api/skills/[id] with updated data
5. On success: modal closes, row in table updates in-place, optional success toast
6. On cancel: modal closes, no changes

#### A5. Delete Skill
1. User clicks delete icon on a table row
2. DeleteConfirmDialog opens: Are you sure you want to delete [Skill Name]?
3. User clicks Confirm / Delete
4. DELETE /api/skills/[id]
5. On success: dialog closes, row removed from table (wireframe shows After Delete state), optional success toast
6. On cancel: dialog closes, no changes

### Flow B: Skill Library -- Pending Approvals Tab

#### B1. View Pending Approvals (Empty)
1. User clicks Pending Approvals tab
2. Navigates to /flows/skill-library/pending
3. Page fetches GET /api/skills/pending
4. If empty array returned: PendingEmptyState renders with message (No skills pending approval)

#### B2. View Pending Approvals (With Items)
1. Same fetch as above, returns array of pending skills
2. Table renders with columns similar to master but with Merge/Approve/Reject action buttons per row

#### B3. Merge Flow (Multi-Step Dialog)
1. User clicks Merge button on a pending skill row
2. **Step 1 -- Analyzing**: MergeAnalyzingDialog opens showing Analyzing keyword... with a processing/spinner indicator
3. POST /api/skills/pending/[id]/analyze triggers analysis
4. **Step 2 -- Analyzed**: Dialog transitions to MergeAnalyzedDialog showing analysis results (similar existing skills found, confidence scores)
5. **Step 3 -- Selecting**: Dialog transitions to MergeSelectingDialog where user picks the merge target from suggested existing skills
6. User selects target and confirms
7. POST /api/skills/pending/[id]/merge with { targetSkillId }
8. On success: dialog closes, row removed from pending table, master library updated
9. On cancel at any step: dialog closes, no changes

#### B4. Approve Flow
1. User clicks Approve button on a pending skill row
2. ApproveConfirmDialog opens: Are you sure you want to approve [Skill Name]?
3. User clicks Approve / Confirm
4. POST /api/skills/pending/[id]/approve
5. On success: dialog closes, row removed from pending table, toast: Approved successfully
6. On cancel: dialog closes, no changes

#### B5. Reject Flow
1. User clicks Reject button on a pending skill row
2. RejectDialog opens with warning icon, text field for rejection reason
3. User enters reason and clicks Reject / Confirm
4. POST /api/skills/pending/[id]/reject with { reason }
5. On success: dialog closes, row removed from pending table, toast notification
6. On cancel: dialog closes, no changes

### Flow C: Skills & Labels Section (Job Creation)

#### C1. Default State
1. User is on /flows/job-vacancy/new (New Job Vacancy page)
2. Skills & Labels section renders with any pre-existing skill tags organized by category
3. Section shows action buttons: AI Auto, Browse Library, Create New

#### C2. AI Auto-Extract
1. User clicks AI Auto button
2. System analyzes the job description text already entered on the page
3. Loading/processing indicator shown on button or section
4. AI returns suggested skills as tags
5. Tags populate into the Skills & Labels section, organized by category
6. User can remove individual tags by clicking the X on each tag

#### C3. Browse Library
1. User clicks Browse Library button
2. BrowseLibraryPanel opens (modal or side panel)
3. Panel shows LibraryTable with columns: checkbox, Skill Name, Category
4. User can search within the library via search input
5. User selects multiple skills via checkboxes
6. User clicks Apply or Insert to add selected skills
7. Panel closes, selected skills appear as tags in the Skills & Labels section
8. **Alternative**: User can drag and drop skills from the library panel into the section (grip handles visible on draggable items)

#### C4. Drag and Drop from Library
1. While BrowseLibraryPanel is open, user grabs a skill by its grip handle
2. User drags the skill to the Skills & Labels drop zone
3. Visual drop indicator shown on the target area
4. On drop: skill tag appears in the section
5. Skill is visually marked as added in the library panel (checkbox checked, dimmed)

#### C5. Create New Skill Inline
1. User clicks Create New in the Skills & Labels section
2. Inline input appears (or small popover) for entering a new skill name
3. User types skill name and presses Enter or clicks Add
4. New skill tag appears in the section
5. Optionally: skill is also submitted to the backend for future library inclusion (could go to Pending Approvals)

#### C6. Insert Skills
1. After selecting skills via any method (AI, Browse, Create), user sees them as tags
2. Insert skills action finalizes the selection into the job form data
3. Section shows final state: Available in the field -- all skills visible and populated

#### C7. Remove Skill Tag
1. User clicks X button on any skill tag
2. Tag is removed from the section
3. If the tag came from the library, it becomes unselected in the library panel (if open)

---

## 3. State Transitions

### Master Library Page States

```
[Loading] -> [Loaded: Has Data] -> (search) -> [Filtered: Has Results]
                                 -> (search) -> [Filtered: Empty]
          -> [Loaded: Empty] (no skills exist -- unlikely but handled)

Modal States:
[Closed] -> [Open: Create Mode] -> [Saving...] -> [Closed + Table Refreshed]
[Closed] -> [Open: Edit Mode]   -> [Saving...] -> [Closed + Table Refreshed]
[Closed] -> [Open: Edit Mode]   -> [Cancel]    -> [Closed]

Delete Dialog:
[Closed] -> [Open: Confirming] -> [Deleting...] -> [Closed + Row Removed]
[Closed] -> [Open: Confirming] -> [Cancel]      -> [Closed]
```

### Pending Approvals Page States

```
[Loading] -> [Loaded: Empty]    -> renders PendingEmptyState
          -> [Loaded: Has Items] -> renders table

Merge Dialog (multi-step):
[Closed] -> [Step 1: Analyzing] -> [Step 2: Analyzed] -> [Step 3: Selecting target] -> [Merging...] -> [Closed + Row Removed]
          -> [Cancel at any step] -> [Closed]

Approve Dialog:
[Closed] -> [Open: Confirming] -> [Approving...] -> [Closed + Row Removed + Toast]

Reject Dialog:
[Closed] -> [Open: Enter Reason] -> [Rejecting...] -> [Closed + Row Removed + Toast]
```

### Skills & Labels Section States

```
[Default: Empty/Minimal Tags]
  -> (AI Auto click)        -> [Processing AI] -> [Tags Populated from AI]
  -> (Browse Library click)  -> [Library Panel Open]
                               -> (select + apply) -> [Tags Added from Library]
                               -> (drag & drop)    -> [Tag Added Individually]
                               -> (close)          -> [Panel Closed]
  -> (Create New click)     -> [Inline Input Visible] -> (submit) -> [New Tag Added]
  -> (Remove tag)           -> [Tag Removed]

Final state: [All Skills Populated -- Available in the field]
```

---

## 4. Component Hierarchy

### A) Skill Library

```
SkillLibraryLayout (layout.tsx)
|-- Tab Navigation: [Master Library] [Pending Approvals]
|
|-- MasterLibraryPage (master/page.tsx)
|   |-- Breadcrumb: Settings / Skill Library / Master Library
|   |-- Page Title: Skill Library
|   |-- SkillsToolbar
|   |   |-- Search Input (with Search icon)
|   |   |-- Filter Button (with SlidersHorizontal icon)
|   |   |-- Add New Button (with Plus icon)
|   |-- SkillsTable
|   |   |-- Table Header: Keyword Name | Category | Synonyms | Action
|   |   |-- SkillRow (repeated)
|   |   |   |-- Keyword Name cell
|   |   |   |-- Category cell (badge/text)
|   |   |   |-- Synonyms cell (comma-separated or tags)
|   |   |   |-- Action cell
|   |   |       |-- Edit icon button (PencilLine)
|   |   |       |-- Delete icon button (Trash2)
|   |   |-- SkeletonRow (loading state, repeated 3x)
|   |   |-- Empty State Row (no results)
|   |
|   |-- EditSkillModal (overlay)
|   |   |-- Modal Header: Edit Skill (same for add/edit)
|   |   |-- Name Field (text input)
|   |   |-- Category Field (select/dropdown)
|   |   |-- Description Field (textarea)
|   |   |-- Footer: Cancel button | Save button
|   |   |-- Close (X) button
|   |
|   |-- DeleteConfirmDialog (overlay)
|       |-- Warning text
|       |-- Cancel button
|       |-- Confirm/Delete button
|
|-- PendingApprovalsPage (pending/page.tsx)
    |-- Breadcrumb: Settings / Skill Library / Pending Approvals
    |-- PendingApprovalsTable
    |   |-- Table Header
    |   |-- Pending rows with Merge | Approve | Reject buttons
    |   |-- PendingEmptyState
    |
    |-- MergeAnalyzingDialog (Spinner + Analyzing keyword... text)
    |-- MergeAnalyzedDialog (Analysis results display)
    |-- MergeSelectingDialog (List of candidate skills to merge into)
    |-- ApproveConfirmDialog (Confirmation text + buttons)
    |-- RejectDialog (Warning icon + rejection reason textarea + buttons)
```

### B) Skills & Labels Section (Job Vacancy)

```
NewJobVacancyPage (job-vacancy/new/page.tsx)
|-- Breadcrumb: Jobs / New Job Vacancy
|-- Page Title: New Job Vacancy
|-- ... (other job form sections)
|
|-- SkillsLabelsSection
|   |-- Section Header: Skills & Labels
|   |-- Action Buttons Row
|   |   |-- AIAutoExtractButton (AI Auto with sparkle/wand icon)
|   |   |-- Browse Library Button
|   |   |-- Create New Button
|   |-- SkillTagGroup (repeated per category)
|   |   |-- Category Label
|   |   |-- SkillTag (repeated: Tag Label text + X remove button)
|   |-- CreateNewSkillInline (conditionally visible: text input + add button)
|   |-- InsertSkillsButton (Insert skills)
|
|-- BrowseLibraryPanel (modal/side panel, conditionally visible)
    |-- Panel Header: Keyword Library + Close button
    |-- Search Input
    |-- LibraryTable
    |   |-- Table Header: Checkbox (select all) | Skill Name | Category
    |   |-- DraggableSkillItem (repeated: grip handle + checkbox + name + category)
    |-- Footer: Apply/Insert Button
```

---

## 5. Data Flow

### Types (shared/types/skill.ts)

```typescript
export type SkillStatus = "active" | "normal";
export type PendingAction = "merge" | "approve" | "reject";

export interface SkillCategory {
  id: string;
  name: string;        // e.g., Technical, Soft Skills, Tools
  color?: string;       // for tag color coding
}

export interface Skill {
  id: string;
  name: string;         // Keyword Name column
  category: string;     // category id
  categoryName: string; // denormalized for display
  synonyms: string[];   // Synonyms column
  description?: string;
  status: SkillStatus;  // Active or Normal
  createdAt: string;
  updatedAt: string;
}

export interface PendingSkill {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  synonyms: string[];
  submittedBy: string;
  submittedAt: string;
  source?: string;       // e.g., user-created, ai-suggested
}

export interface MergeAnalysis {
  pendingSkillId: string;
  suggestedTargets: Array<{
    skillId: string;
    skillName: string;
    similarity: number;   // 0-1 confidence score
    reason: string;
  }>;
}
```

### API Call Map

| User Action | HTTP Method | Endpoint | Request Body | Response |
|---|---|---|---|---|
| Load master library | GET | /api/skills | -- | Skill[] |
| Add new skill | POST | /api/skills | { name, category, description } | Skill |
| Update skill | PUT | /api/skills/[id] | { name, category, description } | Skill |
| Delete skill | DELETE | /api/skills/[id] | -- | { success: true } |
| Load pending approvals | GET | /api/skills/pending | -- | PendingSkill[] |
| Analyze for merge | POST | /api/skills/pending/[id]/analyze | -- | MergeAnalysis |
| Execute merge | POST | /api/skills/pending/[id]/merge | { targetSkillId } | { success: true } |
| Approve skill | POST | /api/skills/pending/[id]/approve | -- | { success: true } |
| Reject skill | POST | /api/skills/pending/[id]/reject | { reason } | { success: true } |
| AI auto-extract | POST | /api/skills/extract | { jobDescription } | Skill[] |
| Browse library | GET | /api/skills | -- | Skill[] |

### Data Flow Diagrams

**Master Library CRUD:**
```
SkillsToolbar (Add New) -> EditSkillModal -> Save -> POST /api/skills -> refetch table
SkillRow (edit icon) -> EditSkillModal (prefilled) -> Save -> PUT /api/skills/[id] -> refetch table
SkillRow (delete icon) -> DeleteConfirmDialog -> Confirm -> DELETE /api/skills/[id] -> refetch table
```

**Pending Approvals:**
```
PendingRow (Merge) -> MergeAnalyzingDialog -> POST .../analyze -> MergeAnalyzedDialog -> MergeSelectingDialog -> POST .../merge -> refetch
PendingRow (Approve) -> ApproveConfirmDialog -> POST .../approve -> refetch + toast
PendingRow (Reject) -> RejectDialog -> POST .../reject -> refetch + toast
```

**Skills & Labels Section:**
```
AIAutoExtractButton -> POST /api/skills/extract (with job description) -> populate SkillTagGroups
BrowseLibraryPanel -> GET /api/skills -> LibraryTable -> user selects -> Apply -> add to SkillTagGroups
CreateNewSkillInline -> local state add -> add to SkillTagGroups
```

---

## 6. Edge Cases

### Empty States
- **Master Library: No skills exist** -- Table body shows: No skills found. Click Add New to create your first skill.
- **Master Library: Search yields nothing** -- Table body shows: No skills match your search.
- **Pending Approvals: No pending items** -- Dedicated empty state component with message: No skills pending approval.
- **Skills & Labels Section: No tags yet** -- Section shows placeholder text and action buttons only.
- **Browse Library: No skills in library** -- Library table shows empty state.

### Loading States
- **Table loading** -- 3 skeleton rows (matching existing SkeletonRow pattern from recruitment flow)
- **Modal save in progress** -- Save button shows spinner, disabled state, text changes to Saving...
- **Merge analysis in progress** -- Dedicated dialog with spinner and Analyzing keyword... text
- **AI auto-extract in progress** -- Button shows spinner/loading indicator, section may show pulsing placeholder tags
- **Delete in progress** -- Confirm button shows spinner, disabled

### Error States
- **API fetch fails** -- Table shows error message with retry button: Failed to load skills. Try again.
- **Save/Update fails** -- Modal stays open, inline error message: Failed to save. Please try again.
- **Delete fails** -- Dialog stays open, error message shown
- **AI extraction fails** -- Toast or inline error: AI extraction failed. Please try again.
- **Merge analysis fails** -- Dialog shows error state with retry option

### Confirmation Dialogs
- **Delete Skill** -- Are you sure you want to delete [Skill Name]? This action cannot be undone. (Cancel/Delete buttons)
- **Approve Skill** -- Are you sure you want to approve [Skill Name]? (Cancel/Approve buttons)
- **Reject Skill** -- Warning icon, Reject [Skill Name], mandatory reason field, Cancel/Reject buttons

### Validation
- **EditSkillModal** -- Name is required (cannot be empty), Category is required
- **RejectDialog** -- Reason is required (cannot submit empty rejection)
- **CreateNewSkillInline** -- Skill name cannot be empty, optional duplicate check

### Toast Notifications
- Approve success: Approved successfully (explicitly shown in wireframe)
- Reject success: Toast notification (shown in wireframe)
- Delete success: Optional success toast
- Merge success: Optional success toast
- Save/Create success: Optional success toast

---

## 7. Navigation Map

```
                         App Home (/)
                              |
                    /flows/skill-library
                    (Skill Library Layout)
                    [Master Library] [Pending]
                      /                \
       /flows/skill-              /flows/skill-
       library/master             library/pending

       Skills Table               Pending Table
       + Search/Filter            (or Empty State)
       + Add New (modal)
       + Edit (modal)             + Merge (multi-dialog)
       + Delete (dialog)          + Approve (dialog)
                                  + Reject (dialog)


       /flows/job-vacancy/new
       (New Job Vacancy Page)

       Skills & Labels Section
       [AI Auto] [Browse Library] [Create New]

       - AI Auto -> processes -> populates tags
       - Browse Library -> opens BrowseLibraryPanel (modal overlay)
         (select + Apply, or Drag & Drop)
       - Create New -> inline input -> new tag
       - [Insert Skills] -> finalizes

       Tag Groups (by category)
         [Tag x] [Tag x] [Tag x]
```

### Tab Navigation
- Master Library tab <-> Pending Approvals tab (within /flows/skill-library/ layout)
- Tab switch is a route change: /flows/skill-library/master <-> /flows/skill-library/pending

### Modal/Dialog Navigation
- All modals and dialogs are overlays on their parent page -- no route change
- Merge flow is a multi-step wizard within a single dialog container (state-driven step transitions, not route-based)
- BrowseLibraryPanel in job vacancy may be a slide-over panel or modal -- no route change

### Cross-Flow Connection
- The Browse Library panel in the Job Vacancy flow reads from the same /api/skills endpoint as the Master Library page
- Skills created inline in the Job Vacancy flow may optionally appear in Pending Approvals (if the system routes user-created skills through approval)

---

## 8. Ambiguities & Open Questions

1. **Active vs Normal skill states**: The wireframe shows two card states. It is unclear what triggers the transition between Active and Normal, or whether this is an admin-controlled toggle. **Recommendation**: Treat as a status badge on the skill; allow toggling via edit modal or a dedicated toggle action.

2. **Tab implementation**: Should tabs be route-based (/master and /pending sub-routes) or client-side state? **Recommendation**: Route-based, matching the FSD pattern where each page has its own data requirements.

3. **Browse Library panel type**: The wireframe shows skills with grip handles for drag-and-drop, plus checkboxes for multi-select. Is this a full modal or a side panel? **Recommendation**: Side panel (slide-over from right) to allow viewing the Skills & Labels section simultaneously for drag-and-drop.

4. **Insert Skills vs Apply**: Are these the same action from different contexts (one from within the library panel, one from the main section)? **Recommendation**: Apply closes the library panel and adds selected skills; Insert Skills is the final confirmation that locks them into the job form.

5. **Drag & Drop scope**: Can skills only be dragged from the Browse Library panel into the section, or can skills also be reordered within the section? **Recommendation**: Library-to-section only for MVP.

6. **Synonyms column behavior**: Are synonyms editable in the Edit Skill modal? The modal fields listed are Name, Category, Description -- no Synonyms field. **Recommendation**: Add a Synonyms field (tag input) to the Edit Skill modal, or flag this as a wireframe gap.

7. **Skills & Labels section persistence**: When skills are added via AI/Browse/Create, are they immediately saved to the job vacancy draft, or only on form submission? **Recommendation**: Local state until the job vacancy form is submitted.

8. **Merge target selection**: When merging, can the user only pick from the suggested targets, or can they search the full library? **Recommendation**: Show suggested targets with option to search the full library.