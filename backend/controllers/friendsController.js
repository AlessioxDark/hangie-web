const Friends = require("../models/friendsModel");
const getAllFriends = async (req, res) => {
  try {
    const { data, error } = await Friends.getAll(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: data, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi amici", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
const getPendingFriends = async (req, res) => {
  try {
    const { data, error } = await Friends.getPending(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: data, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi amici", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
const sendFriendRequest = async (req, res) => {
  try {
    const { data, error } = await Friends.sendRequest(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: data, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi amici", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
const acceptFriendRequest = async (req, res) => {
  try {
    const { data, error } = await Friends.acceptRequest(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: data, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi amici", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
const deleteFriend = async (req, res) => {
  try {
    const { data, error } = await Friends.deleteFriend(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: data, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi amici", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
const GetFriends = async (req, res) => {
  try {
    const { data, error } = await Friends.getAccepted(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: data, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi amici", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
const GetFriendsByQuery = async (req, res) => {
  try {
    const { data, error } = await Friends.getByQuery(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: data, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi amici", // Messaggio generico per l'utente
      details: err.message,
    });
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
