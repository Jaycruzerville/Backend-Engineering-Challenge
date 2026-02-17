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
  let authUser;
  let authSession;
  
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
    
    authUser = authData.user;
    authSession = authData.session;

    // 2. Create Caregiver in MongoDB
    const caregiver = await Caregiver.create({
      supabaseId: authUser.id,
      email: authUser.email,
      name,
    });

    logger.info(`New caregiver registered: ${email} with Supabase ID: ${authUser.id}`);
    
    res.status(201).json({ 
      message: 'Caregiver registered successfully', 
      caregiver: { id: caregiver._id, name: caregiver.name, email: caregiver.email },
      session: authSession 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    logger.error(`Signup Error: ${error.message}`);
    
    // Handle duplicate email in Mongo but new in Supabase (Sync issue)
    if ((error.message.includes('E11000') || error.code === 11000) && authUser) {
        try {
            const { email } = req.body;
            logger.info(`Attempting to sync Caregiver ${email} with new Supabase ID...`);
            const updated = await Caregiver.findOneAndUpdate(
                { email },
                { supabaseId: authUser.id },
                { new: true }
            );
            if (updated) {
                 logger.info(`Synced Caregiver ${email} successfully.`);
                 return res.status(200).json({ 
                    message: 'Caregiver synced successfully', 
                    caregiver: { id: updated._id, name: updated.name, email: updated.email },
                    session: authSession 
                  });
            }
        } catch (syncError) {
             logger.error(`Sync Error: ${syncError.message}`);
        }
    }
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
  const { _id, name, email } = req.user;
  res.json({ 
    caregiver: {
      id: _id,
      name,
      email
    }
  });
};
