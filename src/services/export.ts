/**
 * @fileoverview Export service for D&D campaigns
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Provides export functionality for D&D campaigns in multiple formats:
 * - Plain text (.txt)
 * - PDF (.pdf) with D&D-themed formatting
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { extractPlainTextFromHTML, convertHTMLToFormattedText } from '@/lib/utils';
import type { Document } from '@/types/document';
import type { AIGrammarStatistics } from '@/services/ai/grammar-ai-service';

export interface ExportOptions {
  format: 'pdf' | 'txt';
  includeCover?: boolean;
  title?: string;
  author?: string;
  campaignType?: 'one-shot' | 'campaign' | 'adventure' | 'module';
}

export interface ExportMetadata {
  title: string;
  author: string;
  campaignType: string;
  exportDate: Date;
  wordCount: number;
  qualityScore?: number | undefined;
  dndTerms?: number | undefined;
}

/**
 * Export a D&D campaign document
 */
export async function exportDocument(
  document: Document,
  options: ExportOptions,
  statistics?: AIGrammarStatistics
): Promise<void> {
  const metadata: ExportMetadata = {
    title: options.title || document.title,
    author: options.author || 'Dungeon Master',
    campaignType: options.campaignType || 'campaign',
    exportDate: new Date(),
    wordCount: document.stats.wordCount,
    qualityScore: statistics?.qualityScore,
    dndTerms: statistics?.campaignMetrics?.dndTerms
  };

  switch (options.format) {
    case 'pdf':
      await exportToPDFInternal(document, options, metadata, statistics);
      break;
    case 'txt':
      await exportToText(document, options, metadata, statistics);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Export campaign as PDF with D&D-themed formatting
 */
async function exportToPDFInternal(
  document: Document,
  options: ExportOptions,
  metadata: ExportMetadata,
  statistics?: AIGrammarStatistics
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    
    const lines = pdf.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.4;
    
    checkPageBreak(lines.length * lineHeight);
    
    lines.forEach((line: string) => {
      pdf.text(line, margin, currentY);
      currentY += lineHeight;
    });
    
    currentY += lineHeight * 0.5; // Add some spacing after text
  };

  try {
    // Cover Page (if requested)
    if (options.includeCover) {
      // Title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(metadata.title, contentWidth);
      let titleY = pageHeight / 3;
      
      titleLines.forEach((line: string) => {
        const textWidth = pdf.getTextWidth(line);
        const x = (pageWidth - textWidth) / 2;
        pdf.text(line, x, titleY);
        titleY += 10;
      });

      // D&D Campaign Label
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      const subtitle = `A Dungeons & Dragons ${metadata.campaignType.charAt(0).toUpperCase() + metadata.campaignType.slice(1)}`;
      const subtitleWidth = pdf.getTextWidth(subtitle);
      pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, titleY + 20);

      // Author
      pdf.setFontSize(14);
      const authorText = `Created by ${metadata.author}`;
      const authorWidth = pdf.getTextWidth(authorText);
      pdf.text(authorText, (pageWidth - authorWidth) / 2, titleY + 40);

      // Export Date
      pdf.setFontSize(10);
      const dateText = `Exported on ${metadata.exportDate.toLocaleDateString()}`;
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, (pageWidth - dateWidth) / 2, titleY + 55);

      // Add decorative border
      pdf.setDrawColor(139, 69, 19); // Brown color for D&D theme
      pdf.setLineWidth(1);
      pdf.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (margin * 2) + 10);

      // New page for content
      pdf.addPage();
      currentY = margin;
    }



    // Main Content
    addWrappedText('Campaign Content', 18, 'bold');
    currentY += 5;

    // Convert HTML content to formatted text preserving structure
    const formattedText = convertHTMLToFormattedText(document.content);
    
    // Process the formatted text line by line to handle different elements
    const lines = formattedText.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines but add spacing
      if (line.trim() === '') {
        currentY += 3;
        continue;
      }
      
      // Handle different formatting styles
      if (line.match(/^={60}$/)) {
        // H1 underline - skip, we'll handle with the title above
        continue;
      } else if (line.match(/^-{40}$/)) {
        // H2 underline - skip, we'll handle with the title above
        continue;
      } else if (line.match(/^-{20}$/)) {
        // H3 underline - skip, we'll handle with the title above
        continue;
      } else if (line.match(/^-{60}$/)) {
        // Horizontal rule
        checkPageBreak(5);
        pdf.setDrawColor(139, 69, 19);
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 5;
        continue;
      } else if (i < lines.length - 1 && lines[i + 1].match(/^={60}$/)) {
        // H1 title (next line is underline)
        addWrappedText(line, 16, 'bold');
        currentY += 3;
      } else if (i < lines.length - 1 && lines[i + 1].match(/^-{40}$/)) {
        // H2 title (next line is underline)
        addWrappedText(line, 14, 'bold');
        currentY += 2;
      } else if (i < lines.length - 1 && lines[i + 1].match(/^-{20}$/)) {
        // H3 title (next line is underline)
        addWrappedText(line, 13, 'bold');
        currentY += 2;
      } else if (line.match(/^[^:]+:$/)) {
        // H4-H6 titles (end with colon)
        addWrappedText(line, 12, 'bold');
        currentY += 1;
      } else if (line.startsWith('• ')) {
        // Bullet list item
        const text = line.substring(2);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        // Add bullet point
        const bulletX = margin + 5;
        const textX = margin + 10;
        
        checkPageBreak(5);
        pdf.text('•', bulletX, currentY);
        
        // Wrap text with proper indentation
        const wrappedLines = pdf.splitTextToSize(text, contentWidth - 15);
        wrappedLines.forEach((wrappedLine: string, index: number) => {
          if (index > 0) checkPageBreak(4);
          pdf.text(wrappedLine, textX, currentY);
          currentY += 4;
        });
        
        currentY += 1; // Small spacing after list item
      } else if (line.match(/^\d+\. /)) {
        // Numbered list item
        const match = line.match(/^(\d+\. )(.*)$/);
        if (match) {
          const number = match[1];
          const text = match[2];
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          
          checkPageBreak(5);
          
          // Add number
          const numberWidth = pdf.getTextWidth(number);
          pdf.text(number, margin + 5, currentY);
          
          // Wrap text with proper indentation
          const wrappedLines = pdf.splitTextToSize(text, contentWidth - numberWidth - 10);
          wrappedLines.forEach((wrappedLine: string, index: number) => {
            if (index > 0) checkPageBreak(4);
            pdf.text(wrappedLine, margin + 5 + numberWidth, currentY);
            currentY += 4;
          });
          
          currentY += 1; // Small spacing after list item
        }
      } else if (line.startsWith('> ')) {
        // Blockquote
        const text = line.substring(2);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'italic');
        
        checkPageBreak(5);
        
        // Add quote indicator
        pdf.setDrawColor(139, 69, 19);
        pdf.setLineWidth(2);
        pdf.line(margin, currentY - 2, margin, currentY + 3);
        
        // Add quoted text with indentation
        const wrappedLines = pdf.splitTextToSize(text, contentWidth - 10);
        wrappedLines.forEach((wrappedLine: string) => {
          checkPageBreak(4);
          pdf.text(wrappedLine, margin + 8, currentY);
          currentY += 4;
        });
        
        currentY += 2; // Extra spacing after blockquote
      } else if (line.startsWith('```') && line.endsWith('```')) {
        // Inline code block
        const text = line.substring(3, line.length - 3);
        pdf.setFontSize(10);
        pdf.setFont('courier', 'normal');
        
        checkPageBreak(6);
        
        // Add background rectangle
        pdf.setFillColor(245, 245, 245);
        const textWidth = pdf.getTextWidth(text);
        pdf.rect(margin, currentY - 3, Math.min(textWidth + 4, contentWidth), 6, 'F');
        
        pdf.text(text, margin + 2, currentY);
        currentY += 8;
      } else {
        // Regular paragraph text
        // Handle bold, italic, and underline formatting
        let processedLine = line;
        let fontSize = 11;
        let fontStyle: 'normal' | 'bold' = 'normal';
        
        // Simple formatting detection (this could be enhanced)
        if (processedLine.includes('**')) {
          // Contains bold text - for simplicity, make whole line bold if it has bold formatting
          fontStyle = 'bold';
          processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '$1');
        } else if (processedLine.includes('*')) {
          // Contains italic text - handle as normal since addWrappedText doesn't support italic
          processedLine = processedLine.replace(/\*(.*?)\*/g, '$1');
        }
        
        // Remove any remaining markdown formatting
        processedLine = processedLine.replace(/`(.*?)`/g, '$1'); // code
        processedLine = processedLine.replace(/_(.*?)_/g, '$1'); // underline
        
        addWrappedText(processedLine, fontSize, fontStyle);
      }
    }

    // Footer on each page
    const totalPages = pdf.internal.pages.length - 1; // Subtract the first empty page
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      // Page number
      const pageText = `Page ${i} of ${totalPages}`;
      const pageTextWidth = pdf.getTextWidth(pageText);
      pdf.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10);
      
      // Campaign title
      pdf.text(metadata.title, margin, pageHeight - 10);
    }

    // Save the PDF
    const fileName = `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(fileName);

    console.log('📄 PDF export completed:', fileName);

  } catch (error) {
    console.error('❌ PDF export failed:', error);
    throw new Error('Failed to export PDF: ' + (error as Error).message);
  }
}

/**
 * Export campaign as plain text
 */
async function exportToText(
  document: Document,
  options: ExportOptions,
  metadata: ExportMetadata,
  statistics?: AIGrammarStatistics
): Promise<void> {
  try {
    let content = '';

    // Header
    content += '='.repeat(60) + '\n';
    content += metadata.title.toUpperCase() + '\n';
    content += '='.repeat(60) + '\n';
    content += `A Dungeons & Dragons ${metadata.campaignType.charAt(0).toUpperCase() + metadata.campaignType.slice(1)}\n`;
    content += `Created by ${metadata.author}\n`;
    content += `Exported on ${metadata.exportDate.toLocaleDateString()}\n`;
    content += '='.repeat(60) + '\n\n';



    // Main Content
    content += 'CAMPAIGN CONTENT\n';
    content += '-'.repeat(16) + '\n\n';
    
    // Convert HTML to formatted text preserving structure
    const formattedText = convertHTMLToFormattedText(document.content);
    content += formattedText;

    content += '\n\n' + '='.repeat(60) + '\n';
    content += 'End of Campaign\n';
    content += '='.repeat(60) + '\n';

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    
    const fileName = `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    console.log('📝 Text export completed:', fileName);

  } catch (error) {
    console.error('❌ Text export failed:', error);
    throw new Error('Failed to export text: ' + (error as Error).message);
  }
}

/**
 * Quick export functions for convenience
 */
export const exportToPDF = (document: Document, statistics?: AIGrammarStatistics) => 
  exportDocument(document, { format: 'pdf', includeCover: true }, statistics);

export const exportToTXT = (document: Document, statistics?: AIGrammarStatistics) => 
  exportDocument(document, { format: 'txt' }, statistics);

/**
 * Get suggested filename for export
 */
export function getSuggestedFilename(document: Document, format: 'pdf' | 'txt'): string {
  const cleanTitle = document.title.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${cleanTitle}_${timestamp}.${format}`;
} 