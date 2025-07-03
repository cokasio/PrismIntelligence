/**
 * Test script for Task API endpoints
 * Run with: node test-tasks-api.js
 */

const BASE_URL = 'http://localhost:3000/api/tasks';

// Test data
const testTaskId = 'test-task-id'; // Replace with actual task ID from your database

async function testTasksAPI() {
  console.log('🧪 Testing Task API Endpoints\n');
  console.log('=' .repeat(60));

  // Test 1: Get all tasks
  console.log('\n📋 Test 1: GET /api/tasks');
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Total tasks:', data.total);
    console.log('✅ Current page:', data.page);
    console.log('✅ Total pages:', data.totalPages);
    console.log('✅ First task:', data.tasks[0]?.title || 'No tasks');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: Get tasks with filters
  console.log('\n📋 Test 2: GET /api/tasks with filters');
  try {
    const params = new URLSearchParams({
      status: 'pending',
      assignedRole: 'PropertyManager',
      sortBy: 'priority',
      sortOrder: 'desc',
      limit: '10'
    });
    
    const response = await fetch(`${BASE_URL}?${params}`);
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Filtered tasks:', data.tasks.length);
    console.log('✅ Applied filters:', JSON.stringify(data.filters, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: Get single task (need valid task ID)
  if (testTaskId !== 'test-task-id') {
    console.log(`\n📋 Test 3: GET /api/tasks/${testTaskId}`);
    try {
      const response = await fetch(`${BASE_URL}/${testTaskId}`);
      const data = await response.json();
      
      console.log('✅ Status:', response.status);
      console.log('✅ Task title:', data.title);
      console.log('✅ Status:', data.status);
      console.log('✅ Due date:', data.due_date);
      console.log('✅ Is overdue:', data.is_overdue);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  // Test 4: Update task (need valid task ID)
  if (testTaskId !== 'test-task-id') {
    console.log(`\n📋 Test 4: PATCH /api/tasks/${testTaskId}`);
    try {
      const response = await fetch(`${BASE_URL}/${testTaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'in_progress',
          notes: 'Started working on this task'
        })
      });
      const data = await response.json();
      
      console.log('✅ Status:', response.status);
      console.log('✅ Updated status:', data.status);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  // Test 5: Complete task (need valid task ID)
  if (testTaskId !== 'test-task-id') {
    console.log(`\n📋 Test 5: POST /api/tasks/${testTaskId}/complete`);
    try {
      const response = await fetch(`${BASE_URL}/${testTaskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completion_notes: 'Task completed successfully with all requirements met',
          actual_hours: 2.5,
          actual_value: 5000,
          success_rating: 5
        })
      });
      const data = await response.json();
      
      console.log('✅ Status:', response.status);
      console.log('✅ Message:', data.message);
      console.log('✅ Outcome created:', data.outcome?.id ? 'Yes' : 'No');
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ API endpoint tests complete!');
  console.log('\nNext steps:');
  console.log('1. Replace testTaskId with an actual task ID from your database');
  console.log('2. Make sure the Next.js dev server is running (npm run dev)');
  console.log('3. Check the server logs for any errors');
}

// Run the tests
testTasksAPI().catch(console.error);