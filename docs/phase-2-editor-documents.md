# Phase 2: Core Editor & Document Management

*Building the TipTap-powered writing interface and document management system*

---

## **Overview**

This phase implements the core writing experience using TipTap editor and establishes the document management system. Users will be able to create, edit, save, and manage their writing documents with a rich text editing experience.

**Timeline:** Day 1-2 (10-12 hours)

**Dependencies:** Phase 1 (Foundation & Authentication)

**Deliverables:**
- Fully functional TipTap rich text editor
- Document CRUD operations
- Auto-save functionality
- Document library and management
- Real-time document status indicators

---

## **Frontend Tasks**

### **1. TipTap Editor Setup**
- [ ] Install TipTap dependencies:
  - [ ] `@tiptap/react`
  - [ ] `@tiptap/starter-kit`
  - [ ] `@tiptap/extension-highlight`
  - [ ] `@tiptap/extension-character-count`
  - [ ] `@tiptap/extension-placeholder`
  - [ ] `@tiptap/extension-focus`
- [ ] Configure base editor with essential extensions
- [ ] Set up editor styling with Material Design 3 theme
- [ ] Implement responsive editor layout (60-70% screen width)

### **2. Editor Component Architecture**
- [ ] Create base `Editor` organism component (`components/organisms/editor/`)
- [ ] Build editor toolbar molecules:
  - [ ] `EditorToolbar` with formatting buttons
  - [ ] `DocumentTitle` editable component
  - [ ] `DocumentStatus` indicator (saved/saving/error)
  - [ ] `WordCount` and reading time display
- [ ] Implement editor atoms:
  - [ ] `ToolbarButton` for editor actions
  - [ ] `StatusBadge` for document states
  - [ ] `EditorMenu` for format options

### **3. Rich Text Features**
- [ ] Implement basic formatting:
  - [ ] Bold, italic, underline text formatting
  - [ ] Heading levels (H1, H2, H3)
  - [ ] Bullet points and numbered lists
  - [ ] Blockquotes
  - [ ] Code blocks and inline code
- [ ] Add advanced formatting:
  - [ ] Text alignment (left, center, right)
  - [ ] Link insertion and editing
  - [ ] Horizontal rules
  - [ ] Hard breaks and soft breaks
- [ ] Configure placeholder text for empty documents
- [ ] Implement focus management and keyboard shortcuts

### **4. Document Management UI**
- [ ] Create `DocumentList` organism for document library
- [ ] Build document list molecules:
  - [ ] `DocumentCard` for individual documents
  - [ ] `DocumentGrid` for grid layout view
  - [ ] `DocumentTable` for list layout view
  - [ ] `DocumentSearch` for filtering documents
- [ ] Implement document action atoms:
  - [ ] `CreateDocumentButton` (FAB and toolbar)
  - [ ] `DocumentActions` dropdown (edit, delete, share)
  - [ ] `ViewToggle` for grid/list layouts
  - [ ] `SortSelector` for document ordering

### **5. Document Dashboard**
- [ ] Create dashboard layout template
- [ ] Implement dashboard sections:
  - [ ] Recent documents section
  - [ ] Quick actions panel
  - [ ] Writing goals progress
  - [ ] Document statistics overview
- [ ] Add empty states for new users
- [ ] Implement responsive dashboard for mobile devices

### **6. Document Editor Page**
- [ ] Create editor layout template (`templates/editor-layout/`)
- [ ] Implement editor page structure:
  - [ ] Header with document title and actions
  - [ ] Main editor area with TipTap
  - [ ] Sidebar placeholder for future AI suggestions
  - [ ] Footer with document statistics
- [ ] Add keyboard shortcuts for common actions:
  - [ ] Ctrl+S for save
  - [ ] Ctrl+B for bold
  - [ ] Ctrl+I for italic
  - [ ] Ctrl+Z/Y for undo/redo

### **7. Document State Management**
- [ ] Create document Zustand store (`stores/document-store.ts`):
  - [ ] Active document state
  - [ ] Document list state
  - [ ] Loading and error states
  - [ ] Auto-save queue management
- [ ] Implement document hooks:
  - [ ] `useDocument` for individual document management
  - [ ] `useDocumentList` for document library
  - [ ] `useAutoSave` for automatic saving
  - [ ] `useDocumentStatus` for save status tracking

### **8. Document Import/Export**
- [ ] Implement document import functionality:
  - [ ] File upload component
  - [ ] Support for .txt files
  - [ ] Support for .docx files (using mammoth.js)
  - [ ] Progress indicators for file processing
- [ ] Add document export options:
  - [ ] Export as .txt
  - [ ] Export as .pdf (basic implementation)
  - [ ] Export as .docx (future enhancement)
- [ ] Create import/export UI molecules

---

## **Backend Tasks**

### **1. Firestore Document Schema**
- [ ] Design document data structure:
  ```javascript
  documents/{documentId}
    - title: string
    - content: string (HTML from TipTap)
    - userId: string
    - createdAt: timestamp
    - updatedAt: timestamp
    - wordCount: number
    - characterCount: number
    - readingTime: number
    - status: 'draft' | 'published'
    - tags: string[]
    - isPublic: boolean
  ```
- [ ] Set up Firestore indexes for document queries
- [ ] Configure security rules for document access

### **2. Document Service Layer**
- [ ] Implement document service (`services/firebase/documents.ts`):
  - [ ] `createDocument()` - Create new document
  - [ ] `getDocument(id)` - Retrieve single document
  - [ ] `getUserDocuments(userId)` - Get all user documents
  - [ ] `updateDocument(id, data)` - Update document content
  - [ ] `deleteDocument(id)` - Delete document
  - [ ] `searchDocuments(query)` - Search user documents
- [ ] Add document validation schemas
- [ ] Implement proper error handling and retries

### **3. Real-time Document Sync**
- [ ] Set up Firestore real-time listeners:
  - [ ] Document content synchronization
  - [ ] Document list updates
  - [ ] Conflict resolution for simultaneous edits
- [ ] Implement offline persistence:
  - [ ] Cache documents for offline access
  - [ ] Queue updates when offline
  - [ ] Sync changes when back online
- [ ] Add connection status monitoring

### **4. Auto-save Implementation**
- [ ] Create auto-save service (`services/documents/auto-save.ts`):
  - [ ] Debounced save (3-second delay after typing stops)
  - [ ] Manual save on Ctrl+S
  - [ ] Save before navigation away
  - [ ] Queue saves when offline
- [ ] Implement save status tracking:
  - [ ] "Saving..." indicator during saves
  - [ ] "Saved" confirmation with timestamp
  - [ ] Error handling for failed saves
- [ ] Add save conflict resolution

### **5. Document Security Rules**
- [ ] Implement comprehensive Firestore rules:
  ```javascript
  // Users can only access their own documents
  match /documents/{documentId} {
    allow read, write: if request.auth != null 
      && request.auth.uid == resource.data.userId;
    
    // Validate document structure
    allow create: if request.auth != null 
      && request.resource.data.userId == request.auth.uid
      && request.resource.data.keys().hasAll(['title', 'content', 'createdAt']);
    
    // Ensure users can't change document ownership
    allow update: if request.auth != null 
      && request.auth.uid == resource.data.userId
      && request.resource.data.userId == resource.data.userId;
  }
  ```
- [ ] Add rate limiting for document operations
- [ ] Implement data validation on the backend

### **6. Document Processing Services**
- [ ] Create document processor service (`services/storage/document-processor.ts`):
  - [ ] Text extraction from uploaded files
  - [ ] Word count and character count calculations
  - [ ] Reading time estimation
  - [ ] HTML sanitization for TipTap content
- [ ] Implement file upload handling:
  - [ ] File size validation (max 10MB)
  - [ ] File type validation
  - [ ] Virus scanning (placeholder)
  - [ ] Progress tracking for uploads

### **7. Document Analytics**
- [ ] Track document-related events:
  - [ ] Document creation
  - [ ] Document updates
  - [ ] Save frequency
  - [ ] Time spent editing
  - [ ] Word count progress
- [ ] Implement document usage metrics:
  - [ ] Daily writing streaks
  - [ ] Average session length
  - [ ] Most productive times
  - [ ] Document completion rates

---

## **Testing & Quality Assurance**

### **Frontend Testing**
- [ ] Test TipTap editor functionality:
  - [ ] Text formatting operations
  - [ ] Keyboard shortcuts
  - [ ] Copy/paste behavior
  - [ ] Undo/redo functionality
- [ ] Test document management UI:
  - [ ] Document creation flow
  - [ ] Document list rendering
  - [ ] Search and filter operations
  - [ ] Responsive behavior
- [ ] Test auto-save functionality:
  - [ ] Save after typing stops
  - [ ] Manual save operations
  - [ ] Offline behavior
  - [ ] Error recovery

### **Backend Testing**
- [ ] Test document CRUD operations:
  - [ ] Create documents with validation
  - [ ] Read documents with proper permissions
  - [ ] Update documents with conflict resolution
  - [ ] Delete documents with cleanup
- [ ] Test real-time synchronization:
  - [ ] Multiple browser tabs
  - [ ] Offline/online scenarios
  - [ ] Concurrent user editing
- [ ] Test security rules:
  - [ ] Unauthorized access attempts
  - [ ] Data validation enforcement
  - [ ] Cross-user data access prevention

### **Integration Testing**
- [ ] Test complete document workflows:
  - [ ] Create → Edit → Save → Retrieve
  - [ ] Import → Process → Edit → Export
  - [ ] Search → Filter → Sort → Access
- [ ] Test error scenarios:
  - [ ] Network failures during save
  - [ ] Large document handling
  - [ ] Concurrent edit conflicts
- [ ] Test performance with large documents:
  - [ ] 10,000+ word documents
  - [ ] Multiple documents open
  - [ ] Rapid typing and formatting

---

## **Performance Optimization**

### **Editor Performance**
- [ ] Implement efficient re-rendering:
  - [ ] Memoize editor components
  - [ ] Debounce editor updates
  - [ ] Lazy load editor extensions
- [ ] Optimize large document handling:
  - [ ] Virtual scrolling for very long documents
  - [ ] Progressive loading of document content
  - [ ] Efficient diff algorithms for changes

### **Document Loading**
- [ ] Implement smart loading strategies:
  - [ ] Pagination for document lists
  - [ ] Lazy loading of document previews
  - [ ] Caching of frequently accessed documents
- [ ] Optimize bundle size:
  - [ ] Code splitting for editor components
  - [ ] Dynamic imports for document processing
  - [ ] Tree shaking for unused TipTap extensions

### **Database Optimization**
- [ ] Optimize Firestore queries:
  - [ ] Compound indexes for complex queries
  - [ ] Pagination for large document lists
  - [ ] Field selection to minimize data transfer
- [ ] Implement efficient caching:
  - [ ] Local storage for document metadata
  - [ ] Memory caching for active documents
  - [ ] Service worker caching for offline access

---

## **Success Criteria**

### **Functional Requirements**
- [ ] Users can create new documents successfully
- [ ] Rich text editing works smoothly with all formatting options
- [ ] Documents save automatically without user intervention
- [ ] Document library displays all user documents correctly
- [ ] Search and filter functionality works accurately
- [ ] Import/export functionality processes files correctly
- [ ] Real-time sync works across multiple browser tabs
- [ ] Offline editing continues with sync on reconnection

### **Performance Requirements**
- [ ] Editor loads and becomes interactive within 2 seconds
- [ ] Typing lag is imperceptible (< 16ms input delay)
- [ ] Auto-save completes within 1 second
- [ ] Document list loads within 3 seconds
- [ ] Large documents (10,000+ words) remain responsive
- [ ] File imports complete within 10 seconds for typical documents

### **User Experience Requirements**
- [ ] Editor interface is intuitive and distraction-free
- [ ] Document status is always clearly visible
- [ ] Error states provide helpful guidance
- [ ] Keyboard shortcuts work consistently
- [ ] Mobile editing experience is fully functional
- [ ] Theme switching preserves editor state

### **Technical Requirements**
- [ ] All document operations respect security rules
- [ ] Data validation prevents malformed documents
- [ ] Error handling gracefully recovers from failures
- [ ] Real-time listeners clean up properly
- [ ] Memory usage remains stable during long editing sessions
- [ ] Code follows established architectural patterns

---

## **Phase 2 Completion Checklist**

Before moving to Phase 3, ensure:
- [ ] TipTap editor is fully functional with all required features
- [ ] Document CRUD operations work reliably
- [ ] Auto-save functionality operates correctly
- [ ] Document library provides complete management capabilities
- [ ] Real-time synchronization handles edge cases
- [ ] Import/export functionality processes common file types
- [ ] Performance meets all specified requirements
- [ ] Security rules protect all document operations
- [ ] Error handling covers all failure scenarios
- [ ] Mobile experience is fully responsive and functional

---

**Previous Phase:** [Phase 1: Foundation & Authentication](./phase-1-foundation-auth.md)
**Next Phase:** [Phase 3: Grammar & Spell Checking](./phase-3-grammar-spell-check.md) 