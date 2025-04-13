const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');

const present_year = process.env.PRESENT_YEAR
console.log(present_year);
// Filter students
router.get('/students', async (req, res) => {
  const { branch, batch, section } = req.query;
  const filter = {};
  if (branch) filter.branch = branch;
  if (batch) filter.batch = batch;
  if (section) filter.section = section;

  try {
    const students = await Student.find(filter);
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report by branch, year, section
router.get('/report/:branch/:year/:section', async (req, res) => {
  const { branch, year, section } = req.params;
  try {
    const certs = await Certificate.find({ branch, section, presentYearOfStudent: Number(year) });
    const students = await Student.find({ branch, section });

    const result = { X1: 0, X2: 0, Y: 0, U: 0, V: 0, Z: 0 };
    certs.forEach(c => {
      if (result[c.domain] !== undefined) result[c.domain]++;
    });

    const T = students.length;
    const total = Object.values(result).reduce((a, b) => a + b, 0);
    const participationIndex = ((total / T) * 100).toFixed(2);

    res.status(200).json({ year, branch, section, counts: result, totalStudents: T, participationIndex });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/report/certification-summary', async (req, res) => {
  try {
    const branches = ['AIML', 'IoT'];
    const domains = ['X1', 'X2', 'Y', 'U', 'V', 'Z'];
    const yearMap = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };

    const finalReport = {};

    for (let branch of branches) {
      const branchData = {};
      domains.forEach(domain => {
        branchData[domain] = { I: 0, II: 0, III: 0, IV: 0, Total: 0 };
      });

      const certificates = await Certificate.find({ branch,YearinwhichCertificateWasRecieved:present_year });

      certificates.forEach(cert => {
        const yearLabel = yearMap[cert.presentYearOfStudent];
        if (!yearLabel || !domains.includes(cert.domain)) return;

        branchData[cert.domain][yearLabel]++;
        branchData[cert.domain].Total++;
      });

      finalReport[branch] = branchData;
    }

    res.json(finalReport);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// convert to pdf 
// Convert to PDF
router.post("/compile-latex", async (req, res) => {
  const latexContent = req.body.latex;
  const encoded = encodeURIComponent(latexContent);
  const url = `https://latexonline.cc/compile?compiler=pdflatex&text=${latexContent}`;

  try {
    const response = await fetch(url);
    console.log(response)
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "application/pdf");
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("PDF generation failed.");
  }
});

module.exports = router;
