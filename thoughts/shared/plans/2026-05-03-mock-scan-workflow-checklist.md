# Mock Scan Workflow - Testing Checklist

## Pre-Testing Setup
- [ ] Run `npm run dev` and open http://localhost:5173
- [ ] Open browser DevTools > Application > Local Storage
- [ ] Clear any existing `sentinelscan_scans` data

## Test 1: Full Scan Lifecycle
1. [ ] Navigate to `/dashboard/scans/new`
2. [ ] Fill in form:
   - Target: `192.168.1.0/24`
   - Scan Type: `Web Application Scan`
   - Profile: `Standard`
   - Enable credentials (optional)
3. [ ] Click "Launch Scan"
4. [ ] Verify: Redirected to `/dashboard/scans/scan-XXXX/progress`
5. [ ] Verify: Progress page shows:
   - [ ] Scan target and ID in header
   - [ ] "Queued" status badge
   - [ ] Terminal log showing "Scan queued..."
   - [ ] Progress bar at 0%
6. [ ] Wait for "Initializing" phase (2s)
   - [ ] Verify: Status changes to "Initializing"
   - [ ] Verify: Log shows target resolution, template loading
7. [ ] Wait for "Discovering" phase (4s)
   - [ ] Verify: Hosts appear in stats panel
   - [ ] Verify: Log shows "FOUND Host ..." messages
8. [ ] Wait for "Scanning" phase (8s)
   - [ ] Verify: Progress bar animates from 30% to 90%
   - [ ] Verify: Findings appear in real-time
   - [ ] Verify: Stats update (vulns count increases)
9. [ ] Wait for "Analyzing" phase (2s)
   - [ ] Verify: Status changes to "Analyzing"
10. [ ] Wait for "Completed" phase
    - [ ] Verify: Status changes to "Completed"
    - [ ] Verify: Progress bar at 100%
    - [ ] Verify: "Redirecting..." message appears
    - [ ] Verify: Auto-redirects to `/dashboard/scans/scan-XXXX` after 3s
    - [ ] OR click "View Results Now" button

## Test 2: ScanDetail Page
1. [ ] After redirect from progress page
2. [ ] Verify: ScanDetail shows:
   - [ ] Correct target, scan type, profile
   - [ ] Status badge shows "Completed"
   - [ ] Summary cards show correct counts
   - [ ] Hosts table lists all discovered hosts
   - [ ] Vulnerabilities table lists all findings sorted by severity
3. [ ] Click on a vulnerability row
   - [ ] Verify: Navigates to result detail page

## Test 3: AllScans Integration
1. [ ] Navigate to `/dashboard/scans/all`
2. [ ] Verify: Newly created scan appears in the table
3. [ ] Verify: Status shows "completed" (or current status)
4. [ ] Verify: Click on scan row navigates to detail/progress appropriately
5. [ ] Create another scan with different type:
   - [ ] Target: `example.com`
   - [ ] Scan Type: `Basic Network Scan`
6. [ ] Verify: Two scans now appear in AllScans
7. [ ] Test filter tabs:
   - [ ] Click "Running" tab (if scan still running)
   - [ ] Click "Completed" tab
   - [ ] Click "All" tab

## Test 4: Persistence (Page Refresh)
1. [ ] While scan is running (or after completion)
2. [ ] Refresh the page (F5)
3. [ ] Verify: Scan state is preserved
4. [ ] If was running, verify: Progress page shows current state
5. [ ] Navigate to AllScans
6. [ ] Verify: All scans still appear after refresh

## Test 5: Different Scan Types
Test each scan type and verify different findings:

1. [ ] **Web Application Scan** (`web`)
   - [ ] Verify: XSS, SQLi, CSRF findings appear
2. [ ] **Basic Network Scan** (`basic`)
   - [ ] Verify: Open services, weak ciphers findings
3. [ ] **Credentialed Scan** (`credentialed`)
   - [ ] Verify: Patch management, permission findings
4. [ ] **Compliance Audit** (`compliance`)
   - [ ] Verify: CIS, PCI-DSS findings
5. [ ] **Host Discovery** (`discovery`)
   - [ ] Verify: Host list, port scan findings

## Test 6: Multiple Concurrent Scans
1. [ ] Open two browser tabs
2. [ ] Launch scan in Tab 1
3. [ ] Launch scan in Tab 2
4. [ ] Verify: Both scans appear in AllScans
5. [ ] Verify: Each progress page shows correct scan

## Test 7: Edge Cases
1. [ ] Navigate to `/dashboard/scans/nonexistent-id`
   - [ ] Verify: "Scan Not Found" message appears
2. [ ] Navigate to `/dashboard/scans/nonexistent-id/progress`
   - [ ] Verify: "Scan Not Found" message appears
3. [ ] Create scan with URL target: `https://example.com`
   - [ ] Verify: Scan handles URL correctly
4. [ ] Create scan with hostname: `test.local`
   - [ ] Verify: Scan handles hostname correctly

## Test 8: localStorage
1. [ ] Open DevTools > Application > Local Storage
2. [ ] Verify: `sentinelscan_scans` key exists
3. [ ] Verify: Value is valid JSON array
4. [ ] Verify: Scan data includes all fields (id, target, status, etc.)

## Performance Checks
- [ ] Terminal log auto-scrolls smoothly
- [ ] Progress bar animation is smooth
- [ ] Phase timeline updates correctly
- [ ] No console errors during simulation

## Cleanup
- [ ] Clear localStorage after testing
- [ ] Verify: AllScans shows empty state
