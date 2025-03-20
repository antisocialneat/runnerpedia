import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles the POST request to process a Strava screenshot through OCR
 * 
 * @param {NextRequest} request - The incoming request with the image file
 * @returns {Promise<NextResponse>} The OCR processing result or error
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward the request to the OCR service
    const response = await fetch('https://runnerpedia-ocr.reaimagine.id/ocr', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`OCR service returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing OCR request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    );
  }
} 