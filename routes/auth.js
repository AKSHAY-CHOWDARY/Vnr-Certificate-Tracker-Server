const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Student = require('../models/Student');
const authenticate = require('../middleware/authenticate');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Sign-In
router.post('/google', async (req, res) => {
  const { tokenId } = req.body;
  console.log("request for login", tokenId);
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log("ticket", ticket);
    if (!ticket) return res.status(401).json({ error: 'Invalid Google token' });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;
    console.log(payload);
    let student = await Student.findOne({ email });

    if (!student) {
      student = new Student({
        studentId: "N/A",
        name,
        email,
        branch: "N/A",
        section: "N/A",
        batch: "N/A",
        googleId,
        picture,
        isProfileComplete: false,
        role: email.includes('admin') ? 'admin' : 'student',
      });
      await student.save();
    }

    const token = jwt.sign({ id: student._id, role: student.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    console.log(student);
    res.status(200).json({ token, student });
  } catch (err) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("recieved req for admin login");
    const admin = await Student.findOne({ email, role: 'admin' });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    console.log(admin);
    if(admin.password!="vnraimliot") return res.status(400).json({ error: 'Invalid password' });
    //const isValidPassword = await bcrypt.compare(password, admin.password);
    //if (!isValidPassword) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign({ id: email, role: password }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.status(200).json({ token, admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sign Out (Mock Implementation)
router.post('/signout', authenticate, (req, res) => {
  res.status(200).json({ message: 'Signed out successfully' });
});

// Get Current User
router.get('/me', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;