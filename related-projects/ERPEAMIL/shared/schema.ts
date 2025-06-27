import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Project Management Schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"), // For nested projects/folders
  userId: integer("user_id"), // Future: link to users table
  icon: text("icon").default("folder"), // folder, briefcase, chart, etc.
  color: text("color").default("#6366f1"), // Hex color for project
  isArchived: boolean("is_archived").default(false),
  settings: jsonb("settings"), // Project-specific settings
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"), // Link to project
  title: text("title").notNull(),
  source: text("source").notNull(), // 'email' or 'upload'
  status: text("status").notNull().default("active"), // 'active', 'completed', 'processing'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  metadata: jsonb("metadata"), // Additional session data
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  sender: text("sender").notNull(), // 'user', 'system', 'income_analyst', 'balance_analyst', 'cashflow_analyst', 'strategic_advisor'
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"), // 'text', 'file', 'analysis', 'system'
  source: text("source"), // 'email' or 'upload' for tracking message origin
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: jsonb("metadata"), // File info, processing status, etc.
});

export const financialDocuments = pgTable("financial_documents", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  source: text("source").notNull(), // 'email' or 'upload'
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'error'
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  metadata: jsonb("metadata"), // File size, email info, etc.
  analysisResults: jsonb("analysis_results"), // Processed financial data
});

export const agentActivities = pgTable("agent_activities", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  agentName: text("agent_name").notNull(),
  activity: text("activity").notNull(),
  status: text("status").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertFinancialDocumentSchema = createInsertSchema(financialDocuments).omit({
  id: true,
  uploadedAt: true,
  processedAt: true,
});

export const insertAgentActivitySchema = createInsertSchema(agentActivities).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

// Types
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertFinancialDocument = z.infer<typeof insertFinancialDocumentSchema>;
export type FinancialDocument = typeof financialDocuments.$inferSelect;

export type InsertAgentActivity = z.infer<typeof insertAgentActivitySchema>;
export type AgentActivity = typeof agentActivities.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
