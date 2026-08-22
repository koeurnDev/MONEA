import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const DIRS = ['public/images', 'public/images/khmer-legacy'];
const TARGET_SIZE = 500 * 1024; // 500KB

async function optimizeImages() {
  for (const IMAGES_DIR of DIRS) {
    if (!fs.existsSync(IMAGES_DIR)) {
      console.log(`[Skip] Directory not found: ${IMAGES_DIR}`);
      continue;
    }
    
    console.log(`[Scanning] ${IMAGES_DIR}...`);
    const files = fs.readdirSync(IMAGES_DIR);
    
    for (const file of files) {
      const filePath = path.join(IMAGES_DIR, file);
      const stats = fs.statSync(filePath);
      
      // Skip directories and anything already .webp
      if (stats.isDirectory() || file.endsWith('.webp')) continue;
      
      // Focus on large assets (> 500KB)
      if (stats.size > TARGET_SIZE) {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        const targetPath = path.join(IMAGES_DIR, `${base}.webp`);
        
        console.log(`[Optimize] ${file} (${(stats.size/1024).toFixed(1)} KB) -> WebP...`);
        
        try {
          await sharp(filePath)
            .webp({ quality: 85 })
            .toFile(targetPath);
          
          const newStats = fs.statSync(targetPath);
          const saving = ((1 - newStats.size / stats.size) * 100).toFixed(1);
          console.log(`[Saved] ${base}.webp (${(newStats.size/1024).toFixed(1)} KB) - Saved ${saving}%`);
        } catch (err) {
          console.error(`[Error] Failed to optimize ${file}:`, err);
        }
      }
    }
  }
}

optimizeImages().catch(console.error);
