import { useState } from "react";

const BASE_URL = "http://localhost:3000/api";
const handleResponse = async (res) => {
  console.log("arrivata res", res);
  if (!res.ok) {
    console.log("non è ok");
    const errorData = await res.json().catch(() => ({}));
    console.log("errore durante api call di:", errorData.messsage, res.status);
    throw new Error(errorData.message || `Errore: ${res.status}`);
  }
  console.log("è ok");
  const dataToSend = await res.json();
  console.log("eccoli:", dataToSend);
  return await dataToSend;
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
