// Core Models
export interface Property {
  id: string;
  name: string;
  address: string;
  timezone: string;
}

export interface Cabin {
  id: string;
  propertyId: string;
  name: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

export type UserRole = 'Renter' | 'Staff' | 'Admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  propertyIds: string[];
  cabinId: string | null;
  signupToken?: string; // UUID for signup URL
  isActive?: boolean; // Whether user has access
}

// Maintenance Models
export type TicketStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Ticket {
  id: string;
  propertyId: string;
  cabinId: string;
  createdByUserId: string;
  assignedToUserId: string | null;
  category: string;
  subcategory: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketInput {
  propertyId: string;
  cabinId: string;
  category: string;
  subcategory: string;
  priority: TicketPriority;
  description: string;
}

// Community Models
export interface Thread {
  id: string;
  propertyId: string;
  createdByUserId: string;
  title: string;
  bodyMarkdown: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  threadId: string;
  createdByUserId: string;
  bodyMarkdown: string;
  createdAt: string;
}

export interface ThreadInput {
  propertyId: string;
  title: string;
  bodyMarkdown: string;
}

export interface ReplyInput {
  threadId: string;
  bodyMarkdown: string;
}

// Notice & Outage Models
export interface Notice {
  id: string;
  propertyId: string;
  title: string;
  bodyMarkdown: string;
  startsAt: string;
  endsAt: string;
  isPinned: boolean;
}

export interface NoticeInput {
  title: string;
  bodyMarkdown: string;
  startsAt: string;
  endsAt: string;
  isPinned: boolean;
  propertyIds: string[]; // Multiple properties
}

export type OutageStatus = 'Planned' | 'Active' | 'Resolved';

export interface Outage {
  id: string;
  propertyId: string;
  title: string;
  bodyMarkdown: string;
  startsAt: string;
  endsAt: string;
  status: OutageStatus;
}

export interface OutageInput {
  title: string;
  bodyMarkdown: string;
  startsAt: string;
  endsAt: string;
  status: OutageStatus;
  propertyIds: string[]; // Multiple properties
}

// Knowledge Base Models
export interface KBArticle {
  id: string;
  propertyId: string;
  title: string;
  symptoms: string;
  stepsMarkdown: string;
  tags: string[];
  createdByUserId: string;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
}

// Auth/Session Models
export interface Session {
  role: UserRole;
  userId: string;
  propertyId: string;
  cabinId: string | null;
}

// Community API Response
export interface CommunityData {
  threads: Thread[];
  replies: Reply[];
}
