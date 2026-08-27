/**
 * Mobile Performance Testing Script
 * Run this to test mobile optimizations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Mobile Performance Test Starting...');

// Test 1: Bundle Size Analysis
console.log('\n📦 Testing Bundle Size...');

function getFileSizeInMB(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

function analyzeDistFolder() {
  const distPath = path.join(__dirname, '../dist');
  if (!fs.existsSync(distPath)) {
    console.log('❌ Dist folder not found. Run: npm run build');
    return;
  }

  const files = fs.readdirSync(distPath, { recursive: true });
  let totalSize = 0;
  const jsFiles = [];
  const cssFiles = [];

  files.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.statSync(filePath).isFile()) {
      const size = parseFloat(getFileSizeInMB(filePath));
      totalSize += size;
      
      if (file.endsWith('.js')) {
        jsFiles.push({ name: file, size });
      } else if (file.endsWith('.css')) {
        cssFiles.push({ name: file, size });
      }
    }
  });

  console.log(`📊 Total Bundle Size: ${totalSize.toFixed(2)} MB`);
  console.log(`📄 JavaScript Files: ${jsFiles.length}`);
  console.log(`🎨 CSS Files: ${cssFiles.length}`);

  // Check if mobile-optimized
  if (totalSize > 5) {
    console.log('⚠️  Bundle size is large for mobile (>5MB)');
  } else if (totalSize > 2) {
    console.log('⚡ Bundle size is acceptable for mobile (2-5MB)');
  } else {
    console.log('✅ Bundle size is excellent for mobile (<2MB)');
  }

  // Show largest files
  console.log('\n🔍 Largest JavaScript Files:');
  jsFiles.sort((a, b) => b.size - a.size).slice(0, 5).forEach(file => {
    console.log(`  - ${file.name}: ${file.size} MB`);
  });
}

// Test 2: Mobile-Specific Code Analysis
console.log('\n📱 Analyzing Mobile Optimizations...');

function checkMobileOptimizations() {
  const checks = [
    { 
      file: '../src/App.tsx',
      pattern: /isMobile.*AnimationProvider/s,
      description: 'Conditional Animation Provider for mobile'
    },
    {
      file: '../src/hooks/useAuth.tsx', 
      pattern: /fetchingRef\.current/,
      description: 'Auth hook concurrent fetch prevention'
    },
    {
      file: '../src/components/providers/SWRProvider.tsx',
      pattern: /mobileOptimized/,
      description: 'Mobile-optimized SWR configuration'
    },
    {
      file: '../src/app/globals.css',
      pattern: /@media \(max-width: 768px\)/,
      description: 'Mobile-specific CSS optimizations'
    },
    {
      file: '../vite.config.ts',
      pattern: /drop_console/,
      description: 'Production console removal for mobile'
    }
  ];

  checks.forEach(check => {
    const filePath = path.join(__dirname, check.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.description}`);
      } else {
        console.log(`❌ Missing: ${check.description}`);
      }
    } else {
      console.log(`❓ File not found: ${check.file}`);
    }
  });
}

checkMobileOptimizations();

// Test 3: Performance Recommendations
console.log('\n💡 Mobile Performance Recommendations:');
console.log('1. ✅ Use conditional providers for mobile');
console.log('2. ✅ Implement request deduplication');
console.log('3. ✅ Reduce CSS complexity for mobile GPUs');
console.log('4. ✅ Split heavy features into separate chunks');
console.log('5. ✅ Remove console.log in production');
console.log('6. 📱 Test on actual mobile devices');
console.log('7. 🔍 Monitor mobile Core Web Vitals');
console.log('8. 🚀 Consider PWA features for app-like experience');

// Test 4: Next Steps
console.log('\n🎯 Next Steps:');
console.log('1. npm run build - Build optimized bundle');
console.log('2. npm run preview - Test production build locally');
console.log('3. Test on mobile devices and check DevTools');
console.log('4. Monitor mobile performance metrics');

analyzeDistFolder();

console.log('\n🚀 Mobile Performance Test Complete!');