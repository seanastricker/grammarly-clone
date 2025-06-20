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
import { extractPlainTextFromHTML } from '@/lib/utils';
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

    // Convert HTML content to plain text for PDF
    const plainText = extractPlainTextFromHTML(document.content);
    
    // Split content into sections if it contains headers
    const sections = plainText.split(/(?=^[A-Z][^.]*$)/gm).filter(section => section.trim());
    
    if (sections.length > 1) {
      // Content has sections - format as such
      sections.forEach(section => {
        const lines = section.trim().split('\n');
        const firstLine = lines[0].trim();
        
        // Check if first line looks like a header (short, all caps or title case)
        if (firstLine.length < 100 && /^[A-Z]/.test(firstLine)) {
          addWrappedText(firstLine, 14, 'bold');
          
          // Add remaining content
          const content = lines.slice(1).join('\n').trim();
          if (content) {
            addWrappedText(content, 11);
          }
        } else {
          addWrappedText(section.trim(), 11);
        }
        
        currentY += 5; // Extra spacing between sections
      });
    } else {
      // Single section - just add the content
      addWrappedText(plainText, 11);
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
    
    // Convert HTML to plain text
    const plainText = extractPlainTextFromHTML(document.content);
    content += plainText;

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