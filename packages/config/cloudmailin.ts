// CloudMailin Configuration for PrismIntelligence
// Add this to your config/index.ts

export const cloudmailin = {
  // Your CloudMailin webhook secret for verification
  webhookSecret: process.env.CLOUDMAILIN_SECRET || '',
  
  // Your CloudMailin address(es)
  addresses: {
    default: process.env.CLOUDMAILIN_ADDRESS || '',
    // Add more as you grow:
    // premium: process.env.CLOUDMAILIN_PREMIUM_ADDRESS,
  },
  
  // For multi-tenancy
  routing: {
    // How to extract tenant ID from email
    strategy: 'subdomain', // 'subdomain' | 'plus' | 'mapping'
    
    // For subdomain strategy: tenant@reports.domain.com
    subdomainFormat: /^([^@]+)@reports\./,
    
    // For plus strategy: reports+tenant@domain.com  
    plusFormat: /\+([^@]+)@/,
    
    // For direct mapping
    addressMapping: {
      // 'abc123@cloudmailin.net': 'tenant1',
      // 'xyz789@cloudmailin.net': 'tenant2',
    }
  },
  
  // Webhook response format
  responseFormat: 'json',
  
  // File size limits (CloudMailin supports up to 50MB)
  maxAttachmentSize: 25 * 1024 * 1024, // 25MB
  
  // Allowed file types
  allowedFileTypes: ['.pdf', '.xlsx', '.xls', '.csv'],
};

// For email sending (replace SendGrid)
export const smtp = {
  // Option 1: Use any SMTP service
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  
  // Default from address
  fromEmail: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
  fromName: process.env.FROM_NAME || 'Property Intelligence',
  
  // Email templates path
  templatesPath: path.join(__dirname, '../../templates/emails'),
};

// Quick check if email services are configured
export const emailEnabled = {
  receiving: !!cloudmailin.webhookSecret,
  sending: !!smtp.auth.user && !!smtp.auth.pass,
};
