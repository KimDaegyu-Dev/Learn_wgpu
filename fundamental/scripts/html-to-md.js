#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');

function printHelp() {
  console.log(`Usage: node scripts/html-to-md.js [--input DIR] [--output DIR] [--overwrite]

Options:
  --input DIR     Input directory containing .html files (default: webgpu-lessons)
  --output DIR    Output directory for .md files (default: webgpu-lessons-md)
  --overwrite     Overwrite existing .md files (default: false)
  -h, --help      Show this help message
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { input: 'webgpu-lessons', output: 'webgpu-lessons-md', overwrite: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--input' && args[i + 1]) { opts.input = args[++i]; }
    else if (a === '--output' && args[i + 1]) { opts.output = args[++i]; }
    else if (a === '--overwrite') { opts.overwrite = true; }
    else if (a === '-h' || a === '--help') { printHelp(); process.exit(0); }
    else {
      console.warn(`Unknown arg: ${a}`);
      printHelp();
      process.exit(1);
    }
  }
  return opts;
}

async function walk(dir) {
  const results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of list) {
    const res = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      const nested = await walk(res);
      results.push(...nested);
    } else if (/\.html?$/i.test(dirent.name)) {
      results.push(res);
    }
  }
  return results;
}

async function convertFile(filePath, inputRoot, outputRoot, turndownService, overwrite) {
  const rel = path.relative(inputRoot, filePath);
  const outRel = rel.replace(/\.html?$/i, '.md');
  const dest = path.join(outputRoot, outRel);
  await fs.ensureDir(path.dirname(dest));
  if (!overwrite && await fs.pathExists(dest)) {
    console.log(`Skipping (exists): ${dest}`);
    return;
  }
  const html = await fs.readFile(filePath, 'utf8');
  const dom = new JSDOM(html);
  const md = turndownService.turndown(dom.window.document.body);
  await fs.writeFile(dest, md, 'utf8');
  console.log(`Converted: ${filePath} -> ${dest}`);
}

async function main() {
  const opts = parseArgs();
  const inputDir = path.resolve(process.cwd(), opts.input);
  const outputDir = path.resolve(process.cwd(), opts.output);

  if (!await fs.pathExists(inputDir)) {
    console.error(`Input directory does not exist: ${inputDir}`);
    process.exit(2);
  }

  await fs.ensureDir(outputDir);

  const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

  // Rule: preserve fenced code blocks and capture language if class="language-xxx" on <code>
  turndownService.addRule('fencedCodeBlock', {
    filter: function (node) {
      return node.nodeName === 'PRE' && node.firstChild && node.firstChild.nodeName === 'CODE';
    },
    replacement: function (content, node) {
      try {
        const codeNode = node.firstChild;
        const className = codeNode.getAttribute ? codeNode.getAttribute('class') || '' : '';
        const m = className.match(/language-([\w-]+)/);
        const lang = m ? m[1] : '';
        const code = codeNode.textContent || codeNode.innerText || '';
        return '\n\n```' + (lang || '') + '\n' + code + '\n```\n\n';
      } catch (e) {
        return '\n\n```\n' + (node.textContent || '') + '\n```\n\n';
      }
    }
  });

  const files = await walk(inputDir);
  if (files.length === 0) {
    console.log('No HTML files found in input directory.');
    return;
  }

  for (const file of files) {
    try {
      await convertFile(file, inputDir, outputDir, turndownService, opts.overwrite);
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err.message);
    }
  }

  console.log('✅ Conversion complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
