import { NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export interface DataFileInfo {
  fileName: string;
  displayName: string;
  startDate: string;
  endDate: string;
  filePath: string;
  uploadedAt?: string;
  isBlob?: boolean;
}

function parseAirbridgeFileName(fileName: string): { startDate: string; endDate: string; displayName: string } | null {
  // Pattern: bunkerdefense_YYYY-MM-DD_HH_mm_ss+00_00-YYYY-MM-DD_HH_mm_ss+00_00_email_timestamp_uuid.csv
  const pattern = /^([^_]+)_(\d{4}-\d{2}-\d{2})_\d{2}_\d{2}_\d{2}\+\d{2}_\d{2}-(\d{4}-\d{2}-\d{2})_\d{2}_\d{2}_\d{2}\+\d{2}_\d{2}_.*\.csv$/;
  const match = fileName.match(pattern);

  if (!match) {
    return null;
  }

  const [, , startDate, endDate] = match;

  return {
    startDate,
    endDate,
    displayName: `${startDate} ~ ${endDate}`
  };
}

// Check if we're running on Vercel (production/preview) or locally
function isVercelEnvironment(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// Get files from local filesystem (for development)
async function getLocalFiles(): Promise<DataFileInfo[]> {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    
    if (!fs.existsSync(dataDir)) {
      return [];
    }

    const files = fs.readdirSync(dataDir);
    const csvFiles = files.filter(file => file.endsWith('.csv'));

    return csvFiles.map(file => {
      const airbridgeInfo = parseAirbridgeFileName(file);
      const filePath = path.join(dataDir, file);
      const fileStat = fs.statSync(filePath);
      const uploadDate = fileStat.birthtime.toISOString().split('T')[0];
      
      if (airbridgeInfo) {
        return {
          fileName: file,
          displayName: airbridgeInfo.displayName,
          startDate: airbridgeInfo.startDate,
          endDate: airbridgeInfo.endDate,
          filePath: `/data/${file}`,
          isBlob: false
        };
      }
      
      const baseName = file.replace('.csv', '');
      return {
        fileName: file,
        displayName: `${baseName} (업로드: ${uploadDate})`,
        startDate: uploadDate,
        endDate: uploadDate,
        filePath: `/data/${file}`,
        uploadedAt: fileStat.birthtime.toISOString(),
        isBlob: false
      };
    });
  } catch (error) {
    console.error('Error reading local files:', error);
    return [];
  }
}

// Get files from Vercel Blob
async function getBlobFiles(): Promise<DataFileInfo[]> {
  try {
    const { blobs } = await list({ prefix: 'game-data/' });
    
    return blobs.map(blob => {
      const fileName = blob.pathname.replace('game-data/', '');
      const airbridgeInfo = parseAirbridgeFileName(fileName);
      const uploadDate = blob.uploadedAt.toISOString().split('T')[0];
      
      if (airbridgeInfo) {
        return {
          fileName,
          displayName: airbridgeInfo.displayName,
          startDate: airbridgeInfo.startDate,
          endDate: airbridgeInfo.endDate,
          filePath: blob.url,
          uploadedAt: blob.uploadedAt.toISOString(),
          isBlob: true
        };
      }
      
      const baseName = fileName.replace('.csv', '');
      return {
        fileName,
        displayName: `${baseName} (업로드: ${uploadDate})`,
        startDate: uploadDate,
        endDate: uploadDate,
        filePath: blob.url,
        uploadedAt: blob.uploadedAt.toISOString(),
        isBlob: true
      };
    });
  } catch (error) {
    console.error('Error reading blob files:', error);
    return [];
  }
}

export async function GET() {
  try {
    let files: DataFileInfo[] = [];
    
    if (isVercelEnvironment()) {
      // On Vercel: get files from Blob storage
      files = await getBlobFiles();
    } else {
      // Local development: get files from filesystem
      files = await getLocalFiles();
    }

    // Sort by date descending (newest first)
    files.sort((a, b) => b.startDate.localeCompare(a.startDate));

    return NextResponse.json({ files, isBlob: isVercelEnvironment() });
  } catch (error) {
    console.error('Error reading data files:', error);
    return NextResponse.json({ error: 'Failed to read data files' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
    }

    // Sanitize filename
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (isVercelEnvironment()) {
      // Upload to Vercel Blob
      const blob = await put(`game-data/${sanitizedFileName}`, file, {
        access: 'public',
        addRandomSuffix: true, // Prevents overwriting
      });

      return NextResponse.json({ 
        success: true, 
        fileName: sanitizedFileName,
        filePath: blob.url,
        isBlob: true,
        message: '파일이 성공적으로 업로드되었습니다'
      });
    } else {
      // Local development: save to filesystem
      const dataDir = path.join(process.cwd(), 'public', 'data');
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      let filePath = path.join(dataDir, sanitizedFileName);
      let finalFileName = sanitizedFileName;
      
      // Check if file already exists
      if (fs.existsSync(filePath)) {
        const timestamp = Date.now();
        const parts = sanitizedFileName.split('.');
        finalFileName = `${parts.slice(0, -1).join('.')}_${timestamp}.${parts[parts.length - 1]}`;
        filePath = path.join(dataDir, finalFileName);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({ 
        success: true, 
        fileName: finalFileName,
        filePath: `/data/${finalFileName}`,
        isBlob: false,
        message: '파일이 성공적으로 업로드되었습니다'
      });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const blobUrl = searchParams.get('blobUrl');

    if (!fileName && !blobUrl) {
      return NextResponse.json({ error: 'No file identifier provided' }, { status: 400 });
    }

    if (isVercelEnvironment() && blobUrl) {
      // Delete from Vercel Blob
      await del(blobUrl);
      
      return NextResponse.json({ 
        success: true, 
        message: '파일이 성공적으로 삭제되었습니다'
      });
    } else if (fileName) {
      // Local development: delete from filesystem
      const sanitizedFileName = path.basename(fileName);
      const dataDir = path.join(process.cwd(), 'public', 'data');
      const filePath = path.join(dataDir, sanitizedFileName);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      fs.unlinkSync(filePath);

      return NextResponse.json({ 
        success: true, 
        message: '파일이 성공적으로 삭제되었습니다'
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
