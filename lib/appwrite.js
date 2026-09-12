import 'react-native-url-polyfill/auto';
import {
  Client,
  Account,
  Databases,
  Storage,
  Functions,
  ID,
  Query,
  Role,
  Permission,
} from 'react-native-appwrite';
import { Platform } from 'react-native';

/**
 * Helper to safely retrieve environment variables across:
 * - Expo Mobile (process.env.EXPO_PUBLIC_*)
 * - Expo Web (process.env.EXPO_PUBLIC_* / window env)
 * - Bundlers (import.meta.env.*)
 */
const getEnv = (key, fallback = '') => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return fallback;
};

// ============================================================================
// Appwrite Configuration
// ============================================================================
export const APPWRITE_ENDPOINT = getEnv(
  'EXPO_PUBLIC_APPWRITE_ENDPOINT',
  'https://fra.cloud.appwrite.io/v1'
);

export const APPWRITE_PROJECT_ID = getEnv(
  'EXPO_PUBLIC_APPWRITE_PROJECT_ID',
  '6aa3a24400158be49594'
);

export const APPWRITE_PLATFORM = getEnv(
  'EXPO_PUBLIC_APPWRITE_PLATFORM',
  'io.appwrite.callback6aa3a24400158be49594'
);

export const APPWRITE_DATABASE_ID = getEnv(
  'EXPO_PUBLIC_APPWRITE_DATABASE_ID',
  getEnv('VITE_APPWRITE_DATABASE_ID', '6aa3cd67003815f6851f')
);

export const APPWRITE_ISSUES_COLLECTION_ID = getEnv(
  'EXPO_PUBLIC_APPWRITE_COLLECTION_ISSUES_ID',
  getEnv('EXPO_PUBLIC_APPWRITE_COLLECTION_ID', 'issues')
);

export const APPWRITE_STATUS_HISTORY_COLLECTION_ID = getEnv(
  'EXPO_PUBLIC_APPWRITE_COLLECTION_STATUS_HISTORY_ID',
  'status_history'
);

export const APPWRITE_STORAGE_BUCKET_ID = getEnv(
  'EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID',
  getEnv('EXPO_PUBLIC_APPWRITE_BUCKET_ID', '6aa4d5e200333b50dcc3')
);

export const APPWRITE_FUNCTION_STATUS_UPDATE_ID = getEnv(
  'EXPO_PUBLIC_APPWRITE_FUNCTION_STATUS_UPDATE_ID',
  getEnv('EXPO_PUBLIC_APPWRITE_FUNCTION_ID', 'update_issue_status')
);

// ============================================================================
// Client & Service Initialization
// ============================================================================
export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

/**
 * Platform Registration Flag / Documentation:
 * 
 * In Appwrite Console:
 * - Native Mobile (iOS/Android) requires a Mobile platform entry with the Package Name / Bundle ID
 *   (e.g., "io.appwrite.callback6aa3a24400158be49594").
 * - Expo Web requires a Web platform entry with the Hostname
 *   (e.g., "localhost", "localhost:8081", "localhost:5180", or your production domain).
 * 
 * When running via Expo Web in the browser, Appwrite authenticates requests via Origin/CORS matching
 * the registered Web Hostname. Calling `.setPlatform()` attaches the X-Appwrite-Platform header,
 * which satisfies the mobile platform checks.
 * 
 * IMPORTANT CONSOLE SETUP NOTE:
 * Even though this is a single unified Expo codebase, you must register TWO platforms in the
 * Appwrite Console under the same Project:
 * 1) Flutter/React Native/Android or Apple: Package ID / Bundle Identifier matching EXPO_PUBLIC_APPWRITE_PLATFORM
 * 2) Web App: Hostname set to 'localhost' (for development) and your deployment domain
 */
if (APPWRITE_PLATFORM) {
  client.setPlatform(APPWRITE_PLATFORM);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export { ID, Query, Role, Permission };

// ============================================================================
// 1. Auth Service Functions
// ============================================================================

/**
 * Register a new citizen user.
 * Note: Role is strictly defaulted to "citizen" and is NEVER client-settable.
 * 
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @returns {Promise<{ user: object, session: object }>}
 */
export async function registerUser(email, password, name) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const userId = ID.unique();

    // 1. Create account
    const user = await account.create(userId, cleanEmail, password, name);

    // 2. Automatically log in / create session
    const session = await account.createEmailPasswordSession(cleanEmail, password);

    // 3. Enforce default "citizen" role in account preferences (never client-settable)
    await account.updatePrefs({
      role: 'citizen',
    });

    return {
      user: {
        ...user,
        role: 'citizen',
      },
      session,
    };
  } catch (error) {
    console.error('Error in registerUser:', error);
    throw error;
  }
}

/**
 * Log in an existing user with email and password.
 * 
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object, session: object }>}
 */
export async function loginUser(email, password) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const session = await account.createEmailPasswordSession(cleanEmail, password);
    const user = await account.get();

    return {
      user: {
        ...user,
        role: user.prefs?.role || 'citizen',
      },
      session,
    };
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error;
  }
}

/**
 * Get currently authenticated user details.
 * Returns null if no active session or request fails.
 * 
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  try {
    const user = await account.get();
    if (!user) return null;

    return {
      ...user,
      role: user.prefs?.role || 'citizen',
    };
  } catch (error) {
    // Graceful fallback on unauthenticated / expired session
    return null;
  }
}

/**
 * Log out current user and delete the active session.
 * 
 * @returns {Promise<object>}
 */
export async function logoutUser() {
  try {
    return await account.deleteSession('current');
  } catch (error) {
    console.error('Error in logoutUser:', error);
    throw error;
  }
}

// ============================================================================
// 2. Database Service Functions
// ============================================================================

/**
 * Create a new civic issue report.
 * 
 * @param {object} issueData
 * @returns {Promise<object>}
 */
export async function createIssue(issueData) {
  try {
    const documentId = ID.unique();
    const now = new Date().toISOString();

    const payload = {
      title: issueData.title,
      description: issueData.description || '',
      category: issueData.category,
      status: issueData.status || 'Reported',
      latitude: Number(issueData.latitude),
      longitude: Number(issueData.longitude),
      locationName: issueData.locationName || '',
      ward: issueData.ward || '',
      photoUrl: issueData.photoUrl || issueData.imageUrl || '',
      photoFileId: issueData.photoFileId || issueData.fileId || '',
      reportedBy: issueData.reportedBy || issueData.userId || '',
      citizenName: issueData.citizenName || issueData.userName || '',
      citizenPhone: issueData.citizenPhone || issueData.userPhone || '',
      votes: typeof issueData.votes === 'number' ? issueData.votes : 0,
      createdAt: issueData.createdAt || now,
      updatedAt: now,
    };

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ISSUES_COLLECTION_ID,
      documentId,
      payload
    );

    return doc;
  } catch (error) {
    console.error('Error in createIssue:', error);
    throw error;
  }
}

/**
 * Fetch all issues reported by a specific citizen or current user.
 * 
 * @param {string} [userId]
 * @returns {Promise<Array>}
 */
export async function getMyIssues(userId) {
  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        targetUserId = currentUser.$id;
      }
    }

    const queries = [
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ];

    if (targetUserId) {
      queries.unshift(Query.equal('reportedBy', targetUserId));
    }

    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ISSUES_COLLECTION_ID,
      queries
    );

    return response.documents;
  } catch (error) {
    console.error('Error in getMyIssues:', error);
    throw error;
  }
}

/**
 * Fetch issues assigned to or filtered by a specific municipal department.
 * 
 * @param {string} department
 * @returns {Promise<Array>}
 */
export async function getDepartmentIssues(department) {
  try {
    const queries = [
      Query.equal('department', department),
      Query.orderDesc('$createdAt'),
      Query.limit(100),
    ];

    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ISSUES_COLLECTION_ID,
      queries
    );

    return response.documents;
  } catch (error) {
    console.error('Error in getDepartmentIssues:', error);
    throw error;
  }
}

/**
 * Fetch all issues across the platform (for live map, triage, or admin analytics).
 * 
 * @param {Array} [customQueries]
 * @returns {Promise<Array>}
 */
export async function getAllIssues(customQueries = []) {
  try {
    const queries = customQueries.length > 0
      ? customQueries
      : [Query.orderDesc('$createdAt'), Query.limit(100)];

    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ISSUES_COLLECTION_ID,
      queries
    );

    return response.documents;
  } catch (error) {
    console.error('Error in getAllIssues:', error);
    throw error;
  }
}

/**
 * Fetch status history / audit trail for a specific issue.
 * 
 * @param {string} issueId
 * @returns {Promise<Array>}
 */
export async function getIssueStatusHistory(issueId) {
  try {
    const queries = [
      Query.equal('issueId', issueId),
      Query.orderAsc('$createdAt'),
    ];

    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_STATUS_HISTORY_COLLECTION_ID,
      queries
    );

    return response.documents;
  } catch (error) {
    console.error('Error in getIssueStatusHistory:', error);
    throw error;
  }
}

// ============================================================================
// 3. Storage Service Functions
// ============================================================================

/**
 * Upload a photo to Appwrite Storage.
 * Must detect and handle BOTH input shapes:
 * - Mobile Expo ImagePicker / Camera result: `{ uri, ... }`, normalized to `{ name, type, size, uri }`
 * - Web `File` object: from `<input type="file">` when running in browser via Expo Web
 * 
 * Branches internally on `Platform.OS === 'web'` to choose the correct shape.
 * 
 * @param {object|File} fileInput
 * @returns {Promise<object>}
 */
export async function uploadPhoto(fileInput) {
  try {
    if (!fileInput) {
      throw new Error('No file provided for upload');
    }

    let fileToUpload;
    const isWeb = Platform.OS === 'web';

    if (isWeb) {
      // Running in Expo Web / Browser
      if (typeof File !== 'undefined' && fileInput instanceof File) {
        // Standard HTML5 File object from web file input
        fileToUpload = fileInput;
      } else if (fileInput && typeof fileInput === 'object' && fileInput.uri && !fileInput.name) {
        // Expo ImagePicker invoked on web platform
        fileToUpload = {
          name: fileInput.fileName || `civicfix_${Date.now()}.jpg`,
          type: fileInput.mimeType || fileInput.type || 'image/jpeg',
          size: fileInput.fileSize || fileInput.size || 0,
          uri: fileInput.uri,
        };
      } else {
        fileToUpload = fileInput;
      }
    } else {
      // Running on Native Mobile (iOS / Android)
      // Expects Expo ImagePicker / Camera asset: shape { name, type, size, uri }
      if (fileInput && typeof fileInput === 'object') {
        const uri = fileInput.uri;
        if (!uri) {
          throw new Error('Mobile photo upload requires a valid uri');
        }

        const name = fileInput.fileName || fileInput.name || `civicfix_${Date.now()}.jpg`;
        const type = fileInput.mimeType || fileInput.type || 'image/jpeg';
        const size = fileInput.fileSize || fileInput.size || 0;

        fileToUpload = {
          name,
          type,
          size,
          uri,
        };
      } else {
        fileToUpload = fileInput;
      }
    }

    const fileId = ID.unique();
    const uploaded = await storage.createFile(
      APPWRITE_STORAGE_BUCKET_ID,
      fileId,
      fileToUpload
    );

    return uploaded;
  } catch (error) {
    console.error('Error in uploadPhoto:', error);
    throw error;
  }
}

/**
 * Get public URL for photo preview / view.
 * 
 * @param {string} fileId
 * @returns {string}
 */
export function getPhotoPreviewUrl(fileId) {
  if (!fileId) return '';
  return storage.getFileView(APPWRITE_STORAGE_BUCKET_ID, fileId);
}

// ============================================================================
// 4. Status Update via Function Execution
// ============================================================================

/**
 * Update issue status by executing an Appwrite serverless Function.
 * Note: Status changes are performed via serverless function execution rather
 * than direct document updates to enforce authorization, status transitions,
 * audit logging, and automated notifications.
 * 
 * @param {object} params
 * @param {string} params.issueId
 * @param {string} params.newStatus
 * @param {string} [params.remarks]
 * @param {string} [params.resolvedPhotoId]
 * @param {string} [params.staffId]
 * @param {string} [params.staffName]
 * @returns {Promise<object>}
 */
export async function updateIssueStatus({
  issueId,
  newStatus,
  remarks = '',
  resolvedPhotoId = null,
  staffId = null,
  staffName = null,
}) {
  try {
    if (!issueId || !newStatus) {
      throw new Error('Both issueId and newStatus are required');
    }

    const payload = JSON.stringify({
      issueId,
      status: newStatus,
      remarks,
      resolvedPhotoId,
      staffId,
      staffName,
      timestamp: new Date().toISOString(),
    });

    const execution = await functions.createExecution(
      APPWRITE_FUNCTION_STATUS_UPDATE_ID,
      payload,
      false // Synchronous execution to receive output directly
    );

    if (execution.status === 'failed') {
      throw new Error(execution.errors || 'Status update function execution failed');
    }

    if (execution.responseBody) {
      try {
        return JSON.parse(execution.responseBody);
      } catch {
        return { success: true, body: execution.responseBody };
      }
    }

    return execution;
  } catch (error) {
    console.error('Error in updateIssueStatus:', error);
    throw error;
  }
}

// ============================================================================
// 5. Realtime Subscription for Live Map
// ============================================================================

/**
 * Subscribe to realtime issue events for the live map.
 * Operates identically on both mobile and web outputs via pure WebSocket logic.
 * 
 * @param {Function} onUpdate - callback invoked with { events, payload, timestamp }
 * @returns {Function} unsubscribe function to terminate listener
 */
export function subscribeToIssues(onUpdate) {
  try {
    const channel = `databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_ISSUES_COLLECTION_ID}.documents`;

    const unsubscribe = client.subscribe(channel, (response) => {
      if (typeof onUpdate === 'function') {
        onUpdate({
          events: response.events || [],
          payload: response.payload,
          timestamp: response.timestamp,
        });
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error in subscribeToIssues:', error);
    return () => {};
  }
}

// Grouped services export
export const authService = {
  register: registerUser,
  login: loginUser,
  getCurrentUser,
  logout: logoutUser,
};

export const issueService = {
  create: createIssue,
  getMyIssues,
  getDepartmentIssues,
  getAllIssues,
  getStatusHistory: getIssueStatusHistory,
  updateStatus: updateIssueStatus,
  subscribe: subscribeToIssues,
};

export const storageService = {
  uploadPhoto,
  getPhotoPreviewUrl,
};
