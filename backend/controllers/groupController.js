const Group = require("../models/groupModel");
// definire supabase e provare
const supabase = require("../config/db");

const getAllGroups = async (req, res) => {
  try {
    const { data, error } = await Group.getAll(req); // Chiama il modello per ottenere gli eventi
    if (error) {
      console.log(error);
    }
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
    console.log(formattedData);
    res.json(formattedData); // Restituisce i dati come risposta
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getSpecificGroup = async (req, res) => {
  console.log("qui si");
  try {
    const { data, error } = await Group.getGroup(req);
    if (error) {
      console.log(error);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getGroupEvents = async (req, res) => {
  try {
    const { data, error } = await Group.getEvents(req);
    if (error) {
      console.log(error);
    }
    const cleanData = data.map((response) => {
      // Estrae l'oggetto evento dal campo 'eventi' e aggiunge lo 'status'
      return {
        event_id: response.event_id,
        risposte_eventi: response.eventi.risposte_eventi, // Stato (pending, accepted, refused)

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

        // Non includere ...dato (spread) qui se vuoi un oggetto pulito
      };
    });

    console.log("i dati eventi eventsdata", data);
    console.log("i dati eventi eventsdata clean", cleanData);

    res.json(cleanData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getSpecificGroupEvent = async (req, res) => {
  try {
    const { data, error } = await Group.getEvent(req);
    if (error) {
      console.log(error);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const addNewGroup = async (req, res) => {
  try {
    const { data, error } = await Group.newGroup(req);
    if (error) {
      console.log(error);
    }
    // fkfkfk
    const { groupData, participants, creator } = data;
    const notificationInsert = participants
      .filter((p) => p.partecipante_id !== creator.id)
      .map((p) => {
        return {
          type: "new_group",
          is_read: false,
          group_id: groupData.group_id,
          created_at: new Date().toISOString(),
          sender_id: creator.id,
          user_id: p.partecipante_id,
        };
      });
    const { data: notificationData, error: notificanError } = supabase
      .from("notifiche")
      .insert(notificationInsert);

    const io = req.io;

    //     participants.forEach((p) => {
    //     // 1. Evento specifico per la logica delle Chat

    // });
    //     participants
    //       .filter((p) => p.partecipante_id !== creator.id)
    //       .forEach((p) => {
    //           io.to(p.partecipante_id).emit("added_to_group", groupData);

    //     // 2. Evento generico per le Notifiche (il campanellino)
    //     io.to(p.partecipante_id).emit("new_notification", {
    //         type: "group_invite",
    //         sender: creator,
    //         text: `Ti ha aggiunto al gruppo ${groupData.nome}`
    //     });
    //         io.to(p.partecipante_id).emit("new_notification", {
    //           type: "new_group",
    //           sender: creator,
    //           group_id: groupData.group_id,
    //           gruppo: { nome: groupData.nome },
    //           user_id: p.partecipante_id,
    //           created_at: new Date().toISOString(),
    //           is_read: false,
    //         });
    //       });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const modifyGroup = async (req, res) => {
  try {
    const { data, error } = await Group.modify(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const leaveGroup = async (req, res) => {
  try {
    const { data, error } = await Group.leave(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const addParticipants = async (req, res) => {
  try {
    const { data, error } = await Group.addParticipants(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const removeParticipant = async (req, res) => {
  try {
    const { data, error } = await Group.removeParticipant(req); // Chiama il modello per ottenere gli eventi
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
};
