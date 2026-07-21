// // const fs = require('fs');
// // const path = require('path');
// // const multer = require('multer');

// // const CVUpload = require('../../models/cvUploadModel');
// // const User = require('../../models/userModel');

// // // ─────────────────────────────────────────
// // // FILENAME SANITIZATION HELPER
// // // ─────────────────────────────────────────
// // function sanitizeFilename(rawName) {
// //   let name = rawName || 'file';
// //   try { name = decodeURIComponent(name); } catch (e) { }
// //   name = name
// //     .normalize('NFD')
// //     .replace(/[\u0300-\u036f]/g, '')
// //     .normalize('NFC');
// //   const translitMap = {
// //     'ß': 'ss', 'æ': 'ae', 'ø': 'o', 'å': 'a',
// //     'đ': 'd', 'ħ': 'h', 'ı': 'i', 'ł': 'l',
// //     'ŋ': 'n', 'œ': 'oe', 'þ': 'th', 'ð': 'd',
// //     'Æ': 'Ae', 'Ø': 'O', 'Å': 'A', 'Đ': 'D',
// //     'Ħ': 'H', 'Ł': 'L', 'Ŋ': 'N', 'Œ': 'Oe',
// //     'Þ': 'Th', 'Ð': 'D',
// //   };
// //   name = name.replace(/[^\u0000-\u007E]/g, ch => translitMap[ch] || '_');
// //   name = name
// //     .replace(/[^a-zA-Z0-9.\-\(\)]/g, '_')
// //     .replace(/_{2,}/g, '_')
// //     .replace(/^_+|_+$/g, '');
// //   if (!name || name === '.') name = 'file';
// //   return name;
// // }

// // // ─────────────────────────────────────────
// // // MULTER CONFIG
// // // ─────────────────────────────────────────
// // const cvStorage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     const dir = './public/uploads/cvs/';
// //     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// //     cb(null, dir);
// //   },
// //   filename: (req, file, cb) => {
// //     const ext = path.extname(file.originalname).toLowerCase();
// //     const baseNoExt = path.basename(file.originalname, path.extname(file.originalname));
// //     const safeName = sanitizeFilename(baseNoExt);
// //     const finalName = Date.now() + '_' + safeName + ext;
// //     console.log(`Multer saved: ${finalName}  (original: ${file.originalname})`);
// //     cb(null, finalName);
// //   },
// // });

// // exports.cvUploader = multer({
// //   storage: cvStorage,
// //   limits: { fileSize: 1024 * 1024 * 2000, files: 5000 },
// //   fileFilter: (req, file, cb) => {
// //     const ext = path.extname(file.originalname).toLowerCase();
// //     if (['.pdf', '.doc', '.docx', '.zip'].includes(ext)) {
// //       cb(null, true);
// //     } else {
// //       cb(new Error('Only PDF, DOC, DOCX, or ZIP files are allowed.'), false);
// //     }
// //   },
// // }).array('cvFiles', 5000);

// // // ─────────────────────────────────────────
// // // DUPLICATE CHECK HELPER
// // // Check karta hai originalFileName DB mein
// // // already exist karta hai ya nahi.
// // // Agar exist kare → true return karo (skip)
// // // ─────────────────────────────────────────
// // async function isDuplicate(originalName) {
// //   const existing = await CVUpload.findOne({ originalFileName: originalName }).lean();
// //   if (existing) {
// //     console.log(`⏭️  SKIPPED (duplicate): ${originalName}`);
// //     return true;
// //   }
// //   return false;
// // }

// // // ─────────────────────────────────────────
// // // TEXT EXTRACTION — PDF and DOCX
// // // ─────────────────────────────────────────
// // function fixTextEncoding(text, buffer) {
// //   try {
// //     if (text.includes('\ufffd') && buffer) {
// //       const chardet = require('chardet');
// //       const iconv = require('iconv-lite');
// //       const detected = chardet.detect(buffer);
// //       if (detected && detected !== 'UTF-8') {
// //         const redecoded = iconv.decode(buffer, detected);
// //         if (!redecoded.includes('\ufffd')) {
// //           console.log('Re-decoded with:', detected);
// //           return redecoded;
// //         }
// //       }
// //       return text
// //         .replace(/Gro\ufffdk/g, 'Großk')
// //         .replace(/([a-zA-Z])\ufffd([a-zA-Z])/g, (m, a, b) => a + 'ß' + b)
// //         .replace(/\ufffd/g, '');
// //     }
// //     return text;
// //   } catch (e) {
// //     return text.replace(/\ufffd/g, '');
// //   }
// // }

// // async function extractTextFromPDF(filePath) {
// //   return new Promise((resolve) => {
// //     const timer = setTimeout(() => {
// //       console.log('pdf-parse timeout:', filePath);
// //       resolve('');
// //     }, 15000);
// //     try {
// //       const pdfParseModule = require('pdf-parse');
// //       const pdfParse = (typeof pdfParseModule === 'function')
// //         ? pdfParseModule
// //         : (pdfParseModule.default || pdfParseModule);

// //       if (typeof pdfParse !== 'function') {
// //         clearTimeout(timer);
// //         console.log('pdf-parse is not a function — module shape:', typeof pdfParseModule);
// //         resolve('');
// //         return;
// //       }

// //       const buffer = fs.readFileSync(filePath);
// //       pdfParse(buffer)
// //         .then((data) => {
// //           clearTimeout(timer);
// //           let text = (data.text || '').trim();
// //           text = fixTextEncoding(text, buffer);
// //           console.log('PDF extracted chars:', text.length, 'from', path.basename(filePath));
// //           resolve(text);
// //         })
// //         .catch((e) => {
// //           clearTimeout(timer);
// //           console.log('pdf-parse error:', e.message);
// //           resolve('');
// //         });
// //     } catch (e) {
// //       clearTimeout(timer);
// //       console.log('pdf-parse require error:', e.message);
// //       resolve('');
// //     }
// //   });
// // }

// // async function extractTextFromDOCX(filePath) {
// //   try {
// //     const mammoth = require('mammoth');
// //     const buffer = fs.readFileSync(filePath);
// //     const result = await mammoth.extractRawText({ buffer });
// //     let text = (result.value || '').trim();
// //     text = fixTextEncoding(text, buffer);
// //     console.log('DOCX extracted chars:', text.length, 'from', path.basename(filePath));
// //     return text;
// //   } catch (e) {
// //     console.log('mammoth error:', e.message);
// //     return '';
// //   }
// // }

// // // ─────────────────────────────────────────
// // // LOCAL CV PARSER
// // // ─────────────────────────────────────────
// // function localParse(text, originalFileName) {
// //   if (!text) return {};
// //   const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

// //   const emailM = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
// //   const email = emailM ? emailM[0].toLowerCase() : '';

// //   let phone = '';
// //   const phoneLabelM = text.match(
// //     /(?:phone|tel(?:efon)?|mobile|mob(?:ile)?|cell|handy|kontakt|fon|ph)\s*[:\.\-\/]?\s*((?:\+\d{1,3}[\s\-]?)?[\d][\d\s\(\)\-\.]{6,30}\d)/i
// //   );
// //   if (phoneLabelM) {
// //     phone = phoneLabelM[1].replace(/\s{2,}/g, ' ').trim();
// //   }
// //   if (!phone) {
// //     const intlM = text.match(/(\+\d{1,3}[\s\-]?(?:\(\d{1,4}\)[\s\-]?)?\d[\d\s\-\.]{5,20}\d)/);
// //     if (intlM) phone = intlM[1].replace(/\s{2,}/g, ' ').trim();
// //   }
// //   phone = phone.replace(/[\s\-\.]+$/, '').trim();

// //   const skipLine = /^(curriculum|resume|cv |page |tel|phone|email|address|date|summary|objective|profile|experience|education|skills|about|references|professional|personal|key |languages|certif|linkedin|http|www\.|dear |to whom|university|college|institute|school|academy|bachelor|master|phd|mba|b\.sc|m\.sc|department|faculty|born|nationality|gender|dob|date of birth|marital|visa|driving)/i;
// //   const institutionLine = /\b(university|college|institute|school|academy|foundation|hospital|clinic|ltd|inc|corp|llc|plc|gmbh|pvt|limited|solutions|services|technologies|systems|consulting|group|associates|international)\b/i;

// //   function toTitleCase(str) {
// //     return str.split(/\s+/)
// //       .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
// //       .join(' ');
// //   }

// //   function looksLikeName(line) {
// //     const words = line.trim().split(/\s+/);
// //     if (words.length < 2 || words.length > 5) return false;
// //     return words.every(w =>
// //       w.length >= 2 &&
// //       /^[A-Za-z\u00C0-\u00FF'\-\.]+$/.test(w) &&
// //       !/^\d/.test(w)
// //     );
// //   }

// //   let name = '';
// //   for (const line of lines.slice(0, 12)) {
// //     if (line.length < 3 || line.length > 80) continue;
// //     if (line.includes('@') || line.includes('http') || line.includes('|') || line.includes('/') || line.includes(',')) continue;
// //     if (skipLine.test(line) || institutionLine.test(line)) continue;
// //     if (line.match(/^\d/)) continue;
// //     if (looksLikeName(line)) {
// //       name = toTitleCase(line.trim().split(/\s+/).slice(0, 4).join(' '));
// //       break;
// //     }
// //   }
// //   if (!name) {
// //     for (const line of lines.slice(0, 6)) {
// //       if (line.length < 3 || line.length > 50) continue;
// //       if (line.includes('@') || line.includes('http') || line.includes('|') || line.includes('/')) continue;
// //       if (skipLine.test(line) || institutionLine.test(line)) continue;
// //       const words = line.trim().split(/\s+/);
// //       if (words.length >= 2 && words.length <= 4) {
// //         const allLetters = words.every(w => /^[A-Za-z\u00C0-\u00FF'\-\.]{2,}$/.test(w));
// //         if (allLetters) { name = toTitleCase(words.join(' ')); break; }
// //       }
// //     }
// //   }
// //   if (!name && originalFileName) {
// //     const fromFile = originalFileName
// //       .replace(/\.[^.]+$/, '')
// //       .replace(/[_\-]+/g, ' ')
// //       .replace(/\d{8,}/g, '')
// //       .replace(/\s*(cv|resume|curriculum|vitae)\s*/gi, '')
// //       .trim();
// //     if (fromFile && fromFile.length > 2) name = toTitleCase(fromFile.slice(0, 50));
// //   }

// //   let city = '';
// //   const cityLabelM = text.match(/(?:location|city|based in|address|residing|ort)[.\s:]+([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s,\-]{2,50}?)(?:\n|$|,\s*[A-Z]{2,}|\|)/i);
// //   if (cityLabelM) city = cityLabelM[1].split(',')[0].trim();
// //   if (!city) {
// //     for (const line of lines.slice(0, 6)) {
// //       if (line.includes('@') || line.includes('http') || line.includes('linkedin')) continue;
// //       const pipeFirst = line.split('|')[0].trim();
// //       if (pipeFirst.includes(',') && pipeFirst.match(/^[A-Za-z\u00c0-\u024f]/) && pipeFirst.length < 100) {
// //         const beforeComma = pipeFirst.split(',')[0].trim();
// //         if (beforeComma.length >= 2 && beforeComma.length <= 40 &&
// //           beforeComma.match(/^[A-Za-z\u00c0-\u024f][\w\s\u00c0-\u024f\-]*$/) &&
// //           !beforeComma.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)) {
// //           city = beforeComma; break;
// //         }
// //       }
// //     }
// //   }
// //   if (!city) {
// //     const firstLine = lines[0] || '';
// //     const parts = firstLine.split('|').map(p => p.trim());
// //     for (const p of parts.slice(1)) {
// //       if (!p.includes('@') && !p.includes('http') && p.match(/[A-Za-z]/) && p.length < 80) {
// //         const candidate = p.split(',')[0].trim();
// //         if (candidate.length > 1 && !candidate.match(/^\d/)) { city = candidate; break; }
// //       }
// //     }
// //   }

// //   let country = '';
// //   const countryMap = {
// //     'india': 'India', 'germany': 'Germany', 'deutschland': 'Germany',
// //     'united kingdom': 'United Kingdom', 'uk': 'United Kingdom',
// //     'england': 'United Kingdom', 'scotland': 'United Kingdom', 'wales': 'United Kingdom',
// //     'united states': 'USA', 'usa': 'USA', 'u\\.s\\.a': 'USA', 'us': 'USA', 'america': 'USA',
// //     'canada': 'Canada', 'australia': 'Australia', 'new zealand': 'New Zealand',
// //     'france': 'France', 'spain': 'Spain', 'italy': 'Italy',
// //     'netherlands': 'Netherlands', 'holland': 'Netherlands',
// //     'belgium': 'Belgium', 'switzerland': 'Switzerland', 'austria': 'Austria',
// //     'sweden': 'Sweden', 'norway': 'Norway', 'denmark': 'Denmark',
// //     'finland': 'Finland', 'portugal': 'Portugal', 'poland': 'Poland',
// //     'russia': 'Russia', 'china': 'China', 'japan': 'Japan',
// //     'south korea': 'South Korea', 'korea': 'South Korea',
// //     'singapore': 'Singapore', 'malaysia': 'Malaysia', 'indonesia': 'Indonesia',
// //     'thailand': 'Thailand', 'vietnam': 'Vietnam', 'philippines': 'Philippines',
// //     'pakistan': 'Pakistan', 'bangladesh': 'Bangladesh', 'sri lanka': 'Sri Lanka',
// //     'nepal': 'Nepal', 'uae': 'UAE', 'united arab emirates': 'UAE', 'dubai': 'UAE',
// //     'saudi arabia': 'Saudi Arabia', 'qatar': 'Qatar', 'kuwait': 'Kuwait',
// //     'bahrain': 'Bahrain', 'south africa': 'South Africa', 'nigeria': 'Nigeria',
// //     'kenya': 'Kenya', 'ghana': 'Ghana', 'egypt': 'Egypt',
// //     'brazil': 'Brazil', 'mexico': 'Mexico', 'argentina': 'Argentina',
// //     'colombia': 'Colombia', 'chile': 'Chile',
// //   };
// //   const countryLabelM = text.match(/(?:country|nationality)[.\s:]+([A-Za-z\s]{2,40}?)(?:\n|$|,)/i);
// //   if (countryLabelM) {
// //     const candidate = countryLabelM[1].trim().toLowerCase();
// //     for (const [key, val] of Object.entries(countryMap)) {
// //       if (new RegExp('\\b' + key + '\\b').test(candidate)) { country = val; break; }
// //     }
// //   }
// //   if (!country) {
// //     const textLower = text.toLowerCase();
// //     for (const [key, val] of Object.entries(countryMap)) {
// //       if (new RegExp('\\b' + key + '\\b').test(textLower)) { country = val; break; }
// //     }
// //   }

// //   const skills = new Set();
// //   const skillsSectionM = text.match(/(?:key\s+skills?|skills?|competencies|expertise|technologies)[:\s\n]+([\s\S]{10,500}?)(?=\n\s*\n|\n\s*(?:education|experience|employment|references|languages|certif|awards|$))/i);
// //   const skillsText = skillsSectionM ? skillsSectionM[1] : text;
// //   skillsText.split('|').forEach(s => {
// //     const clean = s.replace(/[\n\r]/g, ' ').trim();
// //     if (clean.length > 2 && clean.length < 60 && clean.match(/[A-Za-z]{2,}/) && !clean.match(/^\d/))
// //       skills.add(clean);
// //   });
// //   skillsText.split(/[\n,•\*]/).forEach(s => {
// //     const clean = s.replace(/^[\s\-–]+/, '').trim();
// //     if (clean.length > 2 && clean.length < 60 && clean.match(/[A-Za-z]{2,}/) && !clean.match(/^\d{4}/))
// //       skills.add(clean);
// //   });
// //   const badSkill = /^(skills?|competencies|expertise|key|and|the|with|for|or|in|to|of)$/i;
// //   const skillsArr = [...skills].filter(s => !badSkill.test(s)).slice(0, 15);

// //   const titleKeywords = [
// //     'coach', 'manager', 'director', 'scout', 'analyst', 'recruiter',
// //     'developer', 'engineer', 'designer', 'consultant', 'advisor', 'trainer',
// //     'coordinator', 'executive', 'officer', 'therapist', 'instructor',
// //     'physiotherapist', 'scientist', 'specialist', 'head of', 'assistant',
// //   ];
// //   const foundTitles = [];
// //   lines.forEach(line => {
// //     titleKeywords.forEach(t => {
// //       if (new RegExp('\\b' + t + '\\b', 'i').test(line) && line.length < 80) {
// //         const clean = line.replace(/[|•\-–*]/g, '').trim().slice(0, 60);
// //         if (!foundTitles.includes(clean)) foundTitles.push(clean);
// //       }
// //     });
// //   });

// //   let experienceYears = 0;
// //   const currentYear = new Date().getFullYear();
// //   const currentMonth = new Date().getMonth() + 1;
// //   const directExpM = text.match(/(\d+)\s*\+?\s*(years?|yrs?)\s*(of\s+)?(experience|exp\.?|work)/i);
// //   if (directExpM) {
// //     experienceYears = parseInt(directExpM[1]);
// //   } else {
// //     const expSectionM = text.match(/(?:professional\s+)?experience[:\s]*\n([\s\S]*?)(?=\n\s*(?:education|skills|languages|references|certif|awards|interests|$))/i);
// //     const expText = expSectionM ? expSectionM[1] : text.replace(/\n\s*education[\s\S]*?(experience|$)/i, '\n');
// //     const monthMap = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
// //     const rangeRegex = /(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s.]+)?(\d{4})\s*[\u2013\u2014\u2012\-\u2010]+\s*(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s.]+)?(\d{4}|Present|present|current|Current)/gi;
// //     let totalMonths = 0;
// //     let rm;
// //     while ((rm = rangeRegex.exec(expText)) !== null) {
// //       const startMonth = rm[1] ? (monthMap[rm[1].toLowerCase()] || 1) : 1;
// //       const startYear = parseInt(rm[2]);
// //       const isPresent = /present|current/i.test(rm[4]);
// //       const endMonth = rm[3]
// //         ? (monthMap[rm[3].toLowerCase()] || (isPresent ? currentMonth : 12))
// //         : (isPresent ? currentMonth : 12);
// //       const endYear = isPresent ? currentYear : parseInt(rm[4]);
// //       if (startYear >= 1970 && startYear <= currentYear && endYear >= startYear) {
// //         const months = (endYear - startYear) * 12 + (endMonth - startMonth);
// //         if (months > 0 && months < 600) totalMonths += months;
// //       }
// //     }
// //     if (totalMonths > 0) {
// //       experienceYears = Math.round(totalMonths / 12);
// //     } else {
// //       const allYears = (expText.match(/\b(19[7-9]\d|20[0-2]\d)\b/g) || [])
// //         .map(Number).filter(y => y <= currentYear);
// //       if (allYears.length > 0) experienceYears = currentYear - Math.min(...allYears);
// //     }
// //   }

// //   let linkedinUrl = '';
// //   const linkedinM = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([a-zA-Z0-9\-_%]+)/i);
// //   if (linkedinM) linkedinUrl = 'https://www.linkedin.com/in/' + linkedinM[1];
// //   if (!linkedinUrl) {
// //     const linkedinLabelM = text.match(/linkedin\s*(?:id|profile|url|:|\|)[\s:]*([a-zA-Z0-9\-_%\.\/]+)/i);
// //     if (linkedinLabelM) {
// //       const val = linkedinLabelM[1].trim();
// //       if (val.includes('linkedin.com')) {
// //         linkedinUrl = val.startsWith('http') ? val : 'https://www.' + val;
// //       } else if (val.length > 2 && !val.includes('@')) {
// //         linkedinUrl = 'https://www.linkedin.com/in/' + val.replace(/\/$/, '');
// //       }
// //     }
// //   }

// //   let summary = '';
// //   const summaryM = text.match(/(?:professional\s+summary|summary|objective|profile|about\s+me)[:\s\n]+([\s\S]{30,500}?)(?=\n\s*\n|\n\s*(?:experience|education|skills|$))/i);
// //   if (summaryM) summary = summaryM[1].replace(/\s+/g, ' ').trim().slice(0, 300);

// //   const experience = experienceYears > 0
// //     ? experienceYears + ' Year' + (experienceYears !== 1 ? 's' : '')
// //     : 'Fresher';

// //   return { name, email, phone, city, country, experience, experienceYears, skills: skillsArr, jobTitles: foundTitles.slice(0, 5), summary, linkedinUrl };
// // }

// // // ─────────────────────────────────────────
// // // GEMINI RETRY WRAPPER
// // // ─────────────────────────────────────────
// // async function callGeminiWithRetry(genAI, prompt, maxRetries = 3) {
// //   const delays = [3000, 8000, 15000];
// //   for (let attempt = 0; attempt <= maxRetries; attempt++) {
// //     try {
// //       const response = await genAI.models.generateContent({
// //         model: 'gemini-2.5-flash',
// //         contents: prompt,
// //         config: { temperature: 0, maxOutputTokens: 2048 },
// //       });
// //       return response;
// //     } catch (e) {
// //       const errMsg = (e.message || '').toString();
// //       const is503 = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') ||
// //         errMsg.includes('high demand') || errMsg.includes('overloaded') ||
// //         errMsg.includes('temporarily unavailable');
// //       if (is503 && attempt < maxRetries) {
// //         const waitMs = delays[attempt] || 15000;
// //         console.log(`Gemini 503 — attempt ${attempt + 1}/${maxRetries}, retrying in ${waitMs / 1000}s...`);
// //         await new Promise(r => setTimeout(r, waitMs));
// //         continue;
// //       }
// //       throw e;
// //     }
// //   }
// // }

// // // ─────────────────────────────────────────
// // // AI PARSER — Gemini (primary)
// // // ─────────────────────────────────────────
// // async function parseCVWithAI(text, originalFileName) {
// //   if (!text || text.trim().length < 30) return buildResult({}, originalFileName);

// //   const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// //   if (!GEMINI_API_KEY) {
// //     console.log('No GEMINI_API_KEY — using local parser');
// //     return buildResult(localParse(text, originalFileName), originalFileName);
// //   }

// //   try {
// //     const { GoogleGenAI } = require('@google/genai');
// //     const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
// //     const cvText = text.slice(0, 5000);

// //     const prompt = `You are a professional CV/Resume parser. Extract data from the CV below.
// // Return ONLY a raw JSON object. No markdown, no backticks, no explanation, no extra text — ONLY the JSON.

// // Required JSON format:
// // {"name":"","email":"","phone":"","city":"","country":"","experience":"X Years or Fresher","experienceYears":0,"skills":[],"jobTitles":[],"summary":"","linkedinUrl":""}

// // EXTRACTION RULES:
// // 1. name: Candidate full name from top of CV. Can be ALL CAPS ("ROBERTO CARNEVALI"), Title Case ("Roberto Carnevali"), or mixed. Convert to Title Case always. Must be 1-5 words, letters/hyphens/apostrophes only. NEVER a company, university, job title, address, or email. Extract from filename as last resort (e.g. "John_Smith_CV.pdf" → "John Smith"). ALWAYS return a name — never return empty string "".
// // 2. email: Candidate email address. Return "" if not found.
// // 3. phone: COMPLETE phone number with country code. COPY every single digit exactly as written. "+41 77 453 27 36" must be returned as "+41 77 453 27 36" — never truncate. Return "" if not found.
// // 4. city: City/town name only (e.g. "Zurich", "London", "Mumbai"). Never return a country, email, URL, or LinkedIn here. Return "" if not found.
// // 5. country: Country from address or nationality field (e.g. "Switzerland", "India", "UK"). Return "" if not clearly stated.
// // 6. experience: Calculate TOTAL work experience by adding up EACH role individually.
// //    Step 1: List every single job role with its start and end date.
// //    Step 2: Calculate duration of EACH role separately in years+months.
// //    Step 3: SUM all durations together — do NOT subtract, do NOT skip any role.
// //    Step 4: Round to nearest whole year.
// //    RULES:
// //    - "Present/Current/Now" = 2026
// //    - Count ALL roles including part-time, contract, freelance
// //    - Do NOT exclude any role unless it is clearly marked as "Education" or "Internship"
// //    - If two roles overlap in time, count BOTH fully (candidate worked both simultaneously)
// //    - Return "X Years" format. Example: Role1=4yr + Role2=10yr + Role3=8yr + Role4=4yr = "26 Years"
// // 7. experienceYears: Same total as above but as integer (e.g. 8).
// // 8. skills: All technical/professional skills listed in CV. Max 15, as JSON string array.
// // 9. jobTitles: Job titles/roles the person has held at companies. Max 5, as JSON string array.
// // 10. summary: The professional summary or objective text from CV. Max 300 characters. Return "" if not found.
// // 11. linkedinUrl: Full LinkedIn URL (e.g. "https://www.linkedin.com/in/username"). Return "" if not found.

// // CV TEXT:
// // ${cvText}`;

// //     const response = await callGeminiWithRetry(genAI, prompt, 3);
// //     const aiText = (response.text || '').trim();
// //     if (!aiText) {
// //       console.log('Gemini returned empty response — using local parser');
// //       return buildResult(localParse(text, originalFileName), originalFileName);
// //     }

// //     let jsonStr = aiText
// //       .replace(/^```json\s*/i, '')
// //       .replace(/^```\s*/i, '')
// //       .replace(/\s*```$/i, '')
// //       .trim();
// //     const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
// //     if (jsonMatch) jsonStr = jsonMatch[0];

// //     const ai = JSON.parse(jsonStr);
// //     const local = localParse(text, originalFileName);

// //     const result = {
// //       name: cleanStr(ai.name) || cleanStr(local.name),
// //       email: cleanStr(ai.email) || cleanStr(local.email),
// //       phone: cleanStr(ai.phone) || cleanStr(local.phone),
// //       city: cleanStr(ai.city) || cleanStr(local.city),
// //       country: cleanStr(ai.country) || cleanStr(local.country),
// //       experience: cleanStr(ai.experience) || cleanStr(local.experience) || 'Fresher',
// //       experienceYears: parseInt(ai.experienceYears) || local.experienceYears || 0,
// //       skills: cleanArray(ai.skills, 15) || cleanArray(local.skills, 15),
// //       jobTitles: cleanArray(ai.jobTitles, 5) || cleanArray(local.jobTitles, 5),
// //       summary: cleanStr(ai.summary) || cleanStr(local.summary),
// //       linkedinUrl: cleanStr(ai.linkedinUrl) || cleanStr(local.linkedinUrl),
// //     };

// //     console.log('Gemini parsed:', result.name,
// //       '| phone:', result.phone, '| city:', result.city,
// //       '| country:', result.country, '| exp:', result.experience,
// //       '| skills:', result.skills ? result.skills.length : 0);

// //     return buildResult(result, originalFileName);
// //   } catch (e) {
// //     console.log('Gemini error (all retries exhausted):', e.message, '— falling back to local parser');
// //     return buildResult(localParse(text, originalFileName), originalFileName);
// //   }
// // }

// // // ─────────────────────────────────────────
// // // HELPER FUNCTIONS
// // // ─────────────────────────────────────────
// // function cleanStr(v) {
// //   if (!v || typeof v !== 'string') return '';
// //   const s = v.trim();
// //   if (s === '' || s === 'null' || s === 'undefined' || s === 'N/A' || s === 'n/a') return '';
// //   return s;
// // }

// // function cleanArray(arr, max) {
// //   if (!Array.isArray(arr) || arr.length === 0) return null;
// //   const cleaned = arr.map(s => (s || '').toString().trim()).filter(Boolean);
// //   return cleaned.length > 0 ? cleaned.slice(0, max) : null;
// // }

// // function buildResult(data, originalFileName) {
// //   let name = (data.name || '').toString().trim().slice(0, 100);
// //   if (!name && originalFileName) {
// //     const fromFile = originalFileName
// //       .replace(/\.[^.]+$/, '')
// //       .replace(/[_\-]+/g, ' ')
// //       .replace(/\d{8,}/g, '')
// //       .replace(/\s*(cv|resume|curriculum|vitae)\s*/gi, '')
// //       .trim();
// //     if (fromFile && fromFile.length > 2) {
// //       name = fromFile.split(/\s+/)
// //         .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
// //         .join(' ').slice(0, 100);
// //     }
// //   }
// //   return {
// //     name,
// //     email: (data.email || '').toString().toLowerCase().trim(),
// //     phone: (data.phone || '').toString().trim(),
// //     city: (data.city || '').toString().trim().slice(0, 100),
// //     country: (data.country || '').toString().trim().slice(0, 100),
// //     experience: (data.experience || 'Fresher').toString().trim(),
// //     experienceYears: parseInt(data.experienceYears) || 0,
// //     skills: Array.isArray(data.skills) ? data.skills.slice(0, 15) : [],
// //     jobTitles: Array.isArray(data.jobTitles) ? data.jobTitles.slice(0, 5) : [],
// //     summary: (data.summary || '').toString().trim().slice(0, 300),
// //     linkedinUrl: (data.linkedinUrl || '').toString().trim(),
// //   };
// // }

// // // ─────────────────────────────────────────
// // // PROCESS SINGLE CV
// // // Duplicate check: originalFileName already
// // // exist karta hai DB mein toh skip karo.
// // // ─────────────────────────────────────────
// // async function processSingleCV(filePath, originalName, batchId) {
// //   try {
// //     // ── DUPLICATE CHECK ──────────────────
// //     // Agar yeh file pehle se DB mein hai toh
// //     // process mat karo, silently skip karo.
// //     if (await isDuplicate(originalName)) {
// //       // Disk pe jo naya file save hua hai usse bhi clean karo
// //       try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) { }
// //       return null; // null = skipped
// //     }
// //     // ─────────────────────────────────────

// //     console.log(`Processing: ${originalName} | Path: ${filePath}`);

// //     if (!fs.existsSync(filePath)) {
// //       throw new Error(`File not found on disk: ${filePath}`);
// //     }

// //     const ext = path.extname(originalName).toLowerCase();
// //     let rawText = '';
// //     if (ext === '.pdf') {
// //       rawText = await extractTextFromPDF(filePath);
// //     } else if (ext === '.docx' || ext === '.doc') {
// //       rawText = await extractTextFromDOCX(filePath);
// //     }

// //     console.log('rawText length for', originalName, ':', rawText.length);

// //     const parsed = await parseCVWithAI(rawText, originalName);
// //     const savedFileName = path.basename(filePath);
// //     const finalFilePath = '/uploads/cvs/' + savedFileName;

// //     let fileSize = 0;
// //     try { fileSize = fs.statSync(filePath).size; } catch (e) { }

// //     const cv = new CVUpload({
// //       ...parsed,
// //       originalFileName: originalName,
// //       filePath: finalFilePath,
// //       fileSize,
// //       status: 'processed',
// //       rawText: rawText.slice(0, 5000),
// //       batchId,
// //     });
// //     await cv.save();

// //     const cleanName = (
// //       parsed.name ||
// //       originalName.replace(/\.[^.]+$/, '').replace(/[_\-?]+/g, ' ').replace(/\d{10,}/g, '').trim().slice(0, 80)
// //     ) || 'CV Candidate';

// //     if (parsed.email) {
// //       let user = await User.findOne({ email: parsed.email });
// //       if (user) {
// //         user.resumes.unshift({ resumeTitle: originalName, resumePdf: finalFilePath, selected: false });
// //         if (!user.experience && parsed.experience) user.experience = parsed.experience;
// //         if ((!user.city || user.city === 'N/A') && parsed.city) user.city = parsed.city;
// //         if ((!user.country || user.country === '' || user.country === 'N/A') && parsed.country) user.country = parsed.country;
// //         if (parsed.jobTitles && parsed.jobTitles.length > 0) user.cvJobTitles = parsed.jobTitles;
// //         await user.save();
// //         cv.userId = user._id;
// //         await cv.save();
// //         console.log('Resume added to existing user:', user.email);
// //       } else {
// //         const newUser = new User({
// //           name: cleanName, email: parsed.email, phone: parsed.phone || '',
// //           experience: parsed.experience || 'Fresher', city: parsed.city || 'N/A',
// //           state: 'N/A', country: parsed.country || '', cvJobTitles: parsed.jobTitles || [],
// //           password: Math.random().toString(36).slice(-8) + 'Aa1!',
// //           resumes: [{ resumeTitle: originalName, resumePdf: finalFilePath, selected: true }],
// //         });
// //         await newUser.save();
// //         cv.userId = newUser._id;
// //         await cv.save();
// //         console.log('New user created:', parsed.email, '| country:', parsed.country);
// //       }
// //     } else {
// //       const placeholderEmail = 'cv.' + Date.now() + '.' + Math.random().toString(36).slice(-5) + '@cv-upload.com';
// //       const newUser = new User({
// //         name: cleanName, email: placeholderEmail, phone: parsed.phone || '',
// //         experience: parsed.experience || 'Fresher', city: parsed.city || 'N/A',
// //         state: 'N/A', country: parsed.country || '', cvJobTitles: parsed.jobTitles || [],
// //         password: Math.random().toString(36).slice(-8) + 'Aa1!',
// //         resumes: [{ resumeTitle: originalName, resumePdf: finalFilePath, selected: true }],
// //       });
// //       await newUser.save();
// //       cv.userId = newUser._id;
// //       await cv.save();
// //       console.log('New user (no email) for:', originalName);
// //     }

// //     console.log(`✅ Successfully processed: ${originalName}`);
// //     return cv;

// //   } catch (error) {
// //     console.error(`❌ Failed processing ${originalName}:`, error.message);
// //     throw error;
// //   }
// // }

// // // ─────────────────────────────────────────
// // // ZIP EXTRACTOR
// // // ─────────────────────────────────────────
// // async function extractAndProcessZip(zipPath, batchId) {
// //   await new Promise(r => setTimeout(r, 300));

// //   if (!fs.existsSync(zipPath)) {
// //     throw new Error('ZIP file not found on disk: ' + zipPath);
// //   }

// //   const unzipper = require('unzipper');
// //   const validExts = ['.pdf', '.doc', '.docx'];
// //   const destDir = './public/uploads/cvs/';
// //   if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

// //   let directory;
// //   try {
// //     directory = await unzipper.Open.file(zipPath);
// //   } catch (err) {
// //     throw new Error('Cannot open ZIP file: ' + err.message);
// //   }

// //   const zipSizeMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
// //   console.log(`ZIP opened: ${path.basename(zipPath)} (${zipSizeMB} MB) | total entries: ${directory.files.length}`);

// //   let processed = 0;
// //   let skipped = 0;
// //   let failed = 0;

// //   for (const entry of directory.files) {
// //     if (entry.type === 'Directory') continue;

// //     const entryExt = path.extname(entry.path).toLowerCase();
// //     if (!validExts.includes(entryExt)) continue;

// //     const rawBase = path.basename(entry.path);

// //     // ── DUPLICATE CHECK (ZIP level) ──────
// //     // DB query karne se pehle hi check karo
// //     // taaki file extract bhi na karna pade
// //     if (await isDuplicate(rawBase)) {
// //       skipped++;
// //       continue; // extract hi mat karo
// //     }
// //     // ─────────────────────────────────────

// //     const baseNoExt = path.basename(rawBase, path.extname(rawBase));
// //     const safeName = sanitizeFilename(baseNoExt);
// //     const destName = Date.now() + '_' + Math.random().toString(36).slice(-4) + '_' + safeName + entryExt;
// //     const destPath = path.join(destDir, destName);

// //     try {
// //       await new Promise((resolve, reject) => {
// //         const timeout = setTimeout(() => reject(new Error('Entry extraction timeout')), 30000);
// //         entry.stream()
// //           .pipe(fs.createWriteStream(destPath))
// //           .on('finish', () => { clearTimeout(timeout); resolve(); })
// //           .on('error', (e) => { clearTimeout(timeout); reject(e); });
// //       });

// //       if ((processed + failed) > 0 && (processed + failed) % 50 === 0) {
// //         await new Promise(r => setTimeout(r, 200));
// //       }

// //       const result = await processSingleCV(destPath, rawBase, batchId);
// //       if (result === null) {
// //         skipped++; // processSingleCV ne bhi skip kar diya (race condition fallback)
// //       } else {
// //         processed++;
// //       }

// //     } catch (e) {
// //       failed++;
// //       console.error(`ZIP entry error [${rawBase}]:`, e.message);
// //       try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (_) { }
// //     }
// //   }

// //   try { fs.unlinkSync(zipPath); } catch (e) { }

// //   console.log(`ZIP complete — processed: ${processed}, skipped (duplicates): ${skipped}, failed: ${failed}`);
// //   return { processed, skipped, failed };
// // }

// // // ─────────────────────────────────────────
// // // CONTROLLERS
// // // ─────────────────────────────────────────

// // exports.getUploadPage = async (req, res) => {
// //   try {
// //     const totalCVs = await CVUpload.countDocuments();
// //     const processedCVs = await CVUpload.countDocuments({ status: 'processed' });
// //     const failedCVs = await CVUpload.countDocuments({ status: 'failed' });
// //     const pendingCVs = await CVUpload.countDocuments({ status: 'pending' });
// //     res.render('cv_upload', { totalCVs, processedCVs, failedCVs, pendingCVs });
// //   } catch (error) {
// //     req.flash('red', error.message);
// //     res.redirect('/');
// //   }
// // };

// // exports.postUploadCVs = async (req, res) => {
// //   try {
// //     if (!req.files || req.files.length === 0) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'No files uploaded. Please select at least one file.',
// //       });
// //     }

// //     const batchId = 'batch_' + Date.now();
// //     let processed = 0;
// //     let skipped = 0;
// //     let failed = 0;

// //     for (const file of req.files) {
// //       const ext = path.extname(file.originalname).toLowerCase();

// //       if (ext === '.zip') {
// //         try {
// //           const result = await extractAndProcessZip(file.path, batchId);
// //           processed += result.processed;
// //           skipped += result.skipped || 0;
// //           failed += result.failed;
// //         } catch (e) {
// //           failed++;
// //           console.error('ZIP processing error:', e.message);
// //           try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (_) { }
// //         }
// //       } else {
// //         // Direct PDF / DOC / DOCX
// //         const result = await processSingleCV(file.path, file.originalname, batchId).catch(e => {
// //           failed++;
// //           console.error(`CV error [${file.originalname}]:`, e.message);
// //           return null;
// //         });
// //         if (result === null && !failed) {
// //           skipped++; // was a duplicate
// //         } else if (result !== null) {
// //           processed++;
// //         }
// //       }
// //     }

// //     // Response message mein skipped count bhi dikhao
// //     let msg = `Upload complete! Processed: ${processed}`;
// //     if (skipped > 0) msg += `, Skipped (already uploaded): ${skipped}`;
// //     if (failed > 0) msg += `, Failed: ${failed}`;

// //     res.status(200).json({ success: true, processed, skipped, failed, message: msg });

// //   } catch (error) {
// //     console.error('Upload error:', error.message);
// //     res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
// //   }
// // };

// // exports.searchCVs = async (req, res) => {
// //   try {
// //     const { search, skill, minExp, maxExp, city, page = 1 } = req.query;
// //     const limit = 20;
// //     const skip = (page - 1) * limit;
// //     let query = {};
// //     if (search) {
// //       query.$or = [
// //         { name: { $regex: search, $options: 'i' } },
// //         { email: { $regex: search, $options: 'i' } },
// //         { rawText: { $regex: search, $options: 'i' } },
// //       ];
// //     }
// //     if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };
// //     if (minExp !== undefined && minExp !== '')
// //       query.experienceYears = { ...query.experienceYears, $gte: parseInt(minExp) };
// //     if (maxExp !== undefined && maxExp !== '')
// //       query.experienceYears = { ...query.experienceYears, $lte: parseInt(maxExp) };
// //     if (city) query.city = { $regex: city, $options: 'i' };

// //     const total = await CVUpload.countDocuments(query);
// //     const cvs = await CVUpload.find(query).sort('-date').skip(skip).limit(limit).lean();
// //     const totalPages = Math.ceil(total / limit);
// //     res.render('cv_search', { cvs, total, totalPages, currentPage: parseInt(page), query: req.query });
// //   } catch (error) {
// //     req.flash('red', error.message);
// //     res.redirect('/cv-upload');
// //   }
// // };

// // exports.viewCV = async (req, res) => {
// //   try {
// //     const cv = await CVUpload.findById(req.params.id).populate('userId');
// //     if (!cv) { req.flash('red', 'CV not found!'); return res.redirect('/cv-search'); }
// //     res.render('cv_view', { cv });
// //   } catch (error) {
// //     req.flash('red', error.message);
// //     res.redirect('/cv-search');
// //   }
// // };

// // exports.deleteCV = async (req, res) => {
// //   try {
// //     const cv = await CVUpload.findByIdAndDelete(req.params.id);
// //     if (cv && cv.filePath) {
// //       const fullPath = path.join(__dirname, '../../public', cv.filePath);
// //       try { if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath); } catch (e) { }
// //     }
// //     req.flash('green', 'CV deleted successfully.');
// //     res.redirect('/cv-search');
// //   } catch (error) {
// //     req.flash('red', error.message);
// //     res.redirect('/cv-search');
// //   }
// // };

// // exports.downloadCV = async (req, res) => {
// //   try {
// //     const cv = await CVUpload.findById(req.params.id);
// //     if (!cv || !cv.filePath) { req.flash('red', 'CV file not found!'); return res.redirect('/cv-search'); }
// //     const fullPath = path.join(__dirname, '../../public', cv.filePath);
// //     if (!fs.existsSync(fullPath)) {
// //       const fallbackPath = path.join(__dirname, '../../', cv.filePath);
// //       if (!fs.existsSync(fallbackPath)) { req.flash('red', 'File does not exist on server.'); return res.redirect('/cv-search'); }
// //       return res.download(fallbackPath, cv.originalFileName);
// //     }
// //     res.download(fullPath, cv.originalFileName);
// //   } catch (error) {
// //     req.flash('red', error.message);
// //     res.redirect('/cv-search');
// //   }
// // };

// // exports.getStats = async (req, res) => {
// //   try {
// //     const total = await CVUpload.countDocuments();
// //     const processed = await CVUpload.countDocuments({ status: 'processed' });
// //     const failed = await CVUpload.countDocuments({ status: 'failed' });
// //     const pending = await CVUpload.countDocuments({ status: 'pending' });
// //     res.json({ total, processed, failed, pending });
// //   } catch (e) {
// //     res.json({ error: e.message });
// //   }
// // };


// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');

// const CVUpload = require('../../models/cvUploadModel');
// const User = require('../../models/userModel');

// // ─────────────────────────────────────────
// // FILENAME SANITIZATION HELPER
// // ─────────────────────────────────────────
// function sanitizeFilename(rawName) {
//   let name = rawName || 'file';
//   try { name = decodeURIComponent(name); } catch (e) { }
//   name = name
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .normalize('NFC');
//   const translitMap = {
//     'ß': 'ss', 'æ': 'ae', 'ø': 'o', 'å': 'a',
//     'đ': 'd', 'ħ': 'h', 'ı': 'i', 'ł': 'l',
//     'ŋ': 'n', 'œ': 'oe', 'þ': 'th', 'ð': 'd',
//     'Æ': 'Ae', 'Ø': 'O', 'Å': 'A', 'Đ': 'D',
//     'Ħ': 'H', 'Ł': 'L', 'Ŋ': 'N', 'Œ': 'Oe',
//     'Þ': 'Th', 'Ð': 'D',
//   };
//   name = name.replace(/[^\u0000-\u007E]/g, ch => translitMap[ch] || '_');
//   name = name
//     .replace(/[^a-zA-Z0-9.\-\(\)]/g, '_')
//     .replace(/_{2,}/g, '_')
//     .replace(/^_+|_+$/g, '');
//   if (!name || name === '.') name = 'file';
//   return name;
// }

// // ─────────────────────────────────────────
// // MULTER CONFIG
// // ─────────────────────────────────────────
// const cvStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = './public/uploads/cvs/';
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     const baseNoExt = path.basename(file.originalname, path.extname(file.originalname));
//     const safeName = sanitizeFilename(baseNoExt);
//     const finalName = Date.now() + '_' + safeName + ext;
//     console.log(`Multer saved: ${finalName}  (original: ${file.originalname})`);
//     cb(null, finalName);
//   },
// });

// exports.cvUploader = multer({
//   storage: cvStorage,
//   limits: { fileSize: 1024 * 1024 * 2000, files: 5000 },
//   fileFilter: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (['.pdf', '.doc', '.docx', '.zip'].includes(ext)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF, DOC, DOCX, or ZIP files are allowed.'), false);
//     }
//   },
// }).array('cvFiles', 5000);

// // ─────────────────────────────────────────
// // DUPLICATE CHECK HELPER
// // ─────────────────────────────────────────
// async function isDuplicate(originalName) {
//   const existing = await CVUpload.findOne({ originalFileName: originalName }).lean();
//   if (existing) {
//     console.log(`⏭️  SKIPPED (duplicate): ${originalName}`);
//     return true;
//   }
//   return false;
// }

// // ─────────────────────────────────────────
// // TEXT EXTRACTION — PDF and DOCX
// // ─────────────────────────────────────────
// function fixTextEncoding(text, buffer) {
//   try {
//     if (text.includes('\ufffd') && buffer) {
//       const chardet = require('chardet');
//       const iconv = require('iconv-lite');
//       const detected = chardet.detect(buffer);
//       if (detected && detected !== 'UTF-8') {
//         const redecoded = iconv.decode(buffer, detected);
//         if (!redecoded.includes('\ufffd')) {
//           console.log('Re-decoded with:', detected);
//           return redecoded;
//         }
//       }
//       return text
//         .replace(/Gro\ufffdk/g, 'Großk')
//         .replace(/([a-zA-Z])\ufffd([a-zA-Z])/g, (m, a, b) => a + 'ß' + b)
//         .replace(/\ufffd/g, '');
//     }
//     return text;
//   } catch (e) {
//     return text.replace(/\ufffd/g, '');
//   }
// }

// async function extractTextFromPDF(filePath) {
//   return new Promise((resolve) => {
//     const timer = setTimeout(() => {
//       console.log('pdf-parse timeout:', filePath);
//       resolve('');
//     }, 15000);
//     try {
//       const pdfParseModule = require('pdf-parse');
//       const pdfParse = (typeof pdfParseModule === 'function')
//         ? pdfParseModule
//         : (pdfParseModule.default || pdfParseModule);

//       if (typeof pdfParse !== 'function') {
//         clearTimeout(timer);
//         console.log('pdf-parse is not a function — module shape:', typeof pdfParseModule);
//         resolve('');
//         return;
//       }

//       const buffer = fs.readFileSync(filePath);
//       pdfParse(buffer)
//         .then((data) => {
//           clearTimeout(timer);
//           let text = (data.text || '').trim();
//           text = fixTextEncoding(text, buffer);
//           console.log('PDF extracted chars:', text.length, 'from', path.basename(filePath));
//           resolve(text);
//         })
//         .catch((e) => {
//           clearTimeout(timer);
//           console.log('pdf-parse error:', e.message);
//           resolve('');
//         });
//     } catch (e) {
//       clearTimeout(timer);
//       console.log('pdf-parse require error:', e.message);
//       resolve('');
//     }
//   });
// }

// async function extractTextFromDOCX(filePath) {
//   try {
//     const mammoth = require('mammoth');
//     const buffer = fs.readFileSync(filePath);
//     const result = await mammoth.extractRawText({ buffer });
//     let text = (result.value || '').trim();
//     text = fixTextEncoding(text, buffer);
//     console.log('DOCX extracted chars:', text.length, 'from', path.basename(filePath));
//     return text;
//   } catch (e) {
//     console.log('mammoth error:', e.message);
//     return '';
//   }
// }

// // ─────────────────────────────────────────
// // LOCAL CV PARSER — IMPROVED
// // ─────────────────────────────────────────
// function localParse(text, originalFileName) {
//   if (!text) return {};
//   const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
//   const textLower = text.toLowerCase();

//   // ── HELPER ───────────────────────────────────────────
//   function toTitleCase(str) {
//     return str.split(/\s+/)
//       .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
//       .join(' ');
//   }

//   function looksLikeName(line) {
//     const words = line.trim().split(/\s+/);
//     if (words.length < 2 || words.length > 5) return false;
//     return words.every(w =>
//       w.length >= 2 &&
//       /^[A-Za-z\u00C0-\u00FF'\-\.]+$/.test(w) &&
//       !/^\d/.test(w)
//     );
//   }

//   // ── EMAIL ────────────────────────────────────────────
//   const emailM = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
//   const email = emailM ? emailM[0].toLowerCase() : '';

//   // ── PHONE ────────────────────────────────────────────
//   let phone = '';
//   const phoneLabelM = text.match(
//     /(?:phone|tel(?:efon)?|mobile|mob(?:ile)?|cell|handy|kontakt|fon|ph|contact)\s*[:\.\-\/]?\s*((?:\+\d{1,3}[\s\-]?)?[\d][\d\s\(\)\-\.]{6,30}\d)/i
//   );
//   if (phoneLabelM) {
//     phone = phoneLabelM[1].replace(/\s{2,}/g, ' ').trim();
//   }
//   if (!phone) {
//     const intlM = text.match(/(\+\d{1,3}[\s\-]?(?:\(\d{1,4}\)[\s\-]?)?\d[\d\s\-\.]{5,20}\d)/);
//     if (intlM) phone = intlM[1].replace(/\s{2,}/g, ' ').trim();
//   }
//   if (!phone) {
//     // Local 10-digit numbers
//     const localM = text.match(/\b(\d{5}[\s\-]?\d{5}|\d{3}[\s\-]?\d{3}[\s\-]?\d{4}|\d{4}[\s\-]?\d{3}[\s\-]?\d{4})\b/);
//     if (localM) phone = localM[1].replace(/\s{2,}/g, ' ').trim();
//   }
//   phone = phone.replace(/[\s\-\.]+$/, '').trim();

//   // ── SKIP PATTERNS ────────────────────────────────────
//   const skipLine = /^(curriculum|resume|cv |page |tel|phone|email|address|date|summary|objective|profile|experience|education|skills|about|references|professional|personal|key |languages|certif|linkedin|http|www\.|dear |to whom|university|college|institute|school|academy|bachelor|master|phd|mba|b\.sc|m\.sc|department|faculty|born|nationality|gender|dob|date of birth|marital|visa|driving)/i;
//   const institutionLine = /\b(university|college|institute|school|academy|foundation|hospital|clinic|ltd|inc|corp|llc|plc|gmbh|pvt|limited|solutions|services|technologies|systems|consulting|group|associates|international)\b/i;

//   // ── NAME ─────────────────────────────────────────────
//   let name = '';
//   for (const line of lines.slice(0, 12)) {
//     if (line.length < 3 || line.length > 80) continue;
//     if (line.includes('@') || line.includes('http') || line.includes('|') || line.includes('/') || line.includes(',')) continue;
//     if (skipLine.test(line) || institutionLine.test(line)) continue;
//     if (line.match(/^\d/)) continue;
//     if (looksLikeName(line)) {
//       name = toTitleCase(line.trim().split(/\s+/).slice(0, 4).join(' '));
//       break;
//     }
//   }
//   if (!name) {
//     for (const line of lines.slice(0, 6)) {
//       if (line.length < 3 || line.length > 50) continue;
//       if (line.includes('@') || line.includes('http') || line.includes('|') || line.includes('/')) continue;
//       if (skipLine.test(line) || institutionLine.test(line)) continue;
//       const words = line.trim().split(/\s+/);
//       if (words.length >= 2 && words.length <= 4) {
//         const allLetters = words.every(w => /^[A-Za-z\u00C0-\u00FF'\-\.]{2,}$/.test(w));
//         if (allLetters) { name = toTitleCase(words.join(' ')); break; }
//       }
//     }
//   }
//   if (!name && originalFileName) {
//     const fromFile = originalFileName
//       .replace(/\.[^.]+$/, '')
//       .replace(/[_\-]+/g, ' ')
//       .replace(/\d{8,}/g, '')
//       .replace(/\s*(cv|resume|curriculum|vitae)\s*/gi, '')
//       .trim();
//     if (fromFile && fromFile.length > 2) name = toTitleCase(fromFile.slice(0, 50));
//   }

//   // ── CITY — IMPROVED ──────────────────────────────────
//   let city = '';

//   // Pattern 1: Labeled "Location:", "City:", "Based in:", "Ort:" etc.
//   const cityLabelPatterns = [
//     /(?:location|city|based\s+in|residing\s+in|current\s+location|present\s+location)\s*[:\-|]\s*([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,40}?)(?:\n|,|\||\d|$)/i,
//     /(?:address)\s*[:\-]\s*(?:[\w\s,]+,\s*)?([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,30}?)(?:\s*,?\s*(?:IN|UK|US|USA|AU|CA|DE|\d{5,6})|$|\n)/i,
//     /(?:ort|wohnort)\s*[:\-]\s*([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,30}?)(?:\n|,|$)/i,
//   ];
//   for (const pattern of cityLabelPatterns) {
//     const m = text.match(pattern);
//     if (m && m[1]) {
//       const candidate = m[1].split(',')[0].trim();
//       if (candidate.length >= 2 && candidate.length <= 50 && !/^\d/.test(candidate)) {
//         city = candidate;
//         break;
//       }
//     }
//   }

//   // Pattern 2: "City, State/Country" in first 8 lines
//   if (!city) {
//     for (const line of lines.slice(0, 8)) {
//       if (line.includes('@') || line.includes('http') || line.includes('linkedin')) continue;
//       const cityStateM = line.match(/^([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,30}),\s*([A-Za-z]{2,30})(?:\s*[\d\-\|]|$)/);
//       if (cityStateM) {
//         const cand = cityStateM[1].trim();
//         if (cand.length >= 2 && cand.length <= 40 &&
//           !cand.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i) &&
//           !skipLine.test(cand)) {
//           city = cand;
//           break;
//         }
//       }
//     }
//   }

//   // Pattern 3: Pipe-separated header "Name | City | Phone | Email"
//   if (!city) {
//     for (const line of lines.slice(0, 6)) {
//       if (!line.includes('|')) continue;
//       const parts = line.split('|').map(p => p.trim());
//       for (const p of parts) {
//         if (!p || p.includes('@') || p.includes('http') || p.match(/^\d{4,}/) || p.length > 50) continue;
//         if (p.match(/^[A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,35}$/) && !skipLine.test(p) && !institutionLine.test(p)) {
//           const candidate = p.split(',')[0].trim();
//           if (candidate.length >= 2 && candidate !== name) {
//             city = candidate;
//             break;
//           }
//         }
//       }
//       if (city) break;
//     }
//   }

//   // Pattern 4: "• Mumbai, India" or "- Delhi, India" bullet format
//   if (!city) {
//     const bulletCityM = text.match(/[•\-–]\s*([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,30}),\s*(?:India|Germany|UK|USA|UAE|Canada|Australia|France|Singapore|[A-Z][a-z]{2,})/);
//     if (bulletCityM) city = bulletCityM[1].trim();
//   }

//   // Pattern 5: Indian PIN code hint — "Mumbai - 400001" or "400001, Mumbai"
//   if (!city) {
//     const pinM = text.match(/([A-Za-z\u00c0-\u024f][A-Za-z\s\-]{2,25})\s*[\-,]?\s*\d{6}\b/);
//     if (pinM) {
//       const cand = pinM[1].replace(/^[\s,\-]+|[\s,\-]+$/g, '').trim();
//       if (cand.length >= 2 && !skipLine.test(cand)) city = cand;
//     }
//   }
//   if (!city) {
//     const pinM2 = text.match(/\b\d{6}\b\s*,?\s*([A-Za-z\u00c0-\u024f][A-Za-z\s\-]{2,25})/);
//     if (pinM2) {
//       const cand = pinM2[1].trim();
//       if (cand.length >= 2 && !skipLine.test(cand)) city = cand;
//     }
//   }

//   city = city.replace(/[\.,\-]+$/, '').trim().slice(0, 100);

//   // ── COUNTRY ──────────────────────────────────────────
//   const countryMap = {
//     'india': 'India', 'germany': 'Germany', 'deutschland': 'Germany',
//     'united kingdom': 'United Kingdom', 'uk': 'United Kingdom',
//     'england': 'United Kingdom', 'scotland': 'United Kingdom', 'wales': 'United Kingdom',
//     'united states': 'USA', 'usa': 'USA', 'u\\.s\\.a': 'USA', 'us': 'USA', 'america': 'USA',
//     'canada': 'Canada', 'australia': 'Australia', 'new zealand': 'New Zealand',
//     'france': 'France', 'spain': 'Spain', 'italy': 'Italy',
//     'netherlands': 'Netherlands', 'holland': 'Netherlands',
//     'belgium': 'Belgium', 'switzerland': 'Switzerland', 'austria': 'Austria',
//     'sweden': 'Sweden', 'norway': 'Norway', 'denmark': 'Denmark',
//     'finland': 'Finland', 'portugal': 'Portugal', 'poland': 'Poland',
//     'russia': 'Russia', 'china': 'China', 'japan': 'Japan',
//     'south korea': 'South Korea', 'korea': 'South Korea',
//     'singapore': 'Singapore', 'malaysia': 'Malaysia', 'indonesia': 'Indonesia',
//     'thailand': 'Thailand', 'vietnam': 'Vietnam', 'philippines': 'Philippines',
//     'pakistan': 'Pakistan', 'bangladesh': 'Bangladesh', 'sri lanka': 'Sri Lanka',
//     'nepal': 'Nepal', 'uae': 'UAE', 'united arab emirates': 'UAE', 'dubai': 'UAE',
//     'saudi arabia': 'Saudi Arabia', 'qatar': 'Qatar', 'kuwait': 'Kuwait',
//     'bahrain': 'Bahrain', 'south africa': 'South Africa', 'nigeria': 'Nigeria',
//     'kenya': 'Kenya', 'ghana': 'Ghana', 'egypt': 'Egypt',
//     'brazil': 'Brazil', 'mexico': 'Mexico', 'argentina': 'Argentina',
//     'colombia': 'Colombia', 'chile': 'Chile',
//   };
//   let country = '';
//   const countryLabelM = text.match(/(?:country|nationality|citizenship)\s*[:\-\|]\s*([A-Za-z\s]{2,40}?)(?:\n|,|$)/i);
//   if (countryLabelM) {
//     const candidate = countryLabelM[1].trim().toLowerCase();
//     for (const [key, val] of Object.entries(countryMap)) {
//       if (new RegExp('\\b' + key + '\\b').test(candidate)) { country = val; break; }
//     }
//   }
//   if (!country) {
//     for (const [key, val] of Object.entries(countryMap)) {
//       if (new RegExp('\\b' + key + '\\b').test(textLower)) { country = val; break; }
//     }
//   }

//   // ── SKILLS ───────────────────────────────────────────
//   const skills = new Set();
//   const skillsSectionM = text.match(/(?:key\s+skills?|technical\s+skills?|skills?|competencies|expertise|technologies|tools?)[:\s\n]+([\s\S]{10,600}?)(?=\n\s*\n|\n\s*(?:education|experience|employment|references|languages|certif|awards|$))/i);
//   const skillsText = skillsSectionM ? skillsSectionM[1] : text;
//   skillsText.split('|').forEach(s => {
//     const clean = s.replace(/[\n\r]/g, ' ').trim();
//     if (clean.length > 2 && clean.length < 60 && clean.match(/[A-Za-z]{2,}/) && !clean.match(/^\d/))
//       skills.add(clean);
//   });
//   skillsText.split(/[\n,•\*\u2022\u25CF\u25AA]/).forEach(s => {
//     const clean = s.replace(/^[\s\-–]+/, '').trim();
//     if (clean.length > 2 && clean.length < 60 && clean.match(/[A-Za-z]{2,}/) && !clean.match(/^\d{4}/))
//       skills.add(clean);
//   });
//   const badSkill = /^(skills?|competencies|expertise|key|and|the|with|for|or|in|to|of|i|a)$/i;
//   const skillsArr = [...skills].filter(s => !badSkill.test(s)).slice(0, 15);

//   // ── JOB TITLES ───────────────────────────────────────
//   const titleKeywords = [
//     'coach', 'manager', 'director', 'scout', 'analyst', 'recruiter',
//     'developer', 'engineer', 'designer', 'consultant', 'advisor', 'trainer',
//     'coordinator', 'executive', 'officer', 'therapist', 'instructor',
//     'physiotherapist', 'scientist', 'specialist', 'head of', 'assistant',
//     'architect', 'lead', 'senior', 'junior', 'intern', 'associate',
//     'technician', 'operator', 'supervisor', 'administrator', 'controller',
//   ];
//   const foundTitles = [];
//   lines.forEach(line => {
//     titleKeywords.forEach(t => {
//       if (new RegExp('\\b' + t + '\\b', 'i').test(line) && line.length < 100) {
//         const clean = line.replace(/[|•\-–*\(\)]/g, '').trim().slice(0, 60);
//         if (!foundTitles.includes(clean) && clean.length > 3) foundTitles.push(clean);
//       }
//     });
//   });

//   // ── EXPERIENCE — IMPROVED TOTAL SUM ──────────────────
//   let experienceYears = 0;
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth() + 1;

//   const monthMap = {
//     jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
//     apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
//     aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10,
//     nov: 11, november: 11, dec: 12, december: 12,
//   };

//   // Step 1: Direct statement — "8+ years of experience"
//   const directExpM = text.match(/(\d+)\s*\+?\s*(years?|yrs?)\s*(of\s+)?(experience|exp\.?|work(?:ing)?|professional)/i);
//   if (directExpM) {
//     experienceYears = parseInt(directExpM[1]);
//   }

//   // Step 2: Extract experience section to avoid counting education dates
//   const expSectionM = text.match(
//     /(?:(?:work|professional|employment|career)\s+)?experience[:\s]*\n([\s\S]*?)(?=\n\s*(?:education|academic|qualification|certif|skills|languages|references|volunteer|awards|interests|hobbies|$))/i
//   );
//   const expText = expSectionM ? expSectionM[1] : text;

//   // Step 3: Parse ALL date ranges and SUM every single role
//   // Handles: "Jan 2018 – Present", "2015 - 2019", "March 2020 to Current", "2018–2022"
//   const rangeRegex = /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{4})\s*(?:[\u2013\u2014\u2012\u2010\-]+|to|till|until)\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow|[Tt]ill\s*[Dd]ate|[Tt]oday)/gi;

//   // Handles: "06/2017 – 08/2021", "03/2020 - Present"
//   const slashRangeRegex = /(\d{1,2})\/(\d{4})\s*[\u2013\u2014\-–]+\s*(?:(\d{1,2})\/)?(\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow)/gi;

//   let allRanges = [];
//   let rm;

//   // Parse word-based ranges
//   while ((rm = rangeRegex.exec(expText)) !== null) {
//     const startMonthKey = rm[1] ? rm[1].toLowerCase().slice(0, 3) : '';
//     const startMonth = monthMap[startMonthKey] || 1;
//     const startYear = parseInt(rm[2]);
//     const isPresent = /present|current|now|till\s*date|today/i.test(rm[4]);
//     const endMonthKey = rm[3] ? rm[3].toLowerCase().slice(0, 3) : '';
//     const endMonth = rm[3]
//       ? (monthMap[endMonthKey] || (isPresent ? currentMonth : 12))
//       : (isPresent ? currentMonth : 12);
//     const endYear = isPresent ? currentYear : parseInt(rm[4]);

//     if (startYear >= 1970 && startYear <= currentYear + 1 && endYear >= startYear && endYear <= currentYear + 1) {
//       const months = (endYear - startYear) * 12 + (endMonth - startMonth);
//       if (months > 0 && months < 600) {
//         allRanges.push({ startYear, startMonth, endYear, endMonth, months });
//       }
//     }
//   }

//   // Parse MM/YYYY ranges
//   while ((rm = slashRangeRegex.exec(expText)) !== null) {
//     const startMonth = parseInt(rm[1]);
//     const startYear = parseInt(rm[2]);
//     const isPresent = /present|current|now/i.test(rm[4]);
//     const endMonth = rm[3] ? parseInt(rm[3]) : (isPresent ? currentMonth : 12);
//     const endYear = isPresent ? currentYear : parseInt(rm[4]);

//     if (startYear >= 1970 && startYear <= currentYear + 1 && endYear >= startYear &&
//       startMonth >= 1 && startMonth <= 12 && endMonth >= 1 && endMonth <= 12) {
//       const months = (endYear - startYear) * 12 + (endMonth - startMonth);
//       if (months > 0 && months < 600) {
//         allRanges.push({ startYear, startMonth, endYear, endMonth, months });
//       }
//     }
//   }

//   // SUM ALL ranges (overlapping roles counted separately — both counted fully)
//   if (allRanges.length > 0) {
//     const totalMonths = allRanges.reduce((sum, r) => sum + r.months, 0);
//     const calcYears = Math.round(totalMonths / 12);
//     experienceYears = Math.max(experienceYears, calcYears);
//   }

//   // Step 4: Fallback — earliest year in experience text to now
//   if (experienceYears === 0 && expText) {
//     const allYears = (expText.match(/\b(19[7-9]\d|20[0-2]\d)\b/g) || [])
//       .map(Number).filter(y => y <= currentYear);
//     if (allYears.length > 0) {
//       experienceYears = currentYear - Math.min(...allYears);
//     }
//   }

//   // ── LINKEDIN ─────────────────────────────────────────
//   let linkedinUrl = '';
//   const linkedinM = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([a-zA-Z0-9\-_%]+)/i);
//   if (linkedinM) linkedinUrl = 'https://www.linkedin.com/in/' + linkedinM[1];
//   if (!linkedinUrl) {
//     const linkedinLabelM = text.match(/linkedin\s*(?:id|profile|url|:|\|)[\s:]*([a-zA-Z0-9\-_%\.\/]+)/i);
//     if (linkedinLabelM) {
//       const val = linkedinLabelM[1].trim();
//       if (val.includes('linkedin.com')) {
//         linkedinUrl = val.startsWith('http') ? val : 'https://www.' + val;
//       } else if (val.length > 2 && !val.includes('@')) {
//         linkedinUrl = 'https://www.linkedin.com/in/' + val.replace(/\/$/, '');
//       }
//     }
//   }

//   // ── SUMMARY ──────────────────────────────────────────
//   let summary = '';
//   const summaryM = text.match(/(?:professional\s+summary|career\s+summary|summary|objective|profile|about\s+me|executive\s+summary)[:\s\n]+([\s\S]{30,600}?)(?=\n\s*\n|\n\s*(?:experience|education|skills|employment|$))/i);
//   if (summaryM) summary = summaryM[1].replace(/\s+/g, ' ').trim().slice(0, 300);

//   const experience = experienceYears > 0
//     ? experienceYears + ' Year' + (experienceYears !== 1 ? 's' : '')
//     : 'Fresher';

//   return {
//     name,
//     email,
//     phone,
//     city,
//     country,
//     experience,
//     experienceYears,
//     skills: skillsArr,
//     jobTitles: foundTitles.slice(0, 5),
//     summary,
//     linkedinUrl,
//   };
// }

// // ─────────────────────────────────────────
// // GEMINI RETRY WRAPPER
// // ─────────────────────────────────────────
// async function callGeminiWithRetry(genAI, prompt, maxRetries = 3) {
//   const delays = [3000, 8000, 15000];
//   for (let attempt = 0; attempt <= maxRetries; attempt++) {
//     try {
//       const response = await genAI.models.generateContent({
//         model: 'gemini-2.5-flash',
//         contents: prompt,
//         config: { temperature: 0, maxOutputTokens: 2048 },
//       });
//       return response;
//     } catch (e) {
//       const errMsg = (e.message || '').toString();
//       const is503 = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') ||
//         errMsg.includes('high demand') || errMsg.includes('overloaded') ||
//         errMsg.includes('temporarily unavailable');
//       if (is503 && attempt < maxRetries) {
//         const waitMs = delays[attempt] || 15000;
//         console.log(`Gemini 503 — attempt ${attempt + 1}/${maxRetries}, retrying in ${waitMs / 1000}s...`);
//         await new Promise(r => setTimeout(r, waitMs));
//         continue;
//       }
//       throw e;
//     }
//   }
// }

// // ─────────────────────────────────────────
// // AI PARSER — Gemini (primary)
// // ─────────────────────────────────────────
// async function parseCVWithAI(text, originalFileName) {
//   if (!text || text.trim().length < 30) return buildResult({}, originalFileName);

//   const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
//   if (!GEMINI_API_KEY) {
//     console.log('No GEMINI_API_KEY — using local parser');
//     return buildResult(localParse(text, originalFileName), originalFileName);
//   }

//   try {
//     const { GoogleGenAI } = require('@google/genai');
//     const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
//     const cvText = text.slice(0, 5000);

//     const prompt = `You are a professional CV/Resume parser. Extract data from the CV below.
// Return ONLY a raw JSON object. No markdown, no backticks, no explanation, no extra text — ONLY the JSON.

// Required JSON format:
// {"name":"","email":"","phone":"","city":"","country":"","experience":"X Years or Fresher","experienceYears":0,"skills":[],"jobTitles":[],"summary":"","linkedinUrl":""}

// EXTRACTION RULES:
// 1. name: Candidate full name from top of CV. Can be ALL CAPS ("ROBERTO CARNEVALI"), Title Case ("Roberto Carnevali"), or mixed. Convert to Title Case always. Must be 1-5 words, letters/hyphens/apostrophes only. NEVER a company, university, job title, address, or email. Extract from filename as last resort (e.g. "John_Smith_CV.pdf" → "John Smith"). ALWAYS return a name — never return empty string "".
// 2. email: Candidate email address. Return "" if not found.
// 3. phone: COMPLETE phone number with country code. COPY every single digit exactly as written. "+41 77 453 27 36" must be returned as "+41 77 453 27 36" — never truncate. Return "" if not found.
// 4. city: City/town name only (e.g. "Zurich", "London", "Mumbai"). Never return a country, email, URL, or LinkedIn here. Return "" if not clearly stated.
// 5. country: Country from address or nationality field (e.g. "Switzerland", "India", "UK"). Return "" if not clearly stated.
// 6. experience: Calculate TOTAL work experience by adding up EACH role individually.
//    Step 1: List every single job role with its start and end date.
//    Step 2: Calculate duration of EACH role separately in years+months.
//    Step 3: SUM all durations together — do NOT subtract, do NOT skip any role.
//    Step 4: Round to nearest whole year.
//    RULES:
//    - "Present/Current/Now" = 2026
//    - Count ALL roles including part-time, contract, freelance
//    - Do NOT exclude any role unless it is clearly marked as "Education" or "Internship"
//    - If two roles overlap in time, count BOTH fully (candidate worked both simultaneously)
//    - Return "X Years" format. Example: Role1=4yr + Role2=10yr + Role3=8yr + Role4=4yr = "26 Years"
// 7. experienceYears: Same total as above but as integer (e.g. 8).
// 8. skills: All technical/professional skills listed in CV. Max 15, as JSON string array.
// 9. jobTitles: Job titles/roles the person has held at companies. Max 5, as JSON string array.
// 10. summary: The professional summary or objective text from CV. Max 300 characters. Return "" if not found.
// 11. linkedinUrl: Full LinkedIn URL (e.g. "https://www.linkedin.com/in/username"). Return "" if not found.

// CV TEXT:
// ${cvText}`;

//     const response = await callGeminiWithRetry(genAI, prompt, 3);
//     const aiText = (response.text || '').trim();
//     if (!aiText) {
//       console.log('Gemini returned empty response — using local parser');
//       return buildResult(localParse(text, originalFileName), originalFileName);
//     }

//     let jsonStr = aiText
//       .replace(/^```json\s*/i, '')
//       .replace(/^```\s*/i, '')
//       .replace(/\s*```$/i, '')
//       .trim();
//     const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
//     if (jsonMatch) jsonStr = jsonMatch[0];

//     const ai = JSON.parse(jsonStr);
//     const local = localParse(text, originalFileName);

//     const result = {
//       name: cleanStr(ai.name) || cleanStr(local.name),
//       email: cleanStr(ai.email) || cleanStr(local.email),
//       phone: cleanStr(ai.phone) || cleanStr(local.phone),
//       city: cleanStr(ai.city) || cleanStr(local.city),
//       country: cleanStr(ai.country) || cleanStr(local.country),
//       experience: cleanStr(ai.experience) || cleanStr(local.experience) || 'Fresher',
//       experienceYears: parseInt(ai.experienceYears) || local.experienceYears || 0,
//       skills: cleanArray(ai.skills, 15) || cleanArray(local.skills, 15),
//       jobTitles: cleanArray(ai.jobTitles, 5) || cleanArray(local.jobTitles, 5),
//       summary: cleanStr(ai.summary) || cleanStr(local.summary),
//       linkedinUrl: cleanStr(ai.linkedinUrl) || cleanStr(local.linkedinUrl),
//     };

//     console.log('Gemini parsed:', result.name,
//       '| phone:', result.phone, '| city:', result.city,
//       '| country:', result.country, '| exp:', result.experience,
//       '| skills:', result.skills ? result.skills.length : 0);

//     return buildResult(result, originalFileName);
//   } catch (e) {
//     console.log('Gemini error (all retries exhausted):', e.message, '— falling back to local parser');
//     return buildResult(localParse(text, originalFileName), originalFileName);
//   }
// }

// // ─────────────────────────────────────────
// // HELPER FUNCTIONS
// // ─────────────────────────────────────────
// function cleanStr(v) {
//   if (!v || typeof v !== 'string') return '';
//   const s = v.trim();
//   if (s === '' || s === 'null' || s === 'undefined' || s === 'N/A' || s === 'n/a') return '';
//   return s;
// }

// function cleanArray(arr, max) {
//   if (!Array.isArray(arr) || arr.length === 0) return null;
//   const cleaned = arr.map(s => (s || '').toString().trim()).filter(Boolean);
//   return cleaned.length > 0 ? cleaned.slice(0, max) : null;
// }

// function buildResult(data, originalFileName) {
//   let name = (data.name || '').toString().trim().slice(0, 100);
//   if (!name && originalFileName) {
//     const fromFile = originalFileName
//       .replace(/\.[^.]+$/, '')
//       .replace(/[_\-]+/g, ' ')
//       .replace(/\d{8,}/g, '')
//       .replace(/\s*(cv|resume|curriculum|vitae)\s*/gi, '')
//       .trim();
//     if (fromFile && fromFile.length > 2) {
//       name = fromFile.split(/\s+/)
//         .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
//         .join(' ').slice(0, 100);
//     }
//   }
//   return {
//     name,
//     email: (data.email || '').toString().toLowerCase().trim(),
//     phone: (data.phone || '').toString().trim(),
//     city: (data.city || '').toString().trim().slice(0, 100),
//     country: (data.country || '').toString().trim().slice(0, 100),
//     experience: (data.experience || 'Fresher').toString().trim(),
//     experienceYears: parseInt(data.experienceYears) || 0,
//     skills: Array.isArray(data.skills) ? data.skills.slice(0, 15) : [],
//     jobTitles: Array.isArray(data.jobTitles) ? data.jobTitles.slice(0, 5) : [],
//     summary: (data.summary || '').toString().trim().slice(0, 300),
//     linkedinUrl: (data.linkedinUrl || '').toString().trim(),
//   };
// }

// // ─────────────────────────────────────────
// // PROCESS SINGLE CV
// // ─────────────────────────────────────────
// async function processSingleCV(filePath, originalName, batchId) {
//   try {
//     if (await isDuplicate(originalName)) {
//       try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) { }
//       return null;
//     }

//     console.log(`Processing: ${originalName} | Path: ${filePath}`);

//     if (!fs.existsSync(filePath)) {
//       throw new Error(`File not found on disk: ${filePath}`);
//     }

//     const ext = path.extname(originalName).toLowerCase();
//     let rawText = '';
//     if (ext === '.pdf') {
//       rawText = await extractTextFromPDF(filePath);
//     } else if (ext === '.docx' || ext === '.doc') {
//       rawText = await extractTextFromDOCX(filePath);
//     }

//     console.log('rawText length for', originalName, ':', rawText.length);

//     const parsed = await parseCVWithAI(rawText, originalName);
//     const savedFileName = path.basename(filePath);
//     const finalFilePath = '/uploads/cvs/' + savedFileName;

//     let fileSize = 0;
//     try { fileSize = fs.statSync(filePath).size; } catch (e) { }

//     const cv = new CVUpload({
//       ...parsed,
//       originalFileName: originalName,
//       filePath: finalFilePath,
//       fileSize,
//       status: 'processed',
//       rawText: rawText.slice(0, 5000),
//       batchId,
//     });
//     await cv.save();

//     const cleanName = (
//       parsed.name ||
//       originalName.replace(/\.[^.]+$/, '').replace(/[_\-?]+/g, ' ').replace(/\d{10,}/g, '').trim().slice(0, 80)
//     ) || 'CV Candidate';

//     if (parsed.email) {
//       let user = await User.findOne({ email: parsed.email });
//       if (user) {
//         user.resumes.unshift({ resumeTitle: originalName, resumePdf: finalFilePath, selected: false });
//         if (!user.experience && parsed.experience) user.experience = parsed.experience;
//         if ((!user.city || user.city === 'N/A') && parsed.city) user.city = parsed.city;
//         if ((!user.country || user.country === '' || user.country === 'N/A') && parsed.country) user.country = parsed.country;
//         if (parsed.jobTitles && parsed.jobTitles.length > 0) user.cvJobTitles = parsed.jobTitles;
//         await user.save();
//         cv.userId = user._id;
//         await cv.save();
//         console.log('Resume added to existing user:', user.email);
//       } else {
//         const newUser = new User({
//           name: cleanName, email: parsed.email, phone: parsed.phone || '',
//           experience: parsed.experience || 'Fresher', city: parsed.city || 'N/A',
//           state: 'N/A', country: parsed.country || '', cvJobTitles: parsed.jobTitles || [],
//           password: Math.random().toString(36).slice(-8) + 'Aa1!',
//           resumes: [{ resumeTitle: originalName, resumePdf: finalFilePath, selected: true }],
//         });
//         await newUser.save();
//         cv.userId = newUser._id;
//         await cv.save();
//         console.log('New user created:', parsed.email, '| country:', parsed.country);
//       }
//     } else {
//       const placeholderEmail = 'cv.' + Date.now() + '.' + Math.random().toString(36).slice(-5) + '@cv-upload.com';
//       const newUser = new User({
//         name: cleanName, email: placeholderEmail, phone: parsed.phone || '',
//         experience: parsed.experience || 'Fresher', city: parsed.city || 'N/A',
//         state: 'N/A', country: parsed.country || '', cvJobTitles: parsed.jobTitles || [],
//         password: Math.random().toString(36).slice(-8) + 'Aa1!',
//         resumes: [{ resumeTitle: originalName, resumePdf: finalFilePath, selected: true }],
//       });
//       await newUser.save();
//       cv.userId = newUser._id;
//       await cv.save();
//       console.log('New user (no email) for:', originalName);
//     }

//     console.log(`✅ Successfully processed: ${originalName}`);
//     return cv;

//   } catch (error) {
//     console.error(`❌ Failed processing ${originalName}:`, error.message);
//     throw error;
//   }
// }

// // ─────────────────────────────────────────
// // ZIP EXTRACTOR
// // ─────────────────────────────────────────
// async function extractAndProcessZip(zipPath, batchId) {
//   await new Promise(r => setTimeout(r, 300));

//   if (!fs.existsSync(zipPath)) {
//     throw new Error('ZIP file not found on disk: ' + zipPath);
//   }

//   const unzipper = require('unzipper');
//   const validExts = ['.pdf', '.doc', '.docx'];
//   const destDir = './public/uploads/cvs/';
//   if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

//   let directory;
//   try {
//     directory = await unzipper.Open.file(zipPath);
//   } catch (err) {
//     throw new Error('Cannot open ZIP file: ' + err.message);
//   }

//   const zipSizeMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
//   console.log(`ZIP opened: ${path.basename(zipPath)} (${zipSizeMB} MB) | total entries: ${directory.files.length}`);

//   let processed = 0;
//   let skipped = 0;
//   let failed = 0;

//   for (const entry of directory.files) {
//     if (entry.type === 'Directory') continue;

//     const entryExt = path.extname(entry.path).toLowerCase();
//     if (!validExts.includes(entryExt)) continue;

//     const rawBase = path.basename(entry.path);

//     if (await isDuplicate(rawBase)) {
//       skipped++;
//       continue;
//     }

//     const baseNoExt = path.basename(rawBase, path.extname(rawBase));
//     const safeName = sanitizeFilename(baseNoExt);
//     const destName = Date.now() + '_' + Math.random().toString(36).slice(-4) + '_' + safeName + entryExt;
//     const destPath = path.join(destDir, destName);

//     try {
//       await new Promise((resolve, reject) => {
//         const timeout = setTimeout(() => reject(new Error('Entry extraction timeout')), 30000);
//         entry.stream()
//           .pipe(fs.createWriteStream(destPath))
//           .on('finish', () => { clearTimeout(timeout); resolve(); })
//           .on('error', (e) => { clearTimeout(timeout); reject(e); });
//       });

//       if ((processed + failed) > 0 && (processed + failed) % 50 === 0) {
//         await new Promise(r => setTimeout(r, 200));
//       }

//       const result = await processSingleCV(destPath, rawBase, batchId);
//       if (result === null) {
//         skipped++;
//       } else {
//         processed++;
//       }

//     } catch (e) {
//       failed++;
//       console.error(`ZIP entry error [${rawBase}]:`, e.message);
//       try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (_) { }
//     }
//   }

//   try { fs.unlinkSync(zipPath); } catch (e) { }

//   console.log(`ZIP complete — processed: ${processed}, skipped (duplicates): ${skipped}, failed: ${failed}`);
//   return { processed, skipped, failed };
// }

// // ─────────────────────────────────────────
// // CONTROLLERS
// // ─────────────────────────────────────────

// exports.getUploadPage = async (req, res) => {
//   try {
//     const totalCVs = await CVUpload.countDocuments();
//     const processedCVs = await CVUpload.countDocuments({ status: 'processed' });
//     const failedCVs = await CVUpload.countDocuments({ status: 'failed' });
//     const pendingCVs = await CVUpload.countDocuments({ status: 'pending' });
//     res.render('cv_upload', { totalCVs, processedCVs, failedCVs, pendingCVs });
//   } catch (error) {
//     req.flash('red', error.message);
//     res.redirect('/');
//   }
// };

// exports.postUploadCVs = async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No files uploaded. Please select at least one file.',
//       });
//     }

//     const batchId = 'batch_' + Date.now();
//     let processed = 0;
//     let skipped = 0;
//     let failed = 0;

//     for (const file of req.files) {
//       const ext = path.extname(file.originalname).toLowerCase();

//       if (ext === '.zip') {
//         try {
//           const result = await extractAndProcessZip(file.path, batchId);
//           processed += result.processed;
//           skipped += result.skipped || 0;
//           failed += result.failed;
//         } catch (e) {
//           failed++;
//           console.error('ZIP processing error:', e.message);
//           try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (_) { }
//         }
//       } else {
//         const result = await processSingleCV(file.path, file.originalname, batchId).catch(e => {
//           failed++;
//           console.error(`CV error [${file.originalname}]:`, e.message);
//           return null;
//         });
//         if (result === null && !failed) {
//           skipped++;
//         } else if (result !== null) {
//           processed++;
//         }
//       }
//     }

//     let msg = `Upload complete! Processed: ${processed}`;
//     if (skipped > 0) msg += `, Skipped (already uploaded): ${skipped}`;
//     if (failed > 0) msg += `, Failed: ${failed}`;

//     res.status(200).json({ success: true, processed, skipped, failed, message: msg });

//   } catch (error) {
//     console.error('Upload error:', error.message);
//     res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
//   }
// };

// exports.searchCVs = async (req, res) => {
//   try {
//     const { search, skill, minExp, maxExp, city, page = 1 } = req.query;
//     const limit = 20;
//     const skip = (page - 1) * limit;
//     let query = {};
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { rawText: { $regex: search, $options: 'i' } },
//       ];
//     }
//     if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };
//     if (minExp !== undefined && minExp !== '')
//       query.experienceYears = { ...query.experienceYears, $gte: parseInt(minExp) };
//     if (maxExp !== undefined && maxExp !== '')
//       query.experienceYears = { ...query.experienceYears, $lte: parseInt(maxExp) };
//     if (city) query.city = { $regex: city, $options: 'i' };

//     const total = await CVUpload.countDocuments(query);
//     const cvs = await CVUpload.find(query).sort('-date').skip(skip).limit(limit).lean();
//     const totalPages = Math.ceil(total / limit);
//     res.render('cv_search', { cvs, total, totalPages, currentPage: parseInt(page), query: req.query });
//   } catch (error) {
//     req.flash('red', error.message);
//     res.redirect('/cv-upload');
//   }
// };

// exports.viewCV = async (req, res) => {
//   try {
//     const cv = await CVUpload.findById(req.params.id).populate('userId');
//     if (!cv) { req.flash('red', 'CV not found!'); return res.redirect('/cv-search'); }
//     res.render('cv_view', { cv });
//   } catch (error) {
//     req.flash('red', error.message);
//     res.redirect('/cv-search');
//   }
// };

// exports.deleteCV = async (req, res) => {
//   try {
//     const cv = await CVUpload.findByIdAndDelete(req.params.id);
//     if (cv && cv.filePath) {
//       const fullPath = path.join(__dirname, '../../public', cv.filePath);
//       try { if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath); } catch (e) { }
//     }
//     req.flash('green', 'CV deleted successfully.');
//     res.redirect('/cv-search');
//   } catch (error) {
//     req.flash('red', error.message);
//     res.redirect('/cv-search');
//   }
// };

// exports.downloadCV = async (req, res) => {
//   try {
//     const cv = await CVUpload.findById(req.params.id);
//     if (!cv || !cv.filePath) { req.flash('red', 'CV file not found!'); return res.redirect('/cv-search'); }
//     const fullPath = path.join(__dirname, '../../public', cv.filePath);
//     if (!fs.existsSync(fullPath)) {
//       const fallbackPath = path.join(__dirname, '../../', cv.filePath);
//       if (!fs.existsSync(fallbackPath)) { req.flash('red', 'File does not exist on server.'); return res.redirect('/cv-search'); }
//       return res.download(fallbackPath, cv.originalFileName);
//     }
//     res.download(fullPath, cv.originalFileName);
//   } catch (error) {
//     req.flash('red', error.message);
//     res.redirect('/cv-search');
//   }
// };

// exports.getStats = async (req, res) => {
//   try {
//     const total = await CVUpload.countDocuments();
//     const processed = await CVUpload.countDocuments({ status: 'processed' });
//     const failed = await CVUpload.countDocuments({ status: 'failed' });
//     const pending = await CVUpload.countDocuments({ status: 'pending' });
//     res.json({ total, processed, failed, pending });
//   } catch (e) {
//     res.json({ error: e.message });
//   }
// };


const fs = require('fs');
const path = require('path');
const multer = require('multer');

const CVUpload = require('../../models/cvUploadModel');
const User = require('../../models/userModel');
const { countryFilter, canAccessCountry } = require('../../middleware/auth');

// ─────────────────────────────────────────
// FILENAME SANITIZATION HELPER
// ─────────────────────────────────────────
function sanitizeFilename(rawName) {
  let name = rawName || 'file';
  try { name = decodeURIComponent(name); } catch (e) { }
  name = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');
  const translitMap = {
    'ß': 'ss', 'æ': 'ae', 'ø': 'o', 'å': 'a',
    'đ': 'd', 'ħ': 'h', 'ı': 'i', 'ł': 'l',
    'ŋ': 'n', 'œ': 'oe', 'þ': 'th', 'ð': 'd',
    'Æ': 'Ae', 'Ø': 'O', 'Å': 'A', 'Đ': 'D',
    'Ħ': 'H', 'Ł': 'L', 'Ŋ': 'N', 'Œ': 'Oe',
    'Þ': 'Th', 'Ð': 'D',
  };
  name = name.replace(/[^\u0000-\u007E]/g, ch => translitMap[ch] || '_');
  name = name
    .replace(/[^a-zA-Z0-9.\-\(\)]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!name || name === '.') name = 'file';
  return name;
}

// ─────────────────────────────────────────
// MULTER CONFIG
// ─────────────────────────────────────────
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/uploads/cvs/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseNoExt = path.basename(file.originalname, path.extname(file.originalname));
    const safeName = sanitizeFilename(baseNoExt);
    const finalName = Date.now() + '_' + safeName + ext;
    console.log(`Multer saved: ${finalName}  (original: ${file.originalname})`);
    cb(null, finalName);
  },
});

exports.cvUploader = multer({
  storage: cvStorage,
  limits: { fileSize: 1024 * 1024 * 2000, files: 5000 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.doc', '.docx', '.zip'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, or ZIP files are allowed.'), false);
    }
  },
}).array('cvFiles', 5000);

// ─────────────────────────────────────────
// DUPLICATE CHECK HELPER
// ─────────────────────────────────────────
async function isDuplicate(originalName) {
  const existing = await CVUpload.findOne({ originalFileName: originalName }).lean();
  if (existing) {
    console.log(`⏭️  SKIPPED (duplicate): ${originalName}`);
    return true;
  }
  return false;
}

// ─────────────────────────────────────────
// TEXT EXTRACTION — PDF and DOCX
// ─────────────────────────────────────────
function fixTextEncoding(text, buffer) {
  try {
    if (text.includes('\ufffd') && buffer) {
      const chardet = require('chardet');
      const iconv = require('iconv-lite');
      const detected = chardet.detect(buffer);
      if (detected && detected !== 'UTF-8') {
        const redecoded = iconv.decode(buffer, detected);
        if (!redecoded.includes('\ufffd')) {
          console.log('Re-decoded with:', detected);
          return redecoded;
        }
      }
      return text
        .replace(/Gro\ufffdk/g, 'Großk')
        .replace(/([a-zA-Z])\ufffd([a-zA-Z])/g, (m, a, b) => a + 'ß' + b)
        .replace(/\ufffd/g, '');
    }
    return text;
  } catch (e) {
    return text.replace(/\ufffd/g, '');
  }
}

async function extractTextFromPDF(filePath) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.log('pdf-parse timeout:', filePath);
      resolve('');
    }, 15000);
    try {
      const pdfParseModule = require('pdf-parse');
      const pdfParse = (typeof pdfParseModule === 'function')
        ? pdfParseModule
        : (pdfParseModule.default || pdfParseModule);

      if (typeof pdfParse !== 'function') {
        clearTimeout(timer);
        console.log('pdf-parse is not a function — module shape:', typeof pdfParseModule);
        resolve('');
        return;
      }

      const buffer = fs.readFileSync(filePath);
      pdfParse(buffer)
        .then((data) => {
          clearTimeout(timer);
          let text = (data.text || '').trim();
          text = fixTextEncoding(text, buffer);
          console.log('PDF extracted chars:', text.length, 'from', path.basename(filePath));
          resolve(text);
        })
        .catch((e) => {
          clearTimeout(timer);
          console.log('pdf-parse error:', e.message);
          resolve('');
        });
    } catch (e) {
      clearTimeout(timer);
      console.log('pdf-parse require error:', e.message);
      resolve('');
    }
  });
}

async function extractTextFromDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    let text = (result.value || '').trim();
    text = fixTextEncoding(text, buffer);
    console.log('DOCX extracted chars:', text.length, 'from', path.basename(filePath));
    return text;
  } catch (e) {
    console.log('mammoth error:', e.message);
    return '';
  }
}

// ─────────────────────────────────────────
// ✅ STRONG EMAIL EXTRACTOR
// 3 rounds — handles spaces, newlines, obfuscated
// ─────────────────────────────────────────
function extractEmailFromText(text) {
  if (!text) return '';

  // Round 1: Standard — handles spaces around @ and dots
  // (PDF extraction mein "abc @ gmail . com" jaisa aa jata hai)
  const round1 = /[a-zA-Z0-9._%+\-]+\s*@\s*[a-zA-Z0-9.\-]+\s*\.\s*[a-zA-Z]{2,}/g;
  const matches = text.match(round1);
  if (matches && matches.length > 0) {
    const clean = matches[0].replace(/\s+/g, '').toLowerCase().trim();
    if (clean.includes('@') && clean.includes('.')) {
      console.log('📧 Email found (Round 1):', clean);
      return clean;
    }
  }

  // Round 2: Loose — agar @ ke aage-peeche newline aa gayi ho
  const round2 = /([a-zA-Z0-9._%+\-]+)\s*\n?\s*@\s*\n?\s*([a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/;
  const m2 = text.match(round2);
  if (m2) {
    const clean = (m2[1].trim() + '@' + m2[2].trim()).toLowerCase();
    console.log('📧 Email found (Round 2):', clean);
    return clean;
  }

  // Round 3: Obfuscated — "name [at] domain [dot] com"
  const round3 = /([a-zA-Z0-9._%+\-]+)\s*[\[\(]?\s*at\s*[\]\)]?\s*([a-zA-Z0-9.\-]+)\s*[\[\(]?\s*dot\s*[\]\)]?\s*([a-zA-Z]{2,})/i;
  const m3 = text.match(round3);
  if (m3) {
    const clean = `${m3[1].trim()}@${m3[2].trim()}.${m3[3].trim()}`.toLowerCase();
    console.log('📧 Email found (Round 3 obfuscated):', clean);
    return clean;
  }

  return '';
}

// ─────────────────────────────────────────
// ✅ FALLBACK EMAIL GENERATOR
// Sirf tab use hoga jab email bilkul na mile
// Priority: name@company-domain.com > name.lastname@gmail.com
// ─────────────────────────────────────────
function generateFallbackEmail(rawText, candidateName) {
  if (!candidateName) candidateName = 'candidate';

  // Name se clean local part banao
  const nameParts = candidateName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  let localPart = '';
  if (nameParts.length >= 2) {
    localPart = nameParts[0] + '.' + nameParts[1]; // firstname.lastname
  } else if (nameParts.length === 1) {
    localPart = nameParts[0];
  } else {
    localPart = 'candidate' + Date.now();
  }

  // Step 1: rawText mein company domain dhoondo
  if (rawText) {
    const domainRegex = /\b([a-zA-Z0-9\-]+\.(?:com|net|org|in|co\.in|co|io|biz|info|edu))\b/gi;
    const allDomains = rawText.match(domainRegex);

    if (allDomains && allDomains.length > 0) {
      // Social/junk domains blacklist
      const blacklist = [
        'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
        'github.com', 'google.com', 'gmail.com', 'yahoo.com', 'hotmail.com',
        'outlook.com', 'naukri.com', 'indeed.com', 'glassdoor.com',
        'monster.com', 'shine.com', 'timesjobs.com',
      ];
      const validDomain = allDomains.find(d => !blacklist.includes(d.toLowerCase()));
      if (validDomain) {
        const fallback = `${localPart}@${validDomain.toLowerCase()}`;
        console.log(`📧 Domain found in CV text → fallback email: ${fallback}`);
        return fallback;
      }
    }
  }

  // Step 2: Koi domain nahi mila → gmail fallback
  const fallback = `${localPart}@gmail.com`;
  console.log(`📧 No domain found → gmail fallback: ${fallback}`);
  return fallback;
}

// ─────────────────────────────────────────
// LOCAL CV PARSER — IMPROVED
// ─────────────────────────────────────────
function localParse(text, originalFileName) {
  if (!text) return {};
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const textLower = text.toLowerCase();

  // ── HELPER ───────────────────────────────────────────
  function toTitleCase(str) {
    return str.split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  function looksLikeName(line) {
    const words = line.trim().split(/\s+/);
    if (words.length < 2 || words.length > 5) return false;
    return words.every(w =>
      w.length >= 2 &&
      /^[A-Za-z\u00C0-\u00FF'\-\.]+$/.test(w) &&
      !/^\d/.test(w)
    );
  }

  // ── EMAIL — STRONG 3-ROUND EXTRACTION ────────────────
  // ✅ extractEmailFromText() use karo — handles spaces, newlines, obfuscated
  const email = extractEmailFromText(text);

  // ── PHONE ────────────────────────────────────────────
  let phone = '';
  const phoneLabelM = text.match(
    /(?:phone|tel(?:efon)?|mobile|mob(?:ile)?|cell|handy|kontakt|fon|ph|contact)\s*[:\.\-\/]?\s*((?:\+\d{1,3}[\s\-]?)?[\d][\d\s\(\)\-\.]{6,30}\d)/i
  );
  if (phoneLabelM) {
    phone = phoneLabelM[1].replace(/\s{2,}/g, ' ').trim();
  }
  if (!phone) {
    const intlM = text.match(/(\+\d{1,3}[\s\-]?(?:\(\d{1,4}\)[\s\-]?)?\d[\d\s\-\.]{5,20}\d)/);
    if (intlM) phone = intlM[1].replace(/\s{2,}/g, ' ').trim();
  }
  if (!phone) {
    const localM = text.match(/\b(\d{5}[\s\-]?\d{5}|\d{3}[\s\-]?\d{3}[\s\-]?\d{4}|\d{4}[\s\-]?\d{3}[\s\-]?\d{4})\b/);
    if (localM) phone = localM[1].replace(/\s{2,}/g, ' ').trim();
  }
  phone = phone.replace(/[\s\-\.]+$/, '').trim();

  // ── SKIP PATTERNS ────────────────────────────────────
  const skipLine = /^(curriculum|resume|cv |page |tel|phone|email|address|date|summary|objective|profile|experience|education|skills|about|references|professional|personal|key |languages|certif|linkedin|http|www\.|dear |to whom|university|college|institute|school|academy|bachelor|master|phd|mba|b\.sc|m\.sc|department|faculty|born|nationality|gender|dob|date of birth|marital|visa|driving)/i;
  const institutionLine = /\b(university|college|institute|school|academy|foundation|hospital|clinic|ltd|inc|corp|llc|plc|gmbh|pvt|limited|solutions|services|technologies|systems|consulting|group|associates|international)\b/i;

  // ── NAME ─────────────────────────────────────────────
  let name = '';
  for (const line of lines.slice(0, 12)) {
    if (line.length < 3 || line.length > 80) continue;
    if (line.includes('@') || line.includes('http') || line.includes('|') || line.includes('/') || line.includes(',')) continue;
    if (skipLine.test(line) || institutionLine.test(line)) continue;
    if (line.match(/^\d/)) continue;
    if (looksLikeName(line)) {
      name = toTitleCase(line.trim().split(/\s+/).slice(0, 4).join(' '));
      break;
    }
  }
  if (!name) {
    for (const line of lines.slice(0, 6)) {
      if (line.length < 3 || line.length > 50) continue;
      if (line.includes('@') || line.includes('http') || line.includes('|') || line.includes('/')) continue;
      if (skipLine.test(line) || institutionLine.test(line)) continue;
      const words = line.trim().split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        const allLetters = words.every(w => /^[A-Za-z\u00C0-\u00FF'\-\.]{2,}$/.test(w));
        if (allLetters) { name = toTitleCase(words.join(' ')); break; }
      }
    }
  }
  if (!name && originalFileName) {
    const fromFile = originalFileName
      .replace(/\.[^.]+$/, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/\d{8,}/g, '')
      .replace(/\s*(cv|resume|curriculum|vitae)\s*/gi, '')
      .trim();
    if (fromFile && fromFile.length > 2) name = toTitleCase(fromFile.slice(0, 50));
  }

  // ── CITY ─────────────────────────────────────────────
  let city = '';

  const cityLabelPatterns = [
    /(?:location|city|based\s+in|residing\s+in|current\s+location|present\s+location)\s*[:\-|]\s*([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,40}?)(?:\n|,|\||\d|$)/i,
    /(?:address)\s*[:\-]\s*(?:[\w\s,]+,\s*)?([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,30}?)(?:\s*,?\s*(?:IN|UK|US|USA|AU|CA|DE|\d{5,6})|$|\n)/i,
    /(?:ort|wohnort)\s*[:\-]\s*([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,30}?)(?:\n|,|$)/i,
  ];
  for (const pattern of cityLabelPatterns) {
    const m = text.match(pattern);
    if (m && m[1]) {
      const candidate = m[1].split(',')[0].trim();
      if (candidate.length >= 2 && candidate.length <= 50 && !/^\d/.test(candidate)) {
        city = candidate;
        break;
      }
    }
  }

  if (!city) {
    for (const line of lines.slice(0, 8)) {
      if (line.includes('@') || line.includes('http') || line.includes('linkedin')) continue;
      const cityStateM = line.match(/^([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,30}),\s*([A-Za-z]{2,30})(?:\s*[\d\-\|]|$)/);
      if (cityStateM) {
        const cand = cityStateM[1].trim();
        if (cand.length >= 2 && cand.length <= 40 &&
          !cand.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i) &&
          !skipLine.test(cand)) {
          city = cand;
          break;
        }
      }
    }
  }

  if (!city) {
    for (const line of lines.slice(0, 6)) {
      if (!line.includes('|')) continue;
      const parts = line.split('|').map(p => p.trim());
      for (const p of parts) {
        if (!p || p.includes('@') || p.includes('http') || p.match(/^\d{4,}/) || p.length > 50) continue;
        if (p.match(/^[A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,35}$/) && !skipLine.test(p) && !institutionLine.test(p)) {
          const candidate = p.split(',')[0].trim();
          if (candidate.length >= 2 && candidate !== name) {
            city = candidate;
            break;
          }
        }
      }
      if (city) break;
    }
  }

  if (!city) {
    const bulletCityM = text.match(/[•\-–]\s*([A-Za-z\u00c0-\u024f][A-Za-z\u00c0-\u024f\s\-]{1,30}),\s*(?:India|Germany|UK|USA|UAE|Canada|Australia|France|Singapore|[A-Z][a-z]{2,})/);
    if (bulletCityM) city = bulletCityM[1].trim();
  }

  if (!city) {
    const pinM = text.match(/([A-Za-z\u00c0-\u024f][A-Za-z\s\-]{2,25})\s*[\-,]?\s*\d{6}\b/);
    if (pinM) {
      const cand = pinM[1].replace(/^[\s,\-]+|[\s,\-]+$/g, '').trim();
      if (cand.length >= 2 && !skipLine.test(cand)) city = cand;
    }
  }
  if (!city) {
    const pinM2 = text.match(/\b\d{6}\b\s*,?\s*([A-Za-z\u00c0-\u024f][A-Za-z\s\-]{2,25})/);
    if (pinM2) {
      const cand = pinM2[1].trim();
      if (cand.length >= 2 && !skipLine.test(cand)) city = cand;
    }
  }

  city = city.replace(/[\.,\-]+$/, '').trim().slice(0, 100);

  // ── COUNTRY ──────────────────────────────────────────
  const countryMap = {
    'india': 'India', 'germany': 'Germany', 'deutschland': 'Germany',
    'united kingdom': 'United Kingdom', 'uk': 'United Kingdom',
    'england': 'United Kingdom', 'scotland': 'United Kingdom', 'wales': 'United Kingdom',
    'united states': 'USA', 'usa': 'USA', 'u\\.s\\.a': 'USA', 'us': 'USA', 'america': 'USA',
    'canada': 'Canada', 'australia': 'Australia', 'new zealand': 'New Zealand',
    'france': 'France', 'spain': 'Spain', 'italy': 'Italy',
    'netherlands': 'Netherlands', 'holland': 'Netherlands',
    'belgium': 'Belgium', 'switzerland': 'Switzerland', 'austria': 'Austria',
    'sweden': 'Sweden', 'norway': 'Norway', 'denmark': 'Denmark',
    'finland': 'Finland', 'portugal': 'Portugal', 'poland': 'Poland',
    'russia': 'Russia', 'china': 'China', 'japan': 'Japan',
    'south korea': 'South Korea', 'korea': 'South Korea',
    'singapore': 'Singapore', 'malaysia': 'Malaysia', 'indonesia': 'Indonesia',
    'thailand': 'Thailand', 'vietnam': 'Vietnam', 'philippines': 'Philippines',
    'pakistan': 'Pakistan', 'bangladesh': 'Bangladesh', 'sri lanka': 'Sri Lanka',
    'nepal': 'Nepal', 'uae': 'UAE', 'united arab emirates': 'UAE', 'dubai': 'UAE',
    'saudi arabia': 'Saudi Arabia', 'qatar': 'Qatar', 'kuwait': 'Kuwait',
    'bahrain': 'Bahrain', 'south africa': 'South Africa', 'nigeria': 'Nigeria',
    'kenya': 'Kenya', 'ghana': 'Ghana', 'egypt': 'Egypt',
    'brazil': 'Brazil', 'mexico': 'Mexico', 'argentina': 'Argentina',
    'colombia': 'Colombia', 'chile': 'Chile',
  };
  let country = '';
  const countryLabelM = text.match(/(?:country|nationality|citizenship)\s*[:\-\|]\s*([A-Za-z\s]{2,40}?)(?:\n|,|$)/i);
  if (countryLabelM) {
    const candidate = countryLabelM[1].trim().toLowerCase();
    for (const [key, val] of Object.entries(countryMap)) {
      if (new RegExp('\\b' + key + '\\b').test(candidate)) { country = val; break; }
    }
  }
  if (!country) {
    for (const [key, val] of Object.entries(countryMap)) {
      if (new RegExp('\\b' + key + '\\b').test(textLower)) { country = val; break; }
    }
  }

  // ── SKILLS ───────────────────────────────────────────
  const skills = new Set();
  const skillsSectionM = text.match(/(?:key\s+skills?|technical\s+skills?|skills?|competencies|expertise|technologies|tools?)[:\s\n]+([\s\S]{10,600}?)(?=\n\s*\n|\n\s*(?:education|experience|employment|references|languages|certif|awards|$))/i);
  const skillsText = skillsSectionM ? skillsSectionM[1] : text;
  skillsText.split('|').forEach(s => {
    const clean = s.replace(/[\n\r]/g, ' ').trim();
    if (clean.length > 2 && clean.length < 60 && clean.match(/[A-Za-z]{2,}/) && !clean.match(/^\d/))
      skills.add(clean);
  });
  skillsText.split(/[\n,•\*\u2022\u25CF\u25AA]/).forEach(s => {
    const clean = s.replace(/^[\s\-–]+/, '').trim();
    if (clean.length > 2 && clean.length < 60 && clean.match(/[A-Za-z]{2,}/) && !clean.match(/^\d{4}/))
      skills.add(clean);
  });
  const badSkill = /^(skills?|competencies|expertise|key|and|the|with|for|or|in|to|of|i|a)$/i;
  const skillsArr = [...skills].filter(s => !badSkill.test(s)).slice(0, 15);

  // ── JOB TITLES ───────────────────────────────────────
  const titleKeywords = [
    'coach', 'manager', 'director', 'scout', 'analyst', 'recruiter',
    'developer', 'engineer', 'designer', 'consultant', 'advisor', 'trainer',
    'coordinator', 'executive', 'officer', 'therapist', 'instructor',
    'physiotherapist', 'scientist', 'specialist', 'head of', 'assistant',
    'architect', 'lead', 'senior', 'junior', 'intern', 'associate',
    'technician', 'operator', 'supervisor', 'administrator', 'controller',
  ];
  const foundTitles = [];
  lines.forEach(line => {
    titleKeywords.forEach(t => {
      if (new RegExp('\\b' + t + '\\b', 'i').test(line) && line.length < 100) {
        const clean = line.replace(/[|•\-–*\(\)]/g, '').trim().slice(0, 60);
        if (!foundTitles.includes(clean) && clean.length > 3) foundTitles.push(clean);
      }
    });
  });

  // ── EXPERIENCE ───────────────────────────────────────
  let experienceYears = 0;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const monthMap = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10,
    nov: 11, november: 11, dec: 12, december: 12,
  };

  const directExpM = text.match(/(\d+)\s*\+?\s*(years?|yrs?)\s*(of\s+)?(experience|exp\.?|work(?:ing)?|professional)/i);
  if (directExpM) experienceYears = parseInt(directExpM[1]);

  const expSectionM = text.match(
    /(?:(?:work|professional|employment|career)\s+)?experience[:\s]*\n([\s\S]*?)(?=\n\s*(?:education|academic|qualification|certif|skills|languages|references|volunteer|awards|interests|hobbies|$))/i
  );
  const expText = expSectionM ? expSectionM[1] : text;

  const rangeRegex = /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{4})\s*(?:[\u2013\u2014\u2012\u2010\-]+|to|till|until)\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow|[Tt]ill\s*[Dd]ate|[Tt]oday)/gi;

  const slashRangeRegex = /(\d{1,2})\/(\d{4})\s*[\u2013\u2014\-–]+\s*(?:(\d{1,2})\/)?(\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow)/gi;

  let allRanges = [];
  let rm;

  while ((rm = rangeRegex.exec(expText)) !== null) {
    const startMonthKey = rm[1] ? rm[1].toLowerCase().slice(0, 3) : '';
    const startMonth = monthMap[startMonthKey] || 1;
    const startYear = parseInt(rm[2]);
    const isPresent = /present|current|now|till\s*date|today/i.test(rm[4]);
    const endMonthKey = rm[3] ? rm[3].toLowerCase().slice(0, 3) : '';
    const endMonth = rm[3]
      ? (monthMap[endMonthKey] || (isPresent ? currentMonth : 12))
      : (isPresent ? currentMonth : 12);
    const endYear = isPresent ? currentYear : parseInt(rm[4]);

    if (startYear >= 1970 && startYear <= currentYear + 1 && endYear >= startYear && endYear <= currentYear + 1) {
      const months = (endYear - startYear) * 12 + (endMonth - startMonth);
      if (months > 0 && months < 600) {
        allRanges.push({ startYear, startMonth, endYear, endMonth, months });
      }
    }
  }

  while ((rm = slashRangeRegex.exec(expText)) !== null) {
    const startMonth = parseInt(rm[1]);
    const startYear = parseInt(rm[2]);
    const isPresent = /present|current|now/i.test(rm[4]);
    const endMonth = rm[3] ? parseInt(rm[3]) : (isPresent ? currentMonth : 12);
    const endYear = isPresent ? currentYear : parseInt(rm[4]);

    if (startYear >= 1970 && startYear <= currentYear + 1 && endYear >= startYear &&
      startMonth >= 1 && startMonth <= 12 && endMonth >= 1 && endMonth <= 12) {
      const months = (endYear - startYear) * 12 + (endMonth - startMonth);
      if (months > 0 && months < 600) {
        allRanges.push({ startYear, startMonth, endYear, endMonth, months });
      }
    }
  }

  if (allRanges.length > 0) {
    const totalMonths = allRanges.reduce((sum, r) => sum + r.months, 0);
    const calcYears = Math.round(totalMonths / 12);
    experienceYears = Math.max(experienceYears, calcYears);
  }

  if (experienceYears === 0 && expText) {
    const allYears = (expText.match(/\b(19[7-9]\d|20[0-2]\d)\b/g) || [])
      .map(Number).filter(y => y <= currentYear);
    if (allYears.length > 0) {
      experienceYears = currentYear - Math.min(...allYears);
    }
  }

  // ── LINKEDIN ─────────────────────────────────────────
  let linkedinUrl = '';
  const linkedinM = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([a-zA-Z0-9\-_%]+)/i);
  if (linkedinM) linkedinUrl = 'https://www.linkedin.com/in/' + linkedinM[1];
  if (!linkedinUrl) {
    const linkedinLabelM = text.match(/linkedin\s*(?:id|profile|url|:|\|)[\s:]*([a-zA-Z0-9\-_%\.\/]+)/i);
    if (linkedinLabelM) {
      const val = linkedinLabelM[1].trim();
      if (val.includes('linkedin.com')) {
        linkedinUrl = val.startsWith('http') ? val : 'https://www.' + val;
      } else if (val.length > 2 && !val.includes('@')) {
        linkedinUrl = 'https://www.linkedin.com/in/' + val.replace(/\/$/, '');
      }
    }
  }

  // ── SUMMARY ──────────────────────────────────────────
  let summary = '';
  const summaryM = text.match(/(?:professional\s+summary|career\s+summary|summary|objective|profile|about\s+me|executive\s+summary)[:\s\n]+([\s\S]{30,600}?)(?=\n\s*\n|\n\s*(?:experience|education|skills|employment|$))/i);
  if (summaryM) summary = summaryM[1].replace(/\s+/g, ' ').trim().slice(0, 300);

  const experience = experienceYears > 0
    ? experienceYears + ' Year' + (experienceYears !== 1 ? 's' : '')
    : 'Fresher';

  return {
    name,
    email,   // ✅ now comes from strong 3-round extractEmailFromText()
    phone,
    city,
    country,
    experience,
    experienceYears,
    skills: skillsArr,
    jobTitles: foundTitles.slice(0, 5),
    summary,
    linkedinUrl,
  };
}

// ─────────────────────────────────────────
// GEMINI RETRY WRAPPER
// ─────────────────────────────────────────
async function callGeminiWithRetry(genAI, prompt, maxRetries = 3) {
  const delays = [3000, 8000, 15000];
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0, maxOutputTokens: 2048 },
      });
      return response;
    } catch (e) {
      const errMsg = (e.message || '').toString();
      const is503 = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand') || errMsg.includes('overloaded') ||
        errMsg.includes('temporarily unavailable');
      if (is503 && attempt < maxRetries) {
        const waitMs = delays[attempt] || 15000;
        console.log(`Gemini 503 — attempt ${attempt + 1}/${maxRetries}, retrying in ${waitMs / 1000}s...`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw e;
    }
  }
}

// ─────────────────────────────────────────
// AI PARSER — Gemini (primary)
// ─────────────────────────────────────────
async function parseCVWithAI(text, originalFileName) {
  if (!text || text.trim().length < 30) return buildResult({}, originalFileName);

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.log('No GEMINI_API_KEY — using local parser');
    return buildResult(localParse(text, originalFileName), originalFileName);
  }

  try {
    const { GoogleGenAI } = require('@google/genai');
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const cvText = text.slice(0, 5000);

    const prompt = `You are a professional CV/Resume parser. Extract data from the CV below.
Return ONLY a raw JSON object. No markdown, no backticks, no explanation, no extra text — ONLY the JSON.

Required JSON format:
{"name":"","email":"","phone":"","city":"","country":"","experience":"X Years or Fresher","experienceYears":0,"skills":[],"jobTitles":[],"summary":"","linkedinUrl":""}

EXTRACTION RULES:
1. name: Candidate full name from top of CV. Can be ALL CAPS ("ROBERTO CARNEVALI"), Title Case ("Roberto Carnevali"), or mixed. Convert to Title Case always. Must be 1-5 words, letters/hyphens/apostrophes only. NEVER a company, university, job title, address, or email. Extract from filename as last resort (e.g. "John_Smith_CV.pdf" → "John Smith"). ALWAYS return a name — never return empty string "".
2. email: Candidate email address. Return "" if not found.
3. phone: COMPLETE phone number with country code. COPY every single digit exactly as written. "+41 77 453 27 36" must be returned as "+41 77 453 27 36" — never truncate. Return "" if not found.
4. city: City/town name only (e.g. "Zurich", "London", "Mumbai"). Never return a country, email, URL, or LinkedIn here. Return "" if not clearly stated.
5. country: Country from address or nationality field (e.g. "Switzerland", "India", "UK"). Return "" if not clearly stated.
6. experience: Calculate TOTAL work experience by adding up EACH role individually.
   Step 1: List every single job role with its start and end date.
   Step 2: Calculate duration of EACH role separately in years+months.
   Step 3: SUM all durations together — do NOT subtract, do NOT skip any role.
   Step 4: Round to nearest whole year.
   RULES:
   - "Present/Current/Now" = 2026
   - Count ALL roles including part-time, contract, freelance
   - Do NOT exclude any role unless it is clearly marked as "Education" or "Internship"
   - If two roles overlap in time, count BOTH fully (candidate worked both simultaneously)
   - Return "X Years" format. Example: Role1=4yr + Role2=10yr + Role3=8yr + Role4=4yr = "26 Years"
7. experienceYears: Same total as above but as integer (e.g. 8).
8. skills: All technical/professional skills listed in CV. Max 15, as JSON string array.
9. jobTitles: Job titles/roles the person has held at companies. Max 5, as JSON string array.
10. summary: The professional summary or objective text from CV. Max 300 characters. Return "" if not found.
11. linkedinUrl: Full LinkedIn URL (e.g. "https://www.linkedin.com/in/username"). Return "" if not found.

CV TEXT:
${cvText}`;

    const response = await callGeminiWithRetry(genAI, prompt, 3);
    const aiText = (response.text || '').trim();
    if (!aiText) {
      console.log('Gemini returned empty response — using local parser');
      return buildResult(localParse(text, originalFileName), originalFileName);
    }

    let jsonStr = aiText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const ai = JSON.parse(jsonStr);
    const local = localParse(text, originalFileName);

    // ✅ Email: AI se mila to use karo, warna local strong regex ka use karo
    const finalEmail = cleanStr(ai.email) || cleanStr(local.email);

    const result = {
      name:            cleanStr(ai.name)         || cleanStr(local.name),
      email:           finalEmail,
      phone:           cleanStr(ai.phone)        || cleanStr(local.phone),
      city:            cleanStr(ai.city)         || cleanStr(local.city),
      country:         cleanStr(ai.country)      || cleanStr(local.country),
      experience:      cleanStr(ai.experience)   || cleanStr(local.experience) || 'Fresher',
      experienceYears: parseInt(ai.experienceYears) || local.experienceYears || 0,
      skills:          cleanArray(ai.skills, 15) || cleanArray(local.skills, 15),
      jobTitles:       cleanArray(ai.jobTitles, 5) || cleanArray(local.jobTitles, 5),
      summary:         cleanStr(ai.summary)      || cleanStr(local.summary),
      linkedinUrl:     cleanStr(ai.linkedinUrl)  || cleanStr(local.linkedinUrl),
    };

    console.log('Gemini parsed:', result.name,
      '| email:', result.email,
      '| phone:', result.phone,
      '| city:', result.city,
      '| country:', result.country,
      '| exp:', result.experience,
      '| skills:', result.skills ? result.skills.length : 0);

    return buildResult(result, originalFileName);
  } catch (e) {
    console.log('Gemini error (all retries exhausted):', e.message, '— falling back to local parser');
    return buildResult(localParse(text, originalFileName), originalFileName);
  }
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────
function cleanStr(v) {
  if (!v || typeof v !== 'string') return '';
  const s = v.trim();
  if (s === '' || s === 'null' || s === 'undefined' || s === 'N/A' || s === 'n/a') return '';
  return s;
}

function cleanArray(arr, max) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const cleaned = arr.map(s => (s || '').toString().trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.slice(0, max) : null;
}

function buildResult(data, originalFileName) {
  let name = (data.name || '').toString().trim().slice(0, 100);
  if (!name && originalFileName) {
    const fromFile = originalFileName
      .replace(/\.[^.]+$/, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/\d{8,}/g, '')
      .replace(/\s*(cv|resume|curriculum|vitae)\s*/gi, '')
      .trim();
    if (fromFile && fromFile.length > 2) {
      name = fromFile.split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ').slice(0, 100);
    }
  }
  return {
    name,
    email:           (data.email || '').toString().toLowerCase().trim(),
    phone:           (data.phone || '').toString().trim(),
    city:            (data.city || '').toString().trim().slice(0, 100),
    country:         (data.country || '').toString().trim().slice(0, 100),
    experience:      (data.experience || 'Fresher').toString().trim(),
    experienceYears: parseInt(data.experienceYears) || 0,
    skills:          Array.isArray(data.skills) ? data.skills.slice(0, 15) : [],
    jobTitles:       Array.isArray(data.jobTitles) ? data.jobTitles.slice(0, 5) : [],
    summary:         (data.summary || '').toString().trim().slice(0, 300),
    linkedinUrl:     (data.linkedinUrl || '').toString().trim(),
  };
}

// ─────────────────────────────────────────
// PROCESS SINGLE CV
// ✅ Fallback email added — no more @cv-upload.com jab email na mile
// ─────────────────────────────────────────
async function processSingleCV(filePath, originalName, batchId) {
  try {
    if (await isDuplicate(originalName)) {
      try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) { }
      return null;
    }

    console.log(`Processing: ${originalName} | Path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found on disk: ${filePath}`);
    }

    const ext = path.extname(originalName).toLowerCase();
    let rawText = '';
    if (ext === '.pdf') {
      rawText = await extractTextFromPDF(filePath);
    } else if (ext === '.docx' || ext === '.doc') {
      rawText = await extractTextFromDOCX(filePath);
    }

    console.log('rawText length for', originalName, ':', rawText.length);

    const parsed = await parseCVWithAI(rawText, originalName);
    const savedFileName = path.basename(filePath);
    const finalFilePath = '/uploads/cvs/' + savedFileName;

    let fileSize = 0;
    try { fileSize = fs.statSync(filePath).size; } catch (e) { }

    // ✅ Email fallback — sirf tab jab email bilkul na mile
    let finalEmail = parsed.email;
    let emailSource = 'extracted';

    if (!finalEmail) {
      finalEmail = generateFallbackEmail(rawText, parsed.name);
      emailSource = 'fallback';
      console.log(`⚠️  No email found in CV [${originalName}] — using fallback: ${finalEmail}`);
    } else {
      console.log(`✅ Email found in CV [${originalName}]: ${finalEmail}`);
    }

    const cv = new CVUpload({
      ...parsed,
      email: finalEmail,  // ✅ fallback email use karo
      originalFileName: originalName,
      filePath: finalFilePath,
      fileSize,
      status: 'processed',
      rawText: rawText.slice(0, 5000),
      batchId,
    });
    await cv.save();

    const cleanName = (
      parsed.name ||
      originalName.replace(/\.[^.]+$/, '').replace(/[_\-?]+/g, ' ').replace(/\d{10,}/g, '').trim().slice(0, 80)
    ) || 'CV Candidate';

    // ✅ Ab hamesha finalEmail hoga (fallback wala ya real wala)
    // Sirf @cv-upload.com wale placeholder emails alag treat karo
    const isCvPlaceholder = finalEmail.includes('@cv-upload.com');

    if (!isCvPlaceholder) {
      // Real ya fallback gmail/domain email — User se match karne ki koshish karo
      let user = await User.findOne({ email: finalEmail });

      if (user) {
        // Existing user mein resume add karo
        user.resumes.unshift({ resumeTitle: originalName, resumePdf: finalFilePath, selected: false });
        if (!user.experience && parsed.experience) user.experience = parsed.experience;
        if ((!user.city || user.city === 'N/A') && parsed.city) user.city = parsed.city;
        if ((!user.country || user.country === '' || user.country === 'N/A') && parsed.country) user.country = parsed.country;
        if (parsed.jobTitles && parsed.jobTitles.length > 0) user.cvJobTitles = parsed.jobTitles;
        await user.save();
        cv.userId = user._id;
        await cv.save();
        console.log(`Resume added to existing user: ${finalEmail} (${emailSource})`);
      } else {
        // Naya user banao
        const newUser = new User({
          name:        cleanName,
          email:       finalEmail,
          phone:       parsed.phone || '',
          experience:  parsed.experience || 'Fresher',
          city:        parsed.city || 'N/A',
          state:       'N/A',
          country:     parsed.country || '',
          cvJobTitles: parsed.jobTitles || [],
          password:    Math.random().toString(36).slice(-8) + 'Aa1!',
          resumes:     [{ resumeTitle: originalName, resumePdf: finalFilePath, selected: true }],
        });
        await newUser.save();
        cv.userId = newUser._id;
        await cv.save();
        console.log(`New user created: ${finalEmail} (${emailSource}) | country: ${parsed.country}`);
      }
    } else {
      // Pure placeholder — jab generateFallbackEmail bhi fail ho (edge case, practically nahi aayega)
      const newUser = new User({
        name:        cleanName,
        email:       finalEmail,
        phone:       parsed.phone || '',
        experience:  parsed.experience || 'Fresher',
        city:        parsed.city || 'N/A',
        state:       'N/A',
        country:     parsed.country || '',
        cvJobTitles: parsed.jobTitles || [],
        password:    Math.random().toString(36).slice(-8) + 'Aa1!',
        resumes:     [{ resumeTitle: originalName, resumePdf: finalFilePath, selected: true }],
      });
      await newUser.save();
      cv.userId = newUser._id;
      await cv.save();
      console.log('New user (placeholder email) for:', originalName);
    }

    console.log(`✅ Successfully processed: ${originalName}`);
    return cv;

  } catch (error) {
    console.error(`❌ Failed processing ${originalName}:`, error.message);
    throw error;
  }
}

// ─────────────────────────────────────────
// ZIP EXTRACTOR
// ─────────────────────────────────────────
async function extractAndProcessZip(zipPath, batchId) {
  await new Promise(r => setTimeout(r, 300));

  if (!fs.existsSync(zipPath)) {
    throw new Error('ZIP file not found on disk: ' + zipPath);
  }

  const unzipper = require('unzipper');
  const validExts = ['.pdf', '.doc', '.docx'];
  const destDir = './public/uploads/cvs/';
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  let directory;
  try {
    directory = await unzipper.Open.file(zipPath);
  } catch (err) {
    throw new Error('Cannot open ZIP file: ' + err.message);
  }

  const zipSizeMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
  console.log(`ZIP opened: ${path.basename(zipPath)} (${zipSizeMB} MB) | total entries: ${directory.files.length}`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of directory.files) {
    if (entry.type === 'Directory') continue;

    const entryExt = path.extname(entry.path).toLowerCase();
    if (!validExts.includes(entryExt)) continue;

    const rawBase = path.basename(entry.path);

    if (await isDuplicate(rawBase)) {
      skipped++;
      continue;
    }

    const baseNoExt = path.basename(rawBase, path.extname(rawBase));
    const safeName = sanitizeFilename(baseNoExt);
    const destName = Date.now() + '_' + Math.random().toString(36).slice(-4) + '_' + safeName + entryExt;
    const destPath = path.join(destDir, destName);

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Entry extraction timeout')), 30000);
        entry.stream()
          .pipe(fs.createWriteStream(destPath))
          .on('finish', () => { clearTimeout(timeout); resolve(); })
          .on('error', (e) => { clearTimeout(timeout); reject(e); });
      });

      if ((processed + failed) > 0 && (processed + failed) % 50 === 0) {
        await new Promise(r => setTimeout(r, 200));
      }

      const result = await processSingleCV(destPath, rawBase, batchId);
      if (result === null) {
        skipped++;
      } else {
        processed++;
      }

    } catch (e) {
      failed++;
      console.error(`ZIP entry error [${rawBase}]:`, e.message);
      try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (_) { }
    }
  }

  try { fs.unlinkSync(zipPath); } catch (e) { }

  console.log(`ZIP complete — processed: ${processed}, skipped (duplicates): ${skipped}, failed: ${failed}`);
  return { processed, skipped, failed };
}

// ─────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────

exports.getUploadPage = async (req, res) => {
  try {
    const totalCVs     = await CVUpload.countDocuments();
    const processedCVs = await CVUpload.countDocuments({ status: 'processed' });
    const failedCVs    = await CVUpload.countDocuments({ status: 'failed' });
    const pendingCVs   = await CVUpload.countDocuments({ status: 'pending' });
    res.render('cv_upload', { totalCVs, processedCVs, failedCVs, pendingCVs });
  } catch (error) {
    req.flash('red', error.message);
    res.redirect('/');
  }
};

exports.postUploadCVs = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. Please select at least one file.',
      });
    }

    const batchId = 'batch_' + Date.now();
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext === '.zip') {
        try {
          const result = await extractAndProcessZip(file.path, batchId);
          processed += result.processed;
          skipped   += result.skipped || 0;
          failed    += result.failed;
        } catch (e) {
          failed++;
          console.error('ZIP processing error:', e.message);
          try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (_) { }
        }
      } else {
        const result = await processSingleCV(file.path, file.originalname, batchId).catch(e => {
          failed++;
          console.error(`CV error [${file.originalname}]:`, e.message);
          return null;
        });
        if (result === null && !failed) {
          skipped++;
        } else if (result !== null) {
          processed++;
        }
      }
    }

    let msg = `Upload complete! Processed: ${processed}`;
    if (skipped > 0) msg += `, Skipped (already uploaded): ${skipped}`;
    if (failed > 0)  msg += `, Failed: ${failed}`;

    res.status(200).json({ success: true, processed, skipped, failed, message: msg });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
  }
};

// exports.searchCVs = async (req, res) => {
//   try {
//     const { search, skill, minExp, maxExp, city, page = 1 } = req.query;
//     const limit = 20;
//     const skip = (page - 1) * limit;
//     let query = {};

//     // Sub Admin country scoping — only see CVs from assigned country/countries.
//     Object.assign(query, countryFilter(req));

//     if (search) {
//       query.$or = [
//         { name:    { $regex: search, $options: 'i' } },
//         { email:   { $regex: search, $options: 'i' } },
//         { rawText: { $regex: search, $options: 'i' } },
//       ];
//     }
//     if (skill)   query.skills = { $in: [new RegExp(skill, 'i')] };
//     if (minExp !== undefined && minExp !== '')
//       query.experienceYears = { ...query.experienceYears, $gte: parseInt(minExp) };
//     if (maxExp !== undefined && maxExp !== '')
//       query.experienceYears = { ...query.experienceYears, $lte: parseInt(maxExp) };
//     if (city) query.city = { $regex: city, $options: 'i' };

//     const total      = await CVUpload.countDocuments(query);
//     const cvs        = await CVUpload.find(query).sort('-date').skip(skip).limit(limit).lean();
//     const totalPages = Math.ceil(total / limit);
//     res.render('cv_search', { cvs, total, totalPages, currentPage: parseInt(page), query: req.query });
//   } catch (error) {
//     req.flash('red', error.message);
//     res.redirect('/cv-upload');
//   }
// };


exports.searchCVs = async (req, res) => {
  try {
    console.log("=== CV SEARCH DEBUG ===");
    console.log("User is SuperAdmin:", req.admin?.isSuperAdmin);
    console.log("Assigned Countries:", req.admin?.assignedCountries);

    let query = {};

    // Temporary: Remove country filter for testing
    if (req.admin && !req.admin.isSuperAdmin) {
      const countries = req.admin.assignedCountries || [];
      console.log("Applying country filter:", countries);
      if (countries.length > 0) {
        query.country = { $in: countries.map(c => new RegExp(`^${c.trim()}$`, 'i')) };
      } else {
        query._id = null; // No countries = no data
      }
    }

    const total = await CVUpload.countDocuments(query);
    const cvs = await CVUpload.find(query)
      .sort('-date')
      .limit(50)
      .lean();

    console.log("Total CVs Found:", total);
    console.log("First 3 CVs:", cvs.slice(0, 3));

    res.render('cv_search', { 
      cvs, 
      total, 
      totalPages: 1, 
      currentPage: 1, 
      query: req.query 
    });
  } catch (error) {
    console.error("CV Search Error:", error);
    req.flash('red', error.message);
    res.redirect('/cv-search');
  }
};
exports.viewCV = async (req, res) => {
  try {
    const cv = await CVUpload.findById(req.params.id).populate('userId');
    if (!cv) { req.flash('red', 'CV not found!'); return res.redirect('/cv-search'); }
    if (!canAccessCountry(req, cv.country)) {
      req.flash('red', "You don't have access to this CV's country.");
      return res.redirect('/cv-search');
    }
    res.render('cv_view', { cv });
  } catch (error) {
    req.flash('red', error.message);
    res.redirect('/cv-search');
  }
};

exports.getEditCV = async (req, res) => {
  try {
    const cv = await CVUpload.findById(req.params.id);
    if (!cv) { req.flash('red', 'CV not found!'); return res.redirect('/cv-search'); }
    if (!canAccessCountry(req, cv.country)) {
      req.flash('red', "You don't have access to this CV's country.");
      return res.redirect('/cv-search');
    }
    res.render('cv_edit', { cv });
  } catch (error) {
    if (error.name === 'CastError') req.flash('red', 'CV not found!');
    else req.flash('red', error.message);
    res.redirect('/cv-search');
  }
};

exports.postEditCV = async (req, res) => {
  try {
    const cv = await CVUpload.findById(req.params.id);
    if (!cv) { req.flash('red', 'CV not found!'); return res.redirect('/cv-search'); }
    if (!canAccessCountry(req, cv.country)) {
      req.flash('red', "You don't have access to this CV's country.");
      return res.redirect('/cv-search');
    }

    const { name, email, phone, city, country, experience, summary } = req.body;
    const newCountry = country !== undefined ? country : cv.country;

    if (!canAccessCountry(req, newCountry)) {
      req.flash('red', "You can't move this CV outside your assigned country.");
      return res.redirect(`/cv-edit/${req.params.id}`);
    }

    cv.name = name ?? cv.name;
    cv.email = email ?? cv.email;
    cv.phone = phone ?? cv.phone;
    cv.city = city ?? cv.city;
    cv.country = newCountry;
    cv.experience = experience ?? cv.experience;
    cv.summary = summary ?? cv.summary;

    if (req.body.skills !== undefined) {
      cv.skills = req.body.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    await cv.save();

    req.flash('green', 'CV updated successfully.');
    res.redirect(`/cv-view/${req.params.id}`);
  } catch (error) {
    req.flash('red', error.message);
    res.redirect(`/cv-edit/${req.params.id}`);
  }
};

exports.deleteCV = async (req, res) => {
  try {
    const cv = await CVUpload.findByIdAndDelete(req.params.id);
    if (cv && cv.filePath) {
      const fullPath = path.join(__dirname, '../../public', cv.filePath);
      try { if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath); } catch (e) { }
    }
    req.flash('green', 'CV deleted successfully.');
    res.redirect('/cv-search');
  } catch (error) {
    req.flash('red', error.message);
    res.redirect('/cv-search');
  }
};

exports.downloadCV = async (req, res) => {
  try {
    const cv = await CVUpload.findById(req.params.id);
    if (!cv || !cv.filePath) { req.flash('red', 'CV file not found!'); return res.redirect('/cv-search'); }
    if (!canAccessCountry(req, cv.country)) {
      req.flash('red', "You don't have access to this CV's country.");
      return res.redirect('/cv-search');
    }
    const fullPath = path.join(__dirname, '../../public', cv.filePath);
    if (!fs.existsSync(fullPath)) {
      const fallbackPath = path.join(__dirname, '../../', cv.filePath);
      if (!fs.existsSync(fallbackPath)) { req.flash('red', 'File does not exist on server.'); return res.redirect('/cv-search'); }
      return res.download(fallbackPath, cv.originalFileName);
    }
    res.download(fullPath, cv.originalFileName);
  } catch (error) {
    req.flash('red', error.message);
    res.redirect('/cv-search');
  }
};

exports.getStats = async (req, res) => {
  try {
    const total     = await CVUpload.countDocuments();
    const processed = await CVUpload.countDocuments({ status: 'processed' });
    const failed    = await CVUpload.countDocuments({ status: 'failed' });
    const pending   = await CVUpload.countDocuments({ status: 'pending' });
    res.json({ total, processed, failed, pending });
  } catch (e) {
    res.json({ error: e.message });
  }
};