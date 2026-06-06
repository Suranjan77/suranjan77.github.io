const { algorithmsList } = require('/home/sur/repo/suranjan77.github.io/src/data/algorithms_content/index.ts');

console.log(`Total algorithms: ${algorithmsList.length}`);
for (const mod of algorithmsList) {
  const refs = mod.references ? mod.references.length : 0;
  const diff = mod.difficulty;
  const tracks = mod.tracks ? mod.tracks.length : 0;
  const code = mod.codeSnippet ? mod.codeSnippet.length : 0;
  
  if (refs < 2 || diff === undefined || tracks === 0 || code === 0) {
    console.log(`Module: ${mod.id} | refs: ${refs} | difficulty: ${diff} | tracks: ${tracks} | codeSnippet length: ${code}`);
  }
}
