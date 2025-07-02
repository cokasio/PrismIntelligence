import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: uploadId } = await params;

    const { data: upload, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (error || !upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    let progress = 0;
    let stage: 'uploading' | 'analyzing' | 'generating' | 'complete' | 'error' = 'uploading';

    switch (upload.status) {
      case 'uploaded':
        progress = 30;
        stage = 'uploading';
        break;
      case 'processing':
        progress = 60;
        stage = 'analyzing';
        break;
      case 'generating_tasks':
        progress = 85;
        stage = 'generating';
        break;
      case 'completed':
        progress = 100;
        stage = 'complete';
        break;
      case 'failed':
        progress = 0;
        stage = 'error';
        break;
    }

    return NextResponse.json({
      uploadId: upload.id,
      fileName: upload.original_filename,
      status: upload.status,
      progress,
      stage,
      error: upload.error_message,
    });

  } catch (error) {
    console.error('Upload status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
