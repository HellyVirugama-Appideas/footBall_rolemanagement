const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processCVFile, extractZip } = require('../../utils/cvParser');
const User = require('../../models/userModel');

const uploadDir = './public/uploads/';

// Existing upload functions (unchanged)
exports.upload = multer({ /* ... same as before */ });
exports.uploadCmsImage = async (req, res) => { /* same */ };

// NEW BULK CV UPLOAD
exports.bulkCVUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
  }),
  limits: { fileSize: 1024 * 1024 * 50 }, // 50MB max for ZIP/single file
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX or ZIP allowed!'), false);
  }
}).single('cvFile');   // single field name = cvFile

exports.processBulkCV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filesToProcess = [];
    const isZip = req.file.originalname.toLowerCase().endsWith('.zip');

    if (isZip) {
      const extracted = await extractZip(req.file.path, uploadDir);
      filesToProcess.push(...extracted);
      fs.unlinkSync(req.file.path); // delete zip after extract
    } else {
      filesToProcess.push(req.file.path);
    }

    const results = [];
    for (const filePath of filesToProcess) {
      const filename = path.basename(filePath);
      const parsed = await processCVFile(filePath, filename);

      // Create new User in database
      const newUser = new User({
        name: parsed.name,
        email: `candidate_${Date.now()}@example.com`, // temporary email (admin baad mein edit kar sakta hai)
        phone: '',
        password: 'TempPass123', // admin baad mein change kar sakta hai
        city: 'Ahmedabad', // default (admin edit karega)
        state: 'Gujarat',
        experience: parsed.experience,
        jobSkill: [], // baad mein manually assign
        resumes: [{
          resumeTitle: parsed.name + ' Resume',
          resumePdf: `/uploads/${path.basename(filePath)}`,
          selected: true
        }]
      });

      await newUser.save();
      results.push({ filename, name: parsed.name, experience: parsed.experience, skills: parsed.skills });
    }

    req.flash('green', `${results.length} CV(s) successfully uploaded and processed!`);
    res.redirect('/user'); // users management page pe redirect
  } catch (error) {
    console.error(error);
    req.flash('red', error.message);
    res.redirect('/uploads');
  }
};