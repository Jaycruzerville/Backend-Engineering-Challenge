const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Caregiver = require('../../src/models/Caregiver');

// Mock Supabase
jest.mock('../../src/config/supabase', () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    getUser: jest.fn(),
  },
}));

const supabase = require('../../src/config/supabase');
const app = require('../../src/index'); // We need to export app from index.js

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/caregivers/signup', () => {
    it('should create a new caregiver and return a session', async () => {
      // Mock Supabase Response
      const mockUser = { id: 'supabase-user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'fake-jwt-token' };
      
      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const res = await request(app)
        .post('/api/caregivers/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test Setup',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain('Caregiver registered successfully');
      
      // Verify MongoDB creation
      const caregiver = await Caregiver.findOne({ email: 'test@example.com' });
      expect(caregiver).toBeTruthy();
      expect(caregiver.supabaseId).toBe('supabase-user-123');
    });

    it('should handle existing email (mocking Supabase error)', async () => {
       supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });

      const res = await request(app)
        .post('/api/caregivers/signup')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
        });

       // The controller returns 409 for duplicate emails
       expect(res.statusCode).toEqual(409);
    });
  });
});
