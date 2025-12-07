#!/bin/bash

# Navigate to the directory containing the zip files
cd /home/dailykos/output_zips || exit

echo "Starting ZIP processing..."

# Loop through all zip files in sorted order
for zipfile in uploads_chunk_*.zip; do

    echo "Processing $zipfile ..."

    # Extract base name without extension
    base_name=$(basename "$zipfile" .zip)

    # Create text file name
    output_txt="text_file_for_${base_name}.txt"

    # Clear previous uploads folder if exists (safety)
    rm -rf uploads

    # Unzip this ZIP into uploads/
    unzip -q "$zipfile"

    # Check if uploads folder exists
    if [ ! -d "uploads" ]; then
        echo "⚠️  ERROR: uploads folder not found after unzipping $zipfile"
        echo "" > "$output_txt"
        continue
    fi

    # Find all files and save to the text file
    find uploads -type f > "$output_txt"

    echo "Created $output_txt with file list."

    # Delete uploads folder for next iteration
    rm -rf uploads

    echo "Cleaned uploads folder."
    echo "----------------------------------------"

done

echo "All ZIP files processed successfully."
