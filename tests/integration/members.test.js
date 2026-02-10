const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Caregiver = require('../../src/models/Caregiver');
const Member = require('../../src/models/Member');

// Mock Supabase
jest.mock('../../src/config/supabase', () => ({
  auth: {
    getUser: jest.fn(),
  },
}));

const supabase = require('../../src/config/supabase');
const app = require('../../src/index');

describe('Member Endpoints (RBAC)', () => {
  let userA, userB;
  let tokenA = 'token-user-a';
  let tokenB = 'token-user-b';

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Seed Users in Mongo
    userA = await Caregiver.create({ 
        email: 'userA@test.com', 
        supabaseId: 'supa-id-A', 
        name: 'User A' 
    });
    
    userB = await Caregiver.create({ 
        email: 'userB@test.com', 
        supabaseId: 'supa-id-B', 
        name: 'User B' 
    });
  });

  const mockAuth = (token, user) => {
     supabase.auth.getUser.mockImplementation((t) => {
        if (t === token) {
            return Promise.resolve({ data: { user: { id: user.supabaseId, email: user.email } }, error: null });
        }
        return Promise.resolve({ data: { user: null }, error: { message: 'Invalid token' } });
     });
  };

  describe('POST /api/protected-members', () => {
    it('should create a member for the authenticated user', async () => {
      mockAuth(tokenA, userA);

      const res = await request(app)
        .post('/api/protected-members')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          firstName: 'Child',
          lastName: 'A',
          relationship: 'Child',
          birthYear: 2020
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.firstName).toBe('Child');
      expect(res.body.caregiverId).toEqual(userA._id.toString());
    });

    it('should return 400 for invalid data (Validation)', async () => {
      mockAuth(tokenA, userA);

      const res = await request(app)
        .post('/api/protected-members')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          firstName: '', // Invalid
          birthYear: 'invalid-year' // Invalid type
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Validation Error');
    });
  });

  describe('GET /api/protected-members (RBAC VERIFICATION)', () => {
    it('should ONLY return members belonging to the logged-in user', async () => {
      // Create data for both users
      await Member.create({ firstName: 'Member A', lastName: 'Fam', relationship: 'Child', birthYear: 2010, caregiverId: userA._id });
      await Member.create({ firstName: 'Member B', lastName: 'Fam', relationship: 'Child', birthYear: 2010, caregiverId: userB._id });

      mockAuth(tokenA, userA);

      const res = await request(app)
        .get('/api/protected-members')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1); // Should only see 1 member
      expect(res.body[0].firstName).toBe('Member A');
    });
  });
});
