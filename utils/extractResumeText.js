const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * Extract text from a PDF resume and save it to user.resumeText
 * Call this whenever a resume is uploaded.
 *
 * @param {Object} user - Mongoose User document
 * @param {string} resumePdfPath - e.g. '/uploads/cvs/file.pdf'
 */
async function extractAndSaveResumeText(user, resumePdfPath) {
  try {
    const fullPath = path.join(__dirname, '../public', resumePdfPath);
    if (!fs.existsSync(fullPath)) return;

    const dataBuffer = fs.readFileSync(fullPath);
    const data = await pdfParse(dataBuffer);

    user.resumeText = data.text || '';
    await user.save();

    console.log(`✅ Resume text extracted for user: ${user.name}`);
  } catch (err) {
    console.error('extractResumeText error:', err.message);
  }
}

module.exports = { extractAndSaveResumeText };