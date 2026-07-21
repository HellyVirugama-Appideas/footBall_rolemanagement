const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const extractText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } 
  else if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  return '';
};

const parseCV = (text, filename) => {
  // Simple but effective parsing
  const nameMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/);
  const expMatch = text.match(/\b(\d{1,2})\s*(?:year|yrs?|years?)\b/i);
  
  // Common skills (tum jobSkill model se bhi match kar sakte ho baad mein)
  const commonSkills = ['react','node','javascript','python','java','mongodb','express','angular','flutter','swift','kotlin','sql','html','css','php'];
  const skills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill)
  );

  return {
    name: nameMatch ? nameMatch[0] : filename.replace(/\.(pdf|docx|doc)$/i, '').trim(),
    experience: expMatch ? `${expMatch[1]} years` : 'Not mentioned',
    skills: skills.length ? skills.join(', ') : 'No skills detected',
    rawText: text.substring(0, 2000) // safety
  };
};

exports.processCVFile = async (filePath, filename) => {
  const text = await extractText(filePath);
  const parsed = parseCV(text, filename);
  return { ...parsed, originalFilePath: filePath };
};

exports.extractZip = async (zipPath, uploadDir) => {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  const extractedFiles = [];

  for (const entry of entries) {
    if (!entry.isDirectory && /\.(pdf|docx|doc)$/i.test(entry.name)) {
      const filePath = path.join(uploadDir, Date.now() + '_' + entry.name);
      zip.extractEntryTo(entry, uploadDir, false, true);
      // Rename to unique
      const oldPath = path.join(uploadDir, entry.name);
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, filePath);
      }
      extractedFiles.push(filePath);
    }
  }
  return extractedFiles;
};