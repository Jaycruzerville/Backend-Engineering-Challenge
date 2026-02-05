const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Generate random caregiver data to avoid unique constraint errors on repeated runs
const randomStr = Math.random().toString(36).substring(7);
const CAREGIVER = {
  email: `test_${randomStr}@gmail.com`,
  password: 'password123',
  name: 'Test Caregiver',
};

const MEMBERS = [
  {
    firstName: 'Child',
    lastName: 'One',
    relationship: 'Child',
    birthYear: 2015,
  },
  {
    firstName: 'Senior',
    lastName: 'Two',
    relationship: 'Parent',
    birthYear: 1950,
  },
];

const run = async () => {
  try {
    console.log('--- STARTING SEED SCRIPT ---');

    // 1. Signup Caregiver
    console.log(`Step 1: Signing up caregiver ${CAREGIVER.email}...`);
    let authHeader;
    try {
        const signupRes = await axios.post(`${API_URL}/caregivers/signup`, CAREGIVER);
        console.log('Signup successful:', signupRes.data.message);
        
        // If session is returned (auto sign-in), use it. otherwise login
        if (signupRes.data.session) {
             authHeader = { Authorization: `Bearer ${signupRes.data.session.access_token}` };
        }
    } catch (err) {
        console.error('Signup failed:', err.response?.data || err.message);
        console.log('Proceeding to login attempt...');
    }

    if (!authHeader) {
        console.log('Step 2: Logging in...');
        try {
            const loginRes = await axios.post(`${API_URL}/caregivers/login`, { 
                email: CAREGIVER.email, 
                password: CAREGIVER.password 
            });
            console.log('Login successful');
            authHeader = { Authorization: `Bearer ${loginRes.data.session.access_token}` };
        } catch (err) {
            if (err.response?.data?.message === 'Invalid credentials') {
                 console.log('Login failed. HINT: If you just signed up, please confirm your email address and run this script again.');
            }
            throw err;
        }
    }

    // 2. Add Members Concurrently
    console.log('Step 3: Adding members concurrently...');
    
    // Create promises for adding members
    const memberPromises = MEMBERS.map(member => 
        axios.post(`${API_URL}/members`, member, { headers: authHeader })
            .then(res => console.log(`Added member: ${res.data.firstName}`))
            .catch(err => console.error(`Failed to add member ${member.firstName}:`, err.response?.data || err.message))
    );

    await Promise.all(memberPromises);
    
    console.log('--- FINISHED SEED SCRIPT ---');
    console.log('CHECK SERVER LOGS for "EVENT: member_added" output to verify requirement.');

  } catch (error) {
    console.error('Script Error:', error.response?.data || error.message);
  }
};

run();
