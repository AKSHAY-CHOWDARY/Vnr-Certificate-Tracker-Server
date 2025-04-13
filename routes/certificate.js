const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const authenticate = require('../middleware/authenticate');

// Get All Certificates
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Certificates by Student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const certificates = await Certificate.find({ studentId: req.params.studentId });
    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Certificates by Branch and Section
router.get('/filter', async (req, res) => {
  const { branch, section } = req.query;

  try {
    const certificates = await Certificate.find({ branch, section });
    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Certificate
router.post('/', authenticate, async (req, res) => {
  try {
    console.log(req);
    const certificate = new Certificate(req.body);
    console.log("recieved req for certif", req.body);
    await certificate.save();
    res.status(201).json({ message: 'Certificate added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Certificate
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;