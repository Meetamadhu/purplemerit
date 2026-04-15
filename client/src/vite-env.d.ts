/** Minimal env typing without referencing `vite/client` (avoids TS "types" resolution issues). */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
