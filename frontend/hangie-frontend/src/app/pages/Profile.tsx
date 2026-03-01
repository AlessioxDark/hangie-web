import ChevronLeft from "@/assets/icons/ChevronLeft";
import KarmaBadge from "@/components/profile/KarmaBadge";
import StatBlock from "@/components/profile/StatBlock";
import ProfileIcon from "@/components/ProfileIcon";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useProfile } from "@/contexts/ProfileContext";
import EventCard from "@/features/events/EventCard";
import RenderErrorState from "@/features/utils/RenderErrorState";
import RenderLoadingState from "@/features/utils/RenderLoadingState";
import React, { useState } from "react";
import { useNavigate } from "react-router";

/* ─────────────────────────────────────────────────────────────
   Design Tokens (strict palette)
───────────────────────────────────────────────────────────── */
const P = {
  primary: "#2463eb",
  primaryLight: "#eff4ff",
  primaryMid: "#dbeafe",
  bg1: "#ffffff",
  bg2: "#f8fafc",
  bg3: "#e2e8f0",
  t1: "#0f172a",
  t2: "#64748b",
  t3: "#94a3b8",
};

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    month: d.toLocaleString("it", { month: "short" }).toUpperCase(),
    weekday: d.toLocaleString("it", { weekday: "short" }).toUpperCase(),
  };
};

const Sep = () => (
  <div className="w-px h-7 rounded-full" style={{ background: P.bg3 }} />
);

/* ─────────────────────────────────────────────────────────────
   Tab Bar
───────────────────────────────────────────────────────────── */
const TABS = [
  { id: "programma", label: "In programma" },
  { id: "organizzati", label: "Organizzati" },
  { id: "passati", label: "Passati" },
];

const TabBar = ({ active, onChange }) => (
  <div className="flex" style={{ borderBottom: `1.5px solid ${P.bg3}` }}>
    {TABS.map((t) => {
      const on = active === t.id;
      return (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="flex-1 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-colors"
          style={{
            color: on ? P.primary : P.t3,
            borderBottom: on
              ? `2px solid ${P.primary}`
              : "2px solid transparent",
          }}
        >
          {t.label}
        </button>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Status Badge
───────────────────────────────────────────────────────────── */
const STATUS_MAP = {
  accepted: { dot: "#16a34a", label: "Confermato" },
  pending: { dot: "#d97706", label: "In attesa" },
  rejected: { dot: "#dc2626", label: "Rifiutato" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? { dot: P.t3, label: status };
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: s.dot }}
      />
      <span className="text-[10px] font-semibold" style={{ color: s.dot }}>
        {s.label}
      </span>
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   Event Row
───────────────────────────────────────────────────────────── */
const EventRow = ({ event, isOwner }) => {
  const { day, month } = formatDate(event.data);
  return (
    <div
      className="flex items-center gap-4 px-4 py-4 rounded-2xl active:opacity-70 transition-opacity cursor-pointer"
      style={{ background: P.bg1, border: `1px solid ${P.bg3}` }}
    >
      {/* Date block */}
      <div
        className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center"
        style={{
          background: P.primaryLight,
          border: `1px solid ${P.primaryMid}`,
        }}
      >
        <span
          className="text-[8px] font-black uppercase tracking-wider"
          style={{ color: P.primary }}
        >
          {month}
        </span>
        <span
          className="text-xl font-black leading-none"
          style={{ color: P.primary }}
        >
          {day}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="font-bold text-[14px] truncate"
            style={{ color: P.t1 }}
          >
            {event.titolo}
          </h3>
          {isOwner && (
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
              style={{ background: P.primaryMid, color: P.primary }}
            >
              ORG
            </span>
          )}
        </div>
        {/* {event.luogo && (
          <p className="text-xs truncate mt-0.5" style={{ color: P.t3 }}>
            {event.luogo}
          </p>
        )} */}
        <div className="mt-1.5">
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Arrow */}
      <svg
        width="16"
        height="16"
        fill="none"
        stroke={P.t3}
        strokeWidth="2"
        viewBox="0 0 24 24"
        className="shrink-0"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Empty State
───────────────────────────────────────────────────────────── */
const EMPTY_MAP = {
  programma: {
    label: "Nessun evento in programma",
    sub: "Aspetta un invito o proponi qualcosa al gruppo.",
  },
  organizzati: {
    label: "Nessun evento organizzato",
    sub: "Metti su qualcosa, il gruppo aspetta.",
  },
  passati: {
    label: "Nessun evento passato",
    sub: "Il meglio deve ancora venire.",
  },
};

const EmptyState = ({ tab }) => {
  const e = EMPTY_MAP[tab] ?? EMPTY_MAP.programma;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: P.bg2, border: `1px solid ${P.bg3}` }}
      >
        <svg
          width="20"
          height="20"
          fill="none"
          stroke={P.t3}
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </div>
      <p className="font-bold text-sm" style={{ color: P.t1 }}>
        {e.label}
      </p>
      <p className="text-xs mt-1 leading-relaxed" style={{ color: P.t3 }}>
        {e.sub}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Friends Avatars Strip
───────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const Profile = () => {
  const navigate = useNavigate();
  const { profileData, getProfileData } = useProfile();
  const { session, LogoutUser } = useAuth();
  const { loading, error } = useApi();
  const [activeTab, setActiveTab] = useState("programma");

  if (loading?.profile) return <RenderLoadingState type="profile" />;
  if (error?.profile)
    return <RenderErrorState type="profile" reloadFunction={getProfileData} />;

  const now = new Date();
  const allEvents = [...(profileData?.newEventsData ?? [])];

  const getFilteredEvents = () => {
    if (activeTab === "programma")
      return allEvents.filter((e) => {
        const d = new Date(e.data);
        return d >= now && (e.status === "accepted" || e.status === "pending");
      });
    if (activeTab === "organizzati")
      return allEvents.filter((e) => e.created_by === session.user.id);
    if (activeTab === "passati")
      return allEvents.filter(
        (e) =>
          new Date(e.data) < now &&
          (e.status === "accepted" || e.status == "rejected"),
      );
    return [];
  };
  // risolcvere bug eventi gestire aspetto
  const filtered = getFilteredEvents();

  const karma = profileData?.karma ?? 82;
  const isOwnProfile = session.user.id == profileData?.user_id; // sostituisci con logica reale (es. profileData.user_id === currentUser.id)

  return (
    <div className="flex flex-col " style={{ background: P.bg1 }}>
      {/* ── HEADER CARD ── */}
      <div style={{ background: P.bg1, borderBottom: `1px solid ${P.bg3}` }}>
        {/* Avatar + Name + Karma */}
        {!isOwnProfile ? (
          <div>
            <div className="w-8 h-8" onClick={() => navigate(-1)}>
              <ChevronLeft color={"#2463eb"} />
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-end px-4 pt-2.5">
            {" "}
            <button
              className=" px-5 py-2 text-white text-sm font-body  bg-red-500 font-semibold rounded-2xl active:bg-red-400 transition-all shadow-sm"
              onClick={LogoutUser}
            >
              Logout
            </button>
          </div>
        )}
        <div
          className={`flex items-center justify-between px-4 ${isOwnProfile && "pt-6"} pb-5`}
        >
          <div className="flex items-center gap-4">
            <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden shrink-0">
              <ProfileIcon user_id={profileData?.user_id} />
            </div>
            <div>
              <h1
                className="text-[18px] font-black leading-tight"
                style={{ color: P.t1 }}
              >
                {profileData?.nome ?? "Utente"}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: P.t3 }}>
                @{profileData?.handle}
              </p>
            </div>
          </div>
          <KarmaBadge points={karma} />
        </div>

        {/* Bio */}
        {profileData?.biografia && (
          <div className="mx-4 mb-4 px-4 py-3 rounded-xl">
            <p
              className="text-sm leading-relaxed break-words"
              style={{ color: P.t2 }}
            >
              {profileData.biografia}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-around px-4 pb-5">
          <StatBlock
            value={profileData?.acceptedEventsCount || 0}
            label="Uscite"
          />
          <Sep />
          <StatBlock
            value={profileData?.createdEventsCount}
            label="Organizzate"
          />
          <Sep />
          <StatBlock value={profileData?.pastAttendedCount} label="Passate" />
          <Sep />
          <StatBlock value={profileData?.friendsCount} label="Amici" />
        </div>

        {/* CTA */}
        <div className="px-4 pb-4 " style={{ background: P.bg1 }}>
          {!isOwnProfile && (
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                style={{ background: P.primary }}
              >
                Aggiungi amico
              </button>
              {/* <button
                className="px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{
                  background: P.bg2,
                  border: `1px solid ${P.bg3}`,
                  color: P.t2,
                }}
              >
                Messaggio
              </button> */}
            </div>
          )}
        </div>

        {/* Tabs */}
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      {/* ── EVENTI ── */}
      <div className="px-4 pt-4 space-y-3 ">
        {filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              // isOwner={event.created_by === profileData.user_id}
            />
          ))
        )}
      </div>
      {filtered.length > 0 && (
        <p
          className="text-center text-xs mt-6 pb-2 font-semibold"
          style={{ color: P.t3 }}
        >
          {filtered.length} event{filtered.length !== 1 ? "i" : "o"}
        </p>
      )}
    </div>
  );
};

export default Profile;
