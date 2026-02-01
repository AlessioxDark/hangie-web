const Group = require("../models/groupModel");
// definire supabase e provare
const supabase = require("../config/db");

const getAllGroups = async (req, res) => {
  try {
    const { data, error } = await Group.getAll(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;

    const formattedData = data.map((row) => {
      let ultimoMessaggio = null;
      row.gruppi.messaggi.forEach((messaggio) => {
        console.log(messaggio);
        if (!ultimoMessaggio || messaggio.sent_at > ultimoMessaggio.sent_at) {
          ultimoMessaggio = messaggio;
        }
      });

      const { gruppi } = row;
      console.log("gruppi", gruppi);
      return {
        ...gruppi,
        ultimoMessaggio: ultimoMessaggio,
      };
    });
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: formattedData,
    });
  } catch (err) {
    console.log("ecco err", err.message);
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi gruppi",
      details: err.message,
    });
  }
};
const getSpecificGroup = async (req, res) => {
  try {
    const { data, error } = await Group.getGroup(req);
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare il tuo gruppo",
      details: err.message,
    });
  }
};
const getGroupEvents = async (req, res) => {
  try {
    const { data, error } = await Group.getEvents(req);
    if (error) throw error;
    console.log("da group events ecco data", data);
    const cleanData = data.map((response) => {
      // Estrae l'oggetto evento dal campo 'eventi' e aggiunge lo 'status'
      return {
        event_id: response.event_id,

        costo: response.eventi.costo,
        data: response.eventi.data,
        titolo: response.eventi.titolo,
        descrizione: response.eventi.descrizione,
        cover_img: response.eventi.cover_img,
        event_imgs: response.eventi.event_imgs,
        luogo: response.eventi.luoghi, // Attenzione, qui è 'luoghi' non 'luogo'
        utente: response.eventi.utenti,
        gruppo: response.eventi.gruppi, // Attenzione, qui è 'gruppi' non 'gruppo'
        scadenza: response.eventi.data_scadenza,
        group_id: response.group_id,
        status: response.status,
        risposte_evento: response.partecipanti,

        // Non includere ...dato (spread) qui se vuoi un oggetto pulito
      };
    });

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: cleanData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi eventi del gruppo",
      details: err.message,
    });
  }
};
const getSpecificGroupEvent = async (req, res) => {
  try {
    const { data, error } = await Group.getEvent(req);
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare l'evento",
      details: err.message,
    });
  }
};
const addNewGroup = async (req, res) => {
  try {
    const { data, error } = await Group.newGroup(req);
    console.log("c'è data o errore", { data, error });
    if (error) throw error;
    const { groupData, participants, creator } = data;
    console.log({ groupData, participants, creator });
    const notificationInsert = participants
      .filter((p) => p.user_id !== creator.id)
      .map((p) => {
        return {
          type: "new_group",
          is_read: false,
          group_id: groupData.group_id,
          created_at: new Date().toISOString(),
          sender_id: creator.id,
          user_id: p.user_id,
        };
      });
    const { error: notificanError } = await supabase
      .from("notifiche")
      .insert(notificationInsert);
    if (notificanError) throw notificanError;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a creare il gruppo",
      details: err.message,
    });
  }
};
const modifyGroup = async (req, res) => {
  try {
    const { data, error } = await Group.modify(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a fornire il gruppo",
      details: err.message,
    });
  }
};
const leaveGroup = async (req, res) => {
  try {
    console.log("arrivati a leave");
    const { data, error } = await Group.leave(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti ad abbandorare il gruppo",
      details: err.message,
    });
  }
};
const addParticipants = async (req, res) => {
  try {
    console.log("ci siamo?");
    const { data, error } = await Group.addParticipants(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti ad aggiungere il partecipante",
      details: err.message,
    });
  }
};
const removeParticipant = async (req, res) => {
  console.log("remove participant al backend");
  try {
    const { data, error } = await Group.removeParticipant(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a rimuovere il partecipante",
      details: err.message,
    });
  }
};
const modifyParticipant = async (req, res) => {
  try {
    const { data, error } = await Group.modifyParticipant(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a mettere admin partecipante",
      details: err.message,
    });
  }
};
module.exports = {
  getAllGroups,
  getSpecificGroup,
  getGroupEvents,
  getSpecificGroupEvent,
  addNewGroup,
  modifyGroup,
  leaveGroup,
  addParticipants,
  removeParticipant,
  modifyParticipant,
};
