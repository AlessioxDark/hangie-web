import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../config/db.js";
import { Navigate, useNavigate } from "react-router";
import { ApiCalls } from "@/services/api.js";
const initialFriends = [
  "983d5e8e-a192-4887-a9b3-c827f2a25535",
  "4bf31b17-a97a-44ae-9893-82e6e5649c6a",
  "a9f85964-3588-4e88-924f-95358a8c3424",
  "c9befc11-9861-4732-b0c9-135498ba7090",
  "caae1e69-09da-4e5d-97ac-6b09947c0edd",
  "5edc5a0c-1aa5-440b-9f01-7909f066dd2f",
];
const initialGroups = [
  {
    nome: "Vette & Sentieri",
    descrizione:
      "Il punto di ritrovo per chi ama le escursioni in montagna e la fotografia naturalistica.",
    createdBy: "983d5e8e-a192-4887-a9b3-c827f2a25535", // ID di Marco Rossi
    group_cover_img:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  },
  {
    nome: "Zaino in Spalla",
    descrizione:
      "Consigli, itinerari low-cost e ricerca di compagni di viaggio per girare il mondo.",
    createdBy: "4bf31b17-a97a-44ae-9893-82e6e5649c6a", // ID di Sara Bianchi
    group_cover_img:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
  },
  {
    nome: "Crossfit & Pizza",
    descrizione:
      "Ci alleniamo duramente per goderci la migliore pizza della città nel weekend.",
    createdBy: "a9f85964-3588-4e88-924f-95358a8c3424", // ID di Luca Moretti
    group_cover_img:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  },
  {
    nome: "Sketchbook Society",
    descrizione:
      "Incontri nei parchi per disegnare dal vivo e scambiarsi tecniche creative.",
    createdBy: "c9befc11-9861-4732-b0c9-135498ba7090", // ID di Elena Gialli
    group_cover_img:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
  },
  {
    nome: "Chef a Domicilio",
    descrizione:
      "Appassionati di cucina fusion che organizzano cene a rotazione a casa dei membri.",
    createdBy: "caae1e69-09da-4e5d-97ac-6b09947c0edd", // ID di Davide Neri
    group_cover_img:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
  },
];
const groupTemplates = {
  "Vette & Sentieri": [
    "Qualcuno ha controllato il meteo per domenica sul Gran Sasso?",
    "Ho appena comprato dei nuovi scarponi, devo provarli!",
    "La luce all'alba sulla cima era pazzesca, ecco la foto.",
    "Ragazzi, ricordatevi le torce frontali per la notturna!",
  ],
  "Zaino in Spalla": [
    "Ho trovato un volo per Tokyo a 400€, chi viene?",
    "Consigli per un ostello economico a Lisbona?",
    "Sto preparando lo zaino, sono a 7kg. Troppo?",
    "Qualcuno ha mai fatto il cammino di Santiago in solitaria?",
  ],
  "Crossfit & Pizza": [
    "Il WOD di oggi è stato devastante...",
    "Prenotato da 'Sorbillo' per sabato alle 21:00!",
    "Record personale di stacco da terra oggi! 🏋️‍♂️",
    "Quante pizze prendiamo? Io vado di doppia mozzarella.",
  ],
  "Sketchbook Society": [
    "Ci vediamo al parco alle 16:00 per disegnare?",
    "Ho provato i nuovi acquerelli, la grana è fantastica.",
    "Qualcuno sa come rendere meglio le ombre sul viso?",
    "Domenica c'è la mostra di Banksy, ci andiamo insieme?",
  ],
  "Chef a Domicilio": [
    "Stasera provo a fare il Ramen in casa, incrociate le dita.",
    "Chi porta il vino per la cena di venerdì?",
    "Ho scoperto un fornitore di spezie pazzesco!",
    "La cucina fusion tra messicano e giapponese è il futuro.",
  ],
};

const initialEvents = [
  {
    titolo: "Escursione Alba sul Gran Sasso",
    descrizione:
      "Partenza notturna per godersi l'alba dalla vetta. Portare abbigliamento a strati e torcia frontale.",
    data: "2026-05-15T03:30:00Z",
    data_scadenza: "2026-05-10T23:59:59Z",
    costo: 15.0,
    luogo_id: "08509cb5-1b88-4adc-9643-4aa50d6efa83",
    created_by: "983d5e8e-a192-4887-a9b3-c827f2a25535", // Marco Rossi
    cover_img:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
  },
  {
    titolo: "Meeting Pianificazione Viaggio Giappone",
    descrizione:
      "Ci incontriamo per definire l'itinerario finale e prenotare i Japan Rail Pass.",
    data: "2026-06-01T18:00:00Z",
    data_scadenza: "2026-05-25T23:59:59Z",
    costo: 0.0,
    luogo_id: "a12caf83-3238-4161-9573-8c921115b305",
    created_by: "4bf31b17-a97a-44ae-9893-82e6e5649c6a", // Sara Bianchi
    cover_img:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
  },
  {
    titolo: "Cena Post-WOD: Pizza e Carboidrati",
    descrizione:
      "Dopo l'allenamento intenso di sabato, reintegriamo con la migliore pizza di Napoli.",
    data: "2026-04-20T20:30:00Z",
    data_scadenza: "2026-04-18T12:00:00Z",
    costo: 25.0,
    luogo_id: "59553005-66bf-497e-919f-7919110121af",
    created_by: "a9f85964-3588-4e88-924f-95358a8c3424", // Luca Moretti
    cover_img:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
  },
];
const authContext = createContext({
  session: null,
  signUpNewUser: (arg) => arg,
  LoginUser: () => {},
  LogoutUser: () => {},
  isAuthLoading: false,
  handleGuestSignIn: () => {},
});

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [groupIds, setGroupIds] = useState([]);
  const [eventsIds, setEventsIds] = useState([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const isPopulatingGuest = useRef(false);
  const signUpNewUser = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error("error during signing up process:", error);
      return { success: false, authError: error };
    }
    return { success: true, authData: data };
  };
  const LoginUser = async (email, password, rememberMe) => {
    try {
      localStorage.setItem("to_remember", rememberMe.toString());

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("errore nel login", error);
        return { success: false, authError: error.message };
      }

      return { success: true, authData: data };
    } catch (error) {
      console.error("errore nel login", error);
    }
  };
  const LogoutUser = async () => {
    try {
      console.log("faccio il logout");
      await supabase.auth.signOut();
      setSession(null);
      localStorage.removeItem("to_remember");

      return <Navigate to={"/login"} replace />;
    } catch (error) {
      console.error("errore nel login", error);
    }
  };

  const handleGuestSignIn = async () => {
    console.log("ci proviamo");
    localStorage.setItem("to_remember", "true");

    const { data: authData, error: authError } =
      await supabase.auth.signInAnonymously();
    if (authError || !authData?.user) {
      return {
        authData: null,
        authError: authError?.message || "Errore sconosciuto",
      };
    }
    let guestData = {};
    if (authData?.user) {
      isPopulatingGuest.current = true;
      guestData = {
        user_id: authData.user.id,
        handle: `guest_${Math.floor(Math.random() * 10000)}`,
        nome: `Ospite ${Math.random() * 1000}`,
        email: authData.user.id + "@guest.com",
        is_guest: true,
      };
      await ApiCalls.addGuest(authData.session.access_token, {
        guestData,
      });
      console.log("c'è user");

      // //1. Inserisci profilo
      // await supabase.from("utenti").insert(guestData);

      // // 2. inserisci amici
      // const newData = initialFriends.map((f) => {
      //   return {
      //     user_id: authData.user.id,
      //     sender_id: authData.user.id,
      //     amico_id: f,
      //     status: "accepted",
      //   };
      // });
      // await supabase.from("amicizie").insert(newData);

      // // 3. inserisci gruppi
      // const { data: groupData, error } = await supabase
      //   .from("gruppi")
      //   .insert(initialGroups)
      //   .select("group_id,createdBy,nome");
      // if (error) console.log(error);
      // const gIds = groupData.map((g) => g.group_id);
      // setGroupIds(gIds);

      // // 4. Inserisci Partecipanti (Guest + Amici)

      // const newParticipantsData = groupData.flatMap((g) => {
      //   const participants = initialFriends.map((f) => ({
      //     group_id: g.group_id,
      //     partecipante_id: f,
      //     role: g.createdBy === f ? "admin" : "member",
      //   }));
      //   // Aggiungiamo anche il Guest stesso come membro
      //   participants.push({
      //     group_id: g.group_id,
      //     partecipante_id: authData.user.id,
      //     role: "member",
      //   });
      //   return participants;
      // });
      // await supabase.from("partecipanti_gruppo").insert(newParticipantsData);

      // const eventsWithGroup = initialEvents.map((event, index) => ({
      //   ...event,
      //   group_id: gIds[index], // Colleghiamo l'evento al gruppo corrispondente
      // }));
      // const { data: eventData, error: eError } = await supabase
      //   .from("eventi")
      //   .insert(eventsWithGroup)
      //   .select("event_id, created_by, group_id");

      // // 6. Inserisci Risposte Eventi
      // const risposte_eventi = eventData.flatMap((e) => {
      //   return [...initialFriends, authData.user.id].map((uId) => ({
      //     status:
      //       uId === e.created_by
      //         ? "accepted"
      //         : uId === authData.user.id
      //           ? "accepted"
      //           : "pending",
      //     user_id: uId,
      //     event_id: e.event_id,
      //   }));
      // });
      // await supabase.from("risposte_eventi").insert(risposte_eventi);

      // // 7. Inserisci Messaggi (inclusi gli Eventi nel feed)

      // const theMessages = groupData.flatMap((group, index) => {
      //   const hasEvent = index < 3;
      //   const relatedEvent = hasEvent
      //     ? eventData.find((e) => e.group_id === group.group_id)
      //     : null;
      //   console.log(
      //     "rel eve",
      //     groupTemplates[`${group.nome}`],
      //     group.nome,
      //     groupTemplates,
      //   );

      //   return Array.from({ length: 5 }).map((_, i) => {
      //     const isEvent = hasEvent && i === 0;
      //     const sender_id =
      //       i === 0
      //         ? group.createdBy
      //         : initialFriends[i % initialFriends.length];

      //     return {
      //       group_id: group.group_id,
      //       user_id: sender_id,
      //       type: isEvent ? "event" : "message",
      //       content: isEvent ? null : groupTemplates[group.nome][i],
      //       event_id: isEvent ? relatedEvent?.event_id : null,
      //     };
      //   });
      // });
      // await supabase.from("messaggi").insert(theMessages);

      // console.log("hai impostato tutti i dati, imposto sessione");
      isPopulatingGuest.current = false;
      setSession(authData?.session);
    }

    return { authData: { ...authData, guestData }, authError };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const wantToBeRemembered = localStorage.getItem("to_remember") === "true";
      if (session && !wantToBeRemembered) {
        await supabase.auth.signOut();

        setSession(null);
      } else {
        setSession(session);
      }
      setIsAuthLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (isPopulatingGuest.current) return;
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log("cambiata session", session);
  }, [session]);

  return (
    <authContext.Provider
      value={{
        session,
        handleGuestSignIn,
        signUpNewUser,
        LoginUser,
        LogoutUser,
        isAuthLoading,
      }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(authContext);
};
