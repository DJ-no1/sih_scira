#!/usr/bin/env node

// Simple test script to verify the search endpoint timeout handling
// Using built-in fetch (Node.js 18+)

async function testSearchEndpoint() {
  console.log('🧪 Testing search endpoint timeout handling...');

  const testPayload = {
    messages: [
      {
        id: 'test-message-1',
        role: 'user',
        parts: [
          {
            type: 'text',
            text: 'What is the weather like today?',
          },
        ],
      },
    ],
    model: 'scira-default',
    group: 'general',
    timezone: 'UTC',
    id: 'test-chat-' + Date.now(),
    selectedVisibilityType: 'private',
    isCustomInstructionsEnabled: false,
    searchProvider: 'tavily',
  };

  try {
    console.log('⏱️  Starting request at:', new Date().toISOString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('🚫 Client-side timeout after 30 seconds');
    }, 30000); // 30 second client timeout for testing

    const response = await fetch('http://localhost:3001/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.status === 408) {
      console.log('⚠️  Got 408 Request Timeout as expected - this confirms the timeout handling is working');
      return;
    }

    if (response.ok) {
      console.log('✅ Request successful');
      console.log('📝 Response type:', response.headers.get('content-type'));

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        console.log('🌊 Streaming response detected');

        // Read a few chunks to verify streaming works
        const reader = response.body.getReader();
        let chunkCount = 0;

        try {
          while (chunkCount < 3) {
            const { done, value } = await reader.read();
            if (done) break;

            chunkCount++;
            console.log(`📦 Chunk ${chunkCount}: ${value.length} bytes`);
          }
        } finally {
          reader.releaseLock();
        }
      }
    } else {
      console.log('❌ Request failed with status:', response.status);
      const text = await response.text();
      console.log('❌ Error response:', text);
    }
  } catch (error) {
    console.error('🔥 Test error:', error.message);

    if (error.name === 'AbortError') {
      console.log('⏱️  Request was aborted due to timeout');
    } else if (error.message.includes('timeout')) {
      console.log('⏱️  Request timed out');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Connection refused - make sure the server is running on port 3001');
    }
  }

  console.log('🏁 Test completed at:', new Date().toISOString());
}

// Run the test
testSearchEndpoint().catch(console.error);
