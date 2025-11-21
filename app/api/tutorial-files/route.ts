import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface DataFileInfo {
  fileName: string;
  displayName: string;
  startDate: string;
  endDate: string;
  filePath: string;
}

function parseAirbridgeFileName(fileName: string): DataFileInfo | null {
  // Pattern: bunkerdefense_YYYY-MM-DD_HH_mm_ss+00_00-YYYY-MM-DD_HH_mm_ss+00_00_email_timestamp_uuid.csv
  const pattern = /^([^_]+)_(\d{4}-\d{2}-\d{2})_\d{2}_\d{2}_\d{2}\+\d{2}_\d{2}-(\d{4}-\d{2}-\d{2})_\d{2}_\d{2}_\d{2}\+\d{2}_\d{2}_.*\.csv$/;
  const match = fileName.match(pattern);

  if (!match) {
    return null;
  }

  const [, projectName, startDate, endDate] = match;

  return {
    fileName,
    displayName: `${startDate} ~ ${endDate}`,
    startDate,
    endDate,
    filePath: `/tutorial/${fileName}`
  };
}

export async function GET() {
  try {
    const tutorialDir = path.join(process.cwd(), 'public', 'tutorial');

    // Check if directory exists
    if (!fs.existsSync(tutorialDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(tutorialDir);
    const csvFiles = files.filter(file => file.endsWith('.csv'));

    const parsedFiles: DataFileInfo[] = csvFiles
      .map(file => parseAirbridgeFileName(file))
      .filter((file): file is DataFileInfo => file !== null)
      .sort((a, b) => b.startDate.localeCompare(a.startDate)); // Sort by date descending (newest first)

    return NextResponse.json({ files: parsedFiles });
  } catch (error) {
    console.error('Error reading tutorial files:', error);
    return NextResponse.json({ error: 'Failed to read tutorial files' }, { status: 500 });
  }
}
