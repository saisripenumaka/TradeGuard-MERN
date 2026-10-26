const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenAI } = require('@google/genai');

// Initialize Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Local cache/fallback database for compliance regulations when Pinecone is not set up
let localRegulations = [
  {
    id: 'reg_ofac_sanctions',
    text: 'OFAC Sanctions & Country Restrictions: Exports of advanced electronics, military hardware, or dual-use items to heavily sanctioned destinations (including Iran, North Korea, Syria, Cuba, and Russia) are strictly prohibited without specific authorization or license from the Office of Foreign Assets Control.',
    metadata: { category: 'Sanctions', countryRestriction: 'High-risk countries' }
  },
  {
    id: 'reg_dual_use_tech',
    text: 'Export Control on Dual-Use Goods (EAR/ITAR): High-tech equipment, drones, microchips, and specific industrial machinery are classified as dual-use goods. Shipping these items requires verified ECCN classification and export control verification. Failure to declare dual-use items can lead to severe federal penalties.',
    metadata: { category: 'Export Control', productRestriction: 'Electronics' }
  },
  {
    id: 'reg_dangerous_goods_lithium',
    text: 'Dangerous Goods - Lithium-ion Batteries: Shipping lithium-ion batteries by air is strictly governed by IATA regulations. They must be packaged according to UN3480 specifications, be under 30% state of charge, and require explicit safety markings and MSDS (Material Safety Data Sheet) documentation.',
    metadata: { category: 'Hazardous Materials', productRestriction: 'Batteries' }
  },
  {
    id: 'reg_customs_documentation',
    text: 'Customs & Documentation Requirements: Every international shipment must include a Commercial Invoice, a detailed Packing List, and a Certificate of Origin. Product descriptions must correspond exactly to the declared HS (Harmonized System) code. Mismatches will result in customs seizure and holding.',
    metadata: { category: 'Customs', documentationRequirement: 'Required' }
  },
  {
    id: 'reg_eu_trade_policy',
    text: 'EU Trade Compliance and RoHS: Products imported into the European Union must have CE markings, RoHS (Restriction of Hazardous Substances) compliance certificates, and be checked against the EU Integrated Tariff (TARIC) database for import duties and product bans.',
    metadata: { category: 'Europe', documentationRequirement: 'CE Mark' }
  }
];

/**
 * Helper to generate 768-dimension text embeddings using Google's text-embedding-004
 */
const getEmbedding = async (text) => {
  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });

    if (response.embedding && response.embedding.values) {
      return response.embedding.values;
    }
    if (response.embeddings && response.embeddings[0] && response.embeddings[0].values) {
      return response.embeddings[0].values;
    }
    throw new Error('No embedding array in response');
  } catch (error) {
    console.error('Error generating Google embedding:', error);
    throw error;
  }
};

/**
 * Initializes Pinecone and ensures index exists
 */
const getPineconeIndex = async () => {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey || apiKey === 'your_pinecone_api_key' || apiKey.includes('key_here') || apiKey.trim() === '') {
    console.log('PINECONE_API_KEY is not configured. Running Pinecone in Mock Mode.');
    return null;
  }

  try {
    const pc = new Pinecone({ apiKey });
    const indexName = 'tradeguard-index';
    
    // Check list of indexes
    const indexList = await pc.listIndexes();
    const indexExists = indexList.indexes?.some(i => i.name === indexName);
    
    if (!indexExists) {
      console.log(`Pinecone index "${indexName}" not found. Creating serverless index...`);
      await pc.createIndex({
        name: indexName,
        dimension: 768,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      // Pause to let index spin up
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    return pc.index(indexName);
  } catch (error) {
    console.error('Pinecone connection error:', error.message);
    return null;
  }
};

/**
 * Upserts compliance chunks into Pinecone
 * @param {Array<{id: string, text: string, metadata: object}>} chunks 
 */
const upsertRegulations = async (chunks) => {
  try {
    const index = await getPineconeIndex();
    if (!index) {
      console.log('Skipping Pinecone upsert - index not available. Saving to local cache.');
      // Merge into local cache
      chunks.forEach(c => {
        const existing = localRegulations.findIndex(r => r.id === c.id);
        if (existing !== -1) {
          localRegulations[existing] = c;
        } else {
          localRegulations.push(c);
        }
      });
      return { success: true, mode: 'mock' };
    }

    // Generate embeddings and structure records
    const records = [];
    for (const chunk of chunks) {
      const values = await getEmbedding(chunk.text);
      records.push({
        id: chunk.id,
        values,
        metadata: {
          text: chunk.text,
          ...chunk.metadata
        }
      });
    }

    // Upsert to default namespace
    await index.upsert(records);
    return { success: true, mode: 'pinecone', count: records.length };
  } catch (error) {
    console.error('Error upserting to Pinecone:', error);
    throw error;
  }
};

/**
 * Queries Pinecone for top 3 matching regulations
 * @param {string} queryString - Shipment query description
 * @returns {Promise<string[]>} array of matching regulation text chunks
 */
const queryRegulations = async (queryString) => {
  try {
    const index = await getPineconeIndex();
    if (!index) {
      console.log('Pinecone index not available. Performing fallback local text keyword matching.');
      // Fallback: simple case-insensitive text match ranking
      const queryLower = queryString.toLowerCase();
      const matches = localRegulations
        .map(reg => {
          let score = 0;
          const words = queryLower.split(/\s+/);
          words.forEach(w => {
            if (reg.text.toLowerCase().includes(w)) score += 1;
            if (reg.metadata.category?.toLowerCase().includes(w)) score += 2;
          });
          return { reg, score };
        })
        .filter(match => match.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(match => match.reg.text);

      // If no matches, return the first 3 default regulations
      if (matches.length === 0) {
        return localRegulations.slice(0, 3).map(r => r.text);
      }
      return matches;
    }

    // Convert query to embedding
    const queryVector = await getEmbedding(queryString);

    // Query index
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true,
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      return queryResponse.matches.map(m => m.metadata.text);
    }
    
    return [];
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    // Safe fallback to local regulations on error
    return localRegulations.slice(0, 3).map(r => r.text);
  }
};

module.exports = {
  upsertRegulations,
  queryRegulations,
  localRegulations, // Exported for testing/seeding reference
};
