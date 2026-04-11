/**
 * Google Drive Image Service
 * Converts various Google Drive share link formats into direct image URLs
 * Also validates that a link is a genuine Google Drive link
 */

/**
 * Supported formats:
 * https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * https://drive.google.com/open?id=FILE_ID
 * https://drive.google.com/uc?id=FILE_ID
 * https://drive.google.com/uc?export=view&id=FILE_ID
 */
const extractDriveFileId = (url) => {
  if (!url || typeof url !== 'string') return null;

  // Format: /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  // Format: ?id=FILE_ID or &id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  return null;
};

const isGoogleDriveUrl = (url) => {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
};

/**
 * Convert any Google Drive share link to a direct viewable image URL
 */
const toDirectImageUrl = (url) => {
  const fileId = extractDriveFileId(url);
  if (!fileId) return url; // return as-is if can't parse
  // Use the thumbnail endpoint which doesn't require auth for public files
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

/**
 * Validate a Google Drive link
 * Returns { valid: bool, fileId: string|null, directUrl: string|null, error: string|null }
 */
const validateDriveLink = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'No URL provided' };
  }
  if (!isGoogleDriveUrl(url)) {
    return { valid: false, error: 'Not a Google Drive link' };
  }
  const fileId = extractDriveFileId(url);
  if (!fileId) {
    return { valid: false, error: 'Could not extract file ID from link. Make sure link is in format: drive.google.com/file/d/FILE_ID/view' };
  }
  return {
    valid: true,
    fileId,
    directUrl: toDirectImageUrl(url),
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
  };
};

module.exports = { extractDriveFileId, isGoogleDriveUrl, toDirectImageUrl, validateDriveLink };
