# Comisaría N° 47 — Configuración Firebase (Fase 1)
## Auth + Roles + Reglas de seguridad

> Esta es la **Fase 1** de la migración a Firebase. Cubre:
> - Autenticación con email/contraseña
> - Sistema de roles (admin / supervisor / operador / lectura)
> - Reglas de seguridad pre-configuradas para todas las fases siguientes
> - Login screen con diseño táctico
>
> Las **Fases 2-5** (datos en Firestore, fotos en Storage, auditoría, edición controlada) se entregan por separado para no romper el sistema en una sola jugada.

---

## 1. Crear el proyecto Firebase (5 minutos)

1. Ir a **https://console.firebase.google.com/**
2. **"Agregar proyecto"** → nombre sugerido: `comisaria-47-neuquen`
3. Saltear Google Analytics (no es necesario para uso interno)
4. Esperar que se cree el proyecto

---

## 2. Habilitar Authentication

1. En el menú izquierdo: **Build → Authentication**
2. Click en **"Get started"**
3. En "Sign-in method" elegir **"Email/Password"** → habilitar el primer toggle (sin link de email)
4. Guardar

---

## 3. Crear Firestore Database

1. En el menú: **Build → Firestore Database**
2. **"Create database"**
3. Elegir **modo producción** (no test)
4. Ubicación recomendada: **`southamerica-east1` (São Paulo)** — la más cercana a Argentina
5. Esperar que se cree

---

## 4. Crear Storage

1. En el menú: **Build → Storage**
2. **"Get started"** → modo producción → misma región que Firestore
3. Esperar

---

## 5. Obtener las credenciales web

1. En **⚙ Configuración del proyecto** (icono de engranaje arriba-izquierda)
2. Pestaña **"General"**
3. Bajar hasta **"Tus apps"** → click en el ícono **`</>`** (Web)
4. Apodo de la app: `Comisaría 47 PWA` → registrar (no marcar "configurar Hosting")
5. Aparece un cuadro `firebaseConfig` con seis valores. **Copiarlos.**

---

## 6. Editar `firebase-config.js` en tu repo

Abrí el archivo `firebase-config.js` que te entrego. Reemplazá los valores `REEMPLAZAR_*` con los tuyos:

```javascript
export const firebaseConfig = {
  apiKey:            "AIzaSyA...",                 // copiar
  authDomain:        "comisaria-47-neuquen.firebaseapp.com",
  projectId:         "comisaria-47-neuquen",
  storageBucket:     "comisaria-47-neuquen.appspot.com",
  messagingSenderId: "123456789012",
  appId:             "1:123456789012:web:abc..."
};
```

> ⚠ Estos valores **NO son secretos** — van expuestos al navegador. La seguridad real está en las reglas de Firestore/Storage.

Y dejá `AUTH_REQUIRED: true` para activar el login.

---

## 7. Desplegar las reglas de seguridad

Tenés **dos opciones**: con Firebase CLI (recomendado) o copy-paste manual.

### Opción A — Firebase CLI (recomendado)

```bash
# Instalar CLI (una sola vez)
npm install -g firebase-tools

# Login a Firebase
firebase login

# En la carpeta de tu repo (donde están firestore.rules y storage.rules):
firebase init firestore   # elegí el proyecto, aceptá los defaults, dejá los archivos existentes
firebase init storage     # idem

# Desplegar reglas e índices
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

### Opción B — Manual

**Reglas Firestore:**
1. Console Firebase → **Firestore Database → Rules**
2. Borrar todo el contenido y pegar **el contenido completo de `firestore.rules`**
3. **Publicar**

**Reglas Storage:**
1. Console Firebase → **Storage → Rules**
2. Borrar todo y pegar **el contenido completo de `storage.rules`**
3. **Publicar**

**Índices Firestore (necesarios para Fase 2 en adelante, pero los creamos ahora):**

En Firestore → Indexes → tab "Composite" → "Add Index", crear cada uno de los 9 índices del archivo `firestore.indexes.json`. Es tedioso a mano, **se recomienda usar Firebase CLI** (`firebase deploy --only firestore:indexes`).

> En Fase 1 las colecciones aún no se usan, pero los índices tardan unos minutos en construirse, así que conviene crearlos ahora para que estén listos cuando llegue la Fase 2.

---

## 8. Crear el primer usuario administrador

Como todavía no hay panel de gestión de usuarios (eso viene en Fase 5), creamos el primer admin manualmente.

### Paso 8.1 — Crear el usuario en Authentication

1. Console Firebase → **Authentication → Users**
2. **"Add user"**
3. Email: `admin@comisaria47.gob.ar` (o el que uses)
4. Password: usar una contraseña fuerte (≥ 12 caracteres)
5. **"Add user"** → vas a ver el **UID** generado (alfanumérico, ~28 chars). **Copialo.**

### Paso 8.2 — Crear el doc de perfil en Firestore

1. Console Firebase → **Firestore Database**
2. **"Start collection"** → ID: `usuarios`
3. **Document ID:** pegar el UID copiado en 8.1
4. Agregar los siguientes campos (uno por uno):

| Campo | Tipo | Valor |
|---|---|---|
| `email` | string | `admin@comisaria47.gob.ar` |
| `displayName` | string | `Administrador` (o el nombre real) |
| `rol` | string | `admin` |
| `activo` | boolean | `true` |
| `comisaria` | string | `Comisaría N° 47` |
| `creadoEn` | timestamp | (click en el calendario, fecha actual) |

5. **Save**

### Paso 8.3 — Crear los demás usuarios

Repetir el proceso 8.1 + 8.2 para cada operador. Los roles válidos son:
- `admin` — control total
- `supervisor` — puede editar todos los registros, no borra ni gestiona usuarios
- `operador` — carga y edita sus propios registros
- `lectura` — solo visualiza

> En **Fase 5** vamos a generar un panel de admin que crea usuarios desde la app. Por ahora, esta carga manual está bien para los 29 operadores iniciales.

---

## 9. Subir todo a GitHub Pages

Estructura final del repo:

```
tu-repo/
├── index.html                     ← reemplazar
├── firebase-config.js             ← NUEVO (con tus credenciales)
├── manifest.json                  ← sin cambios
├── service-worker.js              ← reemplazar (versión v5.0.0)
├── README-INSTALACION.md          ← sin cambios (PWA)
├── README-FIREBASE.md             ← este archivo (referencia)
├── firestore.rules                ← desplegado a Firebase, no a Pages
├── storage.rules                  ← desplegado a Firebase, no a Pages
├── firestore.indexes.json         ← desplegado a Firebase, no a Pages
└── icons/
    └── (sin cambios)
```

> Los archivos `firestore.rules`, `storage.rules` y `firestore.indexes.json` **se despliegan a Firebase** (paso 7), no a GitHub Pages. Pero los podés tener en el repo como referencia y para versionarlos.

Subí los archivos (commit + push) y esperá ~1 minuto a que GitHub Pages actualice.

---

## 10. Probar la Fase 1

1. Abrí la URL de GitHub Pages en Chrome.
2. Si la PWA estaba instalada, **desinstalala y reinstalala** (o forzá refresh con Ctrl+Shift+R) para que cargue el nuevo Service Worker.
3. Tiene que aparecer el **splash inicial → login screen** con el escudo y el campo email/contraseña.
4. Iniciá sesión con `admin@comisaria47.gob.ar` + tu contraseña.
5. Si todo está OK:
   - Aparece el sistema completo
   - En la barra superior aparece **tu nombre + badge `ADMIN` + botón SALIR**
   - En la consola (F12) ves: `[AUTH] Sesión iniciada: admin@... · Rol: admin`
6. Probá **SALIR** → debe volver al login.
7. Probá login con un usuario inexistente → debe mostrar "email o contraseña incorrectos".
8. Probá la recuperación de contraseña → debería llegar un email del `noreply@comisaria-47-neuquen.firebaseapp.com`.

---

## 11. Diagnóstico

| Problema | Solución |
|---|---|
| Pantalla "Firebase no está configurado" | Editar `firebase-config.js` con tus valores reales |
| Login dice "Email o contraseña incorrectos" pero los datos son correctos | El usuario no fue creado en Authentication o el password está mal |
| Login OK pero sale "Tu cuenta no tiene perfil" | Falta crear el doc en `usuarios/{uid}` (paso 8.2) |
| "No se pudo verificar tu perfil" después del login | Las reglas de Firestore no fueron desplegadas (paso 7) |
| Email de recuperación no llega | Revisar carpeta de spam. Verificar que el email exista en Authentication |
| F12 → consola: errores CORS | Verificá que el `authDomain` de `firebase-config.js` esté bien escrito |
| F12 → "Missing or insufficient permissions" | Las reglas no están desplegadas, o el usuario no tiene `activo: true` |

---

## 12. Verificación de seguridad

Probá estos casos para confirmar que las reglas funcionan:

1. **Sin login → escribir directamente a Firestore desde la consola del navegador**:
   ```js
   const { setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");
   setDoc(doc(window.firebaseDB, "incidentes", "hack"), {x:1});
   ```
   → Debe fallar con `Missing or insufficient permissions`.

2. **Como operador, intentar cambiar el rol propio**:
   - Editar el doc `usuarios/{tu-uid}` desde la consola con `rol: "admin"` → Debe fallar.

3. **Como operador, intentar leer otro usuario**:
   - `getDoc(doc(window.firebaseDB, "usuarios", "uid-de-otro"))` → Debe fallar.

Si los tres fallan correctamente, las reglas están bien.

---

## 13. Próximos pasos (Fases siguientes)

Cuando esta Fase 1 esté funcionando para todos los operadores, pedís la **Fase 2** y te entrego:
- Migración de incidentes desde `localStorage` → Firestore
- Sincronización en tiempo real entre dispositivos
- Botón "Importar mis datos locales" para no perder nada
- Indicador "sincronizando…" en el header

Las Fases 3, 4 y 5 vienen después: personas + Storage de fotos, auditoría con motivo, panel de admin.

---

## 14. Costos estimados

**Plan gratuito Spark**: para 29 operadores con uso normal, **gratis**.

Si en algún momento se exceden los 50.000 reads/día (con muchos listeners simultáneos), Firebase pasa al plan **Blaze (pay-as-you-go)**. Para tu escala el costo estimado es **menos de USD 1/mes**.

---

**Versión:** v5.0.0 - Fase 1 (Auth + Roles)  
**Próximo:** v5.1.0 - Fase 2 (Incidentes en tiempo real)
