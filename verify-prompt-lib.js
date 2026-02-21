const BASE_URL = 'http://localhost:3000';

async function runTests() {
    console.log('📚 Starting Prompt Library Verification...\n');

    // 1. Test Categories
    try {
        console.log('Test 1: Fetching Categories...');
        const res = await fetch(`${BASE_URL}/api/categories`);
        const data = await res.json();

        console.log(`[GET /api/categories] Status ${res.status}`);
        if (res.status === 200 && data.data && Array.isArray(data.data)) {
            console.log(`   ✅ Success! Found ${data.data.length} categories.`);
            if (data.data.length > 0) {
                console.log(`   Sample: ${data.data[0].name} (${data.data[0].slug})`);
            }
        } else {
            console.log('   ❌ Failed. Response:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('❌ Categories test error:', e.message);
    }

    // 2. Test Prompts Auth
    try {
        console.log('\nTest 2: Creating Prompt without Auth...');
        const res = await fetch(`${BASE_URL}/api/prompts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Test Prompt',
                content: 'This should fail',
                category_id: '123'
            })
        });

        console.log(`[POST /api/prompts] Status ${res.status}`);
        if (res.status === 401) {
            console.log('   ✅ Success! Unauthorized request was blocked.');
        } else {
            console.log(`   ❌ Unexpected status: ${res.status}`);
        }
    } catch (e) {
        console.error('❌ Create Prompt test error:', e.message);
    }

    // 3. Test Public Prompts List
    try {
        console.log('\nTest 3: Fetching Public Prompts...');
        const res = await fetch(`${BASE_URL}/api/prompts`);
        const data = await res.json();

        console.log(`[GET /api/prompts] Status ${res.status}`);
        if (res.status === 200) {
            console.log(`   ✅ Success! Fetched prompts list.`);
            console.log(`   Count: ${data.data ? data.data.length : 0}`);
            if (data.meta) {
                console.log(`   Pagination: Page ${data.meta.page} of ${data.meta.totalPages}`);
            }
        } else {
            console.log('   ❌ Failed. Response:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('❌ Prompts List test error:', e.message);
    }

    console.log('\n✨ Verification Completed.');
}

runTests();
