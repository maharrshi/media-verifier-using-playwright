# Media Verifier Using Playwright

An automated testing tool that verifies the accessibility and validity of media files (images and videos) hosted on a web server. The tool uses Playwright to visit URLs, check HTTP status codes, and verify that media files render correctly in a browser.

## 🎯 Purpose

This project automates the verification of large batches of media files by:
- Extracting file lists from ZIP archives
- Grouping media files by extension type
- Sampling files for testing (max 10 per type)
- Visiting each file's URL via Playwright
- Checking HTTP status and visual rendering
- Generating detailed test reports

## 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Bash** shell (for server-side ZIP processing scripts)

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd media-verifier-using-playwright
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

## 📁 Project Structure

```
media-verifier-using-playwright/
├── package.json                 # Project dependencies and scripts
├── playwright.config.js         # Playwright configuration
├── README.md                    # This file
├── data/
│   ├── samples.json            # Generated: Sampled media files for testing
│   ├── results.csv             # Generated: Test results
│   └── text_files/             # Input: Text files listing media paths
│       └── text_file_for_uploads_chunk_001.txt
├── server-scripts/
│   └── process_all_zips.sh     # Server-side: Extract file lists from ZIPs
├── src/
│   ├── groupByExtension.js     # Groups files by extension and creates samples
│   ├── verifyMedia.spec.js     # Playwright test suite
│   └── utils.js                # Utility functions
├── playwright-report/          # Generated: HTML test reports
└── test-results/               # Generated: Test execution artifacts
```

## 🔧 Configuration

### Base URL Configuration

The base URL for media files is configured in [src/utils.js](src/utils.js):
```javascript
export function buildFinalUrl(relativePath) {
  return `https://platform.dailykos.com/wp-content/${relativePath}`;
}
```

**To change the base URL:** Edit the `buildFinalUrl` function in [src/utils.js](src/utils.js).

### Supported Media Types

The following media types are supported (configured in [src/groupByExtension.js](src/groupByExtension.js)):

**Images:** `jpg`, `jpeg`, `png`, `gif`, `webp`, `heic`, `jfif`, `bmp`, `tiff`, `svg`

**Videos:** `mp4`, `mov`, `webm`, `mkv`, `m4v`

### Playwright Configuration

Browser and test settings are in [playwright.config.js](playwright.config.js):
- **Timeout:** 60 seconds per test
- **Headless mode:** `false` (browser visible for debugging)
- **Viewport:** 1280x720
- **Reporters:** Console list + HTML report

## 📝 Input Data Preparation

### Option 1: Server-Side Processing (Using ZIP Archives)

If you have ZIP files containing media archives:

1. **Place ZIP files on the server:**
   ```bash
   # On server at /home/dailykos/output_zips/
   uploads_chunk_001.zip
   uploads_chunk_002.zip
   ...
   ```

2. **Run the processing script:**
   ```bash
   cd /home/dailykos/output_zips
   bash process_all_zips.sh
   ```

   This script will:
   - Unzip each archive
   - Generate a text file listing all files
   - Clean up temporary files
   - Output: `text_file_for_uploads_chunk_XXX.txt`

3. **Copy text files to your local project:**
   ```bash
   # Copy from server to local data/text_files/
   scp user@server:/home/dailykos/output_zips/text_file_for_*.txt ./data/text_files/
   ```

### Option 2: Manual Input File Creation

Create text files in `data/text_files/` with one file path per line:

```
uploads/2024/01/image1.jpg
uploads/2024/01/video1.mp4
uploads/2024/02/photo.png
```

**File naming convention:** `text_file_for_<identifier>.txt`

## 🏃 Running the Tests

### Full Workflow (Recommended)

Run both grouping and verification in sequence:

```bash
npm run verify
```

This command:
1. Executes `groupByExtension.js` to create `samples.json`
2. Runs the Playwright test suite
3. Generates `results.csv` and HTML reports

### Step-by-Step Execution

#### Step 1: Generate Sample Files

```bash
node src/groupByExtension.js
```

**What it does:**
- Reads all `.txt` files from `data/text_files/`
- Groups files by extension type
- Samples up to 10 files per extension per ZIP
- Creates `data/samples.json`

**Output example:**
```
Created samples.json with 245 media items.
```

#### Step 2: Run Verification Tests

```bash
npx playwright test
```

**What it does:**
- Reads `data/samples.json`
- For each media file:
  - Constructs the full URL
  - Navigates to the URL using Playwright
  - Checks HTTP status code
  - Verifies media rendering (image width > 0, video element present)
  - Records results in `data/results.csv`
- Generates HTML report in `playwright-report/`

### Alternative: Run Tests Only

```bash
npm test
```

(Assumes `samples.json` already exists)

## 📊 Understanding the Results

### CSV Results (`data/results.csv`)

Each test generates a row with the following columns:

| Column | Description |
|--------|-------------|
| `zip_name` | Source ZIP archive identifier |
| `file_path` | Relative path to the media file |
| `full_url` | Complete URL that was tested |
| `media_type` | File extension (jpg, mp4, etc.) |
| `status` | PASS or FAIL |
| `http_status` | HTTP response code (200, 404, etc.) |
| `notes` | Additional information about failures |

**Example:**
```csv
zip_name,file_path,full_url,media_type,status,http_status,notes
uploads_chunk_001,uploads/2024/01/photo.jpg,https://platform.dailykos.com/wp-content/uploads/2024/01/photo.jpg,jpg,PASS,200,
uploads_chunk_001,uploads/2024/01/missing.png,https://platform.dailykos.com/wp-content/uploads/2024/01/missing.png,png,FAIL,404,HTTP 404
```

### HTML Report

View detailed test results with screenshots:

```bash
npx playwright show-report
```

Or open `playwright-report/index.html` directly in a browser.

## 🔍 Test Logic

### Image Verification
1. Check HTTP status = 200
2. Locate `<img>` element on page
3. Verify `naturalWidth > 0` (image loaded correctly)

### Video Verification
1. Check HTTP status = 200
2. Locate `<video>` element on page
3. If element exists, mark as PASS



## 🛠️ Customization

### Adjust Sample Size

In [src/groupByExtension.js](src/groupByExtension.js), modify the sampling logic:

```javascript
if (count >= 10) {
  chosen = all.sort(() => 0.5 - Math.random()).slice(0, 10);  // Change 10 to desired number
}
```

### Add More Media Types

In [src/groupByExtension.js](src/groupByExtension.js), add to the `SUPPORTED` array:

```javascript
const SUPPORTED = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic',
  'jfif', 'bmp', 'tiff', 'svg',
  'mp4', 'mov', 'webm', 'mkv', 'm4v',
  'avi', 'flv'  // Add new types here
];
```


