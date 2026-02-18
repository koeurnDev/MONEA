const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function createPreset() {
    console.log("Attempting to create 'wedding_upload' preset automatically...");
    try {
        const result = await cloudinary.api.create_upload_preset({
            name: "wedding_upload",
            unsigned: false, // This means it's SIGNED
            settings: {
                return_delete_token: true,
            }
        });
        console.log("Success! Preset created:", result.message);
    } catch (error) {
        if (error.error && error.error.message.includes("already exists")) {
            console.log("Notice: Preset 'wedding_upload' already exists. Attempting to update it to SIGNED mode...");
            try {
                await cloudinary.api.update_upload_preset("wedding_upload", {
                    unsigned: false
                });
                console.log("Success! Preset updated to SIGNED mode.");
            } catch (updateError) {
                console.error("Failed to update preset:", updateError.message);
            }
        } else {
            console.error("Error creating preset:", error.message || error);
        }
    }
}

createPreset();
