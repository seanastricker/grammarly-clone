# WordWise AI - Codebase Best Practices

*AI-first development standards for modular, scalable, and readable code*

---

## **Core Principles**

### **AI-First Development**
- **Modular Architecture:** Each file serves a single, clear purpose
- **Maximum Readability:** Code should be self-documenting and AI-parseable
- **Scalable Structure:** Easy to navigate and extend without confusion
- **Clear Separation:** Distinct boundaries between concerns and responsibilities

### **File Size Limits**
- **Maximum 250 lines per file** for optimal AI tool comprehension
- **Break large files into logical modules** with clear interfaces
- **Prefer composition over monolithic files**
- **Use barrel exports** to maintain clean import paths

---

## **Project Structure**

### **Root Directory Layout**
```
wordwise-ai/
├── public/                          # Static assets
│   ├── icons/                       # App icons and favicons
│   ├── images/                      # Static images
│   └── fonts/                       # Custom fonts
├── src/                             # Source code
├── docs/                            # Documentation
├── tests/                           # Test utilities and fixtures
├── .env.example                     # Environment template
├── .env.local                       # Local environment (gitignored)
├── package.json                     # Dependencies and scripts
├── tailwind.config.ts               # Tailwind configuration
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Project overview
```

### **Source Code Architecture**
```
src/
├── app/                             # Application entry and providers
│   ├── globals.css                  # Global styles and Tailwind imports
│   ├── layout.tsx                   # Root layout component
│   ├── page.tsx                     # Landing page
│   └── providers/                   # Context providers
│       ├── theme-provider.tsx       # Material Design 3 theme provider
│       ├── auth-provider.tsx        # Firebase auth provider
│       └── index.ts                 # Barrel export
├── components/                      # React components (atomic design)
│   ├── ui/                          # Base Shadcn components
│   │   ├── button.tsx               # Material Design 3 button variants
│   │   ├── card.tsx                 # Card component with variants
│   │   ├── input.tsx                # Form input components
│   │   └── index.ts                 # Barrel export
│   ├── atoms/                       # Smallest UI components
│   │   ├── icon/                    # Icon components
│   │   ├── avatar/                  # User avatar component
│   │   ├── badge/                   # Status badges
│   │   └── index.ts                 # Barrel export
│   ├── molecules/                   # Combined atoms
│   │   ├── search-bar/              # Search functionality
│   │   ├── suggestion-card/         # AI suggestion display
│   │   ├── toolbar-button/          # Editor toolbar buttons
│   │   └── index.ts                 # Barrel export
│   ├── organisms/                   # Complex UI sections
│   │   ├── editor/                  # TipTap editor integration
│   │   ├── suggestions-panel/       # AI suggestions sidebar
│   │   ├── navigation/              # App navigation
│   │   ├── document-list/           # Document management
│   │   └── index.ts                 # Barrel export
│   ├── templates/                   # Page layouts
│   │   ├── editor-layout/           # Editor page template
│   │   ├── dashboard-layout/        # Dashboard template
│   │   └── index.ts                 # Barrel export
│   └── pages/                       # Full page components
│       ├── dashboard/               # Dashboard page
│       ├── editor/                  # Editor page
│       ├── analytics/               # Analytics page
│       └── index.ts                 # Barrel export
├── hooks/                           # Custom React hooks
│   ├── use-auth.ts                  # Authentication hook
│   ├── use-document.ts              # Document management
│   ├── use-ai-suggestions.ts        # AI suggestions hook
│   ├── use-theme.ts                 # Theme management
│   ├── use-editor.ts                # TipTap editor hook
│   └── index.ts                     # Barrel export
├── services/                        # External service integrations
│   ├── firebase/                    # Firebase services
│   │   ├── config.ts                # Firebase configuration
│   │   ├── auth.ts                  # Authentication service
│   │   ├── firestore.ts             # Database service
│   │   ├── functions.ts             # Cloud functions client
│   │   └── index.ts                 # Barrel export
│   ├── ai/                          # AI service integrations
│   │   ├── openai.ts                # OpenAI service
│   │   ├── language-tool.ts         # Grammar checking
│   │   ├── suggestions.ts           # AI suggestion processing
│   │   └── index.ts                 # Barrel export
│   ├── analytics/                   # Analytics services
│   │   ├── mixpanel.ts              # User analytics
│   │   ├── sentry.ts                # Error tracking
│   │   └── index.ts                 # Barrel export
│   └── storage/                     # File and document handling
│       ├── document-processor.ts    # Document parsing
│       ├── file-upload.ts           # File upload utilities
│       └── index.ts                 # Barrel export
├── stores/                          # State management (Zustand)
│   ├── auth-store.ts                # Authentication state
│   ├── editor-store.ts              # Editor state
│   ├── ui-store.ts                  # UI state (modals, panels)
│   ├── document-store.ts            # Document management state
│   └── index.ts                     # Barrel export
├── lib/                             # Utility libraries
│   ├── utils.ts                     # General utilities
│   ├── cn.ts                        # Class name utility
│   ├── date.ts                      # Date formatting
│   ├── validation.ts                # Form validation schemas
│   ├── constants.ts                 # App constants
│   └── index.ts                     # Barrel export
├── types/                           # TypeScript type definitions
│   ├── auth.ts                      # Authentication types
│   ├── document.ts                  # Document types
│   ├── ai.ts                        # AI suggestion types
│   ├── api.ts                       # API response types
│   ├── ui.ts                        # UI component types
│   └── index.ts                     # Barrel export
└── styles/                          # Styling files
    ├── globals.css                  # Global CSS and Tailwind
    ├── components.css               # Component-specific styles
    └── editor.css                   # TipTap editor styles
```

---

## **File Naming Conventions**

### **General Rules**
- **kebab-case** for files and directories
- **PascalCase** for React components
- **camelCase** for functions and variables
- **UPPER_SNAKE_CASE** for constants

### **File Extensions**
```typescript
// React components
Button.tsx              // Component files
button.stories.tsx      // Storybook stories
button.test.tsx         // Component tests

// Utilities and services
auth-service.ts         // Service files
date-utils.ts           // Utility functions
api-types.ts            // Type definitions

// Configuration
vite.config.ts          // Build configuration
tailwind.config.ts      // Styling configuration
```

### **Directory Naming**
```
components/ui/          # Base UI components
components/atoms/       # Atomic design level
services/firebase/      # Service grouping
hooks/                  # Custom hooks
types/                  # Type definitions
lib/utils/              # Utility functions
```

---

## **File Documentation Standards**

### **File Header Template**
```typescript
/**
 * @fileoverview Brief description of file purpose and main functionality
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * This file handles [specific responsibility] for the WordWise AI writing assistant.
 * Key features:
 * - Feature 1: Description
 * - Feature 2: Description
 * - Feature 3: Description
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

### **Function Documentation**
```typescript
/**
 * Processes AI suggestions for the given text content
 * 
 * @param text - The text content to analyze
 * @param analysisType - Type of analysis to perform ('grammar' | 'style' | 'clarity')
 * @param userContext - User preferences and writing level context
 * @returns Promise containing AI suggestions with confidence scores
 * 
 * @example
 * ```typescript
 * const suggestions = await processAISuggestions(
 *   "This is a sample text.",
 *   "grammar",
 *   { level: "advanced", tone: "professional" }
 * );
 * ```
 * 
 * @throws {AIProcessingError} When AI service is unavailable
 * @throws {ValidationError} When input parameters are invalid
 */
async function processAISuggestions(
  text: string,
  analysisType: AnalysisType,
  userContext: UserContext
): Promise<AISuggestion[]> {
  // Implementation
}
```

### **Component Documentation**
```typescript
/**
 * AI Suggestion Card Component
 * 
 * Displays individual AI suggestions with accept/dismiss actions.
 * Implements Material Design 3 styling with semantic colors based on suggestion type.
 * 
 * @component
 * @param suggestion - The AI suggestion to display
 * @param onAccept - Callback when suggestion is accepted
 * @param onDismiss - Callback when suggestion is dismissed
 * 
 * @example
 * ```tsx
 * <AISuggestionCard
 *   suggestion={suggestion}
 *   onAccept={handleAccept}
 *   onDismiss={handleDismiss}
 * />
 * ```
 */
export const AISuggestionCard: React.FC<AISuggestionCardProps> = ({
  suggestion,
  onAccept,
  onDismiss
}) => {
  // Implementation
};
```

---

## **Import/Export Patterns**

### **Barrel Exports**
```typescript
// components/atoms/index.ts
/**
 * @fileoverview Barrel export for atomic components
 * Centralizes exports for easy importing and better tree-shaking
 */

export { Icon } from './icon/Icon';
export { Avatar } from './avatar/Avatar';
export { Badge } from './badge/Badge';
export type { IconProps, AvatarProps, BadgeProps } from './types';
```

### **Import Organization**
```typescript
/**
 * Import order:
 * 1. React and React-related
 * 2. External libraries
 * 3. Internal utilities and services
 * 4. Internal components
 * 5. Types
 * 6. Relative imports
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import type { Document, AISuggestion } from '@/types';

import './editor.css';
```

---

## **Component Architecture Standards**

### **Atomic Design Implementation**

#### **Atoms (Single Responsibility)**
```typescript
/**
 * @fileoverview Icon component - renders SVG icons with consistent sizing
 * Atomic component for displaying icons throughout the application
 */

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 'md', className }) => {
  // Implementation under 50 lines
};
```

#### **Molecules (Combined Atoms)**
```typescript
/**
 * @fileoverview Search Bar component - combines input and icon atoms
 * Provides search functionality with keyboard shortcuts and suggestions
 */

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder,
  suggestions
}) => {
  // Implementation under 100 lines
};
```

#### **Organisms (Complex Components)**
```typescript
/**
 * @fileoverview Editor component - TipTap integration with AI suggestions
 * Main writing interface with real-time AI assistance and collaboration features
 */

interface EditorProps {
  documentId: string;
  initialContent?: string;
  onContentChange: (content: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  documentId,
  initialContent,
  onContentChange
}) => {
  // Implementation under 200 lines
  // If exceeding, split into smaller components
};
```

---

## **State Management Standards**

### **Zustand Store Structure**
```typescript
/**
 * @fileoverview Editor state management
 * Handles editor content, AI suggestions, and user interactions
 */

interface EditorState {
  // State properties
  activeDocument: Document | null;
  isEditing: boolean;
  aiSuggestions: AISuggestion[];
  selectedText: string;
}

interface EditorActions {
  // Action methods
  setActiveDocument: (document: Document) => void;
  addAISuggestion: (suggestion: AISuggestion) => void;
  clearSuggestions: () => void;
}

/**
 * Editor store for managing document editing state
 * Handles AI suggestions, document content, and user interactions
 */
export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  // Implementation
}));
```

### **Custom Hooks Pattern**
```typescript
/**
 * @fileoverview Document management hook
 * Provides document CRUD operations with real-time sync and offline support
 */

interface UseDocumentOptions {
  enableRealtime?: boolean;
  enableOffline?: boolean;
}

/**
 * Custom hook for document management
 * 
 * @param documentId - ID of the document to manage
 * @param options - Configuration options for the hook
 * @returns Document data and management functions
 */
export const useDocument = (documentId: string, options: UseDocumentOptions = {}) => {
  // Implementation under 100 lines
  // Return interface with clear methods
};
```

---

## **Service Layer Standards**

### **Firebase Service Structure**
```typescript
/**
 * @fileoverview Firebase Firestore service
 * Handles document storage, real-time updates, and offline sync
 */

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './config';
import type { Document, DocumentUpdate } from '@/types';

/**
 * Firestore service for document operations
 * Provides CRUD operations with real-time capabilities
 */
export class FirestoreService {
  /**
   * Retrieves a document by ID
   * @param documentId - Unique document identifier
   * @returns Promise resolving to document data or null if not found
   */
  async getDocument(documentId: string): Promise<Document | null> {
    // Implementation
  }

  /**
   * Creates or updates a document
   * @param documentId - Unique document identifier
   * @param data - Document data to save
   * @returns Promise resolving when save is complete
   */
  async saveDocument(documentId: string, data: DocumentUpdate): Promise<void> {
    // Implementation
  }
}

export const firestoreService = new FirestoreService();
```

### **AI Service Structure**
```typescript
/**
 * @fileoverview OpenAI service integration
 * Handles AI text analysis and suggestion generation
 */

import OpenAI from 'openai';
import type { AISuggestion, AnalysisType, UserContext } from '@/types';

/**
 * OpenAI service for AI-powered writing assistance
 * Processes text and generates contextual suggestions
 */
export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Analyzes text and generates suggestions
   * @param text - Text content to analyze
   * @param type - Type of analysis to perform
   * @param context - User context for personalized suggestions
   * @returns Promise resolving to array of AI suggestions
   */
  async analyzText(
    text: string, 
    type: AnalysisType, 
    context: UserContext
  ): Promise<AISuggestion[]> {
    // Implementation under 100 lines
  }
}
```

---

## **Testing Standards**

### **Test File Organization**
```
src/
├── components/
│   ├── atoms/
│   │   ├── icon/
│   │   │   ├── Icon.tsx
│   │   │   ├── Icon.test.tsx        # Unit tests
│   │   │   └── Icon.stories.tsx     # Storybook stories
├── hooks/
│   ├── use-document.ts
│   └── use-document.test.ts         # Hook tests
├── services/
│   ├── firebase/
│   │   ├── firestore.ts
│   │   └── firestore.test.ts        # Service tests
tests/
├── e2e/                             # End-to-end tests
│   ├── editor.spec.ts               # Editor workflow tests
│   └── auth.spec.ts                 # Authentication tests
├── fixtures/                        # Test data
├── utils/                           # Test utilities
└── setup.ts                         # Test configuration
```

### **Test Documentation**
```typescript
/**
 * @fileoverview Icon component tests
 * Tests icon rendering, sizing, and accessibility features
 */

import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon Component', () => {
  /**
   * Test: Icon renders with correct aria-label
   * Ensures accessibility compliance for screen readers
   */
  it('should render with correct aria-label', () => {
    // Test implementation
  });

  /**
   * Test: Icon applies correct size classes
   * Validates Material Design 3 sizing implementation
   */
  it('should apply correct size classes', () => {
    // Test implementation
  });
});
```

---

## **Code Quality Standards**

### **TypeScript Configuration**
```typescript
// Strict TypeScript settings for better AI comprehension
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### **ESLint Rules for AI Readability**
```javascript
// .eslintrc.js - Rules for consistent, AI-readable code
module.exports = {
  rules: {
    // Enforce consistent naming
    'camelcase': 'error',
    
    // Require JSDoc comments for functions
    'jsdoc/require-description': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-returns-description': 'error',
    
    // Limit complexity for AI parsing
    'complexity': ['error', 10],
    'max-lines-per-function': ['error', 50],
    'max-depth': ['error', 4],
    
    // Enforce readable code structure
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error'
  }
};
```

---

## **Performance Optimization Patterns**

### **Code Splitting Example**
```typescript
/**
 * @fileoverview Lazy-loaded analytics dashboard
 * Implements code splitting for non-critical features
 */

import { lazy, Suspense } from 'react';
import { AnalyticsSkeleton } from '@/components/atoms';

// Lazy load heavy analytics dashboard
const AnalyticsDashboard = lazy(() => 
  import('@/components/pages/analytics/AnalyticsDashboard')
);

/**
 * Analytics page with lazy loading
 * Reduces initial bundle size and improves performance
 */
export const AnalyticsPage: React.FC = () => {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsDashboard />
    </Suspense>
  );
};
```

### **Bundle Optimization**
```typescript
/**
 * @fileoverview Barrel export with selective imports
 * Enables tree-shaking for better bundle optimization
 */

// Individual exports for tree-shaking
export { Button } from './button/Button';
export { Card } from './card/Card';
export { Input } from './input/Input';

// Type-only exports
export type { ButtonProps } from './button/types';
export type { CardProps } from './card/types';
export type { InputProps } from './input/types';
```

---

## **Error Handling Patterns**

### **Error Boundary Structure**
```typescript
/**
 * @fileoverview Global error boundary
 * Catches and handles runtime errors with user-friendly fallbacks
 */

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Global error boundary for the application
 * Provides fallback UI and error reporting
 */
export class GlobalErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    console.error('Global error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

---

## **Configuration Management**

### **Environment Configuration**
```typescript
/**
 * @fileoverview Environment configuration
 * Centralizes environment variables with type safety
 */

interface AppConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
}

/**
 * Application configuration with environment variable validation
 * Ensures all required environment variables are present
 */
export const config: AppConfig = {
  firebase: {
    apiKey: process.env.VITE_FIREBASE_API_KEY!,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
  },
  openai: {
    apiKey: process.env.VITE_OPENAI_API_KEY!,
    model: process.env.VITE_OPENAI_MODEL || 'gpt-4',
  },
  app: {
    name: 'WordWise AI',
    version: process.env.VITE_APP_VERSION || '1.0.0',
    environment: (process.env.VITE_ENVIRONMENT as AppConfig['app']['environment']) || 'development',
  },
};
```

---

This comprehensive guide ensures our WordWise AI codebase remains modular, scalable, and optimally readable for both human developers and AI tools throughout the development process. 