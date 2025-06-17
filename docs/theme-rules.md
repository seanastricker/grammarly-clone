# WordWise AI - Material Design 3 Theme Rules

*Implementation guide for Material Design 3 using Shadcn + Tailwind CSS*

---

## **Material Design 3 Foundation**

### **Core Principles**
- **Personal:** Dynamic color system that adapts to user preferences
- **Adaptive:** Responds to device capabilities and user context  
- **Expressive:** Supports brand expression while maintaining usability
- **Accessible:** Built-in accessibility with high contrast and clear hierarchy

### **Design Tokens Architecture**
```typescript
// CSS custom properties for Material Design 3
:root {
  /* Primary Colors */
  --md-sys-color-primary: 103 80 164;
  --md-sys-color-on-primary: 255 255 255;
  --md-sys-color-primary-container: 237 221 246;
  --md-sys-color-on-primary-container: 33 0 93;
  
  /* Secondary Colors */
  --md-sys-color-secondary: 98 91 113;
  --md-sys-color-on-secondary: 255 255 255;
  --md-sys-color-secondary-container: 232 222 248;
  --md-sys-color-on-secondary-container: 29 25 43;
  
  /* Tertiary Colors */
  --md-sys-color-tertiary: 125 82 96;
  --md-sys-color-on-tertiary: 255 255 255;
  --md-sys-color-tertiary-container: 255 216 228;
  --md-sys-color-on-tertiary-container: 55 11 30;
  
  /* Error Colors */
  --md-sys-color-error: 186 26 26;
  --md-sys-color-on-error: 255 255 255;
  --md-sys-color-error-container: 255 218 214;
  --md-sys-color-on-error-container: 65 0 2;
  
  /* Surface Colors */
  --md-sys-color-surface: 254 247 255;
  --md-sys-color-on-surface: 28 27 31;
  --md-sys-color-surface-variant: 231 224 236;
  --md-sys-color-on-surface-variant: 73 69 78;
  --md-sys-color-outline: 121 116 126;
  --md-sys-color-outline-variant: 202 196 208;
  
  /* Background */
  --md-sys-color-background: 254 247 255;
  --md-sys-color-on-background: 28 27 31;
}
```

---

## **Tailwind CSS Configuration**

### **Extended Color Palette**
```typescript
// tailwind.config.ts - Material Design 3 color system
export default {
  theme: {
    extend: {
      colors: {
        // Material Design 3 color tokens
        primary: {
          DEFAULT: 'rgb(var(--md-sys-color-primary) / <alpha-value>)',
          foreground: 'rgb(var(--md-sys-color-on-primary) / <alpha-value>)',
          container: 'rgb(var(--md-sys-color-primary-container) / <alpha-value>)',
          'container-foreground': 'rgb(var(--md-sys-color-on-primary-container) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--md-sys-color-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--md-sys-color-on-secondary) / <alpha-value>)',
          container: 'rgb(var(--md-sys-color-secondary-container) / <alpha-value>)',
          'container-foreground': 'rgb(var(--md-sys-color-on-secondary-container) / <alpha-value>)',
        },
        tertiary: {
          DEFAULT: 'rgb(var(--md-sys-color-tertiary) / <alpha-value>)',
          foreground: 'rgb(var(--md-sys-color-on-tertiary) / <alpha-value>)',
          container: 'rgb(var(--md-sys-color-tertiary-container) / <alpha-value>)',
          'container-foreground': 'rgb(var(--md-sys-color-on-tertiary-container) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--md-sys-color-surface) / <alpha-value>)',
          foreground: 'rgb(var(--md-sys-color-on-surface) / <alpha-value>)',
          variant: 'rgb(var(--md-sys-color-surface-variant) / <alpha-value>)',
          'variant-foreground': 'rgb(var(--md-sys-color-on-surface-variant) / <alpha-value>)',
        },
        outline: {
          DEFAULT: 'rgb(var(--md-sys-color-outline) / <alpha-value>)',
          variant: 'rgb(var(--md-sys-color-outline-variant) / <alpha-value>)',
        },
        // Writing assistant specific colors
        'ai-suggestion': {
          grammar: 'rgb(var(--md-sys-color-error) / 0.1)',
          style: 'rgb(var(--md-sys-color-primary) / 0.1)',
          clarity: 'rgb(var(--md-sys-color-tertiary) / 0.1)',
          accepted: 'rgb(var(--md-sys-color-secondary) / 0.1)',
        }
      },
      borderRadius: {
        'xs': '4px',   // 0.25rem
        'sm': '8px',   // 0.5rem
        'md': '12px',  // 0.75rem
        'lg': '16px',  // 1rem
        'xl': '20px',  // 1.25rem
        '2xl': '28px', // 1.75rem
      },
      fontFamily: {
        sans: ['Inter Variable', ...defaultTheme.fontFamily.sans],
        serif: ['Source Serif Pro', ...defaultTheme.fontFamily.serif],
        mono: ['JetBrains Mono Variable', ...defaultTheme.fontFamily.mono],
      },
      typography: {
        'display-large': ['3.5rem', { lineHeight: '4rem', letterSpacing: '-0.025em' }],
        'display-medium': ['2.875rem', { lineHeight: '3.25rem', letterSpacing: '-0.0125em' }],
        'display-small': ['2.25rem', { lineHeight: '2.75rem' }],
        'headline-large': ['2rem', { lineHeight: '2.5rem' }],
        'headline-medium': ['1.75rem', { lineHeight: '2.25rem' }],
        'headline-small': ['1.5rem', { lineHeight: '2rem' }],
        'title-large': ['1.375rem', { lineHeight: '1.75rem' }],
        'title-medium': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.01em' }],
        'title-small': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.0125em' }],
        'body-large': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.00625em' }],
        'body-medium': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'body-small': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'label-large': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.0125em' }],
        'label-medium': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'label-small': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
      }
    }
  }
};
```

---

## **Dark Theme Implementation**

### **Dark Theme Color Tokens**
```css
/* Dark theme overrides */
[data-theme="dark"] {
  /* Primary Colors */
  --md-sys-color-primary: 208 188 255;
  --md-sys-color-on-primary: 54 0 115;
  --md-sys-color-primary-container: 78 0 142;
  --md-sys-color-on-primary-container: 237 221 246;
  
  /* Secondary Colors */
  --md-sys-color-secondary: 204 194 220;
  --md-sys-color-on-secondary: 50 45 65;
  --md-sys-color-secondary-container: 73 68 88;
  --md-sys-color-on-secondary-container: 232 222 248;
  
  /* Surface Colors */
  --md-sys-color-surface: 16 14 19;
  --md-sys-color-on-surface: 230 225 229;
  --md-sys-color-surface-variant: 73 69 78;
  --md-sys-color-on-surface-variant: 202 196 208;
  --md-sys-color-outline: 147 143 153;
  --md-sys-color-outline-variant: 73 69 78;
  
  /* Background */
  --md-sys-color-background: 16 14 19;
  --md-sys-color-on-background: 230 225 229;
}
```

### **Theme Switching**
```typescript
// Theme provider with system preference detection
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    setResolvedTheme(effectiveTheme);
    root.setAttribute('data-theme', effectiveTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

---

## **Component Implementation**

### **Material Design 3 Button Variants**
```typescript
// Button component with Material Design 3 variants
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-full text-label-large font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Material Design 3 button types
        filled: "bg-primary text-primary-foreground hover:shadow-md active:shadow-sm",
        'filled-tonal': "bg-secondary-container text-secondary-container-foreground hover:shadow-md active:shadow-sm",
        outlined: "border border-outline text-primary hover:bg-primary/8 active:bg-primary/12",
        text: "text-primary hover:bg-primary/8 active:bg-primary/12",
        elevated: "bg-surface text-primary shadow-sm hover:shadow-md active:shadow-sm border-0",
      },
      size: {
        sm: "h-8 px-4 text-label-small",
        md: "h-10 px-6 text-label-medium",
        lg: "h-12 px-8 text-label-large",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### **Material Design 3 Card Component**
```typescript
// Card component with Material Design 3 elevation system
const cardVariants = cva(
  "rounded-lg border bg-surface text-surface-foreground transition-all",
  {
    variants: {
      variant: {
        elevated: "shadow-sm hover:shadow-md border-transparent",
        filled: "bg-surface-variant border-transparent",
        outlined: "border-outline-variant shadow-none",
      }
    },
    defaultVariants: {
      variant: "outlined",
    },
  }
);

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
);
```

### **AI Suggestion Components**
```typescript
// Material Design 3 styled AI suggestion card
export const AISuggestionCard = ({ suggestion, onAccept, onDismiss }: AISuggestionCardProps) => {
  const suggestionTypeColors = {
    grammar: 'border-l-error bg-error-container/10',
    style: 'border-l-primary bg-primary-container/10',
    clarity: 'border-l-tertiary bg-tertiary-container/10',
  };

  return (
    <Card 
      variant="outlined"
      className={cn(
        "p-4 border-l-4 transition-all hover:shadow-md",
        suggestionTypeColors[suggestion.type]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-label-small">
              {suggestion.type}
            </Badge>
            <span className="text-body-small text-surface-variant-foreground">
              {Math.round(suggestion.confidence * 100)}% confidence
            </span>
          </div>
          
          <p className="text-body-medium text-surface-foreground mb-2">
            {suggestion.explanation}
          </p>
          
          <div className="space-y-1">
            <div className="text-label-medium text-surface-variant-foreground">Original:</div>
            <div className="bg-surface-variant rounded p-2 text-body-small">
              {suggestion.originalText}
            </div>
            
            <div className="text-label-medium text-surface-variant-foreground">Suggested:</div>
            <div className="bg-primary-container rounded p-2 text-body-small">
              {suggestion.suggestedText}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="filled"
            onClick={() => onAccept(suggestion)}
            className="min-w-[80px]"
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="text"
            onClick={() => onDismiss(suggestion)}
            className="min-w-[80px]"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

---

## **Typography Implementation**

### **Material Design 3 Typography Scale**
```typescript
// Typography component for consistent text styling
const typographyVariants = cva("", {
  variants: {
    variant: {
      'display-large': 'text-display-large font-normal',
      'display-medium': 'text-display-medium font-normal',
      'display-small': 'text-display-small font-normal',
      'headline-large': 'text-headline-large font-normal',
      'headline-medium': 'text-headline-medium font-normal',
      'headline-small': 'text-headline-small font-normal',
      'title-large': 'text-title-large font-medium',
      'title-medium': 'text-title-medium font-medium',
      'title-small': 'text-title-small font-medium',
      'body-large': 'text-body-large font-normal',
      'body-medium': 'text-body-medium font-normal',
      'body-small': 'text-body-small font-normal',
      'label-large': 'text-label-large font-medium',
      'label-medium': 'text-label-medium font-medium',
      'label-small': 'text-label-small font-medium',
    },
    color: {
      primary: 'text-primary',
      'on-surface': 'text-surface-foreground',
      'on-surface-variant': 'text-surface-variant-foreground',
      error: 'text-error',
      tertiary: 'text-tertiary',
    }
  },
  defaultVariants: {
    variant: 'body-medium',
    color: 'on-surface',
  },
});

export const Typography = ({ variant, color, className, ...props }) => (
  <span 
    className={cn(typographyVariants({ variant, color }), className)} 
    {...props} 
  />
);
```

---

## **Material Design 3 Motion**

### **Easing Curves**
```css
/* Material Design 3 easing curves */
:root {
  --md-sys-motion-easing-linear: cubic-bezier(0, 0, 1, 1);
  --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-standard-accelerate: cubic-bezier(0.3, 0, 1, 1);
  --md-sys-motion-easing-standard-decelerate: cubic-bezier(0, 0, 0, 1);
  --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
  --md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
}
```

### **Duration Tokens**
```typescript
// Motion duration system
export const motionDurations = {
  short1: '50ms',   // Micro-interactions
  short2: '100ms',  // Small component changes
  short3: '150ms',  // Medium component changes
  short4: '200ms',  // Large component changes
  medium1: '250ms', // Small layout changes
  medium2: '300ms', // Medium layout changes
  medium3: '350ms', // Large layout changes
  medium4: '400ms', // Panel slides
  long1: '450ms',   // Modal animations
  long2: '500ms',   // Page transitions
  long3: '550ms',   // Complex transitions
  long4: '600ms',   // Extra large animations
};
```

### **Transition Utilities**
```typescript
// Tailwind transition utilities for Material Design 3
const transitionUtilities = {
  'motion-standard': 'transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
  'motion-emphasized': 'transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
  'motion-emphasized-decelerate': 'transition-all duration-400 ease-[cubic-bezier(0.05,0.7,0.1,1)]',
};
```

---

## **Writing Assistant Specific Theming**

### **Editor Theme Integration**
```typescript
// TipTap editor styling with Material Design 3
const editorTheme = {
  '.ProseMirror': {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.125rem', // 18px for optimal reading
    lineHeight: '1.7',
    color: 'rgb(var(--md-sys-color-on-surface))',
    caretColor: 'rgb(var(--md-sys-color-primary))',
    
    // Selection styling
    '::selection': {
      backgroundColor: 'rgb(var(--md-sys-color-primary) / 0.2)',
    },
    
    // Focus styling
    '&:focus': {
      outline: 'none',
    },
    
    // AI suggestion highlights
    '.ai-highlight': {
      position: 'relative',
      cursor: 'pointer',
      borderRadius: '2px',
      transition: 'all var(--motion-standard)',
      
      '&[data-type="grammar"]': {
        backgroundColor: 'rgb(var(--md-sys-color-error) / 0.1)',
        textDecorationLine: 'underline',
        textDecorationStyle: 'wavy',
        textDecorationColor: 'rgb(var(--md-sys-color-error))',
      },
      
      '&[data-type="style"]': {
        backgroundColor: 'rgb(var(--md-sys-color-primary) / 0.1)',
        textDecorationLine: 'underline',
        textDecorationStyle: 'dotted',
        textDecorationColor: 'rgb(var(--md-sys-color-primary))',
      },
      
      '&[data-type="clarity"]': {
        backgroundColor: 'rgb(var(--md-sys-color-tertiary) / 0.1)',
        textDecorationLine: 'underline',
        textDecorationStyle: 'dashed',
        textDecorationColor: 'rgb(var(--md-sys-color-tertiary))',
      },
      
      '&:hover': {
        backgroundColor: 'rgb(var(--md-sys-color-primary) / 0.15)',
      }
    }
  }
};
```

### **Collaborative Features Styling**
```typescript
// User presence indicators with Material Design 3 colors
export const CollaboratorCursor = ({ user, position }: CollaboratorCursorProps) => {
  const userColors = [
    'rgb(var(--md-sys-color-primary))',
    'rgb(var(--md-sys-color-secondary))',
    'rgb(var(--md-sys-color-tertiary))',
    'rgb(var(--md-sys-color-error))',
  ];
  
  const userColor = userColors[user.id.charCodeAt(0) % userColors.length];
  
  return (
    <div 
      className="absolute pointer-events-none z-10"
      style={{ 
        left: position.x, 
        top: position.y,
        borderLeftColor: userColor,
      }}
    >
      <div className="w-0.5 h-6 border-l-2 relative">
        <div 
          className="absolute -top-1 -left-2 px-2 py-1 rounded text-label-small whitespace-nowrap shadow-md"
          style={{ 
            backgroundColor: userColor,
            color: 'white',
          }}
        >
          {user.name}
        </div>
      </div>
    </div>
  );
};
```

---

## **Accessibility Enhancements**

### **High Contrast Mode**
```css
/* High contrast theme for accessibility */
@media (prefers-contrast: high) {
  :root {
    --md-sys-color-primary: 0 0 0;
    --md-sys-color-on-primary: 255 255 255;
    --md-sys-color-surface: 255 255 255;
    --md-sys-color-on-surface: 0 0 0;
    --md-sys-color-outline: 0 0 0;
  }
  
  [data-theme="dark"] {
    --md-sys-color-primary: 255 255 255;
    --md-sys-color-on-primary: 0 0 0;
    --md-sys-color-surface: 0 0 0;
    --md-sys-color-on-surface: 255 255 255;
    --md-sys-color-outline: 255 255 255;
  }
}
```

### **Reduced Motion Support**
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## **Dynamic Color System**

### **Material You Color Generation**
```typescript
// Generate dynamic colors from user preferences or wallpaper
import { argbFromHex, themeFromSourceColor, applyTheme } from '@material/material-color-utilities';

export const generateDynamicTheme = (sourceColor: string) => {
  // Convert hex to ARGB
  const argb = argbFromHex(sourceColor);
  
  // Generate theme from source color
  const theme = themeFromSourceColor(argb);
  
  // Apply theme to CSS custom properties
  const lightTheme = theme.schemes.light.toJSON();
  const darkTheme = theme.schemes.dark.toJSON();
  
  // Update CSS custom properties
  const root = document.documentElement;
  
  Object.entries(lightTheme).forEach(([key, value]) => {
    const cssVar = `--md-sys-color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, `${value.red} ${value.green} ${value.blue}`);
  });
  
  // Store dark theme for theme switching
  localStorage.setItem('dark-theme', JSON.stringify(darkTheme));
};

// Usage in theme provider
export const useDynamicColor = () => {
  const [sourceColor, setSourceColor] = useState('#6750A4'); // Default Material purple
  
  useEffect(() => {
    generateDynamicTheme(sourceColor);
  }, [sourceColor]);
  
  return { sourceColor, setSourceColor };
};
```

---

## **Component Customization Examples**

### **Material Design 3 Navigation Rail**
```typescript
// Desktop navigation with Material Design 3 styling
export const NavigationRail = ({ items, activeItem, onItemClick }: NavigationRailProps) => {
  return (
    <nav className="w-20 bg-surface border-r border-outline-variant flex flex-col items-center py-4 space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item)}
          className={cn(
            "w-14 h-8 rounded-full flex items-center justify-center transition-all",
            "hover:bg-primary/8 focus-visible:bg-primary/12",
            activeItem === item.id
              ? "bg-secondary-container text-secondary-container-foreground"
              : "text-surface-variant-foreground"
          )}
          aria-label={item.label}
        >
          <item.icon className="w-6 h-6" />
        </button>
      ))}
    </nav>
  );
};
```

### **Material Design 3 FAB for Quick Actions**
```typescript
// Floating Action Button for new document creation
export const DocumentFAB = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-lg",
        "bg-primary-container text-primary-container-foreground",
        "hover:shadow-xl transition-all duration-300",
        "focus-visible:ring-2 focus-visible:ring-primary"
      )}
      aria-label="Create new document"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
};
```

---

This comprehensive Material Design 3 theme implementation provides a solid foundation for building a modern, accessible, and visually cohesive writing assistant that follows Google's latest design principles while integrating seamlessly with your chosen tech stack. 