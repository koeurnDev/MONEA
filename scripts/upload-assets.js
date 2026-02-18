const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFolder = './public';
const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

async function uploadImages() {
    const files = fs.readdirSync(uploadFolder);
    const mapping = {};

    console.log('Starting upload...');

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (extensions.includes(ext)) {
            const filePath = path.join(uploadFolder, file);
            const publicId = path.parse(file).name; // Use filename as public_id (without ext)

            try {
                console.log(`Uploading ${file}...`);
                const result = await cloudinary.uploader.upload(filePath, {
                    public_id: publicId,
                    folder: 'wedding_assets', // Optional: organize in a folder
                    overwrite: true
                });
                console.log(`Uploaded ${file} -> ${result.public_id}`);
                mapping[file] = result.public_id;
            } catch (error) {
                console.error(`Failed to upload ${file}:`, error.message);
            }
        }
    }

    console.log('\n--- Upload Complete ---');
    console.log('Use these Public IDs in your code:');
    console.log(JSON.stringify(mapping, null, 2));
}

uploadImages();
