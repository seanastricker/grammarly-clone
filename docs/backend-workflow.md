# WordWise AI - Backend Implementation Workflow

*Step-by-step workflow for AI agents implementing backend features*

---

## **Mandatory Pre-Implementation Steps**

### **1. Requirements Analysis**
- [ ] Read the specific phase document thoroughly
- [ ] Identify all backend services and APIs to be built
- [ ] Understand data flow and storage requirements
- [ ] Check dependencies on previous phases and external services
- [ ] Validate against `@codebase-best-practices.md`

### **2. Architecture Planning**
- [ ] Design data models and schema structures
- [ ] Plan API endpoints and service interfaces
- [ ] Map security requirements and access controls
- [ ] Design error handling and monitoring strategy
- [ ] Plan performance optimization approach

---

## **Implementation Workflow**

### **Step 1: Service Structure Setup**
Create files following the established pattern:

```typescript
// Example for a new service "DocumentService"
src/
  services/
    firebase/
      documents/
        document-service.ts          // Main service class
        document-service.test.ts     // Tests
        types.ts                     // TypeScript interfaces
        index.ts                     // Barrel export
```

**Service Header Template:**
```typescript
/**
 * @fileoverview [Brief description of service purpose]
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * This service handles [specific responsibility] for the WordWise AI writing assistant.
 * Key features:
 * - Feature 1: Description
 * - Feature 2: Description
 * 
 * Dependencies:
 * - Firebase dependency 1
 * - External API dependency 2
 * 
 * Related files:
 * - Path to related service 1
 * - Path to related model 2
 */
```

### **Step 2: Data Model Definition**
Define interfaces and schemas in `types.ts`:

```typescript
/**
 * @fileoverview Type definitions for [ServiceName]
 * Defines all data models, API interfaces, and service contracts
 */

// Firestore document interface
export interface DocumentData {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata: DocumentMetadata;
}

// API request/response interfaces
export interface CreateDocumentRequest {
  title: string;
  content: string;
  metadata?: Partial<DocumentMetadata>;
}

export interface DocumentResponse {
  success: boolean;
  data?: DocumentData;
  error?: ServiceError;
}

// Service configuration
export interface ServiceConfig {
  collectionName: string;
  enableCache: boolean;
  retryAttempts: number;
}

// Error handling
export interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

### **Step 3: Firebase Service Implementation**
Build service following patterns:

```typescript
/**
 * [ServiceName] Service
 * 
 * [Detailed description of service purpose and capabilities]
 * Handles [specific domain] operations with proper error handling and security
 */
export class DocumentService {
  private db: Firestore;
  private auth: Auth;
  private config: ServiceConfig;

  constructor(config?: Partial<ServiceConfig>) {
    this.db = getFirestore();
    this.auth = getAuth();
    this.config = {
      collectionName: 'documents',
      enableCache: true,
      retryAttempts: 3,
      ...config
    };
  }

  /**
   * Creates a new document in Firestore
   * 
   * @param userId - The ID of the user creating the document
   * @param request - Document creation data
   * @returns Promise resolving to document response
   * 
   * @throws {ServiceError} When user is not authenticated
   * @throws {ServiceError} When validation fails
   * @throws {ServiceError} When Firestore operation fails
   */
  async createDocument(
    userId: string,
    request: CreateDocumentRequest
  ): Promise<DocumentResponse> {
    try {
      // 1. Validate authentication
      await this.validateAuthentication(userId);

      // 2. Validate input data
      const validatedData = await this.validateDocumentData(request);

      // 3. Create document with metadata
      const documentData: DocumentData = {
        id: generateId(),
        ...validatedData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metadata: {
          version: 1,
          lastEditedBy: userId,
          ...request.metadata
        }
      };

      // 4. Save to Firestore with security rules
      const docRef = doc(this.db, this.config.collectionName, documentData.id);
      await setDoc(docRef, documentData);

      // 5. Log operation for monitoring
      this.logOperation('create', documentData.id, userId);

      return {
        success: true,
        data: documentData
      };

    } catch (error) {
      // 6. Handle and transform errors
      const serviceError = this.transformError(error);
      this.logError('createDocument', serviceError, { userId, request });
      
      return {
        success: false,
        error: serviceError
      };
    }
  }

  /**
   * Retrieves a document by ID with permission checking
   * 
   * @param documentId - The document ID to retrieve
   * @param userId - The requesting user ID
   * @returns Promise resolving to document response
   */
  async getDocument(
    documentId: string,
    userId: string
  ): Promise<DocumentResponse> {
    try {
      // 1. Validate inputs
      if (!documentId || !userId) {
        throw new Error('Document ID and User ID are required');
      }

      // 2. Get document with retry logic
      const docRef = doc(this.db, this.config.collectionName, documentId);
      const docSnap = await this.withRetry(() => getDoc(docRef));

      // 3. Check if document exists
      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }

      const documentData = docSnap.data() as DocumentData;

      // 4. Check user permissions
      await this.validateDocumentAccess(documentData, userId);

      // 5. Return successful response
      return {
        success: true,
        data: documentData
      };

    } catch (error) {
      const serviceError = this.transformError(error);
      this.logError('getDocument', serviceError, { documentId, userId });
      
      return {
        success: false,
        error: serviceError
      };
    }
  }

  // Private helper methods
  private async validateAuthentication(userId: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('User not authenticated');
    }
  }

  private async validateDocumentData(request: CreateDocumentRequest): Promise<CreateDocumentRequest> {
    // Implement validation logic
    if (!request.title?.trim()) {
      throw new Error('Document title is required');
    }
    if (request.title.length > 200) {
      throw new Error('Document title too long');
    }
    return request;
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.retryAttempts) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }

  private transformError(error: any): ServiceError {
    if (error.code === 'permission-denied') {
      return {
        code: 'PERMISSION_DENIED',
        message: 'You do not have permission to perform this action',
        details: { originalCode: error.code }
      };
    }
    
    return {
      code: 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: { originalError: error }
    };
  }

  private logOperation(operation: string, documentId: string, userId: string): void {
    console.log(`Document operation: ${operation}`, {
      documentId,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  private logError(operation: string, error: ServiceError, context: any): void {
    console.error(`Document service error in ${operation}:`, {
      error,
      context,
      timestamp: new Date().toISOString()
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const documentService = new DocumentService();
```

### **Step 4: Firestore Security Rules**
Define comprehensive security rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidDocumentData() {
      return request.resource.data.keys().hasAll(['title', 'content', 'userId']) &&
             request.resource.data.title is string &&
             request.resource.data.title.size() <= 200 &&
             request.resource.data.content is string;
    }
    
    // Document rules
    match /documents/{documentId} {
      // Users can only read their own documents
      allow read: if isAuthenticated() && 
                     isOwner(resource.data.userId);
      
      // Users can create documents for themselves
      allow create: if isAuthenticated() && 
                       isOwner(request.resource.data.userId) &&
                       isValidDocumentData();
      
      // Users can update their own documents
      allow update: if isAuthenticated() && 
                       isOwner(resource.data.userId) &&
                       isOwner(request.resource.data.userId) &&
                       isValidDocumentData();
      
      // Users can delete their own documents
      allow delete: if isAuthenticated() && 
                       isOwner(resource.data.userId);
    }
    
    // Shared document rules
    match /shared-documents/{shareId} {
      allow read: if isAuthenticated() && (
        isOwner(resource.data.ownerId) ||
        request.auth.uid in resource.data.collaborators
      );
      
      allow write: if isAuthenticated() && 
                      isOwner(resource.data.ownerId);
    }
  }
}
```

### **Step 5: Firebase Cloud Functions**
Implement serverless functions:

```typescript
/**
 * @fileoverview Cloud Functions for document processing
 * Handles server-side operations that require elevated permissions or external APIs
 */

import { onCall, onDocumentCreated, HttpsError } from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Processes AI analysis for document content
 * Calls external AI APIs with proper authentication and rate limiting
 */
export const processAIAnalysis = onCall(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
    maxInstances: 100
  },
  async (request) => {
    try {
      // 1. Validate authentication
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required');
      }

      // 2. Validate and sanitize input
      const { documentId, analysisType, content } = request.data;
      if (!documentId || !analysisType || !content) {
        throw new HttpsError('invalid-argument', 'Missing required parameters');
      }

      // 3. Check user permissions
      const db = getFirestore();
      const docRef = db.collection('documents').doc(documentId);
      const doc = await docRef.get();
      
      if (!doc.exists || doc.data()?.userId !== request.auth.uid) {
        throw new HttpsError('permission-denied', 'Access denied');
      }

      // 4. Rate limiting check
      const rateLimitOk = await checkRateLimit(request.auth.uid);
      if (!rateLimitOk) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
      }

      // 5. Process with external AI service
      const analysisResult = await callAIService(content, analysisType);

      // 6. Store results in Firestore
      await docRef.collection('analysis').add({
        type: analysisType,
        result: analysisResult,
        processedAt: new Date(),
        processedBy: request.auth.uid
      });

      // 7. Update usage tracking
      await updateUserUsage(request.auth.uid, 'ai-analysis');

      return {
        success: true,
        analysisId: analysisResult.id,
        suggestions: analysisResult.suggestions
      };

    } catch (error) {
      console.error('AI analysis error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Processing failed');
    }
  }
);

/**
 * Triggered when a new document is created
 * Performs automatic setup and initial processing
 */
export const onDocumentCreate = onDocumentCreated(
  {
    document: 'documents/{documentId}',
    region: 'us-central1'
  },
  async (event) => {
    try {
      const documentData = event.data?.data();
      if (!documentData) return;

      const db = getFirestore();
      const documentId = event.params.documentId;

      // 1. Initialize document metadata
      await db.collection('document-metadata').doc(documentId).set({
        wordCount: calculateWordCount(documentData.content),
        characterCount: documentData.content.length,
        readingTime: calculateReadingTime(documentData.content),
        createdAt: new Date(),
        lastAnalyzed: null,
        analysisVersion: 1
      });

      // 2. Trigger initial grammar check for non-empty documents
      if (documentData.content.trim()) {
        await triggerGrammarCheck(documentId, documentData.content);
      }

      // 3. Update user statistics
      await updateUserStats(documentData.userId, {
        documentsCreated: 1,
        lastActivityAt: new Date()
      });

      console.log(`Document ${documentId} initialized successfully`);

    } catch (error) {
      console.error('Document creation processing failed:', error);
      // Don't throw - this is a background process
    }
  }
);
```

### **Step 6: API Integration Services**
Implement external API services:

```typescript
/**
 * @fileoverview External API integration service
 * Handles communication with third-party services like OpenAI and LanguageTool
 */

export class APIIntegrationService {
  private openaiClient: OpenAI;
  private languageToolEndpoint: string;

  constructor() {
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.languageToolEndpoint = 'https://api.languagetool.org/v2/check';
  }

  /**
   * Analyzes text using OpenAI GPT-4
   * 
   * @param text - Text content to analyze
   * @param analysisType - Type of analysis to perform
   * @param userContext - User context for personalization
   * @returns Promise resolving to AI analysis results
   */
  async analyzeWithOpenAI(
    text: string,
    analysisType: 'grammar' | 'style' | 'clarity',
    userContext: UserContext
  ): Promise<AIAnalysisResult> {
    try {
      // 1. Build context-aware prompt
      const prompt = this.buildPrompt(text, analysisType, userContext);

      // 2. Call OpenAI API with error handling
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(analysisType, userContext)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      // 3. Parse and validate response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const parsedResult = JSON.parse(content) as AIAnalysisResult;
      
      // 4. Validate result structure
      if (!this.isValidAnalysisResult(parsedResult)) {
        throw new Error('Invalid response format from OpenAI');
      }

      // 5. Log usage for cost tracking
      await this.logAPIUsage('openai', {
        tokens: response.usage?.total_tokens || 0,
        model: 'gpt-4',
        cost: this.calculateCost(response.usage?.total_tokens || 0)
      });

      return parsedResult;

    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Checks grammar using LanguageTool API
   * 
   * @param text - Text to check for grammar errors
   * @param language - Language code (default: 'en-US')
   * @returns Promise resolving to grammar check results
   */
  async checkGrammar(
    text: string,
    language: string = 'en-US'
  ): Promise<GrammarCheckResult> {
    try {
      // 1. Prepare request data
      const requestData = new URLSearchParams({
        text,
        language,
        level: 'picky',
        enabledOnly: 'false'
      });

      // 2. Make API request with timeout
      const response = await fetch(this.languageToolEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'WordWise-AI/1.0'
        },
        body: requestData,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`LanguageTool API error: ${response.status}`);
      }

      // 3. Parse response
      const result = await response.json();

      // 4. Transform to our format
      const grammarResult: GrammarCheckResult = {
        matches: result.matches.map(this.transformGrammarMatch),
        language: result.language.name,
        detectedLanguage: result.language.detectedLanguage
      };

      // 5. Log usage
      await this.logAPIUsage('languagetool', {
        characters: text.length,
        matches: result.matches.length
      });

      return grammarResult;

    } catch (error) {
      console.error('Grammar check failed:', error);
      throw new Error(`Grammar check failed: ${error.message}`);
    }
  }

  // Private helper methods
  private buildPrompt(
    text: string,
    analysisType: string,
    userContext: UserContext
  ): string {
    return `
      Analyze the following text for ${analysisType} improvements.
      User type: ${userContext.userType}
      Experience level: ${userContext.level}
      
      Text: "${text}"
      
      Provide specific, actionable suggestions in JSON format.
    `;
  }

  private isValidAnalysisResult(result: any): result is AIAnalysisResult {
    return result && 
           Array.isArray(result.suggestions) &&
           typeof result.overallScore === 'number';
  }
}
```

### **Step 7: Error Handling & Monitoring**
Implement comprehensive error handling:

```typescript
/**
 * @fileoverview Error handling and monitoring utilities
 * Provides consistent error handling patterns across all backend services
 */

export class ErrorHandler {
  private static instance: ErrorHandler;
  private sentryInitialized: boolean = false;

  private constructor() {
    this.initializeSentry();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handles service errors with proper logging and user feedback
   * 
   * @param error - The error to handle
   * @param context - Additional context for debugging
   * @param operation - The operation that failed
   * @returns Standardized error response
   */
  handleServiceError(
    error: any,
    context: Record<string, any>,
    operation: string
  ): ServiceError {
    // 1. Extract error information
    const errorInfo = this.extractErrorInfo(error);

    // 2. Log error with context
    this.logError(errorInfo, context, operation);

    // 3. Report to monitoring service
    if (this.sentryInitialized) {
      Sentry.captureException(error, {
        tags: { operation },
        extra: context
      });
    }

    // 4. Return user-friendly error
    return this.createUserFriendlyError(errorInfo);
  }

  /**
   * Handles async operations with automatic error handling
   * 
   * @param operation - Async operation to execute
   * @param context - Context for error reporting
   * @returns Promise with handled errors
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: { operationName: string; userId?: string }
  ): Promise<{ success: boolean; data?: T; error?: ServiceError }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const serviceError = this.handleServiceError(
        error,
        context,
        context.operationName
      );
      return { success: false, error: serviceError };
    }
  }

  private extractErrorInfo(error: any): ErrorInfo {
    if (error.code) {
      // Firebase/Firestore error
      return {
        type: 'firebase',
        code: error.code,
        message: error.message,
        stack: error.stack
      };
    }

    if (error.status) {
      // HTTP error
      return {
        type: 'http',
        code: error.status.toString(),
        message: error.statusText || error.message,
        stack: error.stack
      };
    }

    // Generic error
    return {
      type: 'generic',
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      stack: error.stack
    };
  }

  private createUserFriendlyError(errorInfo: ErrorInfo): ServiceError {
    const userMessages = {
      'permission-denied': 'You do not have permission to perform this action',
      'not-found': 'The requested resource was not found',
      'already-exists': 'This resource already exists',
      'resource-exhausted': 'Rate limit exceeded. Please try again later',
      'unauthenticated': 'Please log in to continue',
      'cancelled': 'The operation was cancelled',
      'deadline-exceeded': 'The operation timed out. Please try again'
    };

    return {
      code: errorInfo.code,
      message: userMessages[errorInfo.code] || 'An unexpected error occurred',
      details: {
        type: errorInfo.type,
        timestamp: new Date().toISOString()
      }
    };
  }
}
```

### **Step 8: Testing Implementation**
Write comprehensive backend tests:

```typescript
/**
 * @fileoverview Service tests for DocumentService
 * Tests service functionality, error handling, and security
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DocumentService } from './document-service';
import { mockFirestore, mockAuth } from '../../../test/mocks/firebase';

describe('DocumentService', () => {
  let documentService: DocumentService;
  let mockDb: any;
  let mockAuthInstance: any;

  beforeEach(() => {
    // Setup mocks
    mockDb = mockFirestore();
    mockAuthInstance = mockAuth();
    
    // Initialize service with test config
    documentService = new DocumentService({
      collectionName: 'test-documents',
      enableCache: false,
      retryAttempts: 1
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createDocument', () => {
    /**
     * Test: Successfully creates a document
     * Validates document creation with proper data
     */
    it('should create document successfully', async () => {
      const userId = 'test-user-123';
      const request = {
        title: 'Test Document',
        content: 'This is test content'
      };

      mockAuthInstance.currentUser = { uid: userId };

      const result = await documentService.createDocument(userId, request);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe(request.title);
      expect(result.data?.userId).toBe(userId);
      expect(mockDb.setDoc).toHaveBeenCalled();
    });

    /**
     * Test: Rejects unauthenticated requests
     * Validates security for document creation
     */
    it('should reject unauthenticated requests', async () => {
      const userId = 'test-user-123';
      const request = {
        title: 'Test Document',
        content: 'This is test content'
      };

      mockAuthInstance.currentUser = null;

      const result = await documentService.createDocument(userId, request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PERMISSION_DENIED');
      expect(mockDb.setDoc).not.toHaveBeenCalled();
    });

    /**
     * Test: Validates document data
     * Ensures proper validation of input data
     */
    it('should validate document data', async () => {
      const userId = 'test-user-123';
      const request = {
        title: '', // Empty title should fail
        content: 'This is test content'
      };

      mockAuthInstance.currentUser = { uid: userId };

      const result = await documentService.createDocument(userId, request);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('title is required');
    });
  });

  describe('getDocument', () => {
    /**
     * Test: Retrieves document successfully
     * Validates document retrieval with permissions
     */
    it('should retrieve document successfully', async () => {
      const userId = 'test-user-123';
      const documentId = 'test-doc-456';
      const documentData = {
        id: documentId,
        title: 'Test Document',
        content: 'Test content',
        userId: userId
      };

      mockDb.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => documentData
      });

      const result = await documentService.getDocument(documentId, userId);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(documentId);
      expect(mockDb.getDoc).toHaveBeenCalled();
    });

    /**
     * Test: Handles non-existent documents
     * Validates proper error handling
     */
    it('should handle non-existent documents', async () => {
      const userId = 'test-user-123';
      const documentId = 'non-existent-doc';

      mockDb.getDoc.mockResolvedValue({
        exists: () => false
      });

      const result = await documentService.getDocument(documentId, userId);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found');
    });
  });
});
```

### **Step 9: Performance & Caching**
Implement caching and optimization:

```typescript
/**
 * @fileoverview Caching and performance optimization utilities
 * Provides Redis caching and performance monitoring for backend services
 */

export class CacheService {
  private redis: RedisClient;
  private defaultTTL: number = 3600; // 1 hour

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
  }

  /**
   * Caches function results with automatic serialization
   * 
   * @param key - Cache key
   * @param fn - Function to cache
   * @param ttl - Time to live in seconds
   * @returns Cached or computed result
   */
  async cached<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    try {
      // 1. Try to get from cache
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      // 2. Compute result
      const result = await fn();

      // 3. Store in cache
      await this.redis.setex(key, ttl, JSON.stringify(result));

      return result;
    } catch (error) {
      console.error('Cache error:', error);
      // Fallback to computing result
      return await fn();
    }
  }

  /**
   * Invalidates cache patterns
   * 
   * @param pattern - Cache key pattern to invalidate
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}
```

---

## **Quality Checklist**

Before marking backend work complete, verify:

### **Code Quality**
- [ ] File size under 250 lines (split if larger)
- [ ] All functions have JSDoc documentation
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling implemented
- [ ] No console.logs in production code

### **Security**
- [ ] Authentication validation on all protected endpoints
- [ ] Input validation and sanitization
- [ ] Firestore security rules properly configured
- [ ] Rate limiting implemented where appropriate
- [ ] Sensitive data properly encrypted

### **Performance**
- [ ] Database queries optimized with proper indexes
- [ ] Caching implemented for frequently accessed data
- [ ] Retry logic with exponential backoff
- [ ] Connection pooling configured
- [ ] API response times under 2 seconds

### **Testing**
- [ ] Unit tests cover core service functionality
- [ ] Integration tests verify external API calls
- [ ] Security tests validate access controls
- [ ] Error handling tests cover edge cases
- [ ] Performance tests validate scalability

### **Monitoring**
- [ ] Error logging with proper context
- [ ] Performance metrics collection
- [ ] Usage tracking for cost management
- [ ] Health checks for critical services
- [ ] Alerting configured for failures

---

## **Common Patterns & Solutions**

### **Firestore Batch Operations**
```typescript
// Efficient batch operations
const batch = writeBatch(db);
documents.forEach(doc => {
  const docRef = doc(db, 'documents', doc.id);
  batch.set(docRef, doc.data);
});
await batch.commit();
```

### **Cloud Function Error Handling**
```typescript
// Consistent error handling in Cloud Functions
try {
  // Function logic
} catch (error) {
  console.error('Function failed:', error);
  if (error instanceof HttpsError) {
    throw error;
  }
  throw new HttpsError('internal', 'Operation failed');
}
```

### **API Rate Limiting**
```typescript
// Simple rate limiting with Redis
const key = `rate_limit:${userId}`;
const requests = await redis.incr(key);
if (requests === 1) {
  await redis.expire(key, 3600); // 1 hour window
}
if (requests > 100) {
  throw new Error('Rate limit exceeded');
}
```

---

**Remember:** Every backend service should be secure, performant, and maintainable. Always validate inputs, handle errors gracefully, and implement proper monitoring. Security and data integrity are paramount.

---
➡️ Secure and scalable you must build, for in robust backends, user trust grows. 