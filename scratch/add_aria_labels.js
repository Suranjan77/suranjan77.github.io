const fs = require('fs');
const path = require('path');

const dir = '/home/sur/repo/suranjan77.github.io/src/components/ui/visualizations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

console.log(`Scanning ${files.length} visualization files for ARIA labels...`);

for (const file of files) {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // 1. Process `<input` tags
  content = content.replace(/<input\b([^>]*)/g, (match, body) => {
    if (body.includes('aria-label=')) {
      return match;
    }
    let label = 'Adjustable parameter slider';
    const idMatch = body.match(/id="([^"]+)"/) || body.match(/id=\{`([^`]+)`\}/);
    if (idMatch) {
      label = `Control slider for ${idMatch[1].replace(/[-_]/g, ' ')}`;
    }
    return `<input aria-label="${label}"` + body;
  });

  // 2. Process `<select` tags
  content = content.replace(/<select\b([^>]*)/g, (match, body) => {
    if (body.includes('aria-label=')) {
      return match;
    }
    let label = 'Configuration selector';
    const idMatch = body.match(/id="([^"]+)"/);
    if (idMatch) {
      label = `Selector for ${idMatch[1].replace(/[-_]/g, ' ')}`;
    }
    return `<select aria-label="${label}"` + body;
  });

  // 3. Process `<button` tags - only if they don't have text content
  content = content.replace(/<button\b([^>]*?)>([\s\S]*?)<\/button>/g, (match, attrs, body) => {
    if (attrs.includes('aria-label=') || attrs.includes('title=')) {
      return match;
    }
    const textContent = body.replace(/<[^>]+>/g, '').trim();
    if (textContent.length > 0) {
      return match; // Has text, skip
    }
    return `<button aria-label="Action button"${attrs}>${body}</button>`;
  });

  // 4. Process `<svg` tags
  content = content.replace(/<svg\b([^>]*)/g, (match, body) => {
    let newBody = body;
    if (!body.includes('role=')) {
      newBody += ' role="img"';
    }
    if (!body.includes('aria-label=')) {
      const title = file.replace('Viz.tsx', '').replace(/([A-Z])/g, ' $1').trim();
      newBody += ` aria-label="Interactive ${title} visualization diagram"`;
    }
    return `<svg` + newBody;
  });

  // 5. Ensure SVG title exists
  let svgIdx = content.indexOf('<svg');
  if (svgIdx !== -1) {
    let closeSvgIdx = content.indexOf('>', svgIdx);
    if (closeSvgIdx !== -1) {
      const substring = content.substring(closeSvgIdx + 1, closeSvgIdx + 200);
      if (!substring.includes('<title>')) {
        const title = file.replace('Viz.tsx', '').replace(/([A-Z])/g, ' $1').trim();
        content = content.substring(0, closeSvgIdx + 1) + `\n            <title>${title} Diagram</title>` + content.substring(closeSvgIdx + 1);
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ARIA labels in ${file}`);
  }
}

console.log("Scan and update completed!");
