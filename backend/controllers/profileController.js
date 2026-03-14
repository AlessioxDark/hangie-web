const Profile = require("../models/profileModel");

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
      message: "Non siamo riusciti a trovare i dati del profilo",
      details: err.message,
    });
  }
};

const deleteGuest = async (req, res) => {
  try {
    const { data, error } = await Profile.deleteGuest(req);
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti chiudere la sessione",
      details: err.message,
    });
  }
};
const addGuest = async (req, res) => {
  try {
    const { data, error } = await Profile.addGuest(req);
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo creare la sessione",
      details: err.message,
    });
  }
};

module.exports = {
  getData,
  deleteGuest,
  addGuest,
};
