const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node parse-pdf.js <path-to-pdf>');
    process.exit(1);
  }

  try {
    const buffer = fs.readFileSync(inputPath);
    const parser = new PDFParse(new Uint8Array(buffer));
    const result = await parser.getText();
    await parser.destroy();

    let text = '';
    if (typeof result === 'string') {
      text = result;
    } else if (result && typeof result === 'object') {
      text = result.text || (Array.isArray(result.pages) ? result.pages.map(p => p.text).join('\n') : '');
    }

    process.stdout.write(JSON.stringify({ success: true, text }));
  } catch (e) {
    process.stdout.write(JSON.stringify({ success: false, error: e.message }));
  }
}

main();
