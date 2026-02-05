const mongoose = require('mongoose');

const caregiverSchema = new mongoose.Schema({
  supabaseId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Caregiver', caregiverSchema);
