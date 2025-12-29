import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hangie.app",
  appName: "hangie-frontend",
  webDir: "dist",
  server: {
    // SOSTITUISCI CON IL TUO IP LOCALE (es. 192.168.1.15)
    url: "http://192.168.178.65:5173",
    cleartext: true,
  },
};

export default config;
