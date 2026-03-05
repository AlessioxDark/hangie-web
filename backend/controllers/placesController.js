const Places = require("../models/placesModel");

const getNearbyEvents = async (req, res) => {
  try {
    req.body;
    const { data, error } = await Places.getNearby(req); // Chiama il modello
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getNearbyEvents,
};
