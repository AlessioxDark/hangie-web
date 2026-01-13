export type UUID = string;
export interface GroupData {
  nome: string;
  partecipanti_gruppo: Participant[];
  group_id: UUID;
  descrizione: string;
  createdBy: UUID;
  created_at: string;
  group_cover_img: string | null;
  event_id: UUID | null;
  updated_at: string | null;
}

export interface User {
  user_id: UUID;
  nome: string;
  handle: string;
  profile_pic: string | null;
}
export interface UserFull extends User {
  biografia: string;
  privacy_profilo: "private" | "public";
  email: string;
}
export interface Participant {
  correlation_id: UUID;
  role: "admin" | "member";
  joinedAt: string;
  group_id: UUID;
  user: User;
}
export interface Message {
  message_id: UUID;
  type: "event" | "message";
  event_id?: UUID;
  sent_at: string;
  isRead?: boolean;
  isSent?: boolean;
  isUser?: boolean;
  group_id: UUID;
  user_id: UUID;
  user: User;
  content: string;
}
// export { Message, User, UserFull, Participant, GroupData, UUID };
