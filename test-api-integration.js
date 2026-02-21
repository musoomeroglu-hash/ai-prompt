const BASE_URL = 'http://localhost:3000';

async function runTests() {
    console.log('🚀 Starting API Integration Tests...\n');

    // 1. Health Check (Home Page)
    try {
        const res = await fetch(`${BASE_URL}/`);
        console.log(`[GET /] Status: ${res.status} ${res.status === 200 ? '✅' : '❌'}`);
    } catch (e) {
        console.error('❌ Connection failed:', e.message);
        process.exit(1);
    }

    // 2. Test Generate API (Invalid Input - Should Fail with 400)
    try {
        const res = await fetch(`${BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Missing required fields
                category: ''
            })
        });
        const data = await res.json();
        console.log(`[POST /api/generate] Invalid Input Test: Status ${res.status}`);
        if (res.status === 400 && data.error === 'Invalid input') {
            console.log('   ✅ Validation intercepted invalid request');
        } else {
            console.log('   ❌ Validation failed or unexpected response:', data);
        }
    } catch (e) {
        console.error('❌ Generate API test failed:', e.message);
    }

    // 3. Test Generate API (Valid Input - Dev Mode Bypass)
    try {
        const res = await fetch(`${BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userRequest: 'Test prompt for integration test',
                category: 'Testing',
                targetModel: 'chatgpt'
            })
        });
        const data = await res.json();
        console.log(`[POST /api/generate] Valid Input (Dev Mode): Status ${res.status}`);

        if (res.status === 200 && data.result) {
            console.log('   ✅ Mock user accepted & Response generated');
        } else if (res.status === 401) {
            console.log('   ⚠️ Unauthorized - Mock user logic might be strict about environment');
        } else {
            console.log('   ❌ Unexpected response:', data);
        }
    } catch (e) {
        console.error('❌ Generate API valid test failed:', e.message);
    }

    // 4. Test Subscription API (Invalid Plan - Should Fail)
    try {
        const res = await fetch(`${BASE_URL}/api/subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                planType: 'invalid_plan_name',
                action: 'upgrade'
            })
        });
        const data = await res.json();
        console.log(`[POST /api/subscription] Invalid Plan Test: Status ${res.status}`);
        if (res.status === 400 || res.status === 401) {
            // 401 is also acceptable if it catches auth first
            console.log('   ✅ Invalid plan/Auth rejected');
        } else {
            console.log('   ❌ Invalid plan accepted or other error:', data);
        }
    } catch (e) {
        console.error('❌ Subscription API test failed:', e.message);
    }

    // 5. Test Prompt Categories (Should return seeded data)
    try {
        const res = await fetch(`${BASE_URL}/api/categories`);
        const data = await res.json();
        console.log(`[GET /api/categories] Status ${res.status}`);
        if (res.status === 200 && data.data && data.data.length > 0) {
            console.log(`   ✅ Fetched ${data.data.length} categories`);
        } else {
            console.log('   ❌ Failed to fetch categories:', data);
        }
    } catch (e) {
        console.error('❌ Categories API test failed:', e.message);
    }

    // 6. Test Create Prompt (Should fail 401 Unauthorized)
    try {
        const res = await fetch(`${BASE_URL}/api/prompts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Test Prompt',
                content: 'Content',
                category_id: '123'
            })
        });
        console.log(`[POST /api/prompts] Auth Check: Status ${res.status}`);
        if (res.status === 401) {
            console.log('   ✅ Unauthorized request correctly rejected');
        } else {
            console.log('   ❌ Request was not rejected as expected:', res.status);
        }
    } catch (e) {
        console.error('❌ Create Prompt API test failed:', e.message);
    }

    console.log('\n✨ Tests Completed.');
}

runTests();
