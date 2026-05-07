/* ============================================================
 * Firebase configuration — Comisaría N° 47
 * ----------------------------------------------------------------
 * Reemplazá los valores de abajo con los de TU proyecto Firebase.
 * Los obtenés en:
 *   https://console.firebase.google.com/  →  tu proyecto
 *   →  ⚙ Configuración del proyecto  →  Tus apps  →  Web App  →  Configuración del SDK
 *
 * Estos valores NO son secretos: van expuestos al navegador del usuario.
 * La seguridad real está en las reglas de Firestore/Storage que vas a
 * desplegar (firestore.rules / storage.rules).
 * ============================================================ */

export const firebaseConfig = {
  apiKey: "AIzaSyAUOV0jl765Oa3Batfpnw9yUVvmmWXHWj0",
  authDomain: "comisaria-47-neuquen.firebaseapp.com",
  projectId: "comisaria-47-neuquen",
  storageBucket: "comisaria-47-neuquen.firebasestorage.app",
  messagingSenderId: "188447698111",
  appId: "1:188447698111:web:24266b846248408ca32a0a"
};

/* ============================================================
 * Configuración general del sistema
 * ============================================================ */

export const SYSTEM_CONFIG = {
  // Nombre institucional (aparece en login, header, exports)
  comisaria: "Comisaría N° 47",
  comisariaSubtitulo: "Centro de Monitoreo · Villa Pehuenia · Moquehue · Lonco Luan",

  // Si está en true, exige login para entrar al sistema.
  // Si está en false (modo legacy), funciona como antes con localStorage/IndexedDB.
  // Mantenelo en false hasta haber configurado Firebase y creado el primer admin.
  AUTH_REQUIRED: true,

  // Persistencia de la sesión:
  //   "local"   → permanece después de cerrar el navegador (recomendado)
  //   "session" → se cierra al cerrar la pestaña
  //   "none"    → se cierra al recargar
  AUTH_PERSISTENCE: "local",

  // Si el usuario está sin actividad este tiempo (minutos), lo deslogueamos.
  // 0 = no hay timeout.
  SESSION_IDLE_TIMEOUT_MIN: 0,

  // Roles permitidos (debe coincidir con firestore.rules)
  ROLES: ["admin", "supervisor", "operador", "lectura"]
};
