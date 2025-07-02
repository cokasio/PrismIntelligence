# 🎯 Prism Intelligence MVP Completion - Detailed Prompts

## Current Status Review
Based on the codebase analysis, you already have:
- ✅ Next.js dashboard structure with routing
- ✅ API endpoints for auth, properties, emails, AI
- ✅ Dashboard layout with analytics, settings
- ✅ Supabase integration
- ✅ CloudMailin webhooks

## What's Actually Missing for MVP

---

## Priority 1: Connect Task System to Dashboard (Critical Path)

### Prompt 1.1: Create Tasks API Endpoints
```
In C:\Dev\PrismIntelligence\apps\dashboard-nextjs\src\app\api, create a new tasks folder with these endpoints:

1. Create route.ts for GET /api/tasks:
   - Import taskDatabase service from attachment-loop
   - Implement getActiveTasks with filters:
     * status: 'pending' | 'completed' | 'overdue'
     * assignedRole: 'CFO' | 'PropertyManager' | etc.
     * propertyId: UUID
     * dateRange: { from: Date, to: Date }
   - Add pagination: ?page=1&limit=20
   - Sort options: dueDate, priority, potentialValue
   - Return format:
     {
       tasks: Task[],
       total: number,
       page: number,
       totalPages: number
     }

2. Create [id]/route.ts for single task operations:
   - GET: Fetch task with full details including source document
   - PATCH: Update task fields (status, notes, actualHours)
   - Include audit trail of changes

3. Create [id]/complete/route.ts for POST:
   - Mark task complete
   - Require completion notes
   - Update actual_hours and actual_value
   - Trigger ROI metrics recalculation
   - Return updated task with outcome

Example implementation structure:
- Use Supabase client from lib/supabase
- Add proper TypeScript types
- Include error handling for common cases
- Add request validation using zod
```

### Prompt 1.2: Create Task Management UI Components
```
In C:\Dev\PrismIntelligence\apps\dashboard-nextjs\src\components, create a comprehensive task management system:

1. Create components/tasks/TaskList.tsx:
   - Use shadcn/ui Table component
   - Columns: Status icon, Title, Assigned Role, Due Date, Priority, Value, Actions
   - Row features:
     * Color coding: red (overdue), amber (due soon), green (on track)
     * Priority badges (1-5 with colors)
     * Value formatting ($X,XXX)
     * Hover to preview task description
   - Implement virtual scrolling for large lists
   - Add selection checkboxes for bulk actions

2. Create components/tasks/TaskFilters.tsx:
   - Role selector (multi-select dropdown)
   - Status filter (pending/completed/all)
   - Date range picker
   - Priority filter (checkboxes 1-5)
   - Search by title/description
   - Clear all filters button
   - Save filter presets

3. Create components/tasks/TaskDetail.tsx:
   - Slide-out panel or modal
   - Show complete task information:
     * Full description with formatting
     * Source insight that triggered task
     * Link to source document
     * Creation date and history
     * Estimated vs actual hours
     * Potential vs realized value
   - Action buttons:
     * Complete with notes
     * Reassign to different role
     * Change due date
     * Add comments
   - Activity timeline

4. Create components/tasks/TaskActions.tsx:
   - Quick complete button with popover for notes
   - Edit task inline
   - View source document
   - Email task details
   - Print task

Integrate with existing dashboard layout at (dashboard)/tasks/page.tsx
```

### Prompt 1.3: Create ROI Dashboard Components
```
In C:\Dev\PrismIntelligence\apps\dashboard-nextjs\src\app\(dashboard), create a new roi folder:

1. Create roi/page.tsx main dashboard:
   Layout: 
   - Top row: 4 KPI cards (use existing card components)
   - Middle: 2 charts side by side
   - Bottom: Recent activity table

2. Create components/roi/KPICards.tsx:
   - Time Saved This Month (hours with trend arrow)
   - Tasks Completed (X of Y with percentage)
   - Value Identified (currency with sparkline)
   - Active Properties (count with status)
   
   Each card should:
   - Animate on load
   - Show loading skeleton
   - Update every 30 seconds
   - Click to drill down

3. Create components/roi/TimeChart.tsx using Recharts:
   - Line chart showing daily time saved
   - Toggle between day/week/month views
   - Hover for detailed breakdown
   - Export as image option

4. Create components/roi/ValueChart.tsx:
   - Stacked bar chart: Potential vs Realized value
   - Group by property or by month
   - Click bars to see task details
   - Show ROI percentage

5. Create components/roi/ActivityFeed.tsx:
   - Real-time feed of:
     * New analyses completed
     * Tasks created (with value)
     * Tasks completed
     * Milestones reached
   - Each item clickable
   - Auto-refresh via WebSocket

Wire up to /api/roi endpoints that query the roi_metrics and analysis_summaries tables
```

---

## Priority 2: File Upload & Analysis Flow

### Prompt 2.1: Create File Upload Interface
```
In C:\Dev\PrismIntelligence\apps\dashboard-nextjs\src\app\(dashboard)/upload:

1. Create upload/page.tsx:
   - Full-page dropzone using react-dropzone
   - Support drag-and-drop or click to browse
   - Accept: .pdf, .xlsx, .xls, .csv, .png, .jpg
   - Show file preview cards
   - Queue multiple files
   - Start upload button

2. Create components/upload/FileUploadZone.tsx:
   - Animated dashed border on hover
   - File type icons
   - Size validation (max 10MB)
   - Show upload progress per file
   - Success/error states
   - Retry failed uploads

3. Create components/upload/UploadProgress.tsx:
   - Progress bar with percentage
   - Processing stages:
     * Uploading (0-30%)
     * Analyzing with AI (30-80%)
     * Generating tasks (80-95%)
     * Complete (100%)
   - Estimated time remaining
   - Cancel upload option

4. Create api/upload/route.ts:
   - Handle multipart form data
   - Save to Supabase storage
   - Trigger attachment-loop processing
   - Return upload ID for tracking
   - Stream progress updates

5. Create upload/[id]/status/route.ts:
   - GET endpoint for polling status
   - Return current stage and progress
   - Include partial results as available
   - WebSocket alternative for real-time

After upload completes, redirect to analysis results page
```

### Prompt 2.2: Create Analysis Results View
```
Create comprehensive analysis view at (dashboard)/analysis/[id]/page.tsx:

1. Layout structure:
   - Header: Document name, upload date, status badge
   - Left column (2/3 width):
     * AI Summary section
     * Key Metrics cards
     * Insights list with priorities
     * Generated tasks preview
   - Right column (1/3 width):
     * Document preview/viewer
     * Processing details
     * Action buttons

2. Create components/analysis/SummaryCard.tsx:
   - Clean card design with icon
   - AI-generated executive summary
   - Expand/collapse for full text
   - Copy to clipboard button

3. Create components/analysis/MetricsGrid.tsx:
   - Dynamic grid based on found metrics
   - Each metric shows:
     * Name and value
     * Trend indicator
     * Mini chart if historical data
     * Comparison to benchmark

4. Create components/analysis/InsightsList.tsx:
   - Grouped by priority (High/Medium/Low)
   - Each insight shows:
     * Icon based on type
     * Clear description
     * Impact statement
     * Link to generated tasks
   - Filter by category

5. Create components/analysis/TaskPreview.tsx:
   - Compact list of generated tasks
   - Group by assigned role
   - Quick complete buttons
   - "View all tasks" link

6. Add action buttons:
   - Download analysis as PDF
   - Email summary
   - Re-run analysis
   - Upload similar document

Integration: Link from email notifications and task sources
```

---

## Priority 3: Real-Time Updates & Polish

### Prompt 3.1: Implement WebSocket Updates
```
In C:\Dev\PrismIntelligence\apps\dashboard-nextjs\src\lib, create real-time functionality:

1. Create lib/websocket.ts:
   - Initialize Socket.io client or Supabase Realtime
   - Auto-reconnect on disconnect
   - Event handlers for:
     * analysis.started
     * analysis.progress
     * analysis.completed
     * task.created
     * task.updated
     * roi.updated

2. Create hooks/useRealtimeUpdates.ts:
   - Subscribe to relevant channels
   - Update local state on events
   - Show toast notifications
   - Cleanup on unmount

3. Create components/NotificationToast.tsx:
   - Slide in from top-right
   - Different styles for:
     * Success (green)
     * Info (blue)
     * Warning (amber)
     * Error (red)
   - Auto-dismiss after 5 seconds
   - Click to navigate to item

4. Update existing components:
   - TaskList: Auto-refresh on new tasks
   - ROI Dashboard: Live metric updates
   - Upload Progress: Real-time status
   - Activity Feed: Instant updates

5. Create lib/realtimeSync.ts:
   - Sync strategies for offline/online
   - Queue updates when offline
   - Reconcile on reconnect
   - Prevent duplicate updates
```

### Prompt 3.2: Add Mobile Responsive Design
```
Update all dashboard components for mobile responsiveness:

1. Navigation updates:
   - Convert sidebar to bottom tab bar on mobile
   - Hamburger menu for secondary options
   - Swipe gestures for panel navigation

2. Task List mobile view:
   - Card layout instead of table
   - Swipe actions (complete, dismiss)
   - Pull to refresh
   - Infinite scroll

3. Upload mobile optimizations:
   - Full-screen dropzone
   - Camera capture for documents
   - Simplified progress view

4. ROI Dashboard mobile:
   - Stack KPI cards vertically
   - Scrollable chart container
   - Tap for chart details
   - Simplified activity feed

5. Responsive breakpoints:
   - Mobile: < 640px
   - Tablet: 640px - 1024px  
   - Desktop: > 1024px

Use Tailwind responsive utilities throughout
Test on actual devices, not just browser resize
```

---

## Priority 4: Authentication & User Experience

### Prompt 4.1: Complete Authentication Flow
```
Enhance existing auth in (auth) folder:

1. Update login/page.tsx:
   - Add "Remember me" checkbox
   - Social login buttons (Google, Microsoft)
   - Better error messages
   - Loading states
   - Redirect to intended page after login

2. Add registration flow:
   - Multi-step process:
     * Email & password
     * Company details
     * Role selection
     * Property assignment
   - Email verification
   - Welcome email trigger

3. Create middleware.ts in src:
   - Protect dashboard routes
   - Role-based redirects
   - Session refresh
   - Inactivity timeout

4. Add user menu component:
   - Avatar with dropdown
   - Quick role switcher
   - Settings link
   - Logout with confirmation

5. Create onboarding flow:
   - First login detection
   - Interactive tour
   - Sample document upload
   - Complete first task
   - Celebration on completion
```

---

## Testing Each Component

After implementing each prompt:

```bash
# 1. Start both services
npm run attachment-loop:dev
npm run dev

# 2. Test specific features
- Tasks: Upload a document, verify tasks appear
- ROI: Check metrics calculate correctly
- Upload: Test various file types
- Real-time: Open two browsers, verify sync

# 3. Mobile testing
- Use Chrome DevTools device mode
- Test on actual phone via local network
- Verify touch interactions work
```

---

## Definition of MVP Complete

Your MVP is ready when:
1. ✅ Can upload files through web interface
2. ✅ See analysis results immediately
3. ✅ Tasks appear in sortable, filterable list
4. ✅ Can complete tasks with notes
5. ✅ ROI dashboard shows real metrics
6. ✅ Works on mobile devices
7. ✅ Real-time updates work
8. ✅ Authentication protects data
9. ✅ 5-minute demo flows smoothly
10. ✅ No console errors in production

---

## Critical Path (Priority Order)

1. **Tasks API + UI** (enables core value prop)
2. **File Upload** (closes the loop)
3. **ROI Dashboard** (proves value)
4. **Real-time** (polished experience)
5. **Mobile** (broader accessibility)
6. **Auth Polish** (production ready)

Focus on 1-3 first. Ship when those work. Add 4-6 based on user feedback.