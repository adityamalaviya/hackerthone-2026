import type {
  Client,
  Account,
  Databases,
  Storage,
  Functions,
  Models,
} from 'react-native-appwrite';

export const APPWRITE_ENDPOINT: string;
export const APPWRITE_PROJECT_ID: string;
export const APPWRITE_PLATFORM: string;
export const APPWRITE_DATABASE_ID: string;
export const APPWRITE_ISSUES_COLLECTION_ID: string;
export const APPWRITE_STATUS_HISTORY_COLLECTION_ID: string;
export const APPWRITE_STORAGE_BUCKET_ID: string;
export const APPWRITE_FUNCTION_STATUS_UPDATE_ID: string;

export const client: Client;
export const account: Account;
export const databases: Databases;
export const storage: Storage;
export const functions: Functions;

export { ID, Query, Role, Permission } from 'react-native-appwrite';

export function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ user: Models.User<Models.Preferences>; session: Models.Session }>;

export function loginUser(
  email: string,
  password: string
): Promise<{ user: Models.User<Models.Preferences>; session: Models.Session }>;

export function getCurrentUser(): Promise<(Models.User<Models.Preferences> & { role: string }) | null>;

export function logoutUser(): Promise<Record<string, unknown>>;

export interface CreateIssueInput {
  title: string;
  description?: string;
  category: string;
  status?: string;
  latitude: number | string;
  longitude: number | string;
  locationName?: string;
  ward?: string;
  photoUrl?: string;
  imageUrl?: string;
  photoFileId?: string;
  fileId?: string;
  reportedBy?: string;
  userId?: string;
  citizenName?: string;
  userName?: string;
  citizenPhone?: string;
  userPhone?: string;
  votes?: number;
  createdAt?: string;
}

export function createIssue(issueData: CreateIssueInput): Promise<Models.Document>;

export function getMyIssues(userId?: string): Promise<Models.Document[]>;

export function getDepartmentIssues(department: string): Promise<Models.Document[]>;

export function getAllIssues(customQueries?: string[]): Promise<Models.Document[]>;

export function getIssueStatusHistory(issueId: string): Promise<Models.Document[]>;

export interface MobileImagePickerResult {
  uri: string;
  fileName?: string;
  name?: string;
  mimeType?: string;
  type?: string;
  fileSize?: number;
  size?: number;
}

export function uploadPhoto(
  fileInput: File | MobileImagePickerResult
): Promise<Models.File>;

export function getPhotoPreviewUrl(fileId: string): string;

export interface UpdateStatusParams {
  issueId: string;
  newStatus: string;
  remarks?: string;
  resolvedPhotoId?: string | null;
  staffId?: string | null;
  staffName?: string | null;
}

export function updateIssueStatus(params: UpdateStatusParams): Promise<Models.Execution | any>;

export interface RealtimeIssueEvent {
  events: string[];
  payload: Models.Document;
  timestamp: number;
}

export function subscribeToIssues(
  onUpdate: (event: RealtimeIssueEvent) => void
): () => void;

export const authService: {
  register: typeof registerUser;
  login: typeof loginUser;
  getCurrentUser: typeof getCurrentUser;
  logout: typeof logoutUser;
};

export const issueService: {
  create: typeof createIssue;
  getMyIssues: typeof getMyIssues;
  getDepartmentIssues: typeof getDepartmentIssues;
  getAllIssues: typeof getAllIssues;
  getStatusHistory: typeof getIssueStatusHistory;
  updateStatus: typeof updateIssueStatus;
  subscribe: typeof subscribeToIssues;
};

export const storageService: {
  uploadPhoto: typeof uploadPhoto;
  getPhotoPreviewUrl: typeof getPhotoPreviewUrl;
};
