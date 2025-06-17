# WordWise AI - UI Rules & Component Guidelines

*Desktop-first visual and interaction guidelines for our AI writing assistant*

---

## **Core Design Principles**

### **Desktop-First Approach**
- **Primary viewport:** 1440px+ (large desktop)
- **Secondary:** 1024px+ (desktop)
- **Tertiary:** 768px+ (tablet, graceful degradation)
- **Mobile:** 640px+ (minimal support, basic functionality)

### **Writing-Focused Design**
- **Content is king:** Text editor takes 60-70% of screen real estate
- **Minimal chrome:** UI elements fade into background during writing
- **Contextual tools:** AI suggestions appear near relevant text
- **Distraction-free:** Optional focus modes hide all non-essential UI

---

## **Layout Architecture**

### **Main Application Layout**
```typescript
// Primary desktop layout structure
<div className="h-screen flex">
  {/* Sidebar Navigation - 280px fixed */}
  <aside className="w-70 border-r bg-surface">
    <Navigation />
  </aside>
  
  {/* Main Content Area - flexible */}
  <main className="flex-1 flex flex-col">
    <header className="h-16 border-b bg-surface">
      <Toolbar />
    </header>
    
    <div className="flex-1 flex">
      {/* Editor - 60-70% width */}
      <section className="flex-1 min-w-0">
        <Editor />
      </section>
      
      {/* AI Suggestions Panel - 320px fixed when open */}
      <aside className="w-80 border-l bg-surface-variant">
        <AISuggestionsPanel />
      </aside>
    </div>
  </main>
</div>
```

### **Responsive Breakpoints**
- **XL:** 1440px+ (optimal experience)
- **LG:** 1024px+ (full features, compact)
- **MD:** 768px+ (single column, drawer navigation)
- **SM:** 640px+ (mobile web, basic editing only)

---

## **Component Architecture**

### **Base Component Structure**
```typescript
// Component pattern with TypeScript + Shadcn
interface ComponentProps {
  variant?: 'default' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center",
          // Variants
          {
            'bg-primary text-primary-foreground': variant === 'default',
            'bg-secondary text-secondary-foreground': variant === 'secondary',
            'hover:bg-accent': variant === 'ghost',
          },
          // Sizes
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
```

### **Component Hierarchy**
1. **Atoms:** Button, Input, Icon, Avatar
2. **Molecules:** SearchBar, ToolbarButton, SuggestionCard
3. **Organisms:** Toolbar, SuggestionsPanel, DocumentList
4. **Templates:** EditorLayout, DashboardLayout
5. **Pages:** Editor, Dashboard, Analytics

---

## **Typography System**

### **Font Stack**
```css
/* Primary: Sans-serif for UI */
font-family: 'Inter Variable', ui-sans-serif, system-ui, -apple-system, sans-serif;

/* Secondary: Serif for editor content */
font-family: 'Source Serif Pro', ui-serif, Georgia, 'Times New Roman', serif;

/* Monospace: Code and technical content */
font-family: 'JetBrains Mono Variable', ui-monospace, 'SF Mono', 'Monaco', monospace;
```

### **Type Scale (Desktop-First)**
```typescript
// Tailwind configuration for desktop-optimized typography
const typography = {
  'display': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // 64px
  'headline': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 48px
  'title': ['2rem', { lineHeight: '1.3' }], // 32px
  'body': ['1rem', { lineHeight: '1.6' }], // 16px
  'caption': ['0.875rem', { lineHeight: '1.4' }], // 14px
  'label': ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.02em' }], // 12px
};
```

### **Reading Optimization**
- **Editor font size:** 18px (1.125rem) for optimal reading
- **Line height:** 1.7 for body text, 1.4 for UI elements
- **Measure:** 65-75 characters per line in editor
- **Contrast:** Minimum 4.5:1 for body text, 7:1 for small text

---

## **Spacing & Grid System**

### **Spatial Units (8px base)**
```typescript
const spacing = {
  '0.5': '0.125rem', // 2px
  '1': '0.25rem',    // 4px
  '2': '0.5rem',     // 8px
  '3': '0.75rem',    // 12px
  '4': '1rem',       // 16px
  '6': '1.5rem',     // 24px
  '8': '2rem',       // 32px
  '12': '3rem',      // 48px
  '16': '4rem',      // 64px
  '20': '5rem',      // 80px
};
```

### **Layout Grid**
- **Container max-width:** 1400px
- **Gutter:** 24px (1.5rem)
- **Column gaps:** 16px (1rem)
- **Section spacing:** 48px (3rem) vertical

---

## **Color System Integration**

### **Semantic Color Usage**
```typescript
// Color application for writing assistant
const colorUsage = {
  // AI suggestions
  'ai-grammar': 'text-red-600 bg-red-50 border-red-200',
  'ai-style': 'text-blue-600 bg-blue-50 border-blue-200',
  'ai-clarity': 'text-amber-600 bg-amber-50 border-amber-200',
  'ai-accepted': 'text-green-600 bg-green-50 border-green-200',
  
  // Document states
  'doc-saved': 'text-green-600',
  'doc-saving': 'text-amber-600',
  'doc-error': 'text-red-600',
  'doc-syncing': 'text-blue-600',
  
  // User presence (collaboration)
  'user-1': 'bg-blue-500',
  'user-2': 'bg-green-500',
  'user-3': 'bg-purple-500',
  'user-4': 'bg-orange-500',
};
```

---

## **Accessibility Requirements**

### **WCAG 2.1 AA Compliance**
```typescript
// Accessibility checklist for components
const a11yRequirements = {
  // Color & Contrast
  colorContrast: '4.5:1 minimum for normal text, 3:1 for large text',
  colorBlindness: 'Never rely on color alone for meaning',
  
  // Keyboard Navigation
  focusManagement: 'Visible focus indicators, logical tab order',
  keyboardTraps: 'Modal dialogs and dropdowns must trap focus',
  shortcuts: 'Common shortcuts: Ctrl+S (save), Ctrl+Z (undo), Ctrl+/ (help)',
  
  // Screen Readers
  semanticHTML: 'Use proper HTML5 semantic elements',
  ariaLabels: 'Descriptive labels for all interactive elements',
  landmarks: 'main, nav, aside, header, footer regions',
  liveRegions: 'Announce AI suggestions and status updates',
};
```

### **Focus Management**
```typescript
// Focus patterns for editor interface
const focusPatterns = {
  editor: 'Focus moves to editor on page load',
  suggestions: 'Tab through suggestions, Enter to accept, Escape to dismiss',
  modals: 'Focus trap in modal, return focus on close',
  toolbar: 'Arrow keys for horizontal navigation',
  panels: 'F6 to cycle between major sections',
};
```

### **Screen Reader Support**
```typescript
// ARIA patterns for writing assistant
<div role="main" aria-label="Document editor">
  <div 
    role="textbox" 
    aria-multiline="true"
    aria-label="Document content"
    aria-describedby="word-count character-count"
  >
    {/* TipTap editor */}
  </div>
  
  <aside 
    role="complementary" 
    aria-label="AI suggestions"
    aria-live="polite"
  >
    {/* Suggestions panel */}
  </aside>
</div>
```

---

## **Interaction Patterns**

### **AI Suggestion Interactions**
```typescript
// Suggestion interaction states
const suggestionStates = {
  idle: 'Subtle underline, no distraction',
  hover: 'Highlight suggestion, show preview tooltip',
  active: 'Full suggestion card with options',
  accepting: 'Animation showing text replacement',
  accepted: 'Brief success state, then return to normal',
  dismissed: 'Fade out, remove from suggestions list',
};
```

### **Real-time Collaboration**
```typescript
// Collaboration visual cues
const collaborationPatterns = {
  cursors: 'Show other users cursors with name labels',
  selections: 'Highlight other users text selections',
  presence: 'Avatar indicators in toolbar',
  comments: 'Thread markers in document margin',
  conflicts: 'Clear visual indicators for merge conflicts',
};
```

### **Micro-interactions**
- **Button press:** 100ms scale transform + color change
- **Loading states:** Skeleton UI, not spinners
- **Successful actions:** Brief green check animation
- **Errors:** Shake animation + red outline
- **AI processing:** Subtle pulse on affected text

---

## **Tech Stack Integration**

### **Component Development with Shadcn**
```typescript
// Extending Shadcn components for writing assistant
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const SuggestionButton = ({ 
  suggestion, 
  onAccept, 
  onReject 
}: SuggestionButtonProps) => {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => onAccept(suggestion)}
        className={cn(
          "text-xs h-7",
          // Semantic colors based on suggestion type
          suggestion.type === 'grammar' && "bg-red-100 text-red-800 hover:bg-red-200",
          suggestion.type === 'style' && "bg-blue-100 text-blue-800 hover:bg-blue-200"
        )}
      >
        Accept
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onReject(suggestion)}
        className="text-xs h-7"
      >
        Dismiss
      </Button>
    </div>
  );
};
```

### **TipTap Editor Styling**
```typescript
// Editor prose styles for Material Design 3
const editorStyles = `
.ProseMirror {
  @apply prose prose-lg max-w-none;
  @apply focus:outline-none;
  @apply leading-relaxed;
  
  /* AI suggestion highlights */
  .ai-highlight {
    @apply relative;
  }
  
  .ai-highlight[data-type="grammar"] {
    @apply underline decoration-red-400 decoration-wavy;
  }
  
  .ai-highlight[data-type="style"] {
    @apply underline decoration-blue-400 decoration-dotted;
  }
}
`;
```

### **Firebase Real-time UI Updates**
```typescript
// Real-time status indicators
export const DocumentStatus = () => {
  const { isOnline, isSaving, lastSaved } = useDocumentSync();
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className={cn(
        "w-2 h-2 rounded-full",
        isOnline ? "bg-green-500" : "bg-red-500"
      )} />
      {isSaving ? (
        <span>Saving...</span>
      ) : (
        <span>Saved {formatTimeAgo(lastSaved)}</span>
      )}
    </div>
  );
};
```

---

## **Performance Guidelines**

### **Component Optimization**
```typescript
// Memoization for expensive components
const AISuggestionsPanel = memo(({ suggestions, onAccept, onReject }) => {
  const sortedSuggestions = useMemo(
    () => suggestions.sort((a, b) => b.confidence - a.confidence),
    [suggestions]
  );
  
  const handleAccept = useCallback((suggestion) => {
    onAccept(suggestion);
    analytics.track('AI Suggestion Accepted', {
      type: suggestion.type,
      confidence: suggestion.confidence,
    });
  }, [onAccept]);
  
  return (
    <div className="space-y-2">
      {sortedSuggestions.map(suggestion => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onAccept={handleAccept}
          onReject={onReject}
        />
      ))}
    </div>
  );
});
```

### **Lazy Loading Patterns**
```typescript
// Code splitting for heavy features
const AnalyticsDashboard = lazy(() => import('@/components/AnalyticsDashboard'));
const DocumentProcessor = lazy(() => import('@/components/DocumentProcessor'));

// Usage with loading states
<Suspense fallback={<AnalyticsSkeletonLoader />}>
  <AnalyticsDashboard />
</Suspense>
```

---

## **Animation & Motion**

### **Motion Principles**
- **Duration:** 200ms for micro-interactions, 300ms for panel transitions
- **Easing:** `ease-out` for entrances, `ease-in` for exits
- **Reduced motion:** Respect `prefers-reduced-motion` setting
- **Purposeful:** Every animation should have clear purpose

### **Common Animations**
```typescript
// Framer Motion variants for consistent animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2, ease: 'easeOut' }
};

const slideIn = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { duration: 0.3, ease: 'easeOut' }
};
```

---

## **Error Handling & Feedback**

### **Error States**
```typescript
// Error boundary with user-friendly fallbacks
export const EditorErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-medium">Something went wrong</h3>
            <p className="text-muted-foreground">
              We're having trouble loading the editor. Your work is saved.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Reload Editor
            </Button>
          </div>
        </div>
      }
      onError={(error) => {
        Sentry.captureException(error);
        analytics.track('Editor Error', { error: error.message });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### **Loading States**
```typescript
// Skeleton loading for content areas
export const DocumentListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    ))}
  </div>
);
```

---

This comprehensive UI rules document provides the foundation for building a consistent, accessible, and performant desktop-first writing assistant interface that integrates seamlessly with your Material Design 3 theme and chosen tech stack. 