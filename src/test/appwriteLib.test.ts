import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mock functions so they are available inside vi.mock factories
const {
  mockSetEndpoint,
  mockSetProject,
  mockSetPlatform,
  mockSubscribe,
  mockAccountCreate,
  mockCreateEmailPasswordSession,
  mockUpdatePrefs,
  mockAccountGet,
  mockDeleteSession,
  mockCreateDocument,
  mockListDocuments,
  mockCreateFile,
  mockGetFileView,
  mockCreateExecution,
  mockPlatform,
} = vi.hoisted(() => {
  const setEndpoint = vi.fn();
  const setProject = vi.fn();
  const setPlatform = vi.fn();
  setEndpoint.mockReturnThis();
  setProject.mockReturnThis();
  setPlatform.mockReturnThis();

  return {
    mockSetEndpoint: setEndpoint,
    mockSetProject: setProject,
    mockSetPlatform: setPlatform,
    mockSubscribe: vi.fn(),
    mockAccountCreate: vi.fn(),
    mockCreateEmailPasswordSession: vi.fn(),
    mockUpdatePrefs: vi.fn(),
    mockAccountGet: vi.fn(),
    mockDeleteSession: vi.fn(),
    mockCreateDocument: vi.fn(),
    mockListDocuments: vi.fn(),
    mockCreateFile: vi.fn(),
    mockGetFileView: vi.fn(),
    mockCreateExecution: vi.fn(),
    mockPlatform: { OS: 'web' },
  };
});

vi.mock('react-native-appwrite', () => {
  class MockClient {
    setEndpoint = mockSetEndpoint;
    setProject = mockSetProject;
    setPlatform = mockSetPlatform;
    subscribe = mockSubscribe;
  }
  class MockAccount {
    create = mockAccountCreate;
    createEmailPasswordSession = mockCreateEmailPasswordSession;
    updatePrefs = mockUpdatePrefs;
    get = mockAccountGet;
    deleteSession = mockDeleteSession;
  }
  class MockDatabases {
    createDocument = mockCreateDocument;
    listDocuments = mockListDocuments;
  }
  class MockStorage {
    createFile = mockCreateFile;
    getFileView = mockGetFileView;
  }
  class MockFunctions {
    createExecution = mockCreateExecution;
  }

  return {
    Client: MockClient,
    Account: MockAccount,
    Databases: MockDatabases,
    Storage: MockStorage,
    Functions: MockFunctions,
    ID: {
      unique: () => 'mock_unique_id_' + Math.random().toString(36).substring(2, 8),
    },
    Query: {
      equal: (attr: string, val: unknown) => `equal("${attr}", ${JSON.stringify(val)})`,
      orderDesc: (attr: string) => `orderDesc("${attr}")`,
      orderAsc: (attr: string) => `orderAsc("${attr}")`,
      limit: (n: number) => `limit(${n})`,
    },
    Role: {},
    Permission: {},
  };
});

vi.mock('react-native', () => ({
  Platform: mockPlatform,
}));

vi.mock('react-native-url-polyfill/auto', () => ({}));

import {
  client,
  account,
  databases,
  storage,
  functions,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_PLATFORM,
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  createIssue,
  getMyIssues,
  getDepartmentIssues,
  getAllIssues,
  getIssueStatusHistory,
  uploadPhoto,
  updateIssueStatus,
  subscribeToIssues,
} from '../../lib/appwrite.js';

let initialEndpointCalls = 0;
let initialProjectCalls = 0;
let initialPlatformCalls = 0;

describe('Cross-Platform Appwrite Client & Services (lib/appwrite.js)', () => {
  // Capture initialization calls that happen on module import
  initialEndpointCalls = mockSetEndpoint.mock.calls.length;
  initialProjectCalls = mockSetProject.mock.calls.length;
  initialPlatformCalls = mockSetPlatform.mock.calls.length;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlatform.OS = 'web';
  });

  describe('Requirement 1: Client & Service Initialization', () => {
    it('initializes client with endpoint, project ID, and platform', () => {
      expect(APPWRITE_ENDPOINT).toBeDefined();
      expect(APPWRITE_PROJECT_ID).toBeDefined();
      expect(APPWRITE_PLATFORM).toBeDefined();

      expect(initialEndpointCalls).toBeGreaterThanOrEqual(1);
      expect(initialProjectCalls).toBeGreaterThanOrEqual(1);
      expect(initialPlatformCalls).toBeGreaterThanOrEqual(1);

      expect(client).toBeDefined();
      expect(account).toBeDefined();
      expect(databases).toBeDefined();
      expect(storage).toBeDefined();
    });
  });

  describe('Requirement 2: Auth Service Functions', () => {
    it('registerUser creates account, establishes session, and strictly sets role to "citizen"', async () => {
      const mockCreatedUser = {
        $id: 'usr_new_001',
        email: 'citizen@example.com',
        name: 'Aarav Patel',
      };
      const mockSession = {
        $id: 'sess_new_001',
        userId: 'usr_new_001',
      };

      mockAccountCreate.mockResolvedValueOnce(mockCreatedUser);
      mockCreateEmailPasswordSession.mockResolvedValueOnce(mockSession);
      mockUpdatePrefs.mockResolvedValueOnce({ role: 'citizen' });

      const result = await registerUser('citizen@example.com', 'SecurePass123!', 'Aarav Patel');

      expect(mockAccountCreate).toHaveBeenCalledWith(
        expect.any(String),
        'citizen@example.com',
        'SecurePass123!',
        'Aarav Patel'
      );
      expect(mockCreateEmailPasswordSession).toHaveBeenCalledWith(
        'citizen@example.com',
        'SecurePass123!'
      );
      expect(mockUpdatePrefs).toHaveBeenCalledWith({ role: 'citizen' });
      expect(result.user.role).toBe('citizen');
      expect(result.session).toEqual(mockSession);
    });

    it('loginUser signs in and returns user and session', async () => {
      const mockSession = { $id: 'sess_login_001' };
      const mockUser = {
        $id: 'usr_002',
        email: 'citizen@example.com',
        name: 'Aarav Patel',
        prefs: { role: 'citizen' },
      };

      mockCreateEmailPasswordSession.mockResolvedValueOnce(mockSession);
      mockAccountGet.mockResolvedValueOnce(mockUser);

      const result = await loginUser('citizen@example.com', 'Pass123!');

      expect(mockCreateEmailPasswordSession).toHaveBeenCalledWith('citizen@example.com', 'Pass123!');
      expect(mockAccountGet).toHaveBeenCalled();
      expect(result.user.role).toBe('citizen');
      expect(result.session).toEqual(mockSession);
    });

    it('getCurrentUser returns user profile with role, and null when unauthenticated', async () => {
      mockAccountGet.mockResolvedValueOnce({
        $id: 'usr_003',
        name: 'Priya Sharma',
        prefs: {},
      });

      const user = await getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.role).toBe('citizen'); // Defaults to citizen

      mockAccountGet.mockRejectedValueOnce(new Error('User not authorized'));
      const nullUser = await getCurrentUser();
      expect(nullUser).toBeNull();
    });

    it('logoutUser deletes current session', async () => {
      mockDeleteSession.mockResolvedValueOnce({ status: true });

      const res = await logoutUser();
      expect(mockDeleteSession).toHaveBeenCalledWith('current');
      expect(res).toEqual({ status: true });
    });
  });

  describe('Requirement 3: Database Service Functions', () => {
    it('createIssue writes new issue document with default Reported status and coordinates', async () => {
      const mockDoc = {
        $id: 'doc_issue_001',
        title: 'Deep pothole on Tagore Road',
        status: 'Reported',
      };
      mockCreateDocument.mockResolvedValueOnce(mockDoc);

      const input = {
        title: 'Deep pothole on Tagore Road',
        description: 'Dangerous pothole near circle',
        category: 'Pothole',
        latitude: 23.0792,
        longitude: 70.1345,
        locationName: 'Rotary Circle',
        ward: 'Ward 4 (Central)',
        reportedBy: 'usr_001',
        citizenName: 'Aarav Patel',
      };

      const result = await createIssue(input);

      expect(mockCreateDocument).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          title: 'Deep pothole on Tagore Road',
          category: 'Pothole',
          status: 'Reported',
          latitude: 23.0792,
          longitude: 70.1345,
          locationName: 'Rotary Circle',
          ward: 'Ward 4 (Central)',
          reportedBy: 'usr_001',
        })
      );
      expect(result).toEqual(mockDoc);
    });

    it('getMyIssues queries documents filtered by user ID', async () => {
      mockListDocuments.mockResolvedValueOnce({
        documents: [{ $id: 'issue_1', title: 'Pothole' }],
      });

      const docs = await getMyIssues('usr_001');

      expect(mockListDocuments).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.arrayContaining([expect.stringContaining('equal("reportedBy", "usr_001")')])
      );
      expect(docs).toHaveLength(1);
    });

    it('getDepartmentIssues queries documents for a specific department', async () => {
      mockListDocuments.mockResolvedValueOnce({
        documents: [{ $id: 'issue_2', department: 'Roads & Infrastructure' }],
      });

      const docs = await getDepartmentIssues('Roads & Infrastructure');

      expect(mockListDocuments).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.arrayContaining([
          expect.stringContaining('equal("department", "Roads & Infrastructure")'),
        ])
      );
      expect(docs).toHaveLength(1);
    });

    it('getAllIssues queries all issues', async () => {
      mockListDocuments.mockResolvedValueOnce({
        documents: [{ $id: 'issue_1' }, { $id: 'issue_2' }],
      });

      const docs = await getAllIssues();
      expect(mockListDocuments).toHaveBeenCalled();
      expect(docs).toHaveLength(2);
    });

    it('getIssueStatusHistory queries status history for a given issue ID', async () => {
      mockListDocuments.mockResolvedValueOnce({
        documents: [
          { $id: 'hist_1', issueId: 'issue_100', status: 'Reported' },
          { $id: 'hist_2', issueId: 'issue_100', status: 'In Progress' },
        ],
      });

      const history = await getIssueStatusHistory('issue_100');

      expect(mockListDocuments).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.arrayContaining([expect.stringContaining('equal("issueId", "issue_100")')])
      );
      expect(history).toHaveLength(2);
    });
  });

  describe('Requirement 4: Storage Service Functions', () => {
    it('uploadPhoto handles web File object when Platform.OS === "web"', async () => {
      mockPlatform.OS = 'web';
      mockCreateFile.mockResolvedValueOnce({ $id: 'file_web_001' });

      // Simulate a web File object
      const webFile = new File(['mock content'], 'test.jpg', { type: 'image/jpeg' });

      const uploaded = await uploadPhoto(webFile);

      expect(mockCreateFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        webFile
      );
      expect(uploaded).toEqual({ $id: 'file_web_001' });
    });

    it('uploadPhoto handles mobile Expo ImagePicker result when Platform.OS !== "web"', async () => {
      mockPlatform.OS = 'android';
      mockCreateFile.mockResolvedValueOnce({ $id: 'file_mobile_001' });

      // Mobile ImagePicker result object shape
      const mobileImageResult = {
        uri: 'file:///data/user/0/host.exp.exponent/cache/ExperienceData/ImagePicker/image.jpg',
        fileName: 'camera_capture.jpg',
        mimeType: 'image/jpeg',
        fileSize: 102400,
      };

      const uploaded = await uploadPhoto(mobileImageResult);

      expect(mockCreateFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        {
          name: 'camera_capture.jpg',
          type: 'image/jpeg',
          size: 102400,
          uri: 'file:///data/user/0/host.exp.exponent/cache/ExperienceData/ImagePicker/image.jpg',
        }
      );
      expect(uploaded).toEqual({ $id: 'file_mobile_001' });
    });
  });

  describe('Requirement 5: Status Update via Function Execution', () => {
    it('executes serverless function with status payload instead of direct document update', async () => {
      mockCreateExecution.mockResolvedValueOnce({
        $id: 'exec_001',
        status: 'completed',
        responseBody: JSON.stringify({ success: true, newStatus: 'In Progress' }),
      });

      const result = await updateIssueStatus({
        issueId: 'issue_100',
        newStatus: 'In Progress',
        remarks: 'Assigned to field engineer team',
        staffId: 'stf_001',
        staffName: 'Rajesh Varma',
      });

      expect(mockCreateExecution).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"status":"In Progress"'),
        false
      );
      expect(result).toEqual({ success: true, newStatus: 'In Progress' });
    });
  });

  describe('Requirement 6: Realtime Subscription for Live Map', () => {
    it('subscribes to realtime issue document changes and returns unsubscribe function', () => {
      const mockUnsubscribe = vi.fn();
      mockSubscribe.mockReturnValueOnce(mockUnsubscribe);

      const callback = vi.fn();
      const unsubscribe = subscribeToIssues(callback);

      expect(mockSubscribe).toHaveBeenCalledWith(
        expect.stringMatching(/^databases\..+\.collections\..+\.documents$/),
        expect.any(Function)
      );

      // Verify callback trigger
      const registeredHandler = mockSubscribe.mock.calls[0][1];
      registeredHandler({
        events: ['databases.*.collections.*.documents.*.update'],
        payload: { $id: 'issue_1', status: 'Resolved' },
        timestamp: 1726135800,
      });

      expect(callback).toHaveBeenCalledWith({
        events: ['databases.*.collections.*.documents.*.update'],
        payload: { $id: 'issue_1', status: 'Resolved' },
        timestamp: 1726135800,
      });

      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
