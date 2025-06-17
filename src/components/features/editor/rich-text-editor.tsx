/**
 * @fileoverview Rich text editor component using TipTap
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Main rich text editor component with TipTap and formatting capabilities.
 */

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { EditorToolbar } from './toolbar';
import { GrammarHighlight, applyGrammarHighlights, clearGrammarHighlights } from './grammar-highlight-extension';
import type { AnalyzedError } from '@/services/ai/language-tool';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  enableGrammarCheck?: boolean;
  onGrammarAnalysis?: (errors: AnalyzedError[], statistics: any) => void;
  currentErrors?: AnalyzedError[]; // Current errors from parent (after user actions)
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onUpdate,
  placeholder = 'Start writing...',
  className,
  editable = true,
  enableGrammarCheck = false,
  onGrammarAnalysis,
  currentErrors = []
}) => {
  // Track when we're applying highlights to prevent triggering grammar analysis
  const isApplyingHighlightsRef = React.useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // The StarterKit includes:
        // - Bold, Italic, Strike, Code
        // - Heading, Paragraph
        // - BulletList, OrderedList, ListItem
        // - Blockquote
        // - History (undo/redo)
        // - HardBreak, HorizontalRule
        history: {
          depth: 50,
        },
      }),
      Underline,
      TextStyle,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // Add grammar highlighting extension
      GrammarHighlight,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      
      // Only trigger onUpdate if we're not currently applying highlights
      if (!isApplyingHighlightsRef.current) {
      onUpdate(html);
      } else {
        console.log('🔧 Skipping onUpdate - applying highlights');
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-xl mx-auto focus:outline-none',
          'min-h-[500px] p-6',
          'prose-headings:text-slate-900 prose-p:text-slate-900',
          'prose-strong:text-slate-900 prose-em:text-slate-900',
          'prose-code:text-slate-900 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
          'prose-blockquote:border-l-blue-600 prose-blockquote:text-slate-600',
          'prose-ul:text-slate-900 prose-ol:text-slate-900 prose-li:text-slate-900',
          'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline'
        ),
        'data-placeholder': placeholder,
      },
    },
  });

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  // Update content when prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      isApplyingHighlightsRef.current = true;
      editor.commands.setContent(content, false);
      // Reset the flag after a brief delay to allow the editor to settle
      setTimeout(() => {
        isApplyingHighlightsRef.current = false;
      }, 10);
    }
  }, [editor, content]);

  // Apply grammar highlights when errors change
  React.useEffect(() => {
    if (!editor) return;

    console.log('🔧 HIGHLIGHT EFFECT TRIGGERED:', {
      enableGrammarCheck,
      currentErrorsLength: currentErrors.length,
      currentErrorIds: currentErrors.map(e => e.id),
      editorExists: !!editor
    });

    console.log('🔧 FULL ERROR DETAILS:', currentErrors.map(e => ({
      id: e.id,
      type: e.type,
      position: e.position,
      message: e.shortMessage
    })));

    // Set the flag to prevent onUpdate during highlight operations
    isApplyingHighlightsRef.current = true;

    // Async function to handle highlight operations
    const applyHighlights = async () => {
      try {
        if (enableGrammarCheck && currentErrors.length > 0) {
          console.log('🔧 Applying highlights:', currentErrors.length, 'current errors');
          const plainText = editor.getText();
          console.log('🔧 Current editor text:', plainText);
          await applyGrammarHighlights(editor, currentErrors, plainText);
        } else {
          // Clear highlights when disabled or no errors
          console.log('🔧 Clearing highlights -', !enableGrammarCheck ? 'grammar disabled' : 'no current errors');
          await clearGrammarHighlights(editor);
        }
      } catch (err) {
        console.warn('Error in highlight operations:', err);
      } finally {
        // Reset the flag after highlight operations complete
        setTimeout(() => {
          isApplyingHighlightsRef.current = false;
          console.log('🔧 Highlight operations complete, re-enabling onUpdate');
        }, 10);
      }
    };

    // Execute the async highlight operations
    applyHighlights();
  }, [editor, currentErrors, enableGrammarCheck]);

  return (
    <div className={cn('border border-slate-200 rounded-lg overflow-hidden bg-white', className)}>
      <EditorToolbar editor={editor} />
      <div className="relative">
        <EditorContent 
          editor={editor}
          className="min-h-[500px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
        />
        {!content && editor && (
          <div className="absolute top-6 left-6 text-slate-500 pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}; 