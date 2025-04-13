const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: String,
  name: String,
  email: { type: String, unique: true },
  password: String,
  branch: String,
  section: String,
  batch: String,
  isProfileComplete: { type: Boolean, default: false },
  picture: {
    type: String,
    default: "https://ui-avatars.com/api/?name=Student+User&background=1a73e8&color=fff",
  },
  googleId: String, // For Google authentication
  role: { type: String, enum: ['student', 'admin'], default: 'student' }, // Add role field
});

module.exports = mongoose.model('Student', StudentSchema);