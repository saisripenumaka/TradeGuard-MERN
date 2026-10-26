const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from a PDF buffer and chunks it into 500-token sections with 50-token overlap.
 * Assumes 1 token ≈ 0.75 words, so 500 tokens ≈ 375 words, and 50 tokens ≈ 37 words overlap.
 * 
 * @param {Buffer} pdfBuffer - File buffer from upload
 * @returns {Promise<{text: string, chunks: string[]}>}
 */
const parseAndChunkPDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text || '';
    
    // Clean whitespace
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    
    // Split into words
    const words = cleanedText.split(' ').filter(word => word.length > 0);
    
    // Estimate: 500 tokens -> ~375 words, 50 tokens -> ~37 words
    const CHUNK_SIZE_WORDS = 375;
    const OVERLAP_WORDS = 37;
    
    const chunks = [];
    
    if (words.length <= CHUNK_SIZE_WORDS) {
      if (words.length > 0) {
        chunks.push(words.join(' '));
      }
    } else {
      let startIndex = 0;
      while (startIndex < words.length) {
        const chunkWords = words.slice(startIndex, startIndex + CHUNK_SIZE_WORDS);
        chunks.push(chunkWords.join(' '));
        
        // Move sliding window forward by size - overlap
        startIndex += (CHUNK_SIZE_WORDS - OVERLAP_WORDS);
        
        // Safety check to prevent infinite loop
        if (CHUNK_SIZE_WORDS <= OVERLAP_WORDS) break;
      }
    }
    
    return {
      text: cleanedText,
      chunks,
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF document: ${error.message}`);
  }
};

module.exports = {
  parseAndChunkPDF,
};
