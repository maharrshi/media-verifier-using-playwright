import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { buildFinalUrl } from './utils.js';

const samples = JSON.parse(fs.readFileSync(path.join('data', 'samples.json')));
const resultsCsv = path.join('data', 'results.csv');

// Write CSV header
fs.writeFileSync(resultsCsv,
  "zip_name,file_path,full_url,media_type,status,http_status,notes\n"
);

test.describe('Media Verification', () => {

  for (const item of samples) {
    test(`Verify ${item.filePath} from ${item.zipName}`, async ({ page }) => {

      const url = buildFinalUrl(item.filePath);

      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      const status = response?.status() || 0;

      let result = "FAIL";
      let notes = "";
      
      if (status !== 200) {
        notes = `HTTP ${status}`;
      } else {
        if (
          ["jpg","jpeg","png","gif","webp","jfif","bmp","tiff","svg"].includes(item.ext)
        ) {
          const img = page.locator("img");
          const exists = await img.count();
          if (exists > 0) {
            const width = await img.nth(0).evaluate(img => img.naturalWidth);
            if (width > 0) {
              result = "PASS";
            } else {
              notes = "Image element has zero width.";
            }
          } else {
            notes = "No <img> tag found.";
          }

        } else if (
          ["mp4","mov","webm","mkv","m4v"].includes(item.ext)
        ) {
          const video = page.locator("video");
          const vexists = await video.count();
          if (vexists > 0) {
            result = "PASS";
          } else {
            notes = "No <video> element found.";
          }

        } else {
          notes = "Unsupported media type.";
        }
      }

      // Write result row
      fs.appendFileSync(
        resultsCsv,
        `${item.zipName},${item.filePath},${url},${item.ext},${result},${status},${notes}\n`
      );

      if (result === "FAIL") {
        expect(false, `${item.filePath} failed: ${notes}`).toBe(true);
      }
    });
  }
});
