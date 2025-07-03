/**
 * Authentication Routes
 * User registration, login, logout, and profile management
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authenticateToken,
  authRateLimit,
  AuthenticatedRequest 
} from '../middleware/auth';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  role?: 'admin' | 'manager' | 'viewer';
}

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * POST /auth/register
 * User registration with company creation
 */
router.post('/register', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      companyName, 
      role = 'admin' 
    }: RegisterRequest = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !companyName) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        required: ['email', 'password', 'firstName', 'lastName', 'companyName']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
        code: 'WEAK_PASSWORD'
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create company first
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        domain: email.split('@')[1], // Extract domain from email
        settings: {
          created_by: email,
          subscription_tier: 'trial'
        }
      })
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      return res.status(500).json({
        error: 'Failed to create company',
        code: 'COMPANY_CREATION_FAILED'
      });
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
        email_verified: false // Will be verified later
      })
      .select('id, email, first_name, last_name, company_id, role')
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      // Cleanup: delete company if user creation failed
      await supabase.from('companies').delete().eq('id', company.id);
      
      return res.status(500).json({
        error: 'Failed to create user',
        code: 'USER_CREATION_FAILED'
      });
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
        user_agent: req.headers['user-agent'],
        ip_address: req.ip
      });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

/**
 * POST /auth/login
 * User login with JWT token generation
 */
router.post('/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe = false }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Get user with password hash
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, company_id, role, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
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
        user_agent: req.headers['user-agent'],
        ip_address: req.ip
      });

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date() })
      .eq('id', user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

/**
 * POST /auth/logout
 * Invalidate refresh token and logout user
 */
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token && req.user) {
      // Invalidate all sessions for this user
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', req.user.id);
    }

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Check if refresh token exists in database
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('refresh_token', refreshToken)
      .single();

    if (error || !session) {
      return res.status(401).json({
        error: 'Refresh token not found',
        code: 'REFRESH_TOKEN_NOT_FOUND'
      });
    }

    // Check if token is expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('refresh_token', refreshToken);

      return res.status(401).json({
        error: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, company_id, role, is_active')
      .eq('id', session.user_id)
      .single();

    if (userError || !user || !user.is_active) {
      return res.status(401).json({
        error: 'User not found or inactive',
        code: 'USER_INACTIVE'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(user);

    res.json({
      accessToken: newAccessToken,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      code: 'REFRESH_ERROR'
    });
  }
});

/**
 * POST /auth/forgot-password
 * Initiate password reset process
 */
router.post('/forgot-password', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
        code: 'MISSING_EMAIL'
      });
    }

    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt,
        used: false
      });

    // TODO: Send email with reset link
    // For now, we'll just log it (in production, integrate with email service)
    console.log(`Password reset link for ${email}: /reset-password?token=${resetToken}`);

    res.json({
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Password reset request failed',
      code: 'FORGOT_PASSWORD_ERROR'
    });
  }
});

/**
 * POST /auth/reset-password
 * Reset password using reset token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password required',
        code: 'MISSING_FIELDS'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
        code: 'WEAK_PASSWORD'
      });
    }

    // Verify reset token
    const { data: resetToken, error } = await supabase
      .from('password_reset_tokens')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .single();

    if (error || !resetToken) {
      return res.status(400).json({
        error: 'Invalid reset token',
        code: 'INVALID_RESET_TOKEN'
      });
    }

    if (resetToken.used) {
      return res.status(400).json({
        error: 'Reset token already used',
        code: 'TOKEN_ALREADY_USED'
      });
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({
        error: 'Reset token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', resetToken.user_id);

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    // Invalidate all sessions for this user
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', resetToken.user_id);

    res.json({
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      code: 'RESET_PASSWORD_ERROR'
    });
  }
});

/**
 * GET /auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Get full user details including company info
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        is_active,
        email_verified,
        last_login,
        created_at,
        companies (
          id,
          name,
          domain,
          settings
        )
      `)
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        company: user.companies
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      code: 'PROFILE_ERROR'
    });
  }
});

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        error: 'First name and last name required',
        code: 'MISSING_FIELDS'
      });
    }

    // Update user profile
    const { data: user, error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date()
      })
      .eq('id', req.user.id)
      .select('id, email, first_name, last_name, role')
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        error: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      code: 'PROFILE_ERROR'
    });
  }
});

export default router;
