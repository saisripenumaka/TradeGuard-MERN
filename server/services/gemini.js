const { GoogleGenAI } = require('@google/genai');

// Initialize Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates a trade compliance analysis report using Gemini 3.1 Pro
 * 
 * @param {object} shipmentMetadata - Details of the shipment
 * @param {string} rawDocumentText - Raw text parsed from packing/invoice PDFs
 * @param {string[]} matchedRegulations - List of regulation text matching the query
 * @returns {Promise<object>} Parsed compliance analysis JSON
 */
const generateComplianceReport = async (shipmentMetadata, rawDocumentText, matchedRegulations) => {
  const {
    productName,
    originCountry,
    destinationCountry,
    quantity,
    value,
    shippingMethod
  } = shipmentMetadata;

  const contextStr = matchedRegulations && matchedRegulations.length > 0 
    ? matchedRegulations.map((reg, idx) => `[Regulation Chunk ${idx + 1}]:\n${reg}`).join('\n\n')
    : 'No matched regulations found in the knowledge base. Rely on general international trade rules.';

  const docTextSnippet = rawDocumentText 
    ? (rawDocumentText.length > 5000 ? rawDocumentText.substring(0, 5000) + '...[TRUNCATED]' : rawDocumentText)
    : 'No shipping document text uploaded or extracted.';

  const systemInstruction = `You are TradeGuard AI, a senior global trade compliance auditor and risk analyst. 
Your task is to analyze the shipment details and accompanying parsed document text against the provided regulatory chunks (or general trade regulations) and output a comprehensive compliance risk assessment report.

You MUST return strictly valid JSON matching the following structure:
{
  "overallRisk": "HIGH" | "MEDIUM" | "LOW",
  "scoreBreakdown": { 
    "documentation": Number, // Score from 0 to 100 representing documentation completeness and correctness (100 is best/lowest risk)
    "product": Number,       // Score from 0 to 100 representing safety/restrictions on product type (100 is best/lowest risk)
    "destination": Number,   // Score from 0 to 100 representing country/destination sanction/customs risk (100 is best/lowest risk)
    "regulatory": Number    // Score from 0 to 100 representing overall adherence to the matched compliance policies (100 is best/lowest risk)
  },
  "criticalIssues": [String],       // List of critical regulatory violations, missing required documents, or bans (empty if none)
  "warnings": [String],             // List of potential risks, missing standard details, or cautions (empty if none)
  "recommendedActions": [String]    // Numbered/ordered list of actionable steps the shipper must take to resolve issues and warnings
}

Guidelines:
1. "overallRisk" must be "HIGH" if there are any critical issues or bans (e.g. shipping dangerous goods without licensing, shipping to sanctioned countries).
2. "scoreBreakdown" values are integers between 0 and 100. Lower scores represent higher risk (e.g. documentation is 30/100 if there's no invoice or missing HS code).
3. Do not include any explanation, backticks, or wrapping markdown code blocks in your output. Return only the raw JSON.`;

  const userPrompt = `
### SHIPMENT METADATA:
- Product Name: ${productName}
- Origin Country: ${originCountry}
- Destination Country: ${destinationCountry}
- Quantity: ${quantity}
- Value (USD): $${value}
- Shipping Method: ${shippingMethod}

### EXTRACTED SHIPPING DOCUMENT TEXT (Invoice/Packing List):
${docTextSnippet}

### RETRIEVED REGULATORY KNOWLEDGE CONTEXT:
${contextStr}

Analyze this shipment for export control compliance, embargoes, hazardous materials rules, customs paperwork matches, and correct classification. Output the JSON compliance report.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        { text: systemInstruction },
        { text: userPrompt }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text().trim();
    
    // Parse the response text to JSON
    const reportData = JSON.parse(responseText);
    return reportData;
  } catch (error) {
    console.error('Error generating report from Gemini:', error);
    
    // Graceful fallback JSON if Gemini fails or output is malformed
    return {
      overallRisk: 'MEDIUM',
      scoreBreakdown: {
        documentation: 50,
        product: 60,
        destination: 70,
        regulatory: 50
      },
      criticalIssues: ['Unable to complete full AI compliance analysis. Running in fallback mode.'],
      warnings: ['Please verify all regulations manually as AI analysis timed out or encountered an error.'],
      recommendedActions: [
        'Review the shipment document text against international embargo/sanction lists.',
        'Double-check HS classification codes for the product.',
        'Ensure proper hazardous materials declarations if the product contains batteries or chemicals.'
      ]
    };
  }
};

module.exports = {
  generateComplianceReport,
};
