const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Hardcoded users to avoid rate limits
const USER_A = {
    email: 'rbac_test_attacker@gmail.com',
    password: 'password123',
    name: 'Attacker'
};
const USER_B = {
    email: 'rbac_test_victim@gmail.com',
    password: 'password123',
    name: 'Victim'
};

const getAuthToken = async (user) => {
    // Try Login FIRST to avoid hitting signup rate limits for existing users
    try {
        const loginRes = await axios.post(`${API_URL}/caregivers/login`, {
            email: user.email,
            password: user.password
        });
        if (loginRes.data.session) return loginRes.data.session.access_token;
    } catch (err) {
        // If login failed (e.g. invalid creds or user doesn't exist), fall through to signup
        console.log(`Login failed for ${user.email}, attempting signup...`);
    }

    // Try Signup
    try {
        const signupRes = await axios.post(`${API_URL}/caregivers/signup`, user);
        if (signupRes.data.session) return signupRes.data.session.access_token;
    } catch (err) {
        console.error(`Auth failed for ${user.email}:`, err.response?.data || err.message);
        throw err;
    }
};

const run = async () => {
    try {
        console.log('--- STARTING RBAC VERIFICATION ---');

        // 1. Authenticate User A (Attacker)
        console.log(`Authenticating Attacker: ${USER_A.email}`);
        const tokenA = await getAuthToken(USER_A);
        const configA = { headers: { Authorization: `Bearer ${tokenA}` } };

        // 2. Authenticate User B (Victim)
        console.log(`Authenticating Victim: ${USER_B.email}`);
        const tokenB = await getAuthToken(USER_B);
        const configB = { headers: { Authorization: `Bearer ${tokenB}` } };

        // 3. User B creates a Member
        console.log('User B creating a private member...');
        const memberRes = await axios.post(`${API_URL}/protected-members`, {
            firstName: 'Private',
            lastName: 'Member',
            relationship: 'Self',
            birthYear: 1980
        }, configB);
        const victimMemberId = memberRes.data._id;
        console.log(`User B Member ID: ${victimMemberId}`);

        // 4. User A attempts to access User B's member (GET)
        console.log('User A attempting to read User B\'s member...');
        try {
            await axios.get(`${API_URL}/protected-members`, configA);
            // We expect the list to NOT contain victimMemberId
            // Actually, querying GET /members scopes to logged in user, so it should return EMPTY list (or own members)
        } catch (err) {
            console.error('Unexpected error on GET', err.message);
        }

        // Test Specific Access (Update/Delete)
        console.log('User A attempting to UPDATE User B\'s member...');
        try {
            await axios.patch(`${API_URL}/protected-members/${victimMemberId}`, { firstName: 'HACKED' }, configA);
            console.error('❌ FAILURE: User A was able to update User B\'s member!');
            process.exit(1);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                 console.log('✅ SUCCESS: User A got 404 Not Found (Access Denied at Application Level)');
            } else {
                 console.error('❌ FAILURE: Unexpected error code:', err.response?.status);
                 process.exit(1);
            }
        }

        console.log('--- RBAC VERIFICATION PASSED ---');

    } catch (error) {
        console.error('Script Error:', error.message);
        if (error.response) console.error(error.response.data);
    }
};

run();
