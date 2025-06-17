/**
 * @fileoverview Custom TipTap extension for grammar error highlighting
 * @author WordWise AI Team
 * @version 1.0.0
 */

import { Mark, mergeAttributes } from '@tiptap/core';
import type { AnalyzedError } from '@/services/ai/language-tool';

export interface GrammarHighlightOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    grammarHighlight: {
      /**
       * Set grammar error highlighting
       */
      setGrammarHighlight: (attributes: {
        errorId: string;
        errorType: 'grammar' | 'spelling' | 'style';
        severity: 'error' | 'warning' | 'suggestion';
        message: string;
        suggestions: string[];
      }) => ReturnType;
      /**
       * Remove grammar error highlighting
       */
      unsetGrammarHighlight: () => ReturnType;
      /**
       * Remove specific error by ID
       */
      removeGrammarError: (errorId: string) => ReturnType;
    };
  }
}

/**
 * Custom TipTap extension for grammar error highlighting
 */
export const GrammarHighlight = Mark.create<GrammarHighlightOptions>({
  name: 'grammarHighlight',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      errorId: {
        default: null,
        parseHTML: element => element.getAttribute('data-error-id'),
        renderHTML: attributes => {
          if (!attributes.errorId) {
            return {};
          }
          return {
            'data-error-id': attributes.errorId,
          };
        },
      },
      errorType: {
        default: 'grammar',
        parseHTML: element => element.getAttribute('data-error-type'),
        renderHTML: attributes => {
          if (!attributes.errorType) {
            return {};
          }
          return {
            'data-error-type': attributes.errorType,
          };
        },
      },
      severity: {
        default: 'error',
        parseHTML: element => element.getAttribute('data-severity'),
        renderHTML: attributes => {
          if (!attributes.severity) {
            return {};
          }
          return {
            'data-severity': attributes.severity,
          };
        },
      },
      message: {
        default: '',
        parseHTML: element => element.getAttribute('data-message'),
        renderHTML: attributes => {
          if (!attributes.message) {
            return {};
          }
          return {
            'data-message': attributes.message,
          };
        },
      },
      suggestions: {
        default: [],
        parseHTML: element => {
          const suggestions = element.getAttribute('data-suggestions');
          return suggestions ? JSON.parse(suggestions) : [];
        },
        renderHTML: attributes => {
          if (!attributes.suggestions || attributes.suggestions.length === 0) {
            return {};
          }
          return {
            'data-suggestions': JSON.stringify(attributes.suggestions),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-grammar-error]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { errorType, severity } = HTMLAttributes;
    
    console.log('🔧 Rendering grammar highlight:', { errorType, severity, allAttrs: HTMLAttributes });
    
    // Generate CSS classes based on error type and severity  
    const classes = [
      'grammar-error',
      errorType ? `grammar-error-${errorType}` : 'grammar-error-unknown',
      severity ? `grammar-error-${severity}` : 'grammar-error-default',
    ];

    console.log('🔧 Generated CSS classes:', classes);

    return [
      'span',
      mergeAttributes(
        {
          'data-grammar-error': 'true',
          class: classes.join(' '),
          title: HTMLAttributes.message || '',
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      0,
    ];
  },

  addCommands() {
    return {
      setGrammarHighlight:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetGrammarHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
      removeGrammarError:
        (errorId: string) =>
        ({ editor }) => {
          const { state } = editor;
          const { tr } = state;
          
          // Find all marks with the specified errorId
          state.doc.descendants((node: any, pos: number) => {
            if (node.marks) {
              node.marks.forEach((mark: any) => {
                if (mark.type.name === this.name && mark.attrs.errorId === errorId) {
                  const from = pos;
                  const to = pos + node.nodeSize;
                  tr.removeMark(from, to, mark.type);
                }
              });
            }
          });

          if (tr.docChanged) {
            editor.view.dispatch(tr);
          }

          return true;
        },
    };
  },
});

/**
 * Apply grammar error highlights to the editor
 */
export async function applyGrammarHighlights(
  editor: any,
  errors: AnalyzedError[],
  textContent: string
) {
  if (!editor || !errors.length) {
    console.log('🔧 Skipping highlight application:', { hasEditor: !!editor, errorCount: errors.length });
    return;
  }

  console.log('🔧 Applying grammar highlights:', errors.length, 'errors to text:', textContent.substring(0, 50) + '...');
  console.log('🔧 Errors to highlight:', errors.map(e => ({ 
    id: e.id, 
    type: e.type, 
    position: e.position,
    text: textContent.substring(e.position.start, e.position.end)
  })));

  // Clear existing grammar highlights and wait for completion
  await clearGrammarHighlights(editor);
  
  // Small delay to ensure DOM has updated
  await new Promise(resolve => setTimeout(resolve, 10));

  // Apply new highlights
  errors.forEach((error, index) => {
    try {
      const { start, end } = error.position;
      const errorText = textContent.substring(start, end);
      
      console.log(`🔧 Processing error ${index + 1}/${errors.length}:`, {
        id: error.id,
        type: error.type,
        position: { start, end },
        text: errorText
      });
      
      // Convert plain text positions to editor positions
      const editorPositions = mapTextPositionsToEditor(editor, start, end, textContent);
      
      if (editorPositions) {
        const { from, to } = editorPositions;
        
        console.log(`🔧 Applying highlight to editor positions:`, {
          errorId: error.id,
          editorPositions: { from, to },
          editorText: editor.getText().substring(from - 1, to - 1)
        });
        
        // Apply the grammar highlight mark
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .setGrammarHighlight({
            errorId: error.id,
            errorType: error.type,
            severity: error.severity,
            message: error.message,
            suggestions: error.suggestions,
          })
          .run();
          
        console.log(`🔧 Successfully applied highlight for error:`, error.id);
      } else {
        console.warn(`🔧 Could not map positions for error:`, error.id);
      }
    } catch (err) {
      console.warn('Failed to apply grammar highlight:', err);
    }
  });
  
  console.log('🔧 Highlight application complete');
  
  // Debug: Check final DOM state after applying highlights
  const finalDom = editor.view.dom.innerHTML;
  console.log('🔧 FINAL DOM after applying highlights:', finalDom);
  
  // Check final grammar error elements
  const finalGrammarElements = editor.view.dom.querySelectorAll('.grammar-error, [data-grammar-error]');
  console.log('🔧 Final grammar elements after applying:', finalGrammarElements.length);
  finalGrammarElements.forEach((el: any, index: number) => {
    console.log(`🔧 Final grammar element ${index}:`, {
      className: el.className,
      textContent: el.textContent,
      attributes: Array.from(el.attributes).map((attr: any) => `${attr.name}="${attr.value}"`).join(' ')
    });
  });
  
  // Force browser repaint to ensure visual updates
  forceBrowserRepaint(editor);
}

/**
 * Force browser repaint to ensure visual updates match DOM state
 */
function forceBrowserRepaint(editor: any) {
  try {
    console.log('🔧 Forcing browser repaint...');
    
    // Method 1: Force reflow by accessing offsetHeight
    const editorElement = editor.view.dom;
    const _ = editorElement.offsetHeight;
    
    // Method 2: Temporarily modify and restore a style
    const originalDisplay = editorElement.style.display;
    editorElement.style.display = 'none';
    editorElement.offsetHeight; // Force reflow
    editorElement.style.display = originalDisplay;
    
    // Method 3: Use requestAnimationFrame for next paint cycle
    requestAnimationFrame(() => {
      console.log('🔧 Browser repaint completed');
    });
  } catch (err) {
    console.warn('Failed to force browser repaint:', err);
  }
}

/**
 * Clear all grammar highlights from the editor
 */
export async function clearGrammarHighlights(editor: any): Promise<void> {
  if (!editor) {
    console.log('🔧 Skipping highlight clearing - no editor');
    return;
  }

  console.log('🔧 Clearing all grammar highlights');

  // Debug: Check DOM before clearing
  const domBefore = editor.view.dom.innerHTML;
  console.log('🔧 DOM BEFORE clearing:', domBefore);
  
  // Check for any existing grammar error classes in DOM
  const grammarElements = editor.view.dom.querySelectorAll('.grammar-error, [data-grammar-error]');
  console.log('🔧 Grammar elements found in DOM before clearing:', grammarElements.length);
  grammarElements.forEach((el: any, index: number) => {
    console.log(`🔧 Grammar element ${index}:`, {
      className: el.className,
      textContent: el.textContent,
      attributes: Array.from(el.attributes).map((attr: any) => `${attr.name}="${attr.value}"`).join(' ')
    });
  });

  return new Promise((resolve) => {
    try {
      // Method 1: Use editor commands only (avoid transaction mixing)
      console.log('🔧 Method 1: Using editor commands to clear all marks');
      
      // Select all content and remove grammar highlights
      const result = editor
        .chain()
        .focus()
        .selectAll()
        .unsetGrammarHighlight()
        .run();
        
      console.log('🔧 Editor command result:', result);
      
      // Wait for the command to be processed
      setTimeout(() => {
        // Debug: Check DOM after clearing
        const domAfter = editor.view.dom.innerHTML;
        console.log('🔧 DOM AFTER clearing:', domAfter);
        
        // Check if grammar error elements still exist
        const grammarElementsAfter = editor.view.dom.querySelectorAll('.grammar-error, [data-grammar-error]');
        console.log('🔧 Grammar elements remaining after clearing:', grammarElementsAfter.length);
        grammarElementsAfter.forEach((el: any, index: number) => {
          console.log(`🔧 Remaining grammar element ${index}:`, {
            className: el.className,
            textContent: el.textContent,
            attributes: Array.from(el.attributes).map((attr: any) => `${attr.name}="${attr.value}"`).join(' ')
          });
        });
        
        // If elements still exist, try manual DOM cleanup
        if (grammarElementsAfter.length > 0) {
          console.log('🔧 WARNING: Grammar elements still exist after clearing, attempting manual cleanup');
          grammarElementsAfter.forEach((el: any) => {
            try {
              // Remove all grammar-related attributes and classes
              el.removeAttribute('data-grammar-error');
              el.removeAttribute('data-error-id');
              el.removeAttribute('data-error-type');
              el.removeAttribute('data-severity');
              el.removeAttribute('data-message');
              el.removeAttribute('data-suggestions');
              el.removeAttribute('title');
              
              // Remove grammar-related CSS classes
              const cleanClassName = el.className
                .split(' ')
                .filter((cls: string) => !cls.startsWith('grammar-error'))
                .join(' ')
                .trim();
              
              if (cleanClassName) {
                el.className = cleanClassName;
              } else {
                el.removeAttribute('class');
              }
              
              // If it's now an empty span, unwrap it
              if (el.tagName === 'SPAN' && !el.hasAttributes()) {
                const parent = el.parentNode;
                const fragment = document.createDocumentFragment();
                
                // Move all child nodes to fragment
                while (el.firstChild) {
                  fragment.appendChild(el.firstChild);
                }
                
                // Replace the span with its contents
                parent.replaceChild(fragment, el);
                console.log('🔧 Unwrapped empty span element');
              }
            } catch (err) {
              console.warn('🔧 Error in manual cleanup for element:', err);
            }
          });
          console.log('🔧 Manual DOM cleanup completed');
        }
        
        console.log('🔧 Grammar highlight clearing completed');
        resolve();
      }, 50);
      
    } catch (err) {
      console.warn('Failed to clear grammar highlights:', err);
      resolve();
    }
  });
}

/**
 * Map plain text positions to TipTap editor positions
 */
function mapTextPositionsToEditor(
  editor: any,
  textStart: number,
  textEnd: number,
  originalText: string
): { from: number; to: number } | null {
  try {
    const editorText = editor.getText();
    
    // If the text matches exactly, use direct mapping
    if (editorText === originalText) {
      return {
        from: textStart + 1, // TipTap positions start at 1
        to: textEnd + 1,
      };
    }
    
    // Extract the error text from the original analysis
    const errorText = originalText.substring(textStart, textEnd);
    
    // Find all occurrences of this text in the editor
    const editorIndex = editorText.indexOf(errorText);
    
    if (editorIndex !== -1) {
      // Found the text, map to editor positions
      return {
        from: editorIndex + 1,
        to: editorIndex + errorText.length + 1,
      };
    }
    
    // Fallback: try to find similar text (first few characters)
    if (errorText.length > 3) {
      const partialText = errorText.substring(0, Math.min(errorText.length, 5));
      const partialIndex = editorText.indexOf(partialText);
      
      if (partialIndex !== -1) {
        return {
          from: partialIndex + 1,
          to: partialIndex + errorText.length + 1,
        };
      }
    }
    
    console.warn('Could not map text position:', { errorText, editorText: editorText.substring(0, 50) });
    return null;
  } catch (err) {
    console.warn('Failed to map text positions:', err);
    return null;
  }
} 