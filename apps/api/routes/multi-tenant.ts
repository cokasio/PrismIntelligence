// Express routes for multi-tenant system
import { Router } from 'express';
import { cloudMailinHandler } from '../handlers/CloudMailinHandler';
import { getServiceSupabase } from '../../lib/supabase';

const router = Router();
const supabase = getServiceSupabase();

// CloudMailin webhook endpoint
router.post('/webhook/cloudmailin', (req, res) => {
  cloudMailinHandler.handleWebhook(req, res);
});

// Health check for CloudMailin
router.get('/webhook/cloudmailin/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get investor's properties
router.get('/api/investors/:investorId/properties', async (req, res) => {
  try {
    const { investorId } = req.params;
    
    // TODO: Add auth check - user must have access to this investor
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('investor_id', investorId)
      .eq('status', 'active')
      .order('name');
    
    if (error) throw error;
    
    res.json({ properties: data });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get property's recent emails
router.get('/api/properties/:propertyId/emails', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // TODO: Add auth check
    
    const { data, error } = await supabase
      .from('email_messages')
      .select(`
        *,
        email_attachments (
          id,
          filename,
          file_size,
          attachment_type,
          is_processed
        )
      `)
      .eq('property_id', propertyId)
      .order('received_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (error) throw error;
    
    res.json({ emails: data });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get financial reports for a property
router.get('/api/properties/:propertyId/reports', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;
    
    // TODO: Add auth check
    
    let query = supabase
      .from('financial_data_raw')
      .select(`
        *,
        report_attachments (
          filename,
          report_type,
          classification_confidence
        )
      `)
      .eq('property_id', propertyId)
      .order('period_end', { ascending: false });
    
    if (startDate) {
      query = query.gte('period_start', startDate);
    }
    
    if (endDate) {
      query = query.lte('period_end', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ reports: data });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Create a new investor (admin only)
router.post('/api/investors', async (req, res) => {
  try {
    // TODO: Add admin auth check
    
    const { name, entity_type, primary_email, contact_first_name, contact_last_name } = req.body;
    
    const { data, error } = await supabase
      .from('investors')
      .insert({
        name,
        entity_type,
        primary_email,
        contact_first_name,
        contact_last_name,
        status: 'active',
        subscription_tier: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ investor: data });
  } catch (error) {
    console.error('Error creating investor:', error);
    res.status(500).json({ error: 'Failed to create investor' });
  }
});

// Add a property to an investor
router.post('/api/investors/:investorId/properties', async (req, res) => {
  try {
    const { investorId } = req.params;
    const { 
      name, 
      property_type, 
      address_line1, 
      city, 
      state,
      postal_code
    } = req.body;
    
    // TODO: Add auth check - user must be owner/admin
    
    // Generate CloudMailin address
    const cloudmailin_address = `${name.toLowerCase().replace(/\s+/g, '-')}@reports.cloudmailin.net`;
    
    const { data, error } = await supabase
      .from('properties')
      .insert({
        investor_id: investorId,
        name,
        property_type,
        address_line1,
        city,
        state,
        postal_code,
        cloudmailin_address,
        status: 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ property: data });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

export default router;