const Friends = require("../models/friendsModel");
const getAllFriends = async (req, res) => {
  try {
    const { data, error } = await Friends.getAll(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.json(data); // Restituisce i dati come risposta
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getPendingFriends = async (req, res) => {
  try {
    const { data, error } = await Friends.getPending(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.json(data); // Restituisce i dati come risposta
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const sendFriendRequest = async (req, res) => {
  try {
    const { data, error } = await Friends.sendRequest(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const acceptFriendRequest = async (req, res) => {
  try {
    const { data, error } = await Friends.acceptRequest(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.json(data); // Restituisce i dati come risposta
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const deleteFriend = async (req, res) => {
  try {
    const { data, error } = await Friends.deleteFriend(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.json(data); // Restituisce i dati come risposta
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const GetFriends = async (req, res) => {
  try {
    const { data, error } = await Friends.getAccepted(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.json(data); // Restituisce i dati come risposta
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const GetFriendsByQuery = async (req, res) => {
  try {
    const { data, error } = await Friends.getByQuery(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.json(data); // Restituisce i dati come risposta
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  getAllFriends,
  getPendingFriends,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriend,
  GetFriends,
  GetFriendsByQuery,
};
