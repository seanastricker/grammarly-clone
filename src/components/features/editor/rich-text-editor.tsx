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
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onUpdate,
  placeholder = 'Start writing...',
  className,
  editable = true
}) => {
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
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none',
          'min-h-[500px] p-6',
          'prose-headings:text-foreground prose-p:text-foreground',
          'prose-strong:text-foreground prose-em:text-foreground',
          'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
          'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
          'prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline'
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
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-background', className)}>
      <EditorToolbar editor={editor} />
      <div className="relative">
        <EditorContent 
          editor={editor}
          className="min-h-[500px] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
        />
        {!content && editor && (
          <div className="absolute top-6 left-6 text-muted-foreground pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}; 