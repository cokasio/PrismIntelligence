/**
 * Authentication Service
 * Business logic for user authentication and management
 */

import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import { generateToken, generateRefreshToken } from '../middleware/auth';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'viewer';
  companyId: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  role?: 'admin' | 'manager' | 'viewer';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

/**
 * Authentication Service Class
 */
export class AuthService {
  
  /**
   * Register a new user and create their company
   */
  static async registerUser(userData: CreateUserRequest): Promise<AuthResult> {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      companyName, 
      role = 'admin' 
    } = userData;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // Create company first
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          domain: email.split('@')[1],
          settings: {
            created_by: email,
            subscription_tier: 'trial',
            features_enabled: ['document_analysis', 'ai_insights', 'basic_reporting']
          }
        })
        .select()
        .single();

      if (companyError) {
        throw new Error(`Failed to create company: ${companyError.message}`);
      }

      // Create user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          password_hash: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          company_id: company.id,
          role: role,
          is_active: true,
          email_verified: false
        })
        .select('id, email, first_name, last_name, company_id, role, is_active, email_verified, created_at')
        .single();

      if (userError) {
        // Cleanup: delete company if user creation failed
        await supabase.from('companies').delete().eq('id', company.id);
        throw new Error(`Failed to create user: ${userError.message}`);
      }

      // Generate tokens
      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token
      await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          refresh_token: refreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          created_at: new Date()
        });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          companyId: user.company_id,
          isActive: user.is_active,
          emailVerified: user.email_verified,
          createdAt: user.created_at
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '24h'
        }
      };

    } catch (error) {
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Authenticate user login
   */
  static async loginUser(email: string, password: string, rememberMe: boolean = false): Promise<AuthResult> {
    if (!email || !password) {
      throw new Error('Email and password required');
    }

    // Get user with password hash
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, company_id, role, is_active, email_verified, created_at')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('Account deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
        created_at: new Date()
      });

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date() })
      .eq('id', user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        company_id,
        is_active,
        email_verified,
        created_at,
        last_login
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      companyId: user.company_id,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string, 
    updates: { firstName?: string; lastName?: string; email?: string }
  ): Promise<User> {
    const { firstName, lastName, email } = updates;
    
    const updateData: any = {
      updated_at: new Date()
    };

    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
      updateData.email = email.toLowerCase();
      updateData.email_verified = false; // Reset verification if email changes
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, first_name, last_name, role, company_id, is_active, email_verified, created_at, last_login')
      .single();

    if (error || !user) {
      throw new Error('Failed to update profile');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      companyId: user.company_id,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Get current password hash
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date()
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update password');
    }

    // Invalidate all sessions for this user (force re-login)
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date()
      })
      .eq('id', userId);

    if (error) {
      throw new Error('Failed to deactivate user');
    }

    // Invalidate all sessions
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);
  }

  /**
   * Verify email address
   */
  static async verifyEmail(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        email_verified: true,
        updated_at: new Date()
      })
      .eq('id', userId);

    if (error) {
      throw new Error('Failed to verify email');
    }
  }
}

export { AuthService };
