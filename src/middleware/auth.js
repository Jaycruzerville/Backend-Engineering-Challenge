const supabase = require('../config/supabase');
const Caregiver = require('../models/Caregiver');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn(`Auth failed: ${error ? error.message : 'No user found'}`);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Find the caregiver in our MongoDB that matches this Supabase user
    let caregiver = await Caregiver.findOne({ supabaseId: user.id });

    if (!caregiver) {
       // Self-healing: Check if user exists by email (legacy/mismatch case)
       // This handles cases where Supabase user was recreated but Mongo record persists
       logger.warn(`Caregiver not found by ID: ${user.id}. Checking by email: ${user.email}`);
       caregiver = await Caregiver.findOne({ email: user.email });
       
       if (caregiver) {
           logger.info(`Found caregiver by email. Updating Supabase ID to ${user.id}`);
           caregiver.supabaseId = user.id;
           await caregiver.save();
       } else {
           logger.warn(`Caregiver not found in DB for Supabase ID: ${user.id}`);
           return res.status(404).json({ message: 'Caregiver profile not found' });
       }
    }

    req.user = caregiver; // Attach the Mongoose document to req.user
    next();
  } catch (error) {
    logger.error(`Auth Middleware Error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = authMiddleware;
