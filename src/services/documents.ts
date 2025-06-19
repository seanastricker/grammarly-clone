/**
 * @fileoverview Document service for Firebase operations and guest storage
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Service layer for document management with Firebase Firestore and in-memory guest storage.
 * Handles CRUD operations, querying, and document statistics.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * In-memory storage for guest users
 * Data is lost when the session ends
 */
const guestDocuments = new Map<string, Document>();
let guestDocumentCounter = 1;

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
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Document,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentFilters,
  DocumentSortOptions,
  DocumentQueryOptions,
  DocumentListResponse,
  RecentDocument,
  DocumentPrivacy,
  DocumentStatus,
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
 * Check if a user ID indicates a guest user
 */
function isGuestUser(userId: string): boolean {
  return userId.startsWith('guest_');
}

/**
 * Generate a unique guest document ID
 */
function generateGuestDocumentId(): string {
  return `guest_doc_${guestDocumentCounter++}_${Date.now()}`;
}

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
      lastEditedAt: data.stats?.lastEditedAt instanceof Timestamp 
        ? data.stats.lastEditedAt.toDate() 
        : new Date(data.stats?.lastEditedAt || Date.now())
    },
    suggestions: data.suggestions,
    createdAt: data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt),
    lastAccessedAt: data.lastAccessedAt instanceof Timestamp 
      ? data.lastAccessedAt.toDate() 
      : new Date(data.lastAccessedAt),
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
export const createDocument = async (
  userId: string,
  data: CreateDocumentData
): Promise<Document> => {
  const now = new Date();
  const defaultStats: DocumentStats = {
    wordCount: 0,
    characterCount: 0,
    characterCountNoSpaces: 0,
    paragraphCount: 1,
    sentenceCount: 0,
    readingTime: 0,
    lastEditedAt: now
  };

  const documentData = {
    title: data.title,
    type: data.type || 'other',
    content: data.content || '',
    description: data.description || '',
    tags: data.tags || [],
    userId,
    privacy: (data.privacy || 'private') as DocumentPrivacy,
    status: 'draft' as DocumentStatus,
    stats: defaultStats,
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
    version: 1,
    isAutoSaveEnabled: true
  };

  // Handle guest users with in-memory storage
  if (isGuestUser(userId)) {
    const documentId = generateGuestDocumentId();
    const newDocument: Document = {
      id: documentId,
      ...documentData
    };
    
    guestDocuments.set(documentId, newDocument);
    console.log('🔄 Guest document created in memory:', documentId);
    return newDocument;
  }

  // Regular Firebase storage for authenticated users
  try {
    const docRef = await addDoc(collection(db, 'documents'), documentData);
    
    const newDocument: Document = {
      id: docRef.id,
      ...documentData
    };
    
    return newDocument;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

/**
 * Get a single document by ID
 */
export const getDocument = async (
  documentId: string,
  userId: string
): Promise<Document | null> => {
  // Handle guest users with in-memory storage
  if (isGuestUser(userId)) {
    const document = guestDocuments.get(documentId);
    if (document && document.userId === userId) {
      // Update last accessed time
      document.lastAccessedAt = new Date();
      console.log('🔄 Guest document retrieved from memory:', documentId);
      return document;
    }
    return null;
  }

  // Regular Firebase storage for authenticated users
  try {
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    
    // Check if user has access
    if (data.userId !== userId) {
      return null;
    }

    // Convert Firestore Timestamps to Dates
    const document: Document = {
      id: docSnap.id,
      title: data.title,
      content: data.content,
      userId: data.userId,
      type: data.type,
      privacy: data.privacy,
      status: data.status,
      description: data.description,
      tags: data.tags,
      stats: {
        ...data.stats,
        lastEditedAt: data.stats?.lastEditedAt instanceof Timestamp 
          ? data.stats.lastEditedAt.toDate() 
          : new Date(data.stats?.lastEditedAt || Date.now())
      },
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate() 
        : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate() 
        : new Date(data.updatedAt),
      lastAccessedAt: data.lastAccessedAt instanceof Timestamp 
        ? data.lastAccessedAt.toDate() 
        : new Date(data.lastAccessedAt),
      version: data.version || 1,
      isAutoSaveEnabled: data.isAutoSaveEnabled ?? true,
      sharedWith: data.sharedWith,
      collaborators: data.collaborators,
      suggestions: data.suggestions
    };
    
    return document;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

/**
 * Update a document
 */
export async function updateDocument(
  documentId: string,
  userId: string,
  updateData: UpdateDocumentData
): Promise<Document> {
  // Handle guest users with in-memory storage
  if (isGuestUser(userId)) {
    const document = guestDocuments.get(documentId);
    if (!document || document.userId !== userId) {
      throw new Error('Document not found');
    }

    // Update the document in memory
    const updatedDocument: Document = {
      ...document,
      ...(updateData.title && { title: updateData.title }),
      ...(updateData.content && { content: updateData.content }),
      ...(updateData.type && { type: updateData.type }),
      ...(updateData.privacy && { privacy: updateData.privacy }),
      ...(updateData.status && { status: updateData.status }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.tags && { tags: updateData.tags }),
      updatedAt: new Date(),
      lastAccessedAt: new Date(),
      version: document.version + 1,
      stats: updateData.content 
        ? { ...document.stats, ...calculateTextStats(updateData.content) }
        : updateData.stats ? { ...document.stats, ...updateData.stats } : document.stats
    };

    guestDocuments.set(documentId, updatedDocument);
    console.log('🔄 Guest document updated in memory:', documentId);
    return updatedDocument;
  }

  // Regular Firebase storage for authenticated users
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
  // Handle guest users with in-memory storage
  if (isGuestUser(userId)) {
    const userDocuments = Array.from(guestDocuments.values())
      .filter(doc => doc.userId === userId);
    
    console.log('🔄 Guest documents retrieved from memory:', userDocuments.length);
    return {
      documents: userDocuments,
      total: userDocuments.length,
      hasMore: false
    };
  }

  // Regular Firebase storage for authenticated users
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
    q = query(q, limit(100)); // Get more documents for client-side processing

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
      limit(50) // Get more documents to sort client-side
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