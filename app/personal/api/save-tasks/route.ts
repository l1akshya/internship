import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const { csvData } = await request.json();
    
    if (!csvData) {
      return NextResponse.json(
        { error: 'No CSV data provided' },
        { status: 400 }
      );
    }

    // Define the path to save the CSV file
    const filePath = path.join(process.cwd(), 'public', 'tasks.csv');
    
    // Write the CSV data to the file
    fs.writeFileSync(filePath, csvData, 'utf8');
    
    return NextResponse.json(
      { success: true, message: 'Tasks saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving tasks:', error);
    return NextResponse.json(
      { error: 'Failed to save tasks' },
      { status: 500 }
    );
  }
}