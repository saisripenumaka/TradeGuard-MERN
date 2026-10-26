const asyncHandler = require('express-async-handler');
const { upsertRegulations, localRegulations } = require('../services/pinecone');

// @desc    Seed default trade compliance regulations into Pinecone index
// @route   POST /api/admin/seed-regulations
// @access  Private/Admin
const seedRegulations = asyncHandler(async (req, res) => {
  try {
    console.log('Seeding regulations into Pinecone...');
    const result = await upsertRegulations(localRegulations);
    
    res.json({
      success: true,
      message: 'Compliance regulations seeded successfully!',
      mode: result.mode,
      count: localRegulations.length,
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to seed regulations: ${error.message}`);
  }
});

module.exports = {
  seedRegulations,
};
