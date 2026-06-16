"use client";

import React, { useState, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";

// Deterministic mock embedding generator based on word characters
function getMockEmbedding(word: string): number[] {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  
  // Semantic presets
  const presets: Record<string, number[]> = {
    cat: [0.8, 0.5, -0.2],
    dog: [0.75, 0.45, -0.15],
    kitten: [0.85, 0.55, -0.25],
    king: [0.1, -0.7, 0.8],
    queen: [0.15, -0.65, 0.75],
    man: [0.2, -0.3, 0.5],
    woman: [0.25, -0.25, 0.45],
    computer: [-0.8, 0.1, -0.7],
    robot: [-0.75, 0.15, -0.65]
  };

  if (presets[clean]) {
    return presets[clean];
  }

  // Generate deterministic vectors for other words
  let hash1 = 0;
  let hash2 = 0;
  let hash3 = 0;
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    hash1 = (hash1 * 31 + code) % 1000;
    hash2 = (hash2 * 37 + code) % 1000;
    hash3 = (hash3 * 41 + code) % 1000;
  }

  const v1 = (hash1 / 500.0) - 1.0;
  const v2 = (hash2 / 500.0) - 1.0;
  const v3 = (hash3 / 500.0) - 1.0;

  // Normalize
  const len = Math.sqrt(v1 * v1 + v2 * v2 + v3 * v3) || 1.0;
  return [v1 / len, v2 / len, v3 / len];
}

function computeCosineSimilarity(v1: number[], v2: number[]): number {
  let dot = 0;
  let len1 = 0;
  let len2 = 0;
  for (let i = 0; i < v1.length; i++) {
    dot += v1[i] * v2[i];
    len1 += v1[i] * v1[i];
    len2 += v2[i] * v2[i];
  }
  return dot / (Math.sqrt(len1) * Math.sqrt(len2)) || 0;
}

export default function EmbeddingsTokenizationViz() {
  const [inputText, setInputText] = useState<string>("Cat and dog are semantic neighbors. King and computer are not.");
  const [selectedTokens, setSelectedTokens] = useState<string[]>(["cat", "dog"]);

  // Simple token splitting (using standard boundaries)
  const tokens = useMemo(() => {
    // Split on words and punctuation
    const words = inputText.split(/(\s+|,|\.|\?|!|;)/).filter(t => t.length > 0);
    
    let tokenId = 100;
    return words.map(word => {
      const isWhitespace = /^\s+$/.test(word);
      const isPunctuation = /^[,.?!;]$/.test(word);
      const cleanToken = word.trim().toLowerCase();
      
      const id = isWhitespace ? -1 : tokenId++;
      
      return {
        id,
        text: word,
        cleanToken,
        isWhitespace,
        isPunctuation
      };
    });
  }, [inputText]);

  const similarityInfo = useMemo(() => {
    if (selectedTokens.length < 2) return null;
    const v1 = getMockEmbedding(selectedTokens[0]);
    const v2 = getMockEmbedding(selectedTokens[1]);
    const similarity = computeCosineSimilarity(v1, v2);

    return {
      v1,
      v2,
      similarity
    };
  }, [selectedTokens]);

  const handleTokenClick = (cleanToken: string) => {
    if (!cleanToken) return;
    
    // Toggle/select token
    if (selectedTokens.includes(cleanToken)) {
      setSelectedTokens(selectedTokens.filter(t => t !== cleanToken));
    } else {
      if (selectedTokens.length >= 2) {
        // Replace second token
        setSelectedTokens([selectedTokens[0], cleanToken]);
      } else {
        setSelectedTokens([...selectedTokens, cleanToken]);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="flex flex-col gap-4">
          {/* User Input Text Box */}
          <div className="rounded border border-outline bg-surface p-4">
            <label className="block mb-2 font-mono text-xs uppercase font-bold text-on-surface-variant" htmlFor="et-text-input">
              Type text here to tokenize live:
            </label>
            <input
              id="et-text-input"
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full border border-outline bg-surface p-2.5 text-sm rounded font-sans text-on-surface"
              placeholder="Type anything..."
              aria-label="Text to tokenize live input box"
            />
          </div>

          {/* Tokenization display */}
          <div className="relative border border-outline bg-surface overflow-hidden rounded p-4 min-h-[120px]">
            <div className="mb-2 font-mono text-[12px] font-bold uppercase tracking-wider text-primary">
              Tokenized Output (Click words to compare embeddings)
            </div>
            
            <div className="flex flex-wrap gap-2 items-center leading-relaxed">
              {tokens.map((token, idx) => {
                if (token.isWhitespace) {
                  return <span key={`ws-${idx}`} className="w-1" />;
                }

                const isSelected = selectedTokens.includes(token.cleanToken);
                
                return (
                  <button
                    key={`tok-${idx}`}
                    onClick={() => handleTokenClick(token.cleanToken)}
                    className={`inline-flex flex-col items-center border px-2.5 py-1 rounded text-xs transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-pink bg-pink/10 text-on-surface"
                        : "border-outline bg-surface hover:bg-grid text-on-surface"
                    }`}
                    style={{ minWidth: "30px" }}
                    aria-label={`Token ${token.text} with ID ${token.id}`}
                  >
                    <span className="font-bold font-sans">{token.text}</span>
                    <span className="text-[12px] text-muted font-mono">ID: {token.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Embedding Cosine Similarity Visualizer */}
          {similarityInfo && (
            <div
              className="relative border border-outline bg-surface overflow-hidden rounded p-4"
              role="img"
              aria-label="Tokenization and embedding comparison"
            >
              <div className="mb-3 font-mono text-[12px] font-bold uppercase tracking-wider text-primary">
                Semantic Embedding Space Comparison
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Vector 1 */}
                <div className="border border-outline bg-surface-container p-3 font-mono text-xs">
                  <div className="font-bold text-cyan mb-2">Token: &quot;{selectedTokens[0]}&quot;</div>
                  <div className="space-y-1">
                    {similarityInfo.v1.map((val, i) => (
                      <div key={`v1-dim-${i}`} className="flex items-center gap-2">
                        <span className="w-12">Dim {i+1}:</span>
                        <div className="flex-1 bg-grid h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan h-full"
                            style={{
                              width: `${Math.max(0, (val + 1.0) / 2.0 * 100)}%`
                            }}
                          />
                        </div>
                        <span className="w-10 text-right">{val.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vector 2 */}
                <div className="border border-outline bg-surface-container p-3 font-mono text-xs">
                  <div className="font-bold text-pink mb-2">Token: &quot;{selectedTokens[1]}&quot;</div>
                  <div className="space-y-1">
                    {similarityInfo.v2.map((val, i) => (
                      <div key={`v2-dim-${i}`} className="flex items-center gap-2">
                        <span className="w-12">Dim {i+1}:</span>
                        <div className="flex-1 bg-grid h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-pink h-full"
                            style={{
                              width: `${Math.max(0, (val + 1.0) / 2.0 * 100)}%`
                            }}
                          />
                        </div>
                        <span className="w-10 text-right">{val.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        {/* Comparison Output */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">Cosine Similarity</div>
          
          {selectedTokens.length < 2 ? (
            <div className="text-muted italic text-xs">Select two tokens from the box to compute similarity.</div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Selected:</span>
                <span className="font-bold text-cyan">&quot;{selectedTokens[0]}&quot; vs &quot;{selectedTokens[1]}&quot;</span>
              </div>
              <div className="flex justify-between items-center border-t border-outline pt-2">
                <span>Cosine Similarity:</span>
                <span className="font-bold text-pink text-lg">
                  {similarityInfo?.similarity.toFixed(4)}
                </span>
              </div>
              
              <div className="bg-grid p-2.5 rounded text-[12px] leading-snug font-sans text-on-surface-variant">
                {similarityInfo && similarityInfo.similarity > 0.7 && (
                  "High similarity: These tokens are semantically related (like 'cat' and 'dog'). Their vectors point in very similar directions."
                )}
                {similarityInfo && similarityInfo.similarity >= 0.2 && similarityInfo.similarity <= 0.7 && (
                  "Moderate similarity: These tokens have some minor shared context or syntactic similarities."
                )}
                {similarityInfo && similarityInfo.similarity < 0.2 && (
                  "Low similarity: These tokens represent completely different concepts, meaning their vectors are nearly orthogonal or opposite."
                )}
              </div>
            </div>
          )}
        </div>

        {/* Diagnostic presets */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">Preset Pairs to Try</div>
          <div className="flex flex-col gap-2">
            <button aria-label="cat vs dog (Related)"
              onClick={() => setSelectedTokens(["cat", "dog"])}
              className="w-full text-left p-1.5 border border-outline bg-surface hover:bg-grid rounded text-xs cursor-pointer"
            >
              cat vs dog (Related)
            </button>
            <button aria-label="king vs queen (Related gender swap)"
              onClick={() => setSelectedTokens(["king", "queen"])}
              className="w-full text-left p-1.5 border border-outline bg-surface hover:bg-grid rounded text-xs cursor-pointer"
            >
              king vs queen (Related gender swap)
            </button>
            <button aria-label="king vs computer (Unrelated)"
              onClick={() => setSelectedTokens(["king", "computer"])}
              className="w-full text-left p-1.5 border border-outline bg-surface hover:bg-grid rounded text-xs cursor-pointer"
            >
              king vs computer (Unrelated)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
