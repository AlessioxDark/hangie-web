# HANGIE

> **Live Demo:** [http://www.hangie.vercel.app](http://www.hangie.vercel.app)
> _Nota: L'applicazione è ottimizzata per la visualizzazione su dispositivi mobile._

---

## 📝 Descrizione

Questo è il mi oprimo vero e proprio progetto fatto in full-stack, è stato iniziato ad ottobre 2025 con l'obiettivo di acquisire competenze avanzate ed imparare a gestire la complessità di un'applicazione reale.

L'app si chiama Hangie, è una web app che aiuta i suoi utenti ad organizzare eventi tra amici più facilmente, sostituendo tutte quelle difficoltà che si hanno durante l'organizzazione nelle app di messagistica comuni (Instagram, Whatsapp etc) riunendo tute le informazione e gestione degli eventi in un solo punto, risolvendo il problema della frammentazione delle informazioni nelle chat di gruppo e rendedo l'organizzaione di uscite di gruppo nettamente più semplice.

## ✨ Funzionalità Principali

- **Creazione Eventi:** Definizione di data, luogo, dettagli e immagini descrittive.
- **Gestione Partecipanti:** Visualizzazione in tempo reale di chi aderisce, chi disdice o chi è in attesa di votare.
- **Gestione Gruppi:** Spazi dedicati per ogni gruppo di amici dove creare eventi e scambiarsi informazioni.
- **Gestione Amicizie:** Sistema completo per inviare, accettare o annullare richieste di amicizia.
- **Dashboard:** Homepage dedicata per visualizzare e votare rapidamente gli eventi attivi.
- **Karma System:** Sistema di _gamification_ con punteggio Karma calcolato algoritmicamente in base alla partecipazione, utile per aumentare l'engagement.
- **Modalità Ospite:** Implementazione di una _Guest Session_ che genera dati temporanei reali per permettere il test immediato senza registrazione.
- **Sincronizzazione Real-time:** Utilizzo di WebSocket per l'aggiornamento istantaneo di messaggi e interazioni per tutti i partecipanti.
- **Personalizzazione:** Possibilità di modificare descrizioni, partecipanti e immagini cover di ogni gruppo.
- **Mobile-First & Redirect Desktop:** Interfaccia ottimizzata per smartphone con sistema di cortesia per gli utenti da PC.

## 🛠️ Stack Tecnologico

- **Frontend:** React.js, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database & Auth:** Supabase
- **Hosting:** Vercel

## 🚀 Le Sfide che ho affrontato (e cosa ho imparato)

1.   **Architettura dei Dati:** Ho imparato a strutturare i dati affinché seguano un flusso coerente tra il database server e la gestione in tempo reale tramite socket, garantendo l'integrità delle informazioni.
2.  **User Experience:** Ho scelto di concentrarmi sul mobile per rendere l'app più pratica. Implementare il blocco per la versione desktop mi ha insegnato a gestire il "responsive design" in modo creativo.
3.  **Problem Solving:** Durante lo sviluppo ho riscontrato diversi bug come quello più importante i messaggi che non venivano inviati. Risolverli mi ha permesso di capire meglio come funziona il debug nel browser.

## 🚧 Stato del Progetto

L'applicazione è un **MVP (Minimum Viable Product)** funzionante.

- **Bug Noti:** Sono consapevole di alcune piccole imperfezioni di funzionalità che sto rifinendo.

---

Realizzato con impegno da **Alessio Quaranta** | [Email](alessio40aq@gmail.com)
