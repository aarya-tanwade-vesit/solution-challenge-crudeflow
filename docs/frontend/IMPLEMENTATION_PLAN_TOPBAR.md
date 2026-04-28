# CrudeFlow Dashboard — Comprehensive Implementation Plan (TopBar Finalized)

## Executive Summary
This plan outlines the full implementation of a Bloomberg Terminal / Palantir-style enterprise maritime command console. The TopBar is now finalized with all enterprise SaaS features locked. This document focuses on transforming the TopBar specification into a fully operational, integrated system with proper state management, data flow, and user interactions.

---

## Part 1: TopBar Architecture (FINALIZED & LOCKED)

### Section 1: TopBar Left Side Components

#### 1.1 Branding (LOCKED ✅)
- **Display**: "NEMO" (subtitle) + "CrudeFlow" (main title)
- **Purpose**: Establish visual identity and product context
- **State**: Static, no interaction needed
- **Integration**: Sits at far left of TopBar, fixed width container

#### 1.2 Breadcrumb Navigation (FIXED ✅)
- **Display Format**: "Dashboard > [Page Name]"
- **Examples**: 
  - Dashboard > Overview
  - Dashboard > Shipments
  - Dashboard > Simulation Lab
  - Dashboard > Operations
- **Purpose**: Clear hierarchical navigation context for users
- **State Management**: Page name driven by current route/context
- **Integration**: Between Branding and Workspace Switcher, responsive (hidden on mobile)

#### 1.3 Workspace Switcher (PLACEMENT DECIDED: LEFT SIDE ✅)
- **Primary Display**: "[Logo] BPCL Operations ▼" (clickable dropdown)
- **Rationale**: Workspace is core context (like Notion/Slack), NOT a setting
  - Users should never lose awareness of workspace
  - Workspace changes trigger complete data recalculation
  - Highly visible placement prevents confusion
- **Dropdown Menu Contents**:
  - BPCL Operations (with metadata: region, port, active shipments count)
  - Reliance Energy (with metadata)
  - Shell Trading (with metadata)
  - Divider
  - Create Workspace (admin action)
- **Interaction Flow**:
  1. User clicks workspace selector
  2. Dropdown appears below button
  3. Selection triggers:
     - Global context update (workspace ID)
     - KPI data refresh (all 4 KPIs recalculate)
     - Map layer refresh
     - Decision Engine context reset
     - Activity feed filtered to workspace
- **State Needed**: 
  - Current workspace ID (global/context)
  - List of available workspaces
  - Workspace metadata (region, port, shipment count)
  - Dropdown open/closed state

---

### Section 2: TopBar Right Side Components

#### 2.1 System Status Block (REFINED ✅)
- **Display Format**: "[Green Dot] Normal | Updated 2m ago [🔄 Refresh]"
  - Possible states: NORMAL (green), WARNING (amber), CRITICAL (red)
  - Timestamp shows "Xm ago" (relative time)
  - Refresh button allows manual update
- **Interaction**: 
  - **Click status badge** → opens inline dropdown panel (appears below button)
  - **Click refresh button** → triggers immediate system analysis update
- **Dropdown Panel Content** (RIGHT-SIDE DRAWER, NOT replacing this):
  1. **Summary Section**
     - Current system state
     - Risk indicator (number + trend)
     - Affected region (optional enhancement)
  2. **Breakdown Section** (Root cause analysis)
     - Risk contributors with severity:
       - Geopolitical: High (red indicator)
       - Weather: Medium (amber indicator)
       - Port Congestion: Low (blue indicator)
     - Adds context for why system is in this state
  3. **Affected Entities Section**
     - List 3–5 impacted vessels
     - Show risk percentage change for each
     - Allow drill-down to vessel detail
  4. **Suggested Focus Section**
     - Actionable recommendations:
       - "Monitor Hormuz corridor"
       - "Review MT Rajput decision"
       - "Check port queue at Kochi"
     - Links to related dashboard sections
- **State Needed**:
  - Current system status (normal/warning/critical)
  - Last updated timestamp
  - Risk contributors breakdown
  - Affected entities list
  - Suggested focus items
  - Dropdown open/closed state
  - Auto-refresh interval (background polling)

#### 2.2 Activity Feed & System Timeline (REDEFINED ✅)
- **Icon**: Bell icon with badge count (e.g., "3")
- **Display**: Badge changes color based on event severity
  - Normal events: default slate
  - Alerts: amber/red
- **Purpose**: System timeline (NOT alert duplication)
  - Shows mixed feed of: Alerts, Decisions, Simulations, System Updates
  - Prevents "alert fatigue" by consolidating into single timeline
- **Dropdown Timeline Contents** (example chronological order):
  1. "Reroute approved" — 2m ago (Decision event, blue)
  2. "Delay detected: MT Yamuna" — 5m ago (Alert event, amber)
  3. "Simulation executed: Suez route" — 8m ago (Simulation event, purple)
  4. "Port status updated: Kochi" — 12m ago (System update, slate)
  5. "High risk: Geopolitical alert" — 15m ago (Alert event, red)
- **Event Structure**:
  - Icon + Color (indicates type)
  - Description (human-readable)
  - Timestamp (relative: "2m ago")
  - Metadata (vessel name, location, decision ID)
  - Action link (e.g., "View Decision", "Review Alert")
- **Filtering** (optional enhancement):
  - Ability to filter by event type
  - Option to show/hide specific categories
  - Search for specific vessel or event
- **State Needed**:
  - Event list (fetched from API/backend)
  - Current badge count (unread events)
  - Event filters (selected types)
  - Dropdown open/closed state
  - Real-time event streaming (WebSocket/polling for new events)

#### 2.3 User Profile Dropdown (HIERARCHICAL ✅)
- **Level 1: Account Menu**
  - "Manage Account" → Profile settings page
  - "Organization Settings" → Org admin page
  - "Ports & Suppliers Config" → Supplier management
  - "API Keys" → API access management
  - "Preferences" → User settings
  - "Workflow" → Custom workflow builder
  - "Theme Toggle" → Dark/Light mode (future)
  - "Help" → Documentation/support
  - "Logout" → Clear session, redirect to login
- **Level 2: Detailed Pages** (future implementation)
  - Profile editor (name, email, avatar)
  - Organization invite/member management
  - API key generation and revocation
  - etc.
- **Display**: Avatar button with label (e.g., "B Admin")
- **State Needed**:
  - Current user info (name, avatar, role)
  - User preferences
  - Dropdown open/closed state

---

## Part 2: State Management Architecture

### Global State Requirements
The TopBar requires several pieces of state that will impact the entire dashboard:

1. **Workspace Context**
   - Current workspace ID
   - Workspace metadata (region, port, facilities)
   - Available workspaces list
   - Trigger: Data refetch when changed

2. **System Status Context**
   - Current status (enum: normal, warning, critical)
   - Risk contributors breakdown
   - Affected entities
   - Last updated timestamp
   - Trigger: Periodic refresh (auto-poll every 30-60s)

3. **Activity Feed Context**
   - Event list (chronological, newest first)
   - Unread event count
   - Event type filters
   - Trigger: Real-time updates via WebSocket or polling

4. **User Context**
   - Current user (ID, name, email, role, avatar)
   - User preferences
   - Trigger: Loaded on app initialization

### State Management Approach
- **Option A**: React Context API for global state (simple approach)
  - Create providers for: WorkspaceContext, SystemStatusContext, ActivityFeedContext, UserContext
  - Wrap MainLayout with these providers
  - Pros: No external dependencies, clear data flow
  - Cons: Potential re-render overhead with complex state updates

- **Option B**: State management library (scalable approach)
  - Zustand or Jotai for lightweight state management
  - Redux if complex business logic needed
  - Pros: Optimized re-renders, dev tools, scalability
  - Cons: Additional dependency, learning curve

**Recommendation**: Start with Context API for MVP, migrate to Zustand if performance issues arise.

---

## Part 3: Data Flow & API Integration

### Workspace Switching Data Flow
```
User Selects Workspace
  ↓
Update WorkspaceContext
  ↓
Trigger KPI Refetch (API call)
  ↓
Trigger Map Layer Reload
  ↓
Trigger System Status Refresh
  ↓
Update All Dashboard Components
```

### System Status Update Flow
```
Component Mounts
  ↓
Call GET /api/system-status (initial)
  ↓
Store in SystemStatusContext
  ↓
Set Auto-refresh Interval (30s)
  ↓
User clicks Refresh Button
  ↓
Call GET /api/system-status (immediate)
  ↓
Update Context + UI
```

### Activity Feed Real-time Flow
```
Component Mounts
  ↓
Call GET /api/activity-feed (initial fetch, last 10 events)
  ↓
Store in ActivityFeedContext
  ↓
Open WebSocket Connection (or start polling every 5s)
  ↓
New Event Arrives
  ↓
Add to Feed (prepend for newest first)
  ↓
Increment Badge Count
  ↓
Auto-dismiss badge after 30s if not viewed
```

### API Endpoints Required
- `GET /api/workspaces` — List all workspaces
- `GET /api/workspaces/{id}` — Get workspace details
- `GET /api/system-status` — Get current system status + breakdown
- `GET /api/activity-feed` — Get recent events (paginated)
- `POST /api/activity-feed/read/{id}` — Mark event as read
- `GET /api/user/profile` — Get current user info
- `GET /api/kpis` — Get KPI data (filtered by workspace)

---

## Part 4: User Interactions & Workflows

### Workflow 1: Switching Workspaces
1. User arrives at dashboard (default workspace: BPCL Operations)
2. User clicks workspace selector dropdown
3. Dropdown shows list of 3 workspaces + Create button
4. User selects "Reliance Energy"
5. System:
   - Saves workspace preference (localStorage or user profile)
   - Refetches all KPIs for new workspace
   - Updates map layers
   - Resets Decision Engine context
   - Shows loading state during transition
   - Displays toast notification: "Switched to Reliance Energy"
6. Dashboard updates with new workspace data

### Workflow 2: Responding to System Warnings
1. System detects critical risk (e.g., geopolitical event)
2. System Status changes from "Normal" to "Critical" (red)
3. Badge on Activity Feed increments
4. User notices status change
5. User clicks status badge to open panel
6. Panel shows:
   - Summary: "Critical Risk Detected"
   - Breakdown: Geopolitical contributor flagged
   - Affected Entities: MT Rajput (85% risk increase)
   - Suggested Focus: "Review MT Rajput reroute decision"
7. User clicks "View Decision" link → navigates to Decision Engine
8. User can approve/reject recommended action

### Workflow 3: Reviewing Activity Timeline
1. User sees bell icon has badge count "3"
2. User clicks bell icon to open Activity Feed dropdown
3. Timeline shows (newest first):
   - "Reroute approved" — 2m ago
   - "Delay detected" — 5m ago
   - "Port status updated" — 12m ago
4. User clicks on "Reroute approved" event
5. Event expands or navigates to decision detail
6. Badge count decrements (event marked as viewed)

### Workflow 4: Manual Status Refresh
1. User wants latest system status (not waiting for auto-poll)
2. User clicks Refresh button next to timestamp
3. System shows loading spinner briefly
4. New status fetched and displayed
5. Timestamp updates: "Updated now" → "Updated 1m ago"

---

## Part 5: Integration with Existing Components

### TopBar Integration with MainLayout
- TopBar positioned above all content
- Height: 56–64px
- Full width, sticky positioning
- Receives `sidebarExpanded` prop to adjust layout spacing
- Pass workspace change callback to MainLayout for cascading updates

### TopBar Integration with KPI Strip
- When workspace changes, KPI Strip receives new workspace ID
- KPI Strip refetches data via useEffect dependency on workspace ID
- Cards display loading skeleton during fetch

### TopBar Integration with Map & Decision Engine
- Both components receive workspace context
- On workspace change, both re-initialize with new data
- Map clears existing layers and loads new workspace boundaries
- Decision Engine resets current decision and loads new recommendations

### TopBar Drawers (System Status & Activity Feed Panels)
- Positioned as overlays/dropdowns on TopBar
- Do NOT open full-screen modals
- Click outside dropdown closes it
- Keyboard shortcut to toggle (future: Cmd+K or similar)

---

## Part 6: Implementation Phases (Detailed)

### Phase 1: State Management Setup
1. Create Context providers for Workspace, SystemStatus, ActivityFeed, User
2. Create custom hooks: `useWorkspace()`, `useSystemStatus()`, `useActivityFeed()`, `useUser()`
3. Wrap MainLayout with providers
4. Test provider setup in isolation

### Phase 2: TopBar Component Assembly
1. Build Branding component (static)
2. Build BreadcrumbNav component (route-aware)
3. Build WorkspaceSelector component (dropdown logic)
4. Build SystemStatusBlock component (badge + dropdown panel)
5. Build ActivityFeed component (timeline + badge)
6. Build UserProfile component (hierarchical menu)
7. Integrate all into TopBar wrapper

### Phase 3: Data Flow & API Integration
1. Create API client utilities
2. Implement workspace switching logic (context + API calls)
3. Implement system status polling
4. Implement activity feed real-time updates (WebSocket or polling)
5. Add loading states and error handling

### Phase 4: Cascading Updates
1. Wire workspace change to KPI refetch
2. Wire workspace change to Map layer reload
3. Wire workspace change to Decision Engine reset
4. Test end-to-end workspace switching

### Phase 5: Polish & Testing
1. Add animations/transitions (minimal, 100–200ms)
2. Test responsive behavior (mobile/tablet/desktop)
3. Add accessibility features (keyboard navigation, ARIA labels)
4. Performance testing (re-render optimization)

---

## Part 7: Technical Considerations

### Performance
- Debounce workspace selection (prevent rapid re-fetches)
- Memoize TopBar components to prevent unnecessary re-renders
- Use React.lazy for heavy components (future dropdowns)
- Virtual scrolling for activity feed if list grows large

### Error Handling
- API failures should show graceful degradation
- Network timeouts → retry with exponential backoff
- Failed workspace switch → revert to previous workspace, show error toast
- Activity feed errors → show "Unable to load feed" message

### Accessibility
- All buttons must have clear labels and keyboard support
- Dropdowns must support keyboard navigation (arrow keys, Enter)
- Color signals should not be only indicator (add text labels)
- Activity feed items should be proper list semantics

### Security
- Workspace IDs should be validated server-side
- User should only see workspaces they have access to
- Activity feed should filter events by user permissions
- Refresh tokens for session management

---

## Part 8: Success Criteria

✅ TopBar renders without errors
✅ Workspace switcher opens/closes correctly
✅ Workspace change triggers KPI refetch
✅ System Status shows correct state + auto-updates
✅ Activity Feed receives real-time events
✅ User can click through to drill-down details
✅ All interactions are smooth (< 100ms perceived latency)
✅ Mobile responsive (stacks appropriately)
✅ Keyboard navigation works
✅ No console errors or warnings
✅ All API calls return expected data shapes
✅ Dropdowns close on Escape key press

---

## Part 9: Future Enhancements

- Advanced filtering in Activity Feed (by event type, vessel, region)
- Customizable workspace quick-access shortcuts
- System status predictions (ML-based risk forecasting)
- Activity feed personalization (show only relevant events)
- Dark/Light theme toggle in User Profile
- Slack/email integration for critical alerts
- Audit logging for all workspace changes
- Multi-select operations on Activity Feed

---

## Status: Ready for Implementation
All specifications are finalized and locked. Components can now be built following this architecture.
