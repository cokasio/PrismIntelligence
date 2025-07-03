/**
 * Authentication Middleware
 * JWT token validation and user session management
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    company_id: string;
    role: 'admin' | 'manager' | 'viewer';
  };
}

interface JWTPayload {
  userId: string;
  email: string;
  companyId: string;
  role: 'admin' | 'manager' | 'viewer';
  iat: number;
  exp: number;
}

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'prism-intelligence-secret-key';

/**
 * Validate JWT token and attach user to request
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Fetch user from database to ensure still active
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, company_id, role, is_active')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token - user not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      company_id: user.company_id,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Role-based access control middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }

    next();
  };
};

/**
 * Rate limiting for authentication endpoints
 */
export const authRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Simple rate limiting - can be enhanced with Redis
  const key = `auth_${req.ip}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  // This is a simple in-memory implementation
  // In production, use Redis for distributed rate limiting
  const attempts = (global as any).authAttempts || {};
  
  if (!attempts[key]) {
    attempts[key] = [];
  }

  // Clean old attempts
  attempts[key] = attempts[key].filter((timestamp: number) => 
    now - timestamp < windowMs
  );

  if (attempts[key].length >= maxAttempts) {
    return res.status(429).json({
      error: 'Too many authentication attempts',
      code: 'RATE_LIMITED',
      retry_after: Math.ceil((attempts[key][0] + windowMs - now) / 1000)
    });
  }

  attempts[key].push(now);
  (global as any).authAttempts = attempts;

  next();
};

/**
 * Generate JWT token for user
 */
export const generateToken = (user: {
  id: string;
  email: string;
  company_id: string;
  role: string;
}): string => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    companyId: user.company_id,
    role: user.role as 'admin' | 'manager' | 'viewer'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'prism-intelligence'
  });
};

/**
 * Generate refresh token (longer expiry)
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d', issuer: 'prism-intelligence' }
  );
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'refresh') {
      return null;
    }
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
};

export type { AuthenticatedRequest };
