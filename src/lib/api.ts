import type {
  Property,
  Cabin,
  User,
  Ticket,
  Notice,
  Outage,
  CommunityData,
  KBArticle,
} from '../types/models';

const BASE_PATH = import.meta.env.BASE_URL || '/';

/**
 * Fetch JSON data from public/data folder
 */
async function fetchJSON<T>(filename: string): Promise<T> {
  const response = await fetch(`${BASE_PATH}data/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Get all properties
 */
export async function getProperties(): Promise<Property[]> {
  return fetchJSON<Property[]>('properties.json');
}

/**
 * Get property by ID
 */
export async function getProperty(id: string): Promise<Property | null> {
  const properties = await getProperties();
  return properties.find((p) => p.id === id) ?? null;
}

/**
 * Get all cabins
 */
export async function getCabins(): Promise<Cabin[]> {
  return fetchJSON<Cabin[]>('cabins.json');
}

/**
 * Get cabins by property ID
 */
export async function getCabinsByProperty(
  propertyId: string
): Promise<Cabin[]> {
  const cabins = await getCabins();
  return cabins.filter((c) => c.propertyId === propertyId);
}

/**
 * Get cabin by ID
 */
export async function getCabin(id: string): Promise<Cabin | null> {
  const cabins = await getCabins();
  return cabins.find((c) => c.id === id) ?? null;
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  return fetchJSON<User[]>('users.json');
}

/**
 * Get user by ID
 */
export async function getUser(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

/**
 * Get all tickets
 */
export async function getTickets(): Promise<Ticket[]> {
  return fetchJSON<Ticket[]>('tickets.json');
}

/**
 * Get tickets by user ID (created by user)
 */
export async function getMyTickets(userId: string): Promise<Ticket[]> {
  const tickets = await getTickets();
  return tickets.filter((t) => t.createdByUserId === userId);
}

/**
 * Get tickets by property ID
 */
export async function getTicketsByProperty(
  propertyId: string
): Promise<Ticket[]> {
  const tickets = await getTickets();
  return tickets.filter((t) => t.propertyId === propertyId);
}

/**
 * Get tickets assigned to user (for staff)
 */
export async function getAssignedTickets(userId: string): Promise<Ticket[]> {
  const tickets = await getTickets();
  return tickets.filter((t) => t.assignedToUserId === userId);
}

/**
 * Get unassigned tickets (for staff)
 */
export async function getUnassignedTickets(
  propertyId: string
): Promise<Ticket[]> {
  const tickets = await getTickets();
  return tickets.filter(
    (t) => t.propertyId === propertyId && !t.assignedToUserId
  );
}

/**
 * Get ticket by ID
 */
export async function getTicket(id: string): Promise<Ticket | null> {
  const tickets = await getTickets();
  return tickets.find((t) => t.id === id) ?? null;
}

/**
 * Get all notices
 */
export async function getNotices(): Promise<Notice[]> {
  return fetchJSON<Notice[]>('notices.json');
}

/**
 * Get notices by property ID
 */
export async function getNoticesByProperty(
  propertyId: string
): Promise<Notice[]> {
  const notices = await getNotices();
  return notices.filter((n) => n.propertyId === propertyId);
}

/**
 * Get active notices by property ID
 */
export async function getActiveNotices(propertyId: string): Promise<Notice[]> {
  const notices = await getNoticesByProperty(propertyId);
  const now = new Date();
  return notices.filter((n) => {
    const start = new Date(n.startsAt);
    const end = new Date(n.endsAt);
    return now >= start && now <= end;
  });
}

/**
 * Get all outages
 */
export async function getOutages(): Promise<Outage[]> {
  return fetchJSON<Outage[]>('outages.json');
}

/**
 * Get outages by property ID
 */
export async function getOutagesByProperty(
  propertyId: string
): Promise<Outage[]> {
  const outages = await getOutages();
  return outages.filter((o) => o.propertyId === propertyId);
}

/**
 * Get active outages by property ID
 */
export async function getActiveOutages(propertyId: string): Promise<Outage[]> {
  const outages = await getOutagesByProperty(propertyId);
  const now = new Date();
  return outages.filter((o) => {
    const start = new Date(o.startsAt);
    const end = new Date(o.endsAt);
    return now >= start && now <= end;
  });
}

/**
 * Get community data (threads and replies)
 */
export async function getCommunityData(): Promise<CommunityData> {
  return fetchJSON<CommunityData>('community.json');
}

/**
 * Get threads by property ID
 */
export async function getThreads(propertyId: string) {
  const data = await getCommunityData();
  return data.threads.filter((t) => t.propertyId === propertyId);
}

/**
 * Get thread by ID
 */
export async function getThread(id: string) {
  const data = await getCommunityData();
  return data.threads.find((t) => t.id === id) ?? null;
}

/**
 * Get replies for a thread
 */
export async function getThreadReplies(threadId: string) {
  const data = await getCommunityData();
  return data.replies.filter((r) => r.threadId === threadId);
}

/**
 * Get all KB articles
 */
export async function getKBArticles(): Promise<KBArticle[]> {
  return fetchJSON<KBArticle[]>('kb.json');
}

/**
 * Get KB articles by property ID
 */
export async function getKBArticlesByProperty(
  propertyId: string
): Promise<KBArticle[]> {
  const articles = await getKBArticles();
  return articles.filter((a) => a.propertyId === propertyId);
}

/**
 * Get KB article by ID
 */
export async function getKBArticle(id: string): Promise<KBArticle | null> {
  const articles = await getKBArticles();
  return articles.find((a) => a.id === id) ?? null;
}
