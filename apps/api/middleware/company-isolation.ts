/**
 * Company Isolation Middleware
 * Ensures multi-tenant data isolation by filtering all queries by company_id
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

/**
 * Middleware to add company_id filter to database queries
 * This ensures data isolation between companies
 */
export const enforceCompanyIsolation = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required for data access',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  // Add company_id to request context
  req.companyId = req.user.company_id;
  
  // Add helper methods to request for filtered queries
  req.supabaseFilter = (query: any) => {
    return query.eq('company_id', req.user!.company_id);
  };

  next();
};

/**
 * Validate that user belongs to the requested company
 */
export const validateCompanyAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;

  if (requestedCompanyId && requestedCompanyId !== req.user?.company_id) {
    return res.status(403).json({
      error: 'Access denied to this company data',
      code: 'COMPANY_ACCESS_DENIED',
      user_company: req.user?.company_id,
      requested_company: requestedCompanyId
    });
  }

  next();
};

/**
 * Helper function to add company_id to database inserts
 */
export const addCompanyId = (data: any, companyId: string) => {
  if (Array.isArray(data)) {
    return data.map(item => ({ ...item, company_id: companyId }));
  }
  return { ...data, company_id: companyId };
};

/**
 * Middleware to automatically add company_id to request body for POST/PUT requests
 */
export const injectCompanyId = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  // Add company_id to request body for mutations
  if (req.method === 'POST' || req.method === 'PUT') {
    if (req.body && typeof req.body === 'object') {
      req.body = addCompanyId(req.body, req.user.company_id);
    }
  }

  next();
};

/**
 * Company isolation validator for specific resources
 */
export const validateResourceAccess = (resourceType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const resourceId = req.params.id;
    if (!resourceId) {
      return next(); // Let the route handler validate the resource
    }

    try {
      // This would need to be connected to your database client
      // For now, we'll trust the authentication middleware
      // In a full implementation, you'd query the specific resource
      // to ensure it belongs to the user's company
      
      next();
    } catch (error) {
      res.status(500).json({
        error: 'Failed to validate resource access',
        code: 'RESOURCE_VALIDATION_ERROR'
      });
    }
  };
};

// Extend the AuthenticatedRequest interface
declare module './auth' {
  interface AuthenticatedRequest {
    companyId?: string;
    supabaseFilter?: (query: any) => any;
  }
}

export default {
  enforceCompanyIsolation,
  validateCompanyAccess,
  addCompanyId,
  injectCompanyId,
  validateResourceAccess
};
