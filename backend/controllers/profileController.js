const Profile = require("../models/profileModel");

const getPfp = async (req, res) => {
  try {
    const { data, error } = await Profile.getPfp(req);
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare la pfp",
      details: err.message,
    });
  }
};
const getData = async (req, res) => {
  try {
    const { data, error } = await Profile.getData(req);
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare la pfp",
      details: err.message,
    });
  }
};

module.exports = {
  getPfp,
  getData,
};
