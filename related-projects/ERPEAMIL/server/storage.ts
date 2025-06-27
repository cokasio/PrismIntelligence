import { 
  users, chatSessions, chatMessages, financialDocuments, agentActivities, projects,
  type User, type ChatSession, type ChatMessage, type FinancialDocument, type AgentActivity, type Project,
  type InsertUser, type InsertChatSession, type InsertChatMessage, type InsertFinancialDocument, type InsertAgentActivity, type InsertProject
} from '@shared/schema';
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Project methods
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Chat session methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getChatSessions(): Promise<ChatSession[]>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  deleteChatSession(id: number): Promise<void>;

  // Chat message methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;
  getAllChatMessages(): Promise<ChatMessage[]>;

  // Financial document methods
  createFinancialDocument(document: InsertFinancialDocument): Promise<FinancialDocument>;
  getFinancialDocument(id: number): Promise<FinancialDocument | undefined>;
  getFinancialDocuments(sessionId: number): Promise<FinancialDocument[]>;
  updateFinancialDocument(id: number, updates: Partial<FinancialDocument>): Promise<FinancialDocument | undefined>;

  // Agent activity methods
  createAgentActivity(activity: InsertAgentActivity): Promise<AgentActivity>;
  getAgentActivities(sessionId: number): Promise<AgentActivity[]>;
  updateAgentActivity(id: number, updates: Partial<AgentActivity>): Promise<AgentActivity | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Project methods
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.name);
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return await db.select().from(chatSessions);
  }

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const [session] = await db
      .update(chatSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return session || undefined;
  }

  async deleteChatSession(id: number): Promise<void> {
    // Delete related records first
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, id));
    await db.delete(financialDocuments).where(eq(financialDocuments.sessionId, id));
    await db.delete(agentActivities).where(eq(agentActivities.sessionId, id));
    
    // Then delete the session
    await db.delete(chatSessions).where(eq(chatSessions.id, id));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }

  async getAllChatMessages(): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages);
  }

  async createFinancialDocument(insertDocument: InsertFinancialDocument): Promise<FinancialDocument> {
    const [document] = await db
      .insert(financialDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getFinancialDocument(id: number): Promise<FinancialDocument | undefined> {
    const [document] = await db.select().from(financialDocuments).where(eq(financialDocuments.id, id));
    return document || undefined;
  }

  async getFinancialDocuments(sessionId: number): Promise<FinancialDocument[]> {
    return await db.select().from(financialDocuments)
      .where(eq(financialDocuments.sessionId, sessionId));
  }

  async updateFinancialDocument(id: number, updates: Partial<FinancialDocument>): Promise<FinancialDocument | undefined> {
    const [document] = await db
      .update(financialDocuments)
      .set(updates)
      .where(eq(financialDocuments.id, id))
      .returning();
    return document || undefined;
  }

  async createAgentActivity(insertActivity: InsertAgentActivity): Promise<AgentActivity> {
    const [activity] = await db
      .insert(agentActivities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getAgentActivities(sessionId: number): Promise<AgentActivity[]> {
    return await db.select().from(agentActivities)
      .where(eq(agentActivities.sessionId, sessionId));
  }

  async updateAgentActivity(id: number, updates: Partial<AgentActivity>): Promise<AgentActivity | undefined> {
    const [activity] = await db
      .update(agentActivities)
      .set(updates)
      .where(eq(agentActivities.id, id))
      .returning();
    return activity || undefined;
  }
}

export const storage = new DatabaseStorage();