# WordWise AI - Tech Stack Rules & Best Practices

*Comprehensive guidelines, best practices, and conventions for our chosen technology stack*

---

## **Table of Contents**
1. [React + TypeScript](#react--typescript)
2. [Shadcn + Tailwind CSS](#shadcn--tailwind-css)
3. [Firebase Ecosystem](#firebase-ecosystem)
4. [Vite Build Tool](#vite-build-tool)
5. [State Management (Zustand + SWR)](#state-management-zustand--swr)
6. [TipTap Rich Text Editor](#tiptap-rich-text-editor)
7. [AI Integration (OpenAI)](#ai-integration-openai)
8. [Testing Stack](#testing-stack)
9. [Document Processing](#document-processing)
10. [Analytics & Monitoring](#analytics--monitoring)
11. [Email Services](#email-services)
12. [Grammar API](#grammar-api)

---

## **React + TypeScript**

### **✅ Best Practices**

#### **Component Structure**
```typescript
// ✅ GOOD: Functional components with proper typing
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  onClick, 
  disabled 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

#### **Hook Usage**
```typescript
// ✅ GOOD: Custom hooks with proper typing
export const useDocumentEditor = (documentId: string) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Implementation...
  
  return { content, setContent, isLoading, error };
};
```

### **❌ Common Pitfalls**

#### **Avoid Any Types**
```typescript
// ❌ BAD: Using 'any' defeats TypeScript purpose
const handleData = (data: any) => {
  // Type safety lost
};

// ✅ GOOD: Proper typing
interface ApiResponse {
  success: boolean;
  data: Document[];
  message?: string;
}

const handleData = (data: ApiResponse) => {
  // Type safety maintained
};
```

#### **State Updates**
```typescript
// ❌ BAD: Direct state mutation
const updateDocument = () => {
  document.title = 'New Title'; // Don't mutate directly
  setDocument(document);
};

// ✅ GOOD: Immutable updates
const updateDocument = () => {
  setDocument(prev => ({
    ...prev,
    title: 'New Title'
  }));
};
```

### **🔧 Performance Rules**

1. **Use React.memo for expensive components**
2. **Implement useMemo for expensive calculations**
3. **Use useCallback for event handlers passed to children**
4. **Avoid creating objects/functions in render**

### **📝 Conventions**

- Component files: `PascalCase.tsx`
- Hook files: `use-kebab-case.ts`
- Utility files: `kebab-case.ts`
- Always export components as named exports
- Use functional components exclusively

---

## **Shadcn + Tailwind CSS**

### **✅ Best Practices**

#### **Component Composition**
```typescript
// ✅ GOOD: Compose Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DocumentCard = ({ document }: { document: Document }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{document.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{document.description}</p>
        <Button className="mt-4">Edit Document</Button>
      </CardContent>
    </Card>
  );
};
```

#### **Tailwind Utility Organization**
```typescript
// ✅ GOOD: Group related utilities
<div className={cn(
  // Layout
  "flex items-center justify-between p-4",
  // Appearance
  "bg-white border rounded-lg shadow-sm",
  // States
  "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary",
  // Responsive
  "sm:p-6 md:p-8"
)}>
```

### **❌ Common Pitfalls**

#### **Don't Override Shadcn Styles Directly**
```typescript
// ❌ BAD: Overriding Shadcn component styles
<Button className="bg-red-500 text-white"> // Conflicts with Shadcn theme

// ✅ GOOD: Use Shadcn variants or create custom component
<Button variant="destructive">
```

#### **Avoid Arbitrary Values When Possible**
```typescript
// ❌ BAD: Arbitrary values should be last resort
<div className="w-[347px] h-[123px]">

// ✅ GOOD: Use design system values
<div className="w-80 h-32">
```

### **🎨 Design System Rules**

1. **Always use design tokens from Shadcn theme**
2. **Stick to spacing scale (1, 2, 3, 4, 6, 8, 12, 16, 20, 24...)**
3. **Use semantic color names (primary, secondary, destructive, muted)**
4. **Follow mobile-first responsive design**

### **📱 Responsive Guidelines**

- Default: Mobile (320px+)
- `sm:` Tablet (640px+)
- `md:` Desktop (768px+)
- `lg:` Large Desktop (1024px+)
- `xl:` Extra Large (1280px+)

---

## **Firebase Ecosystem**

### **✅ Best Practices**

#### **Firestore Security Rules**
```javascript
// ✅ GOOD: Proper security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own documents
    match /documents/{documentId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Public read for shared documents
    match /shared-documents/{documentId} {
      allow read: if resource.data.isPublic == true;
      allow write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

#### **Firestore Data Modeling**
```typescript
// ✅ GOOD: Flat data structure
interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
  collaborators: string[]; // Array of user IDs
}

// ✅ GOOD: Subcollections for related data
// /documents/{docId}/suggestions/{suggestionId}
interface AISuggestion {
  id: string;
  type: 'grammar' | 'style' | 'clarity';
  originalText: string;
  suggestedText: string;
  position: { start: number; end: number };
  confidence: number;
  createdAt: Timestamp;
}
```

#### **Firebase Functions Best Practices**
```typescript
// ✅ GOOD: Proper function structure
import { https, region } from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';

export const processAIRequest = region('us-central1')
  .https
  .onCall(async (request) => {
    // Validate authentication
    if (!request.auth) {
      throw new https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    // Validate input
    const { text, analysisType } = request.data;
    if (!text || !analysisType) {
      throw new https.HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
      // Process with OpenAI
      const result = await analyzeText(text, analysisType);
      
      // Log for monitoring
      console.log(`AI analysis completed for user: ${request.auth.uid}`);
      
      return { success: true, result };
    } catch (error) {
      console.error('AI processing failed:', error);
      throw new https.HttpsError('internal', 'Processing failed');
    }
  });
```

### **❌ Common Pitfalls**

#### **Firestore Query Limitations**
```typescript
// ❌ BAD: Can't query on multiple fields without composite index
const badQuery = query(
  collection(db, 'documents'),
  where('userId', '==', userId),
  where('createdAt', '>', yesterday),
  orderBy('title') // This requires a composite index
);

// ✅ GOOD: Query with proper indexing
const goodQuery = query(
  collection(db, 'documents'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(10)
);
```

#### **Real-time Listener Management**
```typescript
// ❌ BAD: Not cleaning up listeners
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, 'documents', docId), (doc) => {
    setDocument(doc.data());
  });
  // Missing cleanup!
}, [docId]);

// ✅ GOOD: Proper cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, 'documents', docId), (doc) => {
    setDocument(doc.data());
  });
  
  return () => unsubscribe(); // Clean up listener
}, [docId]);
```

### **💰 Cost Optimization**

1. **Use pagination with `limit()` and `startAfter()`**
2. **Cache frequently accessed data**
3. **Use offline persistence to reduce reads**
4. **Batch writes when possible**
5. **Avoid real-time listeners for static data**

### **🔒 Security Rules**

- Always validate `request.auth` for protected data
- Use resource-based permissions
- Implement field-level security
- Test rules thoroughly before deployment

---

## **Vite Build Tool**

### **✅ Best Practices**

#### **Vite Configuration**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'editor': ['@tiptap/react', '@tiptap/starter-kit'],
          'ai-processing': ['openai'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Firebase emulator
        changeOrigin: true,
      },
    },
  },
});
```

### **📦 Bundle Optimization**

#### **Dynamic Imports for Large Libraries**
```typescript
// ✅ GOOD: Lazy load heavy libraries
const DocumentProcessor = lazy(() => import('@/components/DocumentProcessor'));

// ✅ GOOD: Dynamic imports for conditional features
const loadPDFProcessor = async () => {
  const { PDFDocument } = await import('pdf-lib');
  return PDFDocument;
};
```

### **🚀 Performance Rules**

1. **Use Vite's built-in code splitting**
2. **Leverage tree-shaking with ES modules**
3. **Optimize images with `?url` and `?inline`**
4. **Use Vite's dependency pre-bundling**

---

## **State Management (Zustand + SWR)**

### **✅ Best Practices**

#### **Zustand Store Structure**
```typescript
// ✅ GOOD: Separate stores by domain
interface EditorState {
  activeDocument: Document | null;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  selectedText: string;
  aiSuggestions: AISuggestion[];
}

interface EditorActions {
  setActiveDocument: (doc: Document) => void;
  toggleEditing: () => void;
  setSelectedText: (text: string) => void;
  addAISuggestion: (suggestion: AISuggestion) => void;
  clearSuggestions: () => void;
}

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  // State
  activeDocument: null,
  isEditing: false,
  hasUnsavedChanges: false,
  selectedText: '',
  aiSuggestions: [],

  // Actions
  setActiveDocument: (doc) => set({ activeDocument: doc, hasUnsavedChanges: false }),
  toggleEditing: () => set(state => ({ isEditing: !state.isEditing })),
  setSelectedText: (text) => set({ selectedText: text }),
  addAISuggestion: (suggestion) => 
    set(state => ({ 
      aiSuggestions: [...state.aiSuggestions, suggestion] 
    })),
  clearSuggestions: () => set({ aiSuggestions: [] }),
}));
```

#### **SWR Data Fetching**
```typescript
// ✅ GOOD: Custom SWR hooks
export const useDocument = (documentId: string) => {
  return useSWR(
    documentId ? ['document', documentId] : null,
    () => getDocument(documentId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      dedupingInterval: 60000, // 1 minute
    }
  );
};

export const useUserDocuments = (userId: string) => {
  return useSWR(
    userId ? ['documents', userId] : null,
    () => getUserDocuments(userId),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );
};
```

### **❌ Common Pitfalls**

#### **Zustand Store Size**
```typescript
// ❌ BAD: One massive store
interface AppState {
  // User data
  user: User;
  // Editor data
  documents: Document[];
  // UI state
  modals: ModalState;
  // Analytics
  analytics: AnalyticsData;
  // Everything in one store!
}

// ✅ GOOD: Multiple focused stores
const useUserStore = create<UserState>(...);
const useEditorStore = create<EditorState>(...);
const useUIStore = create<UIState>(...);
```

### **🔄 State Synchronization Rules**

1. **Use Zustand for client-side state only**
2. **Use SWR for all server state**
3. **Never duplicate server state in Zustand**
4. **Keep stores small and focused**

---

## **TipTap Rich Text Editor**

### **✅ Best Practices**

#### **Editor Configuration**
```typescript
// ✅ GOOD: Modular editor setup
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';

export const useDocumentEditor = (content: string, onUpdate: (content: string) => void) => {
  return useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 100, // Undo/redo depth
        },
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'ai-highlight',
        },
      }),
      CharacterCount.configure({
        limit: 50000,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });
};
```

#### **Custom Extensions for AI Highlighting**
```typescript
// ✅ GOOD: Custom extension for AI suggestions
import { Mark, mergeAttributes } from '@tiptap/core';

export const AISuggestion = Mark.create({
  name: 'aiSuggestion',
  
  addOptions() {
    return {
      HTMLAttributes: {},
      types: ['grammar', 'style', 'clarity'],
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'grammar',
        parseHTML: element => element.getAttribute('data-suggestion-type'),
        renderHTML: attributes => ({
          'data-suggestion-type': attributes.type,
        }),
      },
      suggestionId: {
        default: null,
        parseHTML: element => element.getAttribute('data-suggestion-id'),
        renderHTML: attributes => ({
          'data-suggestion-id': attributes.suggestionId,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-suggestion-type]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
```

### **❌ Common Pitfalls**

#### **Performance Issues**
```typescript
// ❌ BAD: Updating editor content too frequently
useEffect(() => {
  if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content); // Can cause infinite loops
  }
}, [content, editor]);

// ✅ GOOD: Debounced updates
const debouncedUpdate = useMemo(
  () => debounce((newContent: string) => {
    if (editor && newContent !== editor.getHTML()) {
      editor.commands.setContent(newContent);
    }
  }, 300),
  [editor]
);
```

### **🎯 AI Integration Rules**

1. **Use marks for highlighting suggestions**
2. **Store suggestion metadata in attributes**
3. **Implement click handlers for suggestion acceptance**
4. **Use transaction batching for multiple highlights**

---

## **AI Integration (OpenAI)**

### **✅ Best Practices**

#### **Firebase Function for AI Processing**
```typescript
// ✅ GOOD: Secure AI processing
import { https, region } from 'firebase-functions/v2';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeText = region('us-central1')
  .https
  .onCall(async (request) => {
    // Validate request
    if (!request.auth) {
      throw new https.HttpsError('unauthenticated', 'Authentication required');
    }

    const { text, analysisType, userContext } = request.data;

    // Rate limiting check
    const userId = request.auth.uid;
    const rateLimit = await checkRateLimit(userId);
    if (rateLimit.exceeded) {
      throw new https.HttpsError('resource-exhausted', 'Rate limit exceeded');
    }

    try {
      const prompt = buildPrompt(text, analysisType, userContext);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional writing assistant...'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      // Log usage for billing tracking
      await logAIUsage(userId, response.usage);

      return {
        suggestions: parseSuggestions(response.choices[0].message.content),
        usage: response.usage,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new https.HttpsError('internal', 'AI processing failed');
    }
  });
```

#### **Prompt Engineering**
```typescript
// ✅ GOOD: Structured prompts
const buildGrammarPrompt = (text: string, userLevel: string) => `
Context: User is ${userLevel} level writer
Task: Analyze the following text for grammar errors
Text: "${text}"

Please respond in JSON format:
{
  "suggestions": [
    {
      "type": "grammar",
      "position": {"start": 0, "end": 5},
      "original": "original text",
      "suggested": "corrected text",
      "explanation": "Brief explanation",
      "confidence": 0.95
    }
  ]
}
`;
```

### **❌ Common Pitfalls**

#### **Token Management**
```typescript
// ❌ BAD: Not counting tokens
const analyzeText = async (text: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: text }], // Could exceed token limit
  });
};

// ✅ GOOD: Token counting and chunking
import { encode } from 'gpt-tokenizer';

const analyzeText = async (text: string) => {
  const tokens = encode(text);
  
  if (tokens.length > 8000) { // Leave room for response
    throw new Error('Text too long for analysis');
  }

  // Process with OpenAI...
};
```

### **💰 Cost Optimization**

1. **Cache similar requests**
2. **Use appropriate model (GPT-3.5 vs GPT-4)**
3. **Implement rate limiting**
4. **Batch similar requests**
5. **Set max_tokens appropriately**

### **🔐 Security Rules**

- Never expose API keys to client
- Implement rate limiting per user
- Validate all inputs
- Log usage for monitoring
- Use Firebase Functions for all AI calls

---

## **Testing Stack**

### **✅ Best Practices**

#### **Vitest Configuration**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### **Component Testing**
```typescript
// ✅ GOOD: Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DocumentEditor } from '@/components/DocumentEditor';

describe('DocumentEditor', () => {
  const mockOnUpdate = vi.fn();
  
  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('should render editor with initial content', () => {
    render(
      <DocumentEditor 
        content="Initial content" 
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Initial content')).toBeInTheDocument();
  });

  it('should call onUpdate when content changes', async () => {
    render(
      <DocumentEditor 
        content="" 
        onUpdate={mockOnUpdate}
      />
    );
    
    const editor = screen.getByRole('textbox');
    fireEvent.input(editor, { target: { textContent: 'New content' } });
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('New content');
    });
  });
});
```

#### **E2E Testing with Playwright**
```typescript
// ✅ GOOD: E2E test structure
import { test, expect } from '@playwright/test';

test.describe('Document Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Login user
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');
    
    // Navigate to editor
    await page.goto('/editor/new');
  });

  test('should create and save document', async ({ page }) => {
    // Type in editor
    await page.fill('[data-testid=editor]', 'This is a test document');
    
    // Save document
    await page.click('[data-testid=save-button]');
    
    // Verify save success
    await expect(page.locator('[data-testid=save-status]')).toContainText('Saved');
  });
});
```

### **🧪 Testing Rules**

1. **Test user interactions, not implementation details**
2. **Use data-testid for stable selectors**
3. **Mock external dependencies (API calls, Firebase)**
4. **Test accessibility with @testing-library/jest-dom**
5. **Write integration tests for critical user flows**

---

## **Document Processing**

### **✅ Best Practices**

#### **Dynamic Import Strategy**
```typescript
// ✅ GOOD: Lazy load document processors
const DocumentUpload: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      let content: string;
      
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const { convertToHtml } = await import('mammoth');
        const result = await convertToHtml({ arrayBuffer: await file.arrayBuffer() });
        content = result.value;
      } else if (file.type === 'application/pdf') {
        const { getDocument } = await import('pdfjs-dist');
        // PDF processing logic
      } else {
        throw new Error('Unsupported file type');
      }
      
      // Process content...
    } catch (error) {
      console.error('Document processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
};
```

### **📄 File Type Support**

#### **Supported Formats**
- **DOCX**: Mammoth.js for Word documents
- **PDF**: pdf-lib for PDF generation, pdfjs-dist for reading
- **Markdown**: Marked for parsing
- **TXT**: Native File API

### **🚀 Performance Rules**

1. **Process large files in Web Workers**
2. **Implement progress indicators**
3. **Use streaming for large documents**
4. **Cache processed content**

---

## **Analytics & Monitoring**

### **✅ Best Practices**

#### **Sentry Error Tracking**
```typescript
// ✅ GOOD: Sentry configuration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    // Filter out development errors
    if (import.meta.env.MODE === 'development') {
      console.log('Sentry event:', event);
    }
    return event;
  },
});

// Custom error boundary
export const AppErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
      {children}
    </Sentry.ErrorBoundary>
  );
};
```

#### **Mixpanel Analytics**
```typescript
// ✅ GOOD: Structured event tracking
import mixpanel from 'mixpanel-browser';

interface AnalyticsEvents {
  'Document Created': {
    document_type: string;
    user_type: 'student' | 'professional' | 'creator';
  };
  'AI Suggestion Accepted': {
    suggestion_type: 'grammar' | 'style' | 'clarity';
    confidence_score: number;
  };
  'Feature Used': {
    feature_name: string;
    session_duration: number;
  };
}

export const analytics = {
  track: <T extends keyof AnalyticsEvents>(
    event: T,
    properties: AnalyticsEvents[T]
  ) => {
    mixpanel.track(event, {
      ...properties,
      timestamp: Date.now(),
      user_id: getCurrentUserId(),
    });
  },
  
  identify: (userId: string, traits: Record<string, any>) => {
    mixpanel.identify(userId);
    mixpanel.people.set(traits);
  },
};
```

### **📊 Tracking Rules**

1. **Track user actions, not technical events**
2. **Include context in event properties**
3. **Respect user privacy preferences**
4. **Use consistent event naming**
5. **Monitor performance metrics**

---

## **Email Services**

### **✅ Best Practices**

#### **Resend Integration**
```typescript
// ✅ GOOD: Email service with templates
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendWelcomeEmail(userEmail: string, userName: string) {
    try {
      const result = await resend.emails.send({
        from: 'WordWise AI <noreply@wordwise.ai>',
        to: userEmail,
        subject: 'Welcome to WordWise AI',
        react: WelcomeEmailTemplate({ name: userName }),
      });
      
      console.log('Welcome email sent:', result.id);
      return result;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  },

  async sendPasswordReset(userEmail: string, resetLink: string) {
    // Implementation...
  },
};
```

### **📧 Email Rules**

1. **Use React email templates**
2. **Implement proper error handling**
3. **Log email events for debugging**
4. **Test emails in development**
5. **Follow CAN-SPAM compliance**

---

## **Grammar API**

### **✅ Best Practices**

#### **LanguageTool Integration**
```typescript
// ✅ GOOD: Grammar checking service
export const grammarService = {
  async checkGrammar(text: string, language = 'en-US') {
    try {
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text,
          language,
          level: 'picky', // More thorough checking
        }),
      });

      const result = await response.json();
      
      return result.matches.map((match: any) => ({
        type: 'grammar',
        position: {
          start: match.offset,
          end: match.offset + match.length,
        },
        original: text.substring(match.offset, match.offset + match.length),
        suggestions: match.replacements.map((r: any) => r.value),
        message: match.message,
        rule: match.rule.id,
      }));
    } catch (error) {
      console.error('Grammar check failed:', error);
      return [];
    }
  },
};
```

### **🔤 Grammar Rules**

1. **Cache grammar results for performance**
2. **Debounce grammar checking requests**
3. **Handle API rate limits gracefully**
4. **Combine with AI suggestions intelligently**
5. **Support multiple languages if needed**

---

## **General Development Rules**

### **🔐 Security Best Practices**

1. **Never expose API keys in client code**
2. **Validate all user inputs**
3. **Use HTTPS everywhere**
4. **Implement proper CORS**
5. **Follow principle of least privilege**

### **⚡ Performance Guidelines**

1. **Lazy load non-critical components**
2. **Implement proper caching strategies**
3. **Use CDN for static assets**
4. **Monitor Core Web Vitals**
5. **Optimize images and fonts**

### **🔄 Development Workflow**

1. **Use feature branches**
2. **Write tests before deployment**
3. **Use TypeScript strict mode**
4. **Follow semantic versioning**
5. **Document breaking changes**

### **📱 Accessibility Requirements**

1. **Follow WCAG 2.1 AA guidelines**
2. **Use semantic HTML**
3. **Implement keyboard navigation**
4. **Provide alt text for images**
5. **Test with screen readers**

---

This comprehensive guide should be referenced throughout development to ensure consistent, high-quality implementation across all aspects of the WordWise AI project. 