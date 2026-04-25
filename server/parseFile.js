const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * Extract text content from an uploaded file.
 * Supports PDF and image files (images returned as base64 for multimodal use).
 */
async function parseFile(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf' || mimeType === 'application/pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return { text: data.text, type: 'pdf' };
  }

  if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext) ||
      (mimeType && mimeType.startsWith('image/'))) {
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    return {
      text: '[Image uploaded — content sent to Gemma for visual analysis]',
      base64,
      mimeType: mimeType || `image/${ext.slice(1)}`,
      type: 'image',
    };
  }

  // Fallback: try to read as plain text
  const text = fs.readFileSync(filePath, 'utf-8');
  return { text, type: 'text' };
}

module.exports = { parseFile };
