import type {
  Ticket,
  TicketInput,
  Thread,
  ThreadInput,
  Reply,
  ReplyInput,
  Notice,
  NoticeInput,
  Outage,
  OutageInput,
  User,
  UserRole,
} from '../types/models';
import { generateId } from './utils';
import { getCurrentUserId } from './authSim';
import { v4 as uuidv4 } from 'uuid';

// localStorage keys for simulated data overlays
const TICKETS_OVERLAY_KEY = 'cabinPortal_ticketsOverlay';
const COMMUNITY_OVERLAY_KEY = 'cabinPortal_communityOverlay';
const NOTICES_OVERLAY_KEY = 'cabinPortal_noticesOverlay';
const OUTAGES_OVERLAY_KEY = 'cabinPortal_outagesOverlay';

// Overlay types
interface TicketsOverlay {
  created: Ticket[];
  updated: Record<string, Partial<Ticket>>;
}

interface CommunityOverlay {
  threadsCreated: Thread[];
  threadsUpdated: Record<string, Partial<Thread>>;
  threadsDeleted: string[];
  repliesCreated: Reply[];
}

interface NoticesOverlay {
  created: Notice[];
  updated: Record<string, Partial<Notice>>;
  deleted: string[];
}

interface OutagesOverlay {
  created: Outage[];
  updated: Record<string, Partial<Outage>>;
  deleted: string[];
}

/**
 * Get tickets overlay from localStorage
 */
function getTicketsOverlay(): TicketsOverlay {
  const stored = localStorage.getItem(TICKETS_OVERLAY_KEY);
  if (!stored) return { created: [], updated: {} };

  try {
    return JSON.parse(stored) as TicketsOverlay;
  } catch {
    return { created: [], updated: {} };
  }
}

/**
 * Save tickets overlay to localStorage
 */
function saveTicketsOverlay(overlay: TicketsOverlay): void {
  localStorage.setItem(TICKETS_OVERLAY_KEY, JSON.stringify(overlay));
}

/**
 * Get community overlay from localStorage
 */
function getCommunityOverlay(): CommunityOverlay {
  const stored = localStorage.getItem(COMMUNITY_OVERLAY_KEY);
  if (!stored) return { threadsCreated: [], threadsUpdated: {}, threadsDeleted: [], repliesCreated: [] };

  try {
    return JSON.parse(stored) as CommunityOverlay;
  } catch {
    return { threadsCreated: [], threadsUpdated: {}, threadsDeleted: [], repliesCreated: [] };
  }
}

/**
 * Save community overlay to localStorage
 */
function saveCommunityOverlay(overlay: CommunityOverlay): void {
  localStorage.setItem(COMMUNITY_OVERLAY_KEY, JSON.stringify(overlay));
}

/**
 * Merge base tickets with overlay (for queries)
 */
export function mergeTicketsWithOverlay(baseTickets: Ticket[]): Ticket[] {
  const overlay = getTicketsOverlay();

  // Apply updates to existing tickets
  const updatedTickets = baseTickets.map((ticket) => {
    const update = overlay.updated[ticket.id];
    return update ? { ...ticket, ...update } : ticket;
  });

  // Add created tickets
  return [...updatedTickets, ...overlay.created];
}

/**
 * Merge base threads with overlay
 */
export function mergeThreadsWithOverlay(baseThreads: Thread[]): Thread[] {
  const overlay = getCommunityOverlay();
  
  // Filter out deleted threads
  let threads = baseThreads.filter((t) => !overlay.threadsDeleted.includes(t.id));
  
  // Apply updates to existing threads
  threads = threads.map((thread) => {
    const update = overlay.threadsUpdated[thread.id];
    return update ? { ...thread, ...update } : thread;
  });
  
  // Add created threads
  return [...threads, ...overlay.threadsCreated];
}

/**
 * Merge base replies with overlay
 */
export function mergeRepliesWithOverlay(baseReplies: Reply[]): Reply[] {
  const overlay = getCommunityOverlay();
  return [...baseReplies, ...overlay.repliesCreated];
}

/**
 * Simulate creating a new ticket
 */
export function createTicket(input: TicketInput): Ticket {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: generateId('T'),
    propertyId: input.propertyId,
    cabinId: input.cabinId,
    createdByUserId: userId,
    assignedToUserId: null,
    category: input.category,
    subcategory: input.subcategory,
    priority: input.priority,
    status: 'Open',
    description: input.description,
    createdAt: now,
    updatedAt: now,
  };

  const overlay = getTicketsOverlay();
  overlay.created.push(ticket);
  saveTicketsOverlay(overlay);

  return ticket;
}

/**
 * Simulate updating a ticket
 */
export function updateTicket(
  ticketId: string,
  update: Partial<Ticket>
): void {
  const overlay = getTicketsOverlay();

  // Check if ticket is in created overlay
  const createdIndex = overlay.created.findIndex((t) => t.id === ticketId);
  if (createdIndex !== -1) {
    overlay.created[createdIndex] = {
      ...overlay.created[createdIndex],
      ...update,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Update existing ticket from JSON
    overlay.updated[ticketId] = {
      ...overlay.updated[ticketId],
      ...update,
      updatedAt: new Date().toISOString(),
    };
  }

  saveTicketsOverlay(overlay);
}

/**
 * Simulate creating a new thread
 */
export function createThread(input: ThreadInput): Thread {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const now = new Date().toISOString();
  const thread: Thread = {
    id: generateId('TH'),
    propertyId: input.propertyId,
    createdByUserId: userId,
    title: input.title,
    bodyMarkdown: input.bodyMarkdown,
    isPinned: false,
    isLocked: false,
    createdAt: now,
    updatedAt: now,
  };

  const overlay = getCommunityOverlay();
  overlay.threadsCreated.push(thread);
  saveCommunityOverlay(overlay);

  return thread;
}

/**
 * Simulate creating a new reply
 */
export function createReply(input: ReplyInput): Reply {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const reply: Reply = {
    id: generateId('RP'),
    threadId: input.threadId,
    createdByUserId: userId,
    bodyMarkdown: input.bodyMarkdown,
    createdAt: new Date().toISOString(),
  };

  const overlay = getCommunityOverlay();
  overlay.repliesCreated.push(reply);
  saveCommunityOverlay(overlay);

  return reply;
}

/**
 * Lock or unlock a thread (Admin only)
 */
export function lockThread(threadId: string, isLocked: boolean): void {
  const overlay = getCommunityOverlay();

  // Check if thread is in created overlay
  const createdIndex = overlay.threadsCreated.findIndex((t) => t.id === threadId);
  if (createdIndex !== -1) {
    overlay.threadsCreated[createdIndex].isLocked = isLocked;
    overlay.threadsCreated[createdIndex].updatedAt = new Date().toISOString();
  } else {
    // Update existing thread from JSON
    overlay.threadsUpdated[threadId] = {
      ...overlay.threadsUpdated[threadId],
      isLocked,
      updatedAt: new Date().toISOString(),
    };
  }

  saveCommunityOverlay(overlay);
}

/**
 * Delete a thread (Admin only)
 */
export function deleteThread(threadId: string): void {
  const overlay = getCommunityOverlay();

  // Check if thread is in created overlay
  const createdIndex = overlay.threadsCreated.findIndex((t) => t.id === threadId);
  if (createdIndex !== -1) {
    // Remove from created array
    overlay.threadsCreated.splice(createdIndex, 1);
  } else {
    // Mark as deleted from JSON
    if (!overlay.threadsDeleted.includes(threadId)) {
      overlay.threadsDeleted.push(threadId);
    }
  }

  saveCommunityOverlay(overlay);
}

/**
 * Clear all simulated data (for testing)
 */
export function clearSimulatedData(): void {
  localStorage.removeItem(TICKETS_OVERLAY_KEY);
  localStorage.removeItem(COMMUNITY_OVERLAY_KEY);
  localStorage.removeItem(NOTICES_OVERLAY_KEY);
  localStorage.removeItem(OUTAGES_OVERLAY_KEY);
}

// ====== NOTICES MANAGEMENT ======

function getNoticesOverlay(): NoticesOverlay {
  const stored = localStorage.getItem(NOTICES_OVERLAY_KEY);
  if (!stored) return { created: [], updated: {}, deleted: [] };
  try {
    return JSON.parse(stored) as NoticesOverlay;
  } catch {
    return { created: [], updated: {}, deleted: [] };
  }
}

function saveNoticesOverlay(overlay: NoticesOverlay): void {
  localStorage.setItem(NOTICES_OVERLAY_KEY, JSON.stringify(overlay));
}

export function mergeNoticesWithOverlay(baseNotices: Notice[]): Notice[] {
  const overlay = getNoticesOverlay();
  
  // Filter out deleted notices
  let merged = baseNotices.filter(n => !overlay.deleted.includes(n.id));
  
  // Apply updates
  merged = merged.map(notice => {
    const updates = overlay.updated[notice.id];
    return updates ? { ...notice, ...updates } : notice;
  });
  
  // Add created notices
  merged = [...merged, ...overlay.created];
  
  // Sort by startsAt descending
  return merged.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
}

export function createNotice(input: NoticeInput): Notice[] {
  const overlay = getNoticesOverlay();
  
  // Create a notice for each selected property
  const newNotices: Notice[] = input.propertyIds.map(propertyId => ({
    id: generateId('N'),
    propertyId,
    title: input.title,
    bodyMarkdown: input.bodyMarkdown,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    isPinned: input.isPinned,
  }));
  
  overlay.created.push(...newNotices);
  saveNoticesOverlay(overlay);
  
  return newNotices;
}

export function updateNotice(noticeId: string, updates: Partial<Notice>): void {
  const overlay = getNoticesOverlay();
  overlay.updated[noticeId] = { ...overlay.updated[noticeId], ...updates };
  saveNoticesOverlay(overlay);
}

export function deleteNotice(noticeId: string): void {
  const overlay = getNoticesOverlay();
  overlay.deleted.push(noticeId);
  saveNoticesOverlay(overlay);
}

// ====== OUTAGES MANAGEMENT ======

function getOutagesOverlay(): OutagesOverlay {
  const stored = localStorage.getItem(OUTAGES_OVERLAY_KEY);
  if (!stored) return { created: [], updated: {}, deleted: [] };
  try {
    return JSON.parse(stored) as OutagesOverlay;
  } catch {
    return { created: [], updated: {}, deleted: [] };
  }
}

function saveOutagesOverlay(overlay: OutagesOverlay): void {
  localStorage.setItem(OUTAGES_OVERLAY_KEY, JSON.stringify(overlay));
}

export function mergeOutagesWithOverlay(baseOutages: Outage[]): Outage[] {
  const overlay = getOutagesOverlay();
  
  // Filter out deleted outages
  let merged = baseOutages.filter(o => !overlay.deleted.includes(o.id));
  
  // Apply updates
  merged = merged.map(outage => {
    const updates = overlay.updated[outage.id];
    return updates ? { ...outage, ...updates } : outage;
  });
  
  // Add created outages
  merged = [...merged, ...overlay.created];
  
  // Sort by startsAt descending
  return merged.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
}

export function createOutage(input: OutageInput): Outage[] {
  const overlay = getOutagesOverlay();
  
  // Create an outage for each selected property
  const newOutages: Outage[] = input.propertyIds.map(propertyId => ({
    id: generateId('O'),
    propertyId,
    title: input.title,
    bodyMarkdown: input.bodyMarkdown,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    status: input.status,
  }));
  
  overlay.created.push(...newOutages);
  saveOutagesOverlay(overlay);
  
  return newOutages;
}

export function updateOutage(outageId: string, updates: Partial<Outage>): void {
  const overlay = getOutagesOverlay();
  overlay.updated[outageId] = { ...overlay.updated[outageId], ...updates };
  saveOutagesOverlay(overlay);
}

export function deleteOutage(outageId: string): void {
  const overlay = getOutagesOverlay();
  overlay.deleted.push(outageId);
  saveOutagesOverlay(overlay);
}

// ====== USER MANAGEMENT ======

const USERS_OVERLAY_KEY = 'cabinPortal_usersOverlay';

interface UsersOverlay {
  created: User[];
  updated: Record<string, Partial<User>>;
  deleted: string[];
}

function getUsersOverlay(): UsersOverlay {
  const stored = localStorage.getItem(USERS_OVERLAY_KEY);
  if (!stored) return { created: [], updated: {}, deleted: [] };
  try {
    const parsed = JSON.parse(stored);
    // Ensure backward compatibility - add deleted array if it doesn't exist
    return {
      created: parsed.created || [],
      updated: parsed.updated || {},
      deleted: parsed.deleted || [],
    };
  } catch {
    return { created: [], updated: {}, deleted: [] };
  }
}

function saveUsersOverlay(overlay: UsersOverlay): void {
  localStorage.setItem(USERS_OVERLAY_KEY, JSON.stringify(overlay));
}

export function mergeUsersWithOverlay(baseUsers: User[]): User[] {
  const overlay = getUsersOverlay();
  
  // Filter out deleted users
  let users = baseUsers.filter((user) => !overlay.deleted.includes(user.id));
  
  // Apply updates to existing users
  users = users.map((user) => {
    const update = overlay.updated[user.id];
    return update ? { ...user, ...update } : user;
  });
  
  // Add created users (exclude deleted ones)
  const activeCreated = overlay.created.filter(
    (user) => !overlay.deleted.includes(user.id)
  );
  
  return [...users, ...activeCreated];
}

interface CreateUserInput {
  email: string;
  name: string;
  role: UserRole;
  propertyId: string;
  cabinId: string | null;
}

export function createUser(input: CreateUserInput): User {
  const signupToken = uuidv4();
  
  const user: User = {
    id: generateId('U'),
    email: input.email,
    name: input.name,
    role: input.role,
    propertyIds: [input.propertyId],
    cabinId: input.cabinId,
    signupToken,
    isActive: false, // Not active until they complete signup
  };
  
  const overlay = getUsersOverlay();
  overlay.created.push(user);
  saveUsersOverlay(overlay);
  
  return user;
}

export function revokeUserAccess(userId: string): void {
  const overlay = getUsersOverlay();
  overlay.updated[userId] = {
    ...overlay.updated[userId],
    isActive: false,
    cabinId: null,
  };
  saveUsersOverlay(overlay);
}

export function getSignupUrl(token: string): string {
  const baseUrl = window.location.origin + import.meta.env.BASE_URL;
  return `${baseUrl}signup/${token}`;
}

export function deleteUser(userId: string): void {
  const overlay = getUsersOverlay();
  overlay.deleted.push(userId);
  saveUsersOverlay(overlay);
}
