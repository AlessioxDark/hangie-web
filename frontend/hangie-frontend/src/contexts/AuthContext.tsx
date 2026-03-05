import { createContext, useContext, useEffect, useState } from "react";
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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
      ("signed in succesfully", data);

      return { success: true, authData: data };
    } catch (error) {
      console.error("errore nel login", error);
    }
  };
  const LogoutUser = async () => {
    try {
      const isGuest = session?.user.is_anonymous;
      await supabase.auth.signOut();
      setSession(null);
      localStorage.removeItem("to_remember");
      if (isGuest) {
        await supabase.from("utenti").delete().eq("user_id", session?.user?.id);
        await supabase
          .from("amicizie")
          .delete()
          .eq("user_id", session?.user?.id);
        await supabase.from("gruppi").delete().in("group_id", groupIds);
        await supabase
          .from("partecipanti_gruppo")
          .delete()
          .in("group_id", groupIds);
        // rimuovi profilo
      }
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
    if (authData?.user) {
      console.log("c'è user");

      await supabase.from("utenti").insert({
        user_id: authData.user.id,
        handle: `guest_${Math.floor(Math.random() * 10000)}`,
        nome: `Ospite ${Math.random() * 1000}`,
        email: authData.user.id + "@guest.com",
        is_guest: true,
      });
      const newData = initialFriends.map((f) => {
        return {
          user_id: authData.user.id,
          sender_id: authData.user.id,
          amico_id: f,
          status: "accepted",
        };
      });
      await supabase.from("amicizie").insert(newData);
      const { data: groupData, error } = await supabase
        .from("gruppi")
        .insert(initialGroups)
        .select("group_id,createdBy");
      if (error) console.log(error);
      const newParticipantsData = groupData
        .map((g) => {
          return [
            ...initialFriends.map((f) => {
              return f == g.createdBy
                ? {
                    group_id: g.group_id,
                    role: "member",
                    partecipante_id: authData.user.id,
                  }
                : {
                    partecipante_id: f,
                    group_id: g.group_id,
                    role: g.createdBy == f ? "admin" : "member",
                  };
            }),
          ];
        })
        .flat();
      groupData.forEach((group) => {
        setGroupIds((prevGroups) => {
          return [...prevGroups, group.group_id];
        });
      });
      const { error: participantsError } = await supabase
        .from("partecipanti_gruppo")
        .insert(newParticipantsData);

      const theMessages = initialGroups.flatMap((group, index) => {
        const gid = groupData[index].group_id;
        const messageCount = 5;

        const hasEvent = index < 3;
        return Array.from({ length: messageCount }).map((_, i) => {
          const sender_id =
            i === 0
              ? group.createdBy
              : initialFriends[i % initialFriends.length];
          const isEvent = hasEvent && i === 0;

          return {
            group_id: gid,
            user_id: sender_id,
            type: isEvent ? "event" : "message",
            content: isEvent ? null : groupTemplates[group.nome][i - 1],
          };
        });
      });
      const { error: messagesError } = await supabase
        .from("messaggi")
        .insert(theMessages);
      console.log("i mess", theMessages);
      console.log("mess err", messagesError);
    }
    return { authData, authError };
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
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
