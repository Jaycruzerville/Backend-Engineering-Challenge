const supabase = require('../config/supabase');
const Caregiver = require('../models/Caregiver');
const logger = require('../utils/logger');
const { z } = require('zod');

// Validation Schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

exports.signup = async (req, res) => {
  try {
    const { email, password, name } = signupSchema.parse(req.body);

    // 1. Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
         return res.status(409).json({ message: 'Email already registered' });
      }
      throw authError;
    }

    if (!authData.user) {
         return res.status(500).json({ message: 'Signup failed to return user data' });
    }

    // 2. Create Caregiver in MongoDB
    const caregiver = await Caregiver.create({
      supabaseId: authData.user.id,
      email: authData.user.email,
      name,
    });

    logger.info(`New caregiver registered: ${email}`);
    
    res.status(201).json({ 
      message: 'Caregiver registered successfully', 
      caregiver: { id: caregiver._id, name: caregiver.name, email: caregiver.email },
      session: authData.session 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    logger.error(`Signup Error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn(`Login failed for ${email}: ${error.message}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ 
      message: 'Login successful', 
      session: data.session 
    });

  } catch (error) {
     if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    logger.error(`Login Error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getMe = async (req, res) => {
  res.json({ caregiver: req.user });
};
