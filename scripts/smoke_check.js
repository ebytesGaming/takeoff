const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IGNORE = new Set(['node_modules', '.git']);
const jsFiles = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(name.name)) continue;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full);
    else if (name.isFile() && name.name.endsWith('.js')) jsFiles.push(full);
  }
}

walk(ROOT);

const requireRe = /require\(\s*(["'`])(.+?)\1\s*\)/g;
const importRe = /from\s+(["'`])(.+?)\1/g; // catch import ... from '...'

const missing = [];

function existsTarget(baseFile, target) {
  // Only check relative targets
  if (!target.startsWith('.')) return true; // not our problem here

  const baseDir = path.dirname(baseFile);
  const p = path.resolve(baseDir, target);
  const candidates = [p, p + '.js', path.join(p, 'index.js')];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return true;
  }
  return false;
}

for (const file of jsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = requireRe.exec(content))) {
    const target = m[2];
    if (target === '...') continue; // skip comment-placeholder matches
    if (!existsTarget(file, target)) missing.push({ file, target });
  }
  while ((m = importRe.exec(content))) {
    const target = m[2];
    if (target === '...') continue; // skip comment-placeholder matches
    if (!existsTarget(file, target)) missing.push({ file, target });
  }
}

if (missing.length === 0) {
  console.log('SMOKE CHECK: OK — no missing relative require/import targets found.');
  process.exit(0);
} else {
  console.log('SMOKE CHECK: FAIL — missing relative targets:');
  for (const item of missing) {
    console.log(`- ${path.relative(ROOT, item.file)} -> ${item.target}`);
  }
  process.exit(2);
}
