require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Gallery = require('./models/Gallery');
const GalleryImage = require('./models/GalleryImage');
const News = require('./models/News');
const Resource = require('./models/Resource');
const Video = require('./models/Video');
const User = require('./models/User');

const SQL_FILE = process.argv[2] || '/Users/selvakumarmaheshwarasarma/Downloads/db_orhan1.sql';

const safeDate = (val) => {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

// Parse SQL VALUES block into array of row arrays (handles ) inside quoted strings)
function parseInsert(sql, tableName) {
  const startMarker = `INSERT INTO \`${tableName}\``;
  const startIdx = sql.indexOf(startMarker);
  if (startIdx === -1) return [];

  const valuesIdx = sql.indexOf('VALUES', startIdx);
  if (valuesIdx === -1) return [];

  const rows = [];
  let i = valuesIdx + 6;

  while (i < sql.length) {
    while (i < sql.length && /\s/.test(sql[i])) i++;
    if (sql[i] !== '(') break;
    i++; // skip opening (

    let row = '';
    let inStr = false;
    let depth = 0;

    while (i < sql.length) {
      const ch = sql[i];
      if (inStr) {
        if (ch === '\\') { row += ch + sql[++i]; }
        else if (ch === "'") { inStr = false; row += ch; }
        else { row += ch; }
      } else {
        if (ch === "'") { inStr = true; row += ch; }
        else if (ch === '(') { depth++; row += ch; }
        else if (ch === ')') {
          if (depth === 0) { i++; break; }
          depth--; row += ch;
        } else { row += ch; }
      }
      i++;
    }

    rows.push(splitRow(row));
    while (i < sql.length && /[,\s]/.test(sql[i])) i++;
    if (sql[i] === ';') break;
  }

  return rows;
}

// Split a CSV row respecting single-quoted strings
function splitRow(str) {
  const cols = [];
  let current = '';
  let inString = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "'" && str[i - 1] !== '\\') {
      inString = !inString;
      current += ch;
    } else if (ch === ',' && !inString) {
      cols.push(parseValue(current.trim()));
      current = '';
    } else {
      current += ch;
    }
  }
  cols.push(parseValue(current.trim()));
  return cols;
}

function parseValue(v) {
  if (v === 'NULL') return null;
  if (v.startsWith("'") && v.endsWith("'")) {
    return v.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  }
  return isNaN(v) ? v : Number(v);
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const sql = fs.readFileSync(SQL_FILE, 'utf8');

  // --- Users ---
  const userRows = parseInsert(sql, 'users');
  for (const [id, name, email, password] of userRows) {
    const exists = await User.findOne({ email });
    if (!exists) {
      // $2y$ (PHP) → $2b$ (Node bcryptjs) — functionally identical
      const nodePassword = password.replace(/^\$2y\$/, '$2b$');
      await User.create({ name, email, password: nodePassword });
      console.log(`User imported: ${email}`);
    } else {
      console.log(`User skipped (exists): ${email}`);
    }
  }

  // --- Galleries (keep SQL id → MongoDB _id mapping) ---
  const galleryMap = {}; // sqlId → mongo _id
  const galleryRows = parseInsert(sql, 'galleries');
  for (const [id, name, cover_image, created_at, updated_at] of galleryRows) {
    const existing = await Gallery.findOne({ name });
    if (!existing) {
      const doc = await Gallery.create({
        name,
        cover_image: cover_image || '/images/noimage.jpg',
        createdAt: safeDate(created_at),
        updatedAt: safeDate(updated_at),
      });
      galleryMap[id] = doc._id;
      console.log(`Gallery imported: ${name}`);
    } else {
      galleryMap[id] = existing._id;
      console.log(`Gallery skipped (exists): ${name}`);
    }
  }

  // --- Gallery Images ---
  const imgRows = parseInsert(sql, 'gallery_imgs');
  let imgCount = 0;
  for (const [id, gallery_id, image, description, created_at] of imgRows) {
    const mongoGalleryId = galleryMap[gallery_id];
    if (!mongoGalleryId) continue;
    const exists = await GalleryImage.findOne({ image, gallery_id: mongoGalleryId });
    if (!exists) {
      await GalleryImage.create({
        gallery_id: mongoGalleryId,
        image: image || '/images/noimage.jpg',
        description,
        createdAt: safeDate(created_at),
      });
      imgCount++;
    }
  }
  console.log(`Gallery images imported: ${imgCount}`);

  // --- News ---
  const newsRows = parseInsert(sql, 'o_news');
  for (const [id, title, author, description, body, cover_image, created_at, updated_at] of newsRows) {
    const exists = await News.findOne({ title });
    if (!exists) {
      await News.create({
        title,
        author,
        description,
        body,
        cover_image: cover_image || '/images/noimage.jpg',
        createdAt: safeDate(created_at),
        updatedAt: safeDate(updated_at),
      });
      console.log(`News imported: ${title}`);
    } else {
      console.log(`News skipped (exists): ${title}`);
    }
  }

  // --- Resources ---
  const resourceRows = parseInsert(sql, 'resources');
  for (const [id, name, file, description, created_at] of resourceRows) {
    const exists = await Resource.findOne({ name });
    if (!exists) {
      await Resource.create({
        name,
        file: null,
        description,
        createdAt: safeDate(created_at),
      });
      console.log(`Resource imported: ${name} (file link not migrated — re-upload via admin)`);
    } else {
      console.log(`Resource skipped (exists): ${name}`);
    }
  }

  // --- Videos ---
  const videoRows = parseInsert(sql, 'videos');
  for (const [id, title, url, created_at] of videoRows) {
    const exists = await Video.findOne({ url });
    if (!exists) {
      await Video.create({ title, url, createdAt: safeDate(created_at) });
      console.log(`Video imported: ${title}`);
    } else {
      console.log(`Video skipped (exists): ${title}`);
    }
  }

  console.log('\nMigration complete!');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
