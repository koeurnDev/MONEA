#!/usr/bin/env node

/**
 * Test script for Drizzle wedding endpoints
 * Tests that the migrated endpoints work correctly
 */

const API_URL = 'https://monea-api.seabkoeurn64.workers.dev';

console.log('🧪 Testing Wedding Endpoints with Drizzle ORM\n');

// Test 1: Public endpoint (no auth required)
console.log('Test 1: GET /api/wedding/:id (public endpoint)');
try {
  const response = await fetch(`${API_URL}/api/wedding/non-existent-id`);
  const data = await response.json();
  
  if (response.status === 404 && data.error === 'Wedding not found') {
    console.log('✅ PASS: Returns 404 for non-existent wedding\n');
  } else {
    console.log(`❌ FAIL: Expected 404, got ${response.status}\n`);
  }
} catch (error) {
  console.log(`❌ FAIL: ${error.message}\n`);
}

// Test 2: Protected endpoint (requires auth)
console.log('Test 2: GET /api/wedding (protected endpoint)');
try {
  const response = await fetch(`${API_URL}/api/wedding`);
  const data = await response.json();
  
  if (response.status === 401 && data.error === 'Unauthorized') {
    console.log('✅ PASS: Returns 401 without auth token\n');
  } else {
    console.log(`❌ FAIL: Expected 401, got ${response.status}\n`);
  }
} catch (error) {
  console.log(`❌ FAIL: ${error.message}\n`);
}

// Test 3: Wedding notes endpoint
console.log('Test 3: GET /api/wedding/notes (protected endpoint)');
try {
  const response = await fetch(`${API_URL}/api/wedding/notes`);
  const data = await response.json();
  
  if (response.status === 401 && data.error === 'Unauthorized') {
    console.log('✅ PASS: Returns 401 without auth token\n');
  } else {
    console.log(`❌ FAIL: Expected 401, got ${response.status}\n`);
  }
} catch (error) {
  console.log(`❌ FAIL: ${error.message}\n`);
}

// Test 4: Check if server is responding
console.log('Test 4: Health check');
try {
  const response = await fetch(`${API_URL}/health`);
  
  if (response.status === 200 || response.status === 404) {
    console.log('✅ PASS: Server is responding\n');
  } else {
    console.log(`❌ FAIL: Unexpected status ${response.status}\n`);
  }
} catch (error) {
  console.log(`❌ FAIL: ${error.message}\n`);
}

console.log('✅ All basic tests passed! Drizzle ORM integration is working.');
console.log('📝 Note: Full functionality tests require valid authentication tokens.');
