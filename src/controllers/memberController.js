const Member = require('../models/Member');
const logger = require('../utils/logger');
const { z } = require('zod');

// Schema Validation
const memberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  relationship: z.string().min(1),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  status: z.enum(['active', 'inactive']).optional(),
});

// Helper for Real-time Log Simulation
const logEvent = (eventType, payload) => {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
  console.log(`[${timestamp}] EVENT: ${eventType} — ${JSON.stringify(payload)}`);
};

exports.createMember = async (req, res, next) => {
  try {
    const data = memberSchema.parse(req.body);

    const member = await Member.create({
      ...data,
      caregiverId: req.user._id,
    });

    logEvent('member_added', { caregiverId: req.user._id, memberId: member._id });
    
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

exports.getMembers = async (req, res, next) => {
  try {
    const members = await Member.find({ caregiverId: req.user._id });
    res.json(members);
  } catch (error) {
    next(error);
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = memberSchema.partial().parse(req.body);

    const member = await Member.findOneAndUpdate(
      { _id: id, caregiverId: req.user._id },
      data,
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    logEvent('member_updated', { caregiverId: req.user._id, memberId: member._id });

    res.json(member);
  } catch (error) {
    next(error);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await Member.findOneAndDelete({ _id: id, caregiverId: req.user._id });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    logEvent('member_removed', { caregiverId: req.user._id, memberId: member._id });

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    next(error);
  }
};
