const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const authenticate = require('../middleware/authenticate');


//get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
router.post('/profile', authenticate, async (req, res) => {
  console.log("Updating profile for user:", req.body);
  const { studentId, name, branch, section, batch, photoURL } = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.body.userId,
      { studentId, name, branch, section, batch, picture: photoURL,isProfileComplete: true },
      { new: true }
    );

    res.status(200).json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Students by Branch and Section
router.get('/filter', async (req, res) => {
  const { branch, section } = req.query;

  try {
    const students = await Student.find({ branch, section });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;