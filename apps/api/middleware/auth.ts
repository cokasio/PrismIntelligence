/**
 * Prism Intelligence - Authentication Middleware
 * JWT token validation, refresh logic, and role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logError, logInfo } from '../utils/logger';

// Extended Request interface with user data
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'manager' | 'viewer';
    companyId: string;
    name: string;
    preferences?: Record<string, any>;
  };
  company?: {
    id: string;
    name: string;
    settings?: Record<string, any>;
  };
}

// JWT payload interface
interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  companyId: string;
  name: string;
  iat?: number;
  exp?: number;
}

// Token blacklist (in production, use Redis)
const tokenBlacklist = new Set<string>();

// Rate limiting per endpoint
const rateLimitMap = new Map<string, { requests: number; resetTime: number }>();

/**
 * Validate JWT token and extract user information
 */
export function validateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authorization header with Bearer token required'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Check token blacklist
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        error: 'TOKEN_REVOKED',
        message: 'Token has been revoked'
      });
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logError('JWT_SECRET not configured');
      return res.status(500).json({
        error: 'SERVER_CONFIGURATION_ERROR',
        message: 'Authentication service not properly configured'
      });
    }
    
    // Verify and decode token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId,
      name: decoded.name
    };
    
    // Log successful authentication
    logInfo(`User authenticated: ${decoded.email} (${decoded.role})`);
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired, please refresh'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid token format'
      });
    }
    
    logError('Token validation error:', error);
    return res.status(401).json({
      error: 'AUTHENTICATION_FAILED',
      message: 'Token validation failed'
    });
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(allowedRoles: ('admin' | 'manager' | 'viewer')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res