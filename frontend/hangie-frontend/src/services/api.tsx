const BASE_URL = "http://localhost:3000/api";
const handleResponse = async (res) => {
  console.log("arrivata res", res);
  if (!res.ok) {
    console.log("non è ok");
    const errorData = await res.json().catch(() => ({}));
    console.log("errore durante api call di:", errorData.message, res.status);
    throw { ...errorData, status: res.status };
  }
  console.log("è ok");
  const dataToSend = await res.json();
  console.log("invio datatosend", dataToSend);

  return dataToSend.data !== undefined ? dataToSend.data : dataToSend;
};

export const ApiCalls = {
  fetchGroups: async (token) => {
    const res = await fetch(`${BASE_URL}/groups?t=${Date.now()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },
  fetchSuspendedEvents: (token, offset) =>
    fetch(`${BASE_URL}/events/suspendedevenets/all`, {
      method: "POST",
      body: JSON.stringify({ offset }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  addNewEvent: (token, dataToSend) =>
    fetch(`${BASE_URL}/events/add/create-event`, {
      method: "POST",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  AddParticipants: (token, groupId, dataToSend) =>
    fetch(`${BASE_URL}add/participants/${groupId}`, {
      method: "PATCH",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  editGroupField: (token, groupId, dataToSend) =>
    fetch(`${BASE_URL}groups/modify/${groupId}`, {
      method: "PATCH",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  MakeParticipantAdmin: (token, groupId, dataToSend) =>
    fetch(`${BASE_URL}groups/modify/participants/${groupId}`, {
      method: "PATCH",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  handleRemoveParticipant: (token, groupId, dataToSend) =>
    fetch(`${BASE_URL}groups/remove/participants/${groupId}`, {
      method: "PATCH",
      body: JSON.stringify(dataToSend),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  handleLeaveGroup: (token, groupId) =>
    fetch(`${BASE_URL}groups/leave/participants/${groupId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  fetchChat: async (groupId, token) => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(res);
  },
  fetchEvent: async (eventId, token) => {
    const res = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await handleResponse(res);
  },
  deleteEvent: async (eventId, token) => {
    const res = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await handleResponse(res);
  },

  fetchGroupEvents: (groupId, token) =>
    fetch(`${BASE_URL}/groups/${groupId}/group-events`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(handleResponse),

  fetchHomeEvents: (offset, token) =>
    fetch(`${BASE_URL}/events/discover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ offset }),
    }).then(handleResponse),
};
