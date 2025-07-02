import nodemailer from 'nodemailer';
import { createTransport, Transporter } from 'nodemailer';
import logger from '../utils/logger.js';
import { taskDatabase } from './database/task-database.service.js';
import path from 'path';
import fs from 'fs/promises';

interface TaskNotification {
  id: string;
  title: string;
  description: string;
  priority: number;
  assignedRole: string;
  dueDate: string;
  estimatedHours: number;
  potentialValue: number;
  sourceInsight: string;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

interface RoleEmailMapping {
  [key: string]: string[];
}

export class NotificationService {
  private transporter: Transporter | null = null;
  private fromAddress: string;
  private appUrl: string;
  private roleEmails: RoleEmailMapping;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // ms
  private isTestMode: boolean;

  constructor() {
    this.fromAddress = process.env.CLOUDMAILIN_FROM_ADDRESS || process.env.CLOUDMAILIN_ADDRESS || 'noreply@prismintel.ai';
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.prismintel.ai';
    this.isTestMode = process.env.CLOUDMAILIN_TEST_MODE === 'true' || process.env.NODE_ENV === 'development';
    
    // Map roles to email addresses from environment
    this.roleEmails = {
      'CFO': this.parseEmails(process.env.CFO_EMAILS || 'cfo@example.com'),
      'PropertyManager': this.parseEmails(process.env.PM_EMAILS || 'pm@example.com'),
      'Maintenance': this.parseEmails(process.env.MAINTENANCE_EMAILS || 'maintenance@example.com'),
      'Accounting': this.parseEmails(process.env.ACCOUNTING_EMAILS || 'accounting@example.com'),
      'Leasing': this.parseEmails(process.env.LEASING_EMAILS || 'leasing@example.com'),
      'Controller': this.parseEmails(process.env.CONTROLLER_EMAILS || 'controller@example.com'),
      'Other': this.parseEmails(process.env.DEFAULT_EMAILS || 'admin@example.com')
    };

    this.initializeTransporter();
  }

  /**
   * Initialize email transporter with CloudMailin or SMTP configuration
   */
  private initializeTransporter(): void {
    try {
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.cloudmta.net',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
      };

      // Add auth if credentials are provided
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        emailConfig.auth = {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        };
      }

      this.transporter = createTransport(emailConfig);
      
      // Verify connection
      this.transporter.verify((error) => {
        if (error) {
          logger.error('Email transporter verification failed:', error);
        } else {
          logger.info('✅ Email notification service ready');
          if (this.isTestMode) {
            logger.warn('⚠️  CloudMailin is in TEST MODE - emails will be logged but not delivered');
            logger.info('   To go live, verify a domain at https://www.cloudmailin.com/');
          }
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  /**
   * Parse comma-separated email addresses
   */
  private parseEmails(emailString: string): string[] {
    return emailString.split(',').map(email => email.trim()).filter(email => email);
  }

  /**
   * Send task notifications when new tasks are created
   */
  async sendTaskNotifications(
    tasks: TaskNotification[],
    documentName: string,
    analysisId: string,
    propertyName: string = 'Property',
    companyId: string
  ): Promise<void> {
    if (!this.transporter || tasks.length === 0) {
      logger.warn('Task notifications not sent - email not configured or no tasks');
      return;
    }

    try {
      // Group tasks by role
      const tasksByRole = this.groupTasksByRole(tasks);
      
      // Send email to each role
      const emailPromises = Object.entries(tasksByRole).map(([role, roleTasks]) =>
        this.sendRoleTaskEmailWithRetry(
          role,
          roleTasks,
          documentName,
          analysisId,
          propertyName,
          companyId
        )
      );

      await Promise.allSettled(emailPromises);
      logger.info(`📧 Sent task notifications for ${Object.keys(tasksByRole).length} roles`);
    } catch (error) {
      logger.error('Failed to send task notifications:', error);
    }
  }

  /**
   * Send email with retry logic
   */
  private async sendRoleTaskEmailWithRetry(
    role: string,
    tasks: TaskNotification[],
    documentName: string,
    analysisId: string,
    propertyName: string,
    companyId: string,
    attempt: number = 1
  ): Promise<void> {
    try {
      await this.sendRoleTaskEmail(role, tasks, documentName, analysisId, propertyName);
    } catch (error) {
      if (attempt < this.maxRetries) {
        logger.warn(`Email send attempt ${attempt} failed for ${role}, retrying...`);
        await this.delay(this.retryDelay * attempt);
        return this.sendRoleTaskEmailWithRetry(
          role, tasks, documentName, analysisId, propertyName, companyId, attempt + 1
        );
      } else {
        logger.error(`Failed to send email to ${role} after ${this.maxRetries} attempts:`, error);
        throw error;
      }
    }
  }

  /**
   * Send email to a specific role with their tasks
   */
  private async sendRoleTaskEmail(
    role: string,
    tasks: TaskNotification[],
    documentName: string,
    analysisId: string,
    propertyName: string
  ): Promise<void> {
    const recipients = this.roleEmails[role] || this.roleEmails['Other'];
    const urgentCount = tasks.filter(t => t.priority <= 2).length;
    const totalValue = tasks.reduce((sum, t) => sum + t.potentialValue, 0);

    const subject = `🎯 ${tasks.length} New Task${tasks.length > 1 ? 's' : ''} - ${propertyName}${urgentCount > 0 ? ' (URGENT)' : ''}`;
    
    const { html, text } = await this.generateTaskEmail(
      role,
      tasks,
      documentName,
      analysisId,
      propertyName,
      totalValue
    );

    const mailOptions = {
      from: `Prism Intelligence <${this.fromAddress}>`,
      to: recipients.join(', '),
      subject,
      html,
      text
    };

    if (this.transporter) {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Sent ${tasks.length} tasks to ${role} (${recipients.join(', ')}) - MessageId: ${info.messageId}`);
      
      if (this.isTestMode) {
        logger.info('📋 TEST MODE - Email Details:');
        logger.info(`   Subject: ${subject}`);
        logger.info(`   Recipients: ${recipients.join(', ')}`);
        logger.info(`   Tasks: ${tasks.map(t => t.title).join(', ')}`);
        logger.info(`   Total Value: $${totalValue.toLocaleString()}`);
        logger.info('   ⚠️  Email queued in CloudMailin but not delivered (test mode)');
      }
    }
  }

  /**
   * Generate task notification email content
   */
  private async generateTaskEmail(
    role: string,
    tasks: TaskNotification[],
    documentName: string,
    analysisId: string,
    propertyName: string,
    totalValue: number
  ): Promise<{ html: string; text: string }> {
    const urgentTasks = tasks.filter(t => t.priority <= 2);
    const normalTasks = tasks.filter(t => t.priority > 2);
    
    // HTML Template
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #1f2937; 
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .wrapper { 
      background-color: #f3f4f6;
      padding: 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    }
    .header { 
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
      color: white; 
      padding: 32px 24px; 
      text-align: center;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content { 
      padding: 32px 24px;
    }
    .summary-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 12px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-value {
      font-size: 24px;
      font-weight: 700;
      color: #0284c7;
    }
    .summary-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .task-section {
      margin: 24px 0;
    }
    .task-section h3 {
      font-size: 18px;
      margin: 0 0 16px 0;
      color: #1e293b;
    }
    .task-card { 
      background: #ffffff; 
      border: 1px solid #e5e7eb; 
      border-radius: 8px; 
      padding: 16px; 
      margin: 12px 0;
      transition: box-shadow 0.2s;
    }
    .task-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .urgent { 
      border-left: 4px solid #ef4444; 
    }
    .normal { 
      border-left: 4px solid #3b82f6; 
    }
    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .task-title {
      font-weight: 600;
      font-size: 16px;
      color: #1e293b;
      margin: 0 0 8px 0;
    }
    .task-meta {
      display: flex;
      gap: 12px;
      font-size: 13px;
      color: #64748b;
    }
    .priority { 
      display: inline-block; 
      padding: 2px 8px; 
      border-radius: 4px; 
      font-size: 11px; 
      font-weight: 600;
      text-transform: uppercase;
    }
    .priority-1, .priority-2 { 
      background: #fee2e2; 
      color: #991b1b; 
    }
    .priority-3 { 
      background: #fef3c7; 
      color: #92400e; 
    }
    .priority-4, .priority-5 { 
      background: #dbeafe; 
      color: #1e40af; 
    }
    .task-value {
      text-align: right;
      white-space: nowrap;
    }
    .value-amount {
      font-size: 18px;
      font-weight: 700;
      color: #059669;
    }
    .value-hours {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }
    .task-description {
      font-size: 14px;
      color: #4b5563;
      margin: 12px 0;
      white-space: pre-line;
    }
    .task-source {
      background: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      color: #6b7280;
      margin: 12px 0;
    }
    .task-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    .button { 
      display: inline-block; 
      padding: 10px 20px; 
      text-decoration: none; 
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      transition: all 0.2s;
    }
    .button-primary {
      background: #10b981;
      color: white;
    }
    .button-primary:hover {
      background: #059669;
    }
    .button-secondary {
      background: #6b7280;
      color: white;
    }
    .button-secondary:hover {
      background: #4b5563;
    }
    .footer { 
      margin-top: 32px;
      padding: 24px;
      background: #f9fafb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>New Tasks for ${role}</h1>
        <p>Generated from: ${documentName}</p>
        <p>${propertyName}</p>
      </div>
      
      <div class="content">
        <div class="summary-box">
          <strong>Task Summary</strong>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${tasks.length}</div>
              <div class="summary-label">Total Tasks</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">$${totalValue.toLocaleString()}</div>
              <div class="summary-label">Potential Value</div>
            </div>
          </div>
        </div>

        ${urgentTasks.length > 0 ? `
        <div class="task-section">
          <h3>🚨 Urgent Tasks (${urgentTasks.length})</h3>
          ${urgentTasks.map(task => this.generateTaskCardHtml(task, analysisId)).join('')}
        </div>
        ` : ''}

        ${normalTasks.length > 0 ? `
        <div class="task-section">
          <h3>📋 Other Tasks (${normalTasks.length})</h3>
          ${normalTasks.map(task => this.generateTaskCardHtml(task, analysisId)).join('')}
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 32px;">
          <a href="${this.appUrl}/analysis/${analysisId}" class="button button-primary" style="margin-right: 12px;">View Full Analysis</a>
          <a href="${this.appUrl}/tasks" class="button button-secondary">View All Tasks</a>
        </div>
      </div>

      <div class="footer">
        <p>This is an automated notification from Prism Intelligence</p>
        <p>To manage your notification preferences, visit <a href="${this.appUrl}/settings/notifications">Settings</a></p>
        <p style="margin-top: 16px; font-size: 11px; color: #9ca3af;">
          ${this.fromAddress} | <a href="${this.appUrl}/unsubscribe">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Plain text version
    const text = `
New Tasks for ${role}
Generated from: ${documentName}
Property: ${propertyName}

Task Summary:
- Total Tasks: ${tasks.length}
- Potential Value: $${totalValue.toLocaleString()}

${urgentTasks.length > 0 ? `
URGENT TASKS (${urgentTasks.length})
${'='.repeat(40)}
${urgentTasks.map((task, i) => this.generateTaskText(task, i + 1)).join('\n')}
` : ''}

${normalTasks.length > 0 ? `
OTHER TASKS (${normalTasks.length})
${'='.repeat(40)}
${normalTasks.map((task, i) => this.generateTaskText(task, i + 1)).join('\n')}
` : ''}

View Full Analysis: ${this.appUrl}/analysis/${analysisId}
View All Tasks: ${this.appUrl}/tasks

---
This is an automated notification from Prism Intelligence
To manage your preferences: ${this.appUrl}/settings/notifications
`;

    return { html, text };
  }

  /**
   * Generate individual task card HTML
   */
  private generateTaskCardHtml(task: TaskNotification, analysisId: string): string {
    const dueDate = new Date(task.dueDate);
    const completeUrl = `${this.appUrl}/api/tasks/${task.id}/complete`;
    
    return `
    <div class="task-card ${task.priority <= 2 ? 'urgent' : 'normal'}">
      <div class="task-header">
        <div>
          <h4 class="task-title">${task.title}</h4>
          <div class="task-meta">
            <span class="priority priority-${task.priority}">Priority ${task.priority}</span>
            <span>Due: ${dueDate.toLocaleDateString()}</span>
            <span>${task.estimatedHours} hours</span>
          </div>
        </div>
        <div class="task-value">
          <div class="value-amount">$${task.potentialValue.toLocaleString()}</div>
          <div class="value-hours">Est. value</div>
        </div>
      </div>
      
      <p class="task-description">${task.description}</p>
      
      <div class="task-source">
        <strong>Source:</strong> ${task.sourceInsight}
      </div>
      
      <div class="task-actions">
        <form action="${completeUrl}" method="POST" style="display: inline;">
          <input type="hidden" name="taskId" value="${task.id}" />
          <button type="submit" class="button button-primary">✓ Mark Complete</button>
        </form>
        <a href="${this.appUrl}/tasks/${task.id}" class="button button-secondary">View Details</a>
      </div>
    </div>`;
  }

  /**
   * Generate task text for plain text email
   */
  private generateTaskText(task: TaskNotification, index: number): string {
    return `
Task ${index}: ${task.title}
Priority: ${task.priority}/5 | Due: ${new Date(task.dueDate).toLocaleDateString()}
Estimated: ${task.estimatedHours} hours | Value: $${task.potentialValue.toLocaleString()}

Description:
${task.description}

Source: ${task.sourceInsight}

Mark Complete: ${this.appUrl}/api/tasks/${task.id}/complete
View Details: ${this.appUrl}/tasks/${task.id}
${'-'.repeat(40)}`;
  }

  /**
   * Send daily digest email
   */
  async sendDailyDigest(companyId: string, propertyId?: string): Promise<void> {
    if (!this.transporter) {
      logger.warn('Daily digest not sent - email not configured');
      return;
    }

    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const threeDaysFromNow = new Date(now.getTime() + 72 * 60 * 60 * 1000);

      // Get tasks data
      const activeTasks = await taskDatabase.getActiveTasks(companyId, propertyId);
      
      // Filter tasks
      const newTasks = activeTasks.filter(t => 
        new Date(t.created_at) >= yesterday
      );
      
      const completedTasks = await this.getCompletedTasksSince(companyId, propertyId, yesterday);
      
      const upcomingTasks = activeTasks.filter(t => 
        new Date(t.due_date) <= threeDaysFromNow && 
        new Date(t.due_date) >= now &&
        t.status !== 'completed'
      );

      const overdueTasks = activeTasks.filter(t => 
        new Date(t.due_date) < now && 
        t.status !== 'completed'
      );

      // Get ROI data
      const roiData = await taskDatabase.getROIDashboard(companyId, propertyId);

      // Send digest to all configured roles
      const allRecipients = new Set<string>();
      Object.values(this.roleEmails).forEach(emails => 
        emails.forEach(email => allRecipients.add(email))
      );

      const { html, text } = await this.generateDailyDigestEmail(
        newTasks,
        completedTasks,
        upcomingTasks,
        overdueTasks,
        roiData
      );

      const mailOptions = {
        from: `Prism Intelligence <${this.fromAddress}>`,
        to: Array.from(allRecipients).join(', '),
        subject: `📊 Daily Intelligence Digest - ${overdueTasks.length > 0 ? `${overdueTasks.length} OVERDUE` : new Date().toLocaleDateString()}`,
        html,
        text
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Daily digest sent to ${allRecipients.size} recipients - MessageId: ${info.messageId}`);
    } catch (error) {
      logger.error('Failed to send daily digest:', error);
    }
  }

  /**
   * Get completed tasks since a specific date
   */
  private async getCompletedTasksSince(
    companyId: string,
    propertyId: string | undefined,
    since: Date
  ): Promise<any[]> {
    // This would query completed tasks from the database
    // For now, returning empty array as placeholder
    return [];
  }

  /**
   * Generate daily digest email content
   */
  private async generateDailyDigestEmail(
    newTasks: any[],
    completedTasks: any[],
    upcomingTasks: any[],
    overdueTasks: any[],
    roiData: any
  ): Promise<{ html: string; text: string }> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #1f2937; 
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .wrapper { 
      background-color: #f3f4f6;
      padding: 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    }
    .header { 
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); 
      color: white; 
      padding: 40px 24px; 
      text-align: center;
    }
    .metric-grid { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 16px; 
      margin: 24px 0; 
    }
    .metric-card { 
      background: #fafafa; 
      border: 1px solid #e5e7eb; 
      border-radius: 8px; 
      padding: 20px; 
      text-align: center; 
    }
    .metric-value { 
      font-size: 28px; 
      font-weight: 700; 
      color: #6366f1; 
      margin: 0;
    }
    .metric-label { 
      font-size: 13px; 
      color: #6b7280; 
      margin-top: 4px; 
    }
    .section {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .section:last-child {
      border-bottom: none;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .task-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .task-item {
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .task-item:last-child {
      border-bottom: none;
    }
    .overdue {
      color: #ef4444;
    }
    .completed {
      color: #10b981;
    }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background: #6366f1; 
      color: white; 
      text-decoration: none; 
      border-radius: 8px;
      font-weight: 500;
      margin: 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">Daily Intelligence Digest</h1>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">
          ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      <div class="section">
        <h2 class="section-title">📊 Performance Metrics</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <p class="metric-value">${roiData?.total_time_saved?.toFixed(1) || 0}h</p>
            <p class="metric-label">Time Saved</p>
          </div>
          <div class="metric-card">
            <p class="metric-value">$${((roiData?.total_value_realized || 0) / 1000).toFixed(0)}k</p>
            <p class="metric-label">Value Identified</p>
          </div>
          <div class="metric-card">
            <p class="metric-value">${newTasks.length}</p>
            <p class="metric-label">New Tasks (24h)</p>
          </div>
          <div class="metric-card">
            <p class="metric-value">${completedTasks.length}</p>
            <p class="metric-label">Completed (24h)</p>
          </div>
        </div>
      </div>

      ${overdueTasks.length > 0 ? `
      <div class="section">
        <h3 class="section-title overdue">🚨 Overdue Tasks (${overdueTasks.length})</h3>
        <ul class="task-list">
          ${overdueTasks.slice(0, 5).map(task => `
            <li class="task-item">
              <strong>${task.title}</strong><br>
              <span style="font-size: 14px; color: #6b7280;">
                ${task.assigned_role} • Due ${new Date(task.due_date).toLocaleDateString()} • $${(task.potential_value || 0).toLocaleString()}
              </span>
            </li>
          `).join('')}
        </ul>
        ${overdueTasks.length > 5 ? `<p style="text-align: center; color: #6b7280;">...and ${overdueTasks.length - 5} more</p>` : ''}
      </div>
      ` : ''}

      ${upcomingTasks.length > 0 ? `
      <div class="section">
        <h3 class="section-title">📅 Due Within 72 Hours (${upcomingTasks.length})</h3>
        <ul class="task-list">
          ${upcomingTasks.slice(0, 5).map(task => `
            <li class="task-item">
              <strong>${task.title}</strong><br>
              <span style="font-size: 14px; color: #6b7280;">
                ${task.assigned_role} • Due ${new Date(task.due_date).toLocaleDateString()} • ${task.estimated_hours}h
              </span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      ${completedTasks.length > 0 ? `
      <div class="section">
        <h3 class="section-title completed">✅ Completed Today (${completedTasks.length})</h3>
        <ul class="task-list">
          ${completedTasks.slice(0, 3).map(task => `
            <li class="task-item">
              <strong>${task.title}</strong><br>
              <span style="font-size: 14px; color: #6b7280;">
                Value realized: $${(task.actual_value || task.potential_value || 0).toLocaleString()}
              </span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <div style="text-align: center; padding: 32px;">
        <a href="${this.appUrl}/dashboard" class="button">View Full Dashboard</a>
        <a href="${this.appUrl}/tasks" class="button" style="background: #6b7280;">Manage Tasks</a>
      </div>
    </div>
  </div>
</body>
</html>`;

    const text = `
DAILY INTELLIGENCE DIGEST
${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

PERFORMANCE METRICS
- Time Saved: ${roiData?.total_time_saved?.toFixed(1) || 0} hours
- Value Identified: $${((roiData?.total_value_realized || 0) / 1000).toFixed(0)}k
- New Tasks (24h): ${newTasks.length}
- Completed (24h): ${completedTasks.length}

${overdueTasks.length > 0 ? `
OVERDUE TASKS (${overdueTasks.length})
${'='.repeat(40)}
${overdueTasks.slice(0, 5).map(task => 
  `- ${task.title}\n  ${task.assigned_role} • Due ${new Date(task.due_date).toLocaleDateString()} • $${(task.potential_value || 0).toLocaleString()}`
).join('\n')}
${overdueTasks.length > 5 ? `\n...and ${overdueTasks.length - 5} more` : ''}
` : ''}

${upcomingTasks.length > 0 ? `
DUE WITHIN 72 HOURS (${upcomingTasks.length})
${'='.repeat(40)}
${upcomingTasks.slice(0, 5).map(task => 
  `- ${task.title}\n  ${task.assigned_role} • Due ${new Date(task.due_date).toLocaleDateString()}`
).join('\n')}
` : ''}

View Full Dashboard: ${this.appUrl}/dashboard
Manage Tasks: ${this.appUrl}/tasks
`;

    return { html, text };
  }

  /**
   * Group tasks by assigned role
   */
  private groupTasksByRole(tasks: TaskNotification[]): Record<string, TaskNotification[]> {
    return tasks.reduce((groups, task) => {
      const role = task.assignedRole || 'Other';
      if (!groups[role]) groups[role] = [];
      groups[role].push(task);
      return groups;
    }, {} as Record<string, TaskNotification[]>);
  }

  /**
   * Helper method to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const notificationService = new NotificationService();