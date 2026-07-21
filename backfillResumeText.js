const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
require('dotenv').config();

const User = require('./models/userModel');

// ✅ Yahan apna actual uploads folder path daalo
const UPLOADS_BASE = '/var/www/backend/public/uploads/cvs';
// Agar alag hai to change karo, jaise:
// const UPLOADS_BASE = '/var/www/uploads/cvs';

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === '.pdf') {
      const data = await pdfParse(fs.readFileSync(filePath));
      return data.text || '';
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }
  } catch (e) {
    throw new Error(`Text extract failed: ${e.message}`);
  }
  return '';
}

async function run() {
  await mongoose.connect(process.env.DATABASE || process.env.DB_URI || process.env.MONGODB_URI);
  console.log('✅ DB Connected');
  console.log('📁 Looking for files in:', UPLOADS_BASE);

  const users = await User.find({
    'resumes.0': { $exists: true },
    $or: [
      { resumeText: { $exists: false } },
      { resumeText: '' },
      { resumeText: null }
    ]
  }).select('name resumes resumeText');

  console.log(`Found ${users.length} users to backfill\n`);

  let success = 0, skipped = 0, failed = 0;

  for (const user of users) {
    try {
      const latest = user.resumes[user.resumes.length - 1];
      if (!latest?.resumePdf) { skipped++; continue; }

      // Sirf filename lo, DB mein jo bhi path stored ho
      const filename = path.basename(latest.resumePdf);
      const fullPath = path.join(UPLOADS_BASE, filename);

      if (!fs.existsSync(fullPath)) {
        console.log(`❌ Not found: ${fullPath}`);
        skipped++;
        continue;
      }

      const text = await extractText(fullPath);
      if (!text) { skipped++; continue; }

      user.resumeText = text;
      await user.save();

      console.log(`✅ ${user.name} — ${text.length} chars`);
      success++;

    } catch (e) {
      console.log(`❌ ${user.name}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Done! Success: ${success} | Skipped: ${skipped} | Failed: ${failed}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});