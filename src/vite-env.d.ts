/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_MODE?: string;
  readonly VITE_ADMIN_URL?: string;
  readonly VITE_PUBLIC_URL?: string;
  readonly VITE_NOTIFICATION_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
