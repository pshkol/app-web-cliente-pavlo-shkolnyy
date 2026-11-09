import { writeFile } from "node:fs/promises";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://wmmiuijgcpsqsxszwhhk.supabase.co";
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

if (!SUPABASE_API_KEY?.startsWith("sb_publishable_")) {
  throw new Error("Configurá SUPABASE_API_KEY con una clave pública sb_publishable_ en .env.");
}

const url = new URL(SUPABASE_URL);
if (url.protocol !== "https:") {
  throw new Error("SUPABASE_URL debe usar HTTPS.");
}

await writeFile(
  new URL("../js/config.js", import.meta.url),
  "// Generado desde .env con scripts/configurar.mjs.\n" +
    `export const SUPABASE_URL = ${JSON.stringify(url.origin)};\n` +
    `export const SUPABASE_API_KEY = ${JSON.stringify(SUPABASE_API_KEY)};\n`,
);

console.log("Configuración pública de Supabase generada en js/config.js.");
