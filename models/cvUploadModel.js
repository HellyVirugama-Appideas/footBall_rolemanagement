const mongoose = require('mongoose');

const cvUploadSchema = new mongoose.Schema({
  // Extracted info from CV
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  skills: [{ type: String, trim: true }],
  experience: { type: String, trim: true }, // e.g. "2 years", "Fresher"
  experienceYears: { type: Number, default: 0 }, // numeric for filtering
  city: { type: String, trim: true },
  country: { type: String, trim: true },
  summary: { type: String, trim: true },
  jobTitles: [{ type: String, trim: true }], // extracted job roles

  // File info
  originalFileName: { type: String },
  filePath: { type: String },
  fileSize: { type: Number },

  // Processing status
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending',
  },
  rawText: { type: String }, // raw extracted text for search
  errorMessage: { type: String },

  // Linked to User (if matched/created)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Upload batch info
  batchId: { type: String }, // to group bulk uploads together
  uploadedBy: { type: String, default: 'admin' },

  date: { type: Date, default: Date.now },
  linkedinUrl: { type: String, default: '' },
});

// Text index for full-text search
cvUploadSchema.index({ name: 'text', skills: 'text', rawText: 'text', jobTitles: 'text' });

module.exports = mongoose.model('CVUpload', cvUploadSchema);
