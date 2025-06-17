/**
 * @fileoverview Document service for Firebase operations
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Service layer for document management with Firebase Firestore.
 * Handles CRUD operations, querying, and document statistics.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit as firestoreLimit,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Document,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentQueryOptions,
  DocumentListResponse,
  RecentDocument,
  DocumentStats,
  DocumentSuggestions
} from '@/types/document';

/**
 * Collection names
 */
const COLLECTIONS = {
  DOCUMENTS: 'documents',
  USERS: 'users'
} as const;

/**
 * Default document statistics
 */
const defaultStats: DocumentStats = {
  wordCount: 0,
  characterCount: 0,
  characterCountNoSpaces: 0,
  paragraphCount: 0,
  sentenceCount: 0,
  readingTime: 0,
  lastEditedAt: new Date()
};

/**
 * Convert Firestore document to Document type
 */
function convertFirestoreDocument(docSnap: QueryDocumentSnapshot<DocumentData>): Document {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title,
    content: data.content,
    userId: data.userId,
    type: data.type,
    privacy: data.privacy,
    status: data.status,
    description: data.description,
    tags: data.tags || [],
    stats: {
      ...data.stats,
      lastEditedAt: data.stats?.lastEditedAt?.toDate() || new Date()
    },
    suggestions: data.suggestions,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
    sharedWith: data.sharedWith,
    collaborators: data.collaborators,
    version: data.version || 1,
    isAutoSaveEnabled: data.isAutoSaveEnabled ?? true
  };
}

/**
 * Calculate text statistics from content
 */
export function calculateTextStats(content: string): Partial<DocumentStats> {
  // Remove HTML tags for accurate text analysis
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = textContent.length;
  const characterCountNoSpaces = textContent.replace(/\s/g, '').length;
  
  // Count paragraphs (double line breaks or <p> tags)
  const paragraphCount = Math.max(1, (content.match(/<p>/g) || textContent.split(/\n\s*\n/)).length);
  
  // Estimate sentences (periods, exclamation marks, question marks)
  const sentenceCount = Math.max(1, (textContent.match(/[.!?]+/g) || ['']).length);
  
  // Estimate reading time (average 200 words per minute)
  const readingTime = Math.ceil(wordCount / 200);

  return {
    wordCount,
    characterCount,
    characterCountNoSpaces,
    paragraphCount,
    sentenceCount,
    readingTime,
    lastEditedAt: new Date()
  };
}

/**
 * Create a new document
 */
export async function createDocument(
  userId: string,
  documentData: CreateDocumentData
): Promise<Document> {
  try {
    const now = new Date();
    const stats = {
      ...defaultStats,
      ...calculateTextStats(documentData.content || ''),
      lastEditedAt: now
    };

    const docData = {
      title: documentData.title,
      content: documentData.content || '',
      userId,
      type: documentData.type || 'other',
      privacy: documentData.privacy || 'private',
      status: 'draft',
      description: documentData.description || '',
      tags: documentData.tags || [],
      stats,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastAccessedAt: serverTimestamp(),
      version: 1,
      isAutoSaveEnabled: true
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.DOCUMENTS), docData);
    
    // Return the created document
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Failed to retrieve created document');
    }

    return convertFirestoreDocument(docSnap as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document');
  }
}

/**
 * Get a document by ID
 */
export async function getDocument(documentId: string, userId: string): Promise<Document | null> {
  try {
    const docRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const document = convertFirestoreDocument(docSnap as QueryDocumentSnapshot<DocumentData>);
    
    // Check if user has access to this document
    if (document.userId !== userId && 
        !document.sharedWith?.includes(userId) && 
        !document.collaborators?.includes(userId) &&
        document.privacy !== 'public') {
      throw new Error('Access denied');
    }

    // Update last accessed time
    await updateDoc(docRef, {
      lastAccessedAt: serverTimestamp()
    });

    return document;
  } catch (error) {
    console.error('Error getting document:', error);
    throw new Error('Failed to get document');
  }
}

/**
 * Update a document
 */
export async function updateDocument(
  documentId: string,
  userId: string,
  updateData: UpdateDocumentData
): Promise<Document> {
  try {
    const docRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
    
    // Verify user has permission to edit
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    const document = convertFirestoreDocument(docSnap as QueryDocumentSnapshot<DocumentData>);
    if (document.userId !== userId && !document.collaborators?.includes(userId)) {
      throw new Error('Permission denied');
    }

    // Calculate new stats if content changed
    const updatedStats = updateData.content 
      ? { ...document.stats, ...calculateTextStats(updateData.content) }
      : document.stats;

    const updatePayload: any = {
      ...updateData,
      stats: updatedStats,
      updatedAt: serverTimestamp(),
      lastAccessedAt: serverTimestamp(),
      version: document.version + 1
    };

    await updateDoc(docRef, updatePayload);

    // Return updated document
    const updatedDocSnap = await getDoc(docRef);
    return convertFirestoreDocument(updatedDocSnap as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error('Failed to update document');
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string, userId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
    
    // Verify user owns the document
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    const document = convertFirestoreDocument(docSnap as QueryDocumentSnapshot<DocumentData>);
    if (document.userId !== userId) {
      throw new Error('Permission denied - only document owner can delete');
    }

    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

/**
 * Get user's documents with filtering and pagination
 */
export async function getUserDocuments(
  userId: string,
  options: DocumentQueryOptions = {}
): Promise<DocumentListResponse> {
  try {
    const {
      filters = {},
      sort = { field: 'updatedAt', direction: 'desc' },
      limit: docLimit = 20,
      offset = 0
    } = options;

    // Simple query with only userId filter - no orderBy to avoid index requirements
    let q = query(
      collection(db, COLLECTIONS.DOCUMENTS),
      where('userId', '==', userId)
    );

    // Apply pagination at Firestore level (we'll do more filtering client-side)
    q = query(q, firestoreLimit(100)); // Get more documents for client-side processing

    const querySnapshot = await getDocs(q);
    const allDocuments: Document[] = [];
    
    querySnapshot.forEach((doc) => {
      allDocuments.push(convertFirestoreDocument(doc));
    });

    // Apply all filtering and sorting client-side
    let filteredDocuments = allDocuments;
    
    // Filter by type
    if (filters.type) {
      filteredDocuments = filteredDocuments.filter(doc => doc.type === filters.type);
    }
    
    // Filter by privacy
    if (filters.privacy) {
      filteredDocuments = filteredDocuments.filter(doc => doc.privacy === filters.privacy);
    }
    
    // Filter by status
    if (filters.status) {
      filteredDocuments = filteredDocuments.filter(doc => doc.status === filters.status);
    }

    // Search filter
    if (filters.searchQuery) {
      const searchQuery = filters.searchQuery.toLowerCase();
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery) ||
        doc.description?.toLowerCase().includes(searchQuery) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }

    // Apply sorting client-side
    filteredDocuments.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'lastAccessedAt':
          aValue = a.lastAccessedAt.getTime();
          bValue = b.lastAccessedAt.getTime();
          break;
        case 'wordCount':
          aValue = a.stats.wordCount;
          bValue = b.stats.wordCount;
          break;
        default:
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
      }

      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination after filtering and sorting
    const startIndex = offset;
    const endIndex = startIndex + docLimit;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);
    const hasMore = filteredDocuments.length > endIndex;

    return {
      documents: paginatedDocuments,
      total: filteredDocuments.length,
      hasMore
    };
  } catch (error) {
    console.error('Error getting user documents:', error);
    throw new Error('Failed to get documents');
  }
}

/**
 * Get recent documents for quick access
 */
export async function getRecentDocuments(
  userId: string,
  docLimit: number = 5
): Promise<RecentDocument[]> {
  try {
    // Simple query without orderBy to avoid index requirements
    const q = query(
      collection(db, COLLECTIONS.DOCUMENTS),
      where('userId', '==', userId),
      firestoreLimit(50) // Get more documents to sort client-side
    );

    const querySnapshot = await getDocs(q);
    const allDocs: RecentDocument[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allDocs.push({
        id: doc.id,
        title: data.title,
        type: data.type,
        wordCount: data.stats?.wordCount || 0,
        lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    // Sort by lastAccessedAt client-side and take the requested limit
    const sortedDocs = allDocs
      .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())
      .slice(0, docLimit);

    return sortedDocs;
  } catch (error) {
    console.error('Error getting recent documents:', error);
    throw new Error('Failed to get recent documents');
  }
}

/**
 * Duplicate a document
 */
export async function duplicateDocument(
  documentId: string,
  userId: string,
  newTitle?: string
): Promise<Document> {
  try {
    const originalDoc = await getDocument(documentId, userId);
    if (!originalDoc) {
      throw new Error('Document not found');
    }

    const duplicateData: CreateDocumentData = {
      title: newTitle || `${originalDoc.title} (Copy)`,
      content: originalDoc.content,
      type: originalDoc.type,
      privacy: originalDoc.privacy,
      ...(originalDoc.description && { description: originalDoc.description }),
      tags: originalDoc.tags
    };

    return await createDocument(userId, duplicateData);
  } catch (error) {
    console.error('Error duplicating document:', error);
    throw new Error('Failed to duplicate document');
  }
}

/**
 * Update document suggestions (grammar/style analysis results)
 */
export async function updateDocumentSuggestions(
  documentId: string,
  userId: string,
  suggestions: DocumentSuggestions
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
    
    await updateDoc(docRef, {
      suggestions: {
        ...suggestions,
        lastCheckedAt: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating document suggestions:', error);
    throw new Error('Failed to update suggestions');
  }
} 