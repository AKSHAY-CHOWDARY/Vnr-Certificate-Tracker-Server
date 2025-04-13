const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  title: String,
  studentId: String,
  branch: String,
  section: String,
  domain: String, // X1, X2, Y, U, V, Z
  url: String,
  YearinwhichCertificateWasRecieved: String,
  uploadedAt: { type: Date, default: Date.now },
  presentYearOfStudent: Number,
});

module.exports = mongoose.model('Certificate', CertificateSchema);
