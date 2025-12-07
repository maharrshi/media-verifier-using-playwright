import fs from 'fs';
import path from 'path';

export function getFilesFromTxt(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').filter(Boolean);
}

export function getMediaExtension(filePath) {
  return path.extname(filePath).toLowerCase().replace('.', '');
}

export function buildFinalUrl(relativePath) {
  return `https://platform.dailykos.com/wp-content/${relativePath}`;
}
