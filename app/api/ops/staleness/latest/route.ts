import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = path.join(process.cwd(), 'reports', 'ops', 'staleness-check-latest.json');

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'staleness report not found' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'failed to read staleness report' }, { status: 500 });
  }
}
