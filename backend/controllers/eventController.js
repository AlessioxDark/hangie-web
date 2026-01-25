const Event = require("../models/eventModel");

const getAllEvents = async (req, res) => {
  try {
    const { data, error } = await Event.getAll(req);
    if (error) throw error;
    const cleanData = data.map((response) => {
      const new_risposte = {
        accepted: response.partecipanti.filter((r) => r.status == "accepted"),
        pending: response.partecipanti.filter((r) => r.status == "pending"),
        refused: response.partecipanti.filter((r) => r.status == "refused"),
      };
      return {
        event_id: response.event_id,
        status: response.status, // Stato (pending, accepted, refused)
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
        risposte_evento: new_risposte,
        // Non includere ...dato (spread) qui se vuoi un oggetto pulito
      };
    });

    const newCleanData = {
      pending: cleanData.filter((response) => {
        return response.status == "pending";
      }),
      accepted: cleanData.filter((response) => {
        return response.status == "accepted";
      }),
      refused: cleanData.filter((response) => {
        // ⬅️ Aggiungi 'refused' (o 'rejected' se usi quel termine)
        return response.status == "refused";
      }),
    };

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: newCleanData, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi eventi", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
const getMyEvents = async (req, res) => {
  try {
    const { finalData, error } = await Event.getEvents();

    if (error) {
      console.error("Errore nel modello Event.getEvents():", error);
      return res.status(500).json({ error: error.message });
    }

    // Assicurati che finalData non sia undefined o null
    const responseData = finalData || [];
    console.log("Dati da inviare:", responseData);

    // Invia la risposta JSON con i dati, o un array vuoto se i dati non sono stati trovati
    res.json({ data: responseData });
  } catch (err) {
    // Gestisce qualsiasi altro errore inaspettato
    console.error("Errore inaspettato nel controller:", err.message);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
const getSpecificEvent = async (req, res) => {
  try {
    const { data, error } = await Event.getEvent(req);
    console.log(data);
    if (error) throw error;
    let newData = {
      event_id: data.event_id,
      status: data.status, // Stato (pending, accepted, refused)
      costo: data.eventi.costo,
      data: data.eventi.data,
      titolo: data.eventi.titolo,
      descrizione: data.eventi.descrizione,
      cover_img: data.eventi.cover_img,
      event_imgs: data.eventi.event_imgs,
      luogo: data.eventi.luoghi, // Attenzione, qui è 'luoghi' non 'luogo'
      utente: data.eventi.utenti,
      gruppo: data.eventi.gruppi, // Attenzione, qui è 'gruppi' non 'gruppo'
      scadenza: data.eventi.data_scadenza,
      risposte_evento: {
        refused: [],
        accepted: [],
        pending: [],
      },
    };
    console.log("data che invio", newData);
    data.partecipanti.forEach((risposta) => {
      if (risposta.status == "accepted") {
        newData.risposte_evento.accepted.push(risposta);
      }
      if (risposta.status == "rejected") {
        newData.risposte_evento.refused.push(risposta);
      }
      if (risposta.status == "pending") {
        newData.risposte_evento.pending.push(risposta);
      }
    });

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: newData, // <--- I dati reali che hai appena creato o modificato
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare il tuo evento", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
const modifyEvent = async (req, res) => {
  try {
    const { data, error } = await Event.modify(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const addNewEvent = async (req, res) => {
  try {
    const { data, error } = await Event.newEvent(req);
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Operazione completata con successo",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a creare il tuo evento",
      details: err.message,
    });
  }
};
const modifyResponseEvent = async (req, res) => {
  try {
    const { data, error } = await Event.modifyResponse(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getSuspendedEvents = async (req, res) => {
  try {
    const { data, error } = await Event.getSuspended(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    const cleanData = data.map((response) => {
      return {
        event_id: response.event_id,
        status: response.status, // Stato (pending, accepted, refused)
        costo: response.eventi.costo,
        data: response.eventi.data,
        titolo: response.eventi.titolo,
        descrizione: response.eventi.descrizione,
        cover_img: response.eventi.cover_img,
        event_imgs: response.eventi.event_imgs,
        luogo: response.eventi.luoghi, // Attenzione, qui è 'luoghi' non 'luogo'
        utente: response.eventi.utenti,
        gruppo: response.eventi.gruppi, // Attenzione, qui è 'gruppi' non 'gruppo'
        scadenza: response.eventi.data_scadenza, // Attenzione, qui è 'gruppi' non 'gruppo'
      };
    });
    res.status(200).json({
      success: true,
      message: "Operazione completata con successo", // Opzionale, utile per i toast
      data: cleanData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Non siamo riusciti a trovare i tuoi eventi in sospeso", // Messaggio generico per l'utente
      details: err.message,
    });
  }
};
module.exports = {
  getAllEvents,
  getMyEvents,
  getSpecificEvent,
  modifyEvent,
  addNewEvent,
  modifyResponseEvent,
  getSuspendedEvents,
};
