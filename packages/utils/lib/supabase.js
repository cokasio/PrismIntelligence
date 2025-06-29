// supabase.js - Using your existing Supabase configuration
import { createClient } from '@supabase/supabase-js'

// Use your existing environment variables from .env
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations that need to bypass RLS
export const getServiceSupabase = () => {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_KEY is not set')
  }
  
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
}

// Property Intelligence specific functions
export async function createCompany(name, domain) {
  const { data, error } = await supabase
    .from('companies')
    .insert([{ name, domain }])
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function createProperty(companyId, propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .insert([{
      company_id: companyId,
      ...propertyData
    }])
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function createReport(companyId, propertyId, reportData) {
  const { data, error } = await supabase
    .from('reports')
    .insert([{
      company_id: companyId,
      property_id: propertyId,
      ...reportData
    }])
    .select()
    .single()
    
  if (error) throw error
  return data
}
export async function createInsight(companyId, reportId, propertyId, insightData) {
  const { data, error } = await supabase
    .from('insights')
    .insert([{
      company_id: companyId,
      report_id: reportId,
      property_id: propertyId,
      ...insightData
    }])
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function createActionItem(companyId, insightId, propertyId, actionData) {
  const { data, error } = await supabase
    .from('action_items')
    .insert([{
      company_id: companyId,
      insight_id: insightId,
      property_id: propertyId,
      ...actionData
    }])
    .select()
    .single()
    
  if (error) throw error
  return data
}

// Vector similarity search
export async function findSimilarReports(embedding, companyId, limit = 10) {
  const { data, error } = await supabase.rpc('find_similar_entities', {
    target_embedding: embedding,
    entity_table: 'reports',
    company_filter: companyId,
    similarity_threshold: 0.8,
    max_results: limit
  })
  
  if (error) throw error
  return data
}

// Get all properties for a company
export async function getCompanyProperties(companyId) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('company_id', companyId)
    .order('name')
    
  if (error) throw error
  return data
}

// Get recent reports for a property
export async function getPropertyReports(propertyId, limit = 10) {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      insights(count),
      action_items(count)
    `)
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })
    .limit(limit)
    
  if (error) throw error
  return data
}