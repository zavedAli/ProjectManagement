# Feature Testing Checklist

## 🧪 Complete Testing Guide

Use this checklist to verify all new features are working correctly.

---

## 1. Drag & Drop Kanban Board

### Basic Functionality
- [ ] Can drag a task from "Todo" to "In Progress"
- [ ] Can drag a task from "In Progress" to "Done"
- [ ] Can drag a task from "Done" back to "In Progress"
- [ ] Task card shows visual feedback during drag (opacity change)
- [ ] Drag overlay appears when dragging
- [ ] Column highlights when hovering over it during drag

### Edge Cases
- [ ] Cannot drag outside the board area
- [ ] Dropping on same column works correctly
- [ ] Multiple rapid drags don't cause errors
- [ ] Task position updates in database (check by refreshing page)
- [ ] Optimistic update works (UI updates immediately)
- [ ] Rollback works if server request fails

### UI/UX
- [ ] Smooth animations during drag
- [ ] Cursor changes to grab/grabbing
- [ ] No layout shift when dragging
- [ ] Works on mobile/tablet (touch events)

---

## 2. Rich Text Editor

### Basic Formatting
- [ ] Bold button works (select text, click B)
- [ ] Italic button works (select text, click I)
- [ ] Bullet list button works
- [ ] Numbered list button works
- [ ] Heading 2 button works

### Content Persistence
- [ ] Formatted text saves to database
- [ ] Formatted text displays correctly after page refresh
- [ ] HTML is properly sanitized (no XSS vulnerabilities)
- [ ] Empty editor shows placeholder text

### Edge Cases
- [ ] Can paste formatted text from Word/Google Docs
- [ ] Can undo/redo formatting (Ctrl+Z / Ctrl+Y)
- [ ] Long text doesn't break layout
- [ ] Special characters render correctly
- [ ] Line breaks are preserved

### UI/UX
- [ ] Toolbar buttons highlight when active
- [ ] Editor has focus indicator
- [ ] Minimum height is maintained
- [ ] Scrolls properly with long content

---

## 3. Workspace Invitations

### Sending Invitations
- [ ] Can open invitation form
- [ ] Email validation works (invalid emails rejected)
- [ ] Can select role (Member/Admin)
- [ ] "Send Invitation" button shows loading state
- [ ] Success message appears after sending
- [ ] Invitation appears in pending list
- [ ] Email is received (check inbox/spam)

### Email Content
- [ ] Email contains workspace name
- [ ] Email contains invitation link
- [ ] Link includes unique token
- [ ] Email mentions expiration (7 days)
- [ ] Email is properly formatted (HTML)

### Accepting Invitations
- [ ] Clicking link opens acceptance page
- [ ] Loading spinner appears
- [ ] Success message shows workspace name
- [ ] Redirects to dashboard after 2 seconds
- [ ] User is added to workspace members
- [ ] Invitation is removed from pending list

### Revoking Invitations
- [ ] Can click "Revoke" button
- [ ] Invitation is removed from list
- [ ] Revoked link no longer works
- [ ] Error message shown if trying to use revoked link

### Edge Cases
- [ ] Cannot invite existing member (error shown)
- [ ] Cannot invite same email twice
- [ ] Expired invitation shows error
- [ ] Invalid token shows error
- [ ] Must be logged in to accept invitation
- [ ] Email must match logged-in user

---

## 4. Infinite Scroll

### Basic Functionality
- [ ] Initial load shows first 20 tasks
- [ ] "Load More" button appears if more tasks exist
- [ ] Clicking "Load More" loads next 20 tasks
- [ ] Button shows loading state while fetching
- [ ] Button disappears when all tasks loaded
- [ ] Previously loaded tasks remain visible

### Performance
- [ ] No duplicate tasks appear
- [ ] Scroll position is maintained after loading
- [ ] Loading is smooth (no janky animations)
- [ ] Works with search/filter

### Edge Cases
- [ ] Works with less than 20 tasks (no button shown)
- [ ] Works with exactly 20 tasks
- [ ] Works with 100+ tasks
- [ ] Network error shows error message
- [ ] Can retry after error

---

## 5. File Attachments

### Uploading Files
- [ ] Can click "Upload File" button
- [ ] File picker opens
- [ ] Can select image file (jpg, png, gif)
- [ ] Can select PDF file
- [ ] Can select document (doc, docx)
- [ ] Upload button shows "Uploading..." state
- [ ] Progress indicator appears (if implemented)
- [ ] Success message after upload
- [ ] File appears in attachments list

### Displaying Attachments
- [ ] Filename is displayed correctly
- [ ] File size is shown (KB/MB)
- [ ] File count is accurate
- [ ] Download link works (opens in new tab)
- [ ] Thumbnail shown for images (if implemented)

### Deleting Attachments
- [ ] Can click "Delete" button
- [ ] Confirmation dialog appears (if implemented)
- [ ] File is removed from list
- [ ] File is deleted from Cloudinary
- [ ] Activity log shows deletion

### File Validation
- [ ] Files over 10MB are rejected
- [ ] Invalid file types are rejected (.exe, .bat, etc.)
- [ ] Error message shown for invalid files
- [ ] Multiple files can be uploaded sequentially

### Edge Cases
- [ ] Empty file name handled gracefully
- [ ] Special characters in filename work
- [ ] Very long filenames are truncated
- [ ] Network error during upload shows error
- [ ] Can retry failed upload

---

## 6. Integration Tests

### Drag & Drop + Rich Text
- [ ] Can drag task with rich text description
- [ ] Rich text preserved after drag
- [ ] Description displays correctly in all columns

### Attachments + Drag & Drop
- [ ] Can drag task with attachments
- [ ] Attachment count preserved after drag
- [ ] Attachments still accessible after drag

### Invitations + Attachments
- [ ] New member can see existing attachments
- [ ] New member can upload attachments
- [ ] New member can delete own attachments

### Infinite Scroll + Search
- [ ] Search works with infinite scroll
- [ ] Pagination resets when searching
- [ ] "Load More" works with search results

---

## 7. Performance Tests

### Load Time
- [ ] Initial page load < 2 seconds
- [ ] Drag operation feels instant
- [ ] Rich text editor loads quickly
- [ ] File upload starts immediately

### Memory Usage
- [ ] No memory leaks after 10+ drags
- [ ] No memory leaks after 10+ file uploads
- [ ] Browser doesn't slow down over time

### Network
- [ ] Works on slow 3G connection
- [ ] Optimistic updates work offline (then sync)
- [ ] Failed requests show error messages
- [ ] Retry mechanism works

---

## 8. Security Tests

### File Upload Security
- [ ] Cannot upload .exe files
- [ ] Cannot upload .sh/.bat scripts
- [ ] File size limit enforced server-side
- [ ] Uploaded files are scanned (if implemented)

### Invitation Security
- [ ] Cannot accept invitation for different email
- [ ] Expired tokens are rejected
- [ ] Used tokens cannot be reused
- [ ] Token is cryptographically secure (32+ bytes)

### Authorization
- [ ] Cannot upload to other workspace's tasks
- [ ] Cannot delete other user's attachments (if restricted)
- [ ] Cannot send invitations without permission
- [ ] Cannot access invitation tokens directly

---

## 9. Browser Compatibility

Test in multiple browsers:

### Chrome/Edge
- [ ] All features work
- [ ] No console errors
- [ ] Drag & drop smooth

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Drag & drop smooth

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Drag & drop smooth

### Mobile Browsers
- [ ] Touch drag works on iOS Safari
- [ ] Touch drag works on Android Chrome
- [ ] File upload works on mobile
- [ ] Rich text editor works on mobile

---

## 10. Accessibility Tests

### Keyboard Navigation
- [ ] Can tab through drag handles
- [ ] Can use arrow keys to move tasks (if implemented)
- [ ] Can tab through rich text toolbar
- [ ] Can use keyboard shortcuts in editor

### Screen Readers
- [ ] Drag & drop announces state changes
- [ ] Rich text toolbar has ARIA labels
- [ ] File upload has descriptive labels
- [ ] Error messages are announced

### Visual
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] Works with 200% zoom
- [ ] Works with dark mode (if implemented)

---

## 📊 Test Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Drag & Drop | ⬜ | |
| Rich Text Editor | ⬜ | |
| Workspace Invitations | ⬜ | |
| Infinite Scroll | ⬜ | |
| File Attachments | ⬜ | |
| Integration | ⬜ | |
| Performance | ⬜ | |
| Security | ⬜ | |
| Browser Compat | ⬜ | |
| Accessibility | ⬜ | |

**Legend**: ✅ Pass | ❌ Fail | ⚠️ Partial | ⬜ Not Tested

---

## 🐛 Bug Report Template

If you find issues, document them like this:

```
**Feature**: [e.g., Drag & Drop]
**Issue**: [Brief description]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Browser**: [Chrome 120, Firefox 121, etc.]
**Screenshot**: [If applicable]
```

---

## ✅ Sign-off

- [ ] All critical features tested
- [ ] All bugs documented
- [ ] Performance is acceptable
- [ ] Security checks passed
- [ ] Ready for production

**Tested by**: _______________  
**Date**: _______________  
**Version**: _______________
