const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIRS = ["public/stars", "public/characters", "public/cards"];
const QUALITY = 82;
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

const formatMB = (bytes) => `${(bytes / 1_000_000).toFixed(1)}MB`;

const findImages = (dir) => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return findImages(fullPath);
    }

    return IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
};

const convertFile = async (file) => {
  const webpPath = file.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  const before = fs.statSync(file).size;

  if (fs.existsSync(webpPath)) {
    const existing = fs.statSync(webpPath).size;
    console.log(`skip (exists): ${webpPath} (${formatMB(existing)})`);
    return { before, after: existing };
  }

  try {
    await sharp(file).webp({ quality: QUALITY }).toFile(webpPath);
    const after = fs.statSync(webpPath).size;
    const saved = Math.round((1 - after / before) * 100);
    console.log(`✓ ${file} -> ${webpPath} (${formatMB(before)} -> ${formatMB(after)}, -${saved}%)`);
    return { before, after, skipped: false };
  } catch (error) {
    console.warn(`warn: skipped unsupported image ${file} (${error.message})`);
    return { before, after: 0, skipped: true };
  }
};

const convertDir = async (dir) => {
  const files = findImages(dir);
  let originalBytes = 0;
  let webpBytes = 0;
  let skipped = 0;

  for (const file of files) {
    const { before, after, skipped: wasSkipped } = await convertFile(file);
    originalBytes += before;
    webpBytes += after;
    if (wasSkipped) {
      skipped += 1;
    }
  }

  return { originalBytes, webpBytes, skipped };
};

(async () => {
  let totalOriginalBytes = 0;
  let totalWebpBytes = 0;
  let totalSkipped = 0;

  for (const dir of DIRS) {
    const { originalBytes, webpBytes, skipped } = await convertDir(dir);
    totalOriginalBytes += originalBytes;
    totalWebpBytes += webpBytes;
    totalSkipped += skipped;
  }

  const saved = totalOriginalBytes > 0 ? Math.round((1 - totalWebpBytes / totalOriginalBytes) * 100) : 0;
  console.log(
    `\nDone. ${formatMB(totalOriginalBytes)} original -> ${formatMB(totalWebpBytes)} WebP (-${saved}%).`,
  );
  if (totalSkipped > 0) {
    console.log(`Skipped ${totalSkipped} unsupported image file(s).`);
  }
  console.log("Run npm run build to verify.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
