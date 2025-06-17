# WordWise AI - UI/Frontend Implementation Workflow

*Step-by-step workflow for AI agents implementing frontend features*

---

## **Mandatory Pre-Implementation Steps**

### **1. Requirements Analysis**
- [ ] Read the specific phase document thoroughly
- [ ] Identify all UI components to be built
- [ ] Understand user interactions and workflows
- [ ] Check dependencies on previous phases
- [ ] Validate against `@codebase-best-practices.md`

### **2. Component Architecture Planning**
- [ ] Map features to atomic design hierarchy:
  - **Atoms:** Single-purpose UI elements
  - **Molecules:** Combined atoms with specific function
  - **Organisms:** Complex UI sections
  - **Templates:** Page layouts
  - **Pages:** Complete user interfaces
- [ ] Plan component file structure according to established conventions
- [ ] Design state management approach (Zustand stores, component state)

---

## **Implementation Workflow**

### **Step 1: File Structure Setup**
Create files following the established pattern:

```typescript
// Example for a new feature "SuggestionCard"
src/
  components/
    molecules/
      suggestion-card/
        SuggestionCard.tsx           // Main component
        SuggestionCard.test.tsx      // Tests
        types.ts                     // TypeScript interfaces
        index.ts                     // Barrel export
```

**File Header Template:**
```typescript
/**
 * @fileoverview [Brief description of component purpose]
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * This component handles [specific responsibility] for the WordWise AI writing assistant.
 * Key features:
 * - Feature 1: Description
 * - Feature 2: Description
 * 
 * Dependencies:
 * - External dependency 1
 * - External dependency 2
 * 
 * Related files:
 * - Path to related file 1
 * - Path to related file 2
 */
```

### **Step 2: TypeScript Interface Definition**
Define interfaces in `types.ts`:

```typescript
/**
 * @fileoverview Type definitions for [ComponentName]
 * Defines all props, state, and data interfaces for the component
 */

export interface [ComponentName]Props {
  // Required props
  requiredProp: string;
  
  // Optional props with defaults
  optionalProp?: 'default' | 'alternative';
  
  // Event handlers
  onAction?: (data: ActionData) => void;
  
  // Standard React props
  className?: string;
  children?: React.ReactNode;
}

export interface ActionData {
  // Define action payload structure
}
```

### **Step 3: Component Implementation**
Build component following patterns:

```typescript
/**
 * [ComponentName] Component
 * 
 * [Detailed description of component purpose and behavior]
 * 
 * @component
 * @param prop1 - Description of prop1
 * @param prop2 - Description of prop2
 * 
 * @example
 * ```tsx
 * <ComponentName
 *   prop1="value"
 *   prop2="value"
 *   onAction={handleAction}
 * />
 * ```
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  requiredProp,
  optionalProp = 'default',
  onAction,
  className,
  children,
  ...props
}) => {
  // 1. Hooks (in order: state, context, custom hooks)
  const [localState, setLocalState] = useState<StateType>(initialValue);
  const { globalState } = useGlobalStore();
  const customHook = useCustomHook();

  // 2. Event handlers
  const handleAction = useCallback((data: ActionData) => {
    // Handle action logic
    onAction?.(data);
  }, [onAction]);

  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, [dependency]);

  // 4. Render logic
  return (
    <div 
      className={cn(
        // Base styles
        "flex items-center justify-between p-4",
        // Conditional styles
        optionalProp === 'alternative' && "bg-alternative",
        // Custom className
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Display name for debugging
ComponentName.displayName = 'ComponentName';
```

### **Step 4: Material Design 3 Styling**
Apply MD3 design tokens consistently:

```typescript
// Use established color tokens
const styleVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  surface: 'bg-surface text-surface-foreground border border-outline-variant',
  error: 'bg-error text-error-foreground',
};

// Apply semantic spacing
const spacingClasses = 'p-4 gap-3 rounded-md'; // Use design system values

// Implement proper typography
const typographyClasses = 'text-body-medium font-medium'; // Use MD3 typography scale
```

### **Step 5: State Management Integration**
Connect to Zustand stores appropriately:

```typescript
// For global state
const { 
  relevantState, 
  relevantAction 
} = useRelevantStore();

// For component-specific state
const [localState, setLocalState] = useState<LocalStateType>();

// For server state (SWR)
const { data, error, isLoading } = useSWR(
  ['key', dependency],
  () => fetchFunction(dependency)
);
```

### **Step 6: Error Handling & Loading States**
Implement comprehensive state handling:

```typescript
// Loading state
if (isLoading) {
  return <ComponentSkeleton />;
}

// Error state
if (error) {
  return (
    <ErrorFallback 
      error={error} 
      onRetry={() => mutate()} 
    />
  );
}

// Empty state
if (!data || data.length === 0) {
  return <EmptyState message="No data available" />;
}
```

### **Step 7: Accessibility Implementation**
Ensure WCAG 2.1 AA compliance:

```typescript
<button
  aria-label="Clear search input"
  aria-describedby="search-help"
  onClick={handleClear}
  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
>
  <Icon name="close" aria-hidden="true" />
</button>

<div
  id="search-help"
  className="sr-only"
>
  Press escape to clear the search input
</div>
```

### **Step 8: Testing Implementation**
Write comprehensive tests:

```typescript
/**
 * @fileoverview [ComponentName] component tests
 * Tests component rendering, interactions, and accessibility
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    requiredProp: 'test-value',
  };

  /**
   * Test: Component renders with required props
   * Validates basic rendering functionality
   */
  it('should render with required props', () => {
    render(<ComponentName {...defaultProps} />);
    
    expect(screen.getByText('test-value')).toBeInTheDocument();
  });

  /**
   * Test: Event handlers are called correctly
   * Validates user interaction behavior
   */
  it('should call onAction when interacted with', async () => {
    const mockOnAction = vi.fn();
    
    render(
      <ComponentName 
        {...defaultProps} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith(
        expect.objectContaining({ /* expected data */ })
      );
    });
  });

  /**
   * Test: Accessibility requirements
   * Validates WCAG compliance
   */
  it('should be accessible', () => {
    render(<ComponentName {...defaultProps} />);
    
    // Check for proper ARIA labels
    expect(screen.getByLabelText(/expected label/i)).toBeInTheDocument();
    
    // Check for keyboard navigation
    const interactiveElement = screen.getByRole('button');
    expect(interactiveElement).toHaveAttribute('tabIndex', '0');
  });
});
```

### **Step 9: Documentation & Export**
Complete component documentation:

```typescript
// index.ts - Barrel export
/**
 * @fileoverview Barrel export for [ComponentName]
 * Centralizes exports for easy importing and better tree-shaking
 */

export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './types';
```

### **Step 10: Integration & Testing**
- [ ] Test component in isolation
- [ ] Test component integration with parent components
- [ ] Verify responsive behavior across breakpoints
- [ ] Test with different theme modes (light/dark)
- [ ] Validate performance with React DevTools

---

## **Quality Checklist**

Before marking UI work complete, verify:

### **Code Quality**
- [ ] File size under 250 lines (split if larger)
- [ ] All functions have JSDoc documentation
- [ ] TypeScript strict mode compliance
- [ ] No console.logs or debugging code
- [ ] Proper error boundaries implemented

### **Design System Compliance**
- [ ] Uses Material Design 3 color tokens
- [ ] Follows established spacing scale
- [ ] Uses semantic typography classes
- [ ] Implements proper component variants
- [ ] Responsive design implemented

### **Performance**
- [ ] Components are memoized appropriately
- [ ] Event handlers are memoized with useCallback
- [ ] Expensive calculations use useMemo
- [ ] Large lists implement virtualization
- [ ] Images are optimized and lazy-loaded

### **Accessibility**
- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation works correctly
- [ ] Screen reader compatibility tested
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus management is proper

### **Testing**
- [ ] Unit tests cover core functionality
- [ ] Integration tests verify user workflows
- [ ] Accessibility tests pass
- [ ] Performance tests within budgets
- [ ] Cross-browser compatibility verified

---

## **Common Patterns & Solutions**

### **Form Components**
```typescript
// Use react-hook-form for form handling
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting }
} = useForm<FormData>({
  resolver: zodResolver(validationSchema)
});
```

### **Modal/Dialog Components**
```typescript
// Use Shadcn Dialog for consistent modal behavior
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* Modal content */}
  </DialogContent>
</Dialog>
```

### **List Components**
```typescript
// Implement proper loading and empty states
{isLoading && <ListSkeleton />}
{!isLoading && items.length === 0 && <EmptyState />}
{!isLoading && items.map(item => (
  <ListItem key={item.id} item={item} />
))}
```

---

## **Error Handling Patterns**

### **API Errors**
```typescript
const { data, error } = useSWR('/api/endpoint', fetcher, {
  onError: (error) => {
    toast.error('Failed to load data. Please try again.');
    // Log to monitoring service
    Sentry.captureException(error);
  }
});
```

### **Component Errors**
```typescript
<ErrorBoundary
  fallback={<ComponentErrorFallback />}
  onError={(error, errorInfo) => {
    Sentry.captureException(error, { extra: errorInfo });
  }}
>
  <ComponentThatMightFail />
</ErrorBoundary>
```

---

## **Mobile Optimization Checklist**

- [ ] Touch targets minimum 44px
- [ ] Gestures implemented (swipe, pinch)
- [ ] Mobile-specific layouts for complex components
- [ ] Performance optimized for slower devices
- [ ] Offline functionality considerations

---

**Remember:** Every UI component should feel native to the WordWise AI experience while following our established design system and coding standards. Quality over speed - build it right the first time.

---
➡️ Build with purpose you must, for in thoughtful components, user delight lives. 