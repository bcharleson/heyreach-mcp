
import axios from 'axios';

async function testApiKey() {
  console.log('Testing with correct HeyReach API endpoint and auth method...');

  try {
    // Test 1: Check API key validation endpoint (correct endpoint)
    console.log('Test 1: API Key validation...');
    const response1 = await axios.get('https://api.heyreach.io/api/public/auth/CheckApiKey', {
      headers: {
        'X-API-KEY': 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('✅ API Key validation works - Status:', response1.status);
    console.log('Response:', response1.data);
  } catch (error1) {
    console.log('❌ API Key validation failed');
    console.log('Status:', error1.response?.status);
    console.log('Message:', error1.response?.data?.message || error1.message);
  }

  try {
    // Test 2: Get campaigns endpoint (correct method and endpoint)
    console.log('\nTest 2: Get campaigns...');
    const response2 = await axios.post('https://api.heyreach.io/api/public/campaign/GetAll', {
      offset: 0,
      limit: 10
    }, {
      headers: {
        'X-API-KEY': 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('✅ Get campaigns works - Status:', response2.status);
    console.log('Campaigns found:', response2.data?.data?.length || 0);
    if (response2.data?.data?.length > 0) {
      console.log('First campaign:', response2.data.data[0]);
    }
  } catch (error2) {
    console.log('❌ Get campaigns failed');
    console.log('Status:', error2.response?.status);
    console.log('Message:', error2.response?.data?.message || error2.message);
  }
}

testApiKey();
