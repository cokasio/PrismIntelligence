import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// File size limits (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed` },
        { status: 400 }
      );
    }

    // Generate unique upload ID and file path
    const uploadId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `uploads/${uploadId}/${fileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadId: uploadId,
          size: file.size.toString(),
        }
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Create upload record in database
    const { data: uploadRecord, error: dbError } = await supabase
      .from('file_uploads')
      .insert({
        id: uploadId,
        original_filename: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        status: 'uploaded',
        upload_metadata: {
          timestamp: new Date().toISOString(),
          user_agent: request.headers.get('user-agent'),
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file
      await supabase.storage.from('documents').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to create upload record' },
        { status: 500 }
      );
    }

    // Trigger processing pipeline (if attachment-loop service is running)
    try {
      // This would normally trigger your attachment-loop service
      // For now, we'll just update the status to show it's queued for processing
      await supabase
        .from('file_uploads')
        .update({ 
          status: 'queued_for_processing',
          processing_started_at: new Date().toISOString()
        })
        .eq('id', uploadId);

      // In a real implementation, you might:
      // 1. Send a message to a queue (Redis/BullMQ)
      // 2. Call a webhook
      // 3. Trigger a serverless function
      // 4. Start a background job
      
      console.log(`File ${file.name} uploaded and queued for processing with ID: ${uploadId}`);
    } catch (processingError) {
      console.error('Failed to queue for processing:', processingError);
      // File is uploaded but processing failed - this is recoverable
    }

    // Return success response
    return NextResponse.json({
      uploadId: uploadId,
      fileName: file.name,
      fileSize: file.size,
      filePath: filePath,
      status: 'uploaded',
      message: 'File uploaded successfully and queued for processing',
      processingUrl: `/api/upload/${uploadId}/status`
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}

// GET endpoint to check upload limits and allowed types
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
    allowedTypes: ALLOWED_TYPES,
    allowedExtensions: ['.pdf', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg'],
  });
}
