import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Save to incoming folder for processing
    const incomingPath = path.join(process.cwd(), '..', '..', 'incoming')
    const fileName = `${Date.now()}-${file.name}`
    const filePath = path.join(incomingPath, fileName)
    
    try {
      await fs.writeFile(filePath, buffer)
      console.log(`File saved to: ${filePath}`)
    } catch (error) {
      console.error('Error saving file:', error)
    }

    // Simulate AI processing (in production, this would trigger your actual backend)
    // Your attachment-loop service will pick up the file and process it
    
    // Return demo response for now
    return NextResponse.json({
      status: 'processing',
      insights: [
        'Rent roll analysis shows 95% occupancy rate',
        'Operating expenses trending 12% above budget',
        'Maintenance requests decreased by 30% this quarter',
        'Three lease renewals pending for next month'
      ],
      tasks: [
        {
          title: 'Review budget variance for utilities',
          priority: 'high',
          value: '$3,200 monthly overage'
        },
        {
          title: 'Schedule lease renewal meetings',
          priority: 'high',
          value: '3 units expiring'
        },
        {
          title: 'Negotiate maintenance contracts',
          priority: 'medium',
          value: 'Potential 15% savings'
        }
      ],
      metrics: {
        timeSaved: '3.2 hours',
        valueIdentified: '$24,500',
        tasksGenerated: 3
      }
    })
  } catch (error) {
    console.error('Error processing document:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}
