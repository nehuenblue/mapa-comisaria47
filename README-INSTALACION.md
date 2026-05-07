# Comisaría N° 47 — Mapa del Delito (PWA)
## Guía de instalación en GitHub Pages

Este sistema es una **Progressive Web App (PWA)**: se instala como una aplicación nativa, funciona sin internet (con limitaciones), y guarda todos los datos localmente en el dispositivo.

---

## 1. Estructura de archivos a subir

Subí estos archivos **manteniendo la estructura exacta** a la raíz de tu repositorio de GitHub Pages:

```
tu-repositorio/
├── index.html                          (archivo principal del sistema)
├── manifest.json                       (metadata de la PWA)
├── service-worker.js                   (lógica de cache y offline)
└── icons/
    ├── icon-192.png                    (icono Android estándar)
    ├── icon-512.png                    (icono Android alta resolución)
    ├── icon-maskable-512.png           (icono adaptativo Android)
    ├── apple-touch-icon-180.png        (icono iOS)
    └── favicon-32.png                  (favicon del navegador)
```

> **Importante:** la carpeta `icons/` debe llamarse exactamente así, en minúsculas.
> Las rutas dentro de `manifest.json` y `service-worker.js` son relativas (`./`), así que funciona tanto si tu repo se sirve en la raíz (`tudominio.com/`) como en una subcarpeta (`username.github.io/repo/`).

---

## 2. Activar GitHub Pages

1. Subí los archivos a tu repositorio (rama `main` o `master`).
2. En el repo, ir a **Settings → Pages**.
3. En **Source**, elegir la rama (`main` / `master`) y la carpeta `/ (root)`.
4. Guardar. En 1-2 minutos aparece la URL `https://tu-usuario.github.io/tu-repo/`.

> GitHub Pages sirve por **HTTPS automáticamente**, lo cual es **obligatorio** para que el Service Worker funcione.

---

## 3. Verificar que la PWA está activa

1. Abrí la URL del sitio en **Chrome o Edge**.
2. Apretá `F12` → pestaña **Application** (o **Aplicación**).
3. En el panel izquierdo:
   - **Service Workers** → debería decir `service-worker.js · activated and running`.
   - **Manifest** → debería mostrar el ícono y el nombre `Comisaría 47`.
   - **Cache Storage** → vas a ver `c47-app-v4.0.0`, `c47-libs-v4.0.0` y `c47-tiles-v4.0.0`.

Dentro de la app, en la columna izquierda aparece la card **"Cache offline"** que muestra el estado del Service Worker en vivo, cuántos tiles tenés cacheados y cuánto espacio estás usando.

---

## 4. Instalar la app en Android

### Chrome Android
1. Abrí la URL del sitio.
2. Aparece un botón flotante **"📲 Instalar"** en la barra superior del sistema (al lado del indicador ONLINE).
3. Apretalo → confirmás → la app se agrega a tu pantalla de inicio.

Alternativa manual: menú de Chrome (⋮) → **"Agregar a pantalla principal"** o **"Instalar app"**.

### Después de instalar:
- La app aparece en el cajón de aplicaciones de Android con el escudo institucional.
- Se abre **a pantalla completa**, sin barra de URL.
- Funciona offline para las zonas que hayas pre-cacheado.

---

## 5. Instalar en PC (Chrome / Edge)

1. Abrí la URL en Chrome o Edge.
2. En la barra de URL aparece un ícono de instalación (🖥️ o un símbolo `⊕`).
3. Apretalo → "Instalar" → la app se agrega como aplicación de escritorio.

También aparece el botón **"📲 Instalar"** en la barra superior del sistema.

---

## 6. Pre-cargar zonas para uso offline

Una vez instalada la PWA:

1. Conectado a internet, abrir la app.
2. En la columna izquierda, card **"Cache offline"**, presionar **"⤓ Pre-cargar zonas (Villa · Moquehue · Lonco)"**.
3. Se descargan ~200 tiles del mapa (≈ 4 MB) en zoom 10 a 15.
4. A partir de ese momento, esas zonas funcionan **sin internet**.

Tiles fuera de las zonas pre-cargadas también se cachean automáticamente cuando navegás el mapa con conexión, hasta un máximo de 600 tiles (≈ 10-15 MB) con descarte por antigüedad.

---

## 7. Funcionalidad offline

### ✅ Funciona sin internet:
- La app entera (Leaflet, heatmap, panel táctico) carga desde cache.
- Cargar, editar, borrar incidentes (localStorage).
- Cargar, editar, borrar fichas de personas + fotos (IndexedDB).
- Exportar Excel / CSV / JSON (las librerías están cacheadas).
- Pan/zoom en zonas pre-cargadas.
- Filtros, heatmap, análisis táctico — todo opera con los datos locales.

### ❌ No funciona sin internet:
- Pan/zoom a zonas que **nunca** se visitaron con conexión.
- Pre-cargar nuevas zonas (necesita red).

### Indicador en pantalla:
- Pill en la barra superior: **ONLINE** (verde) ↔ **OFFLINE** (rojo) reactivo en tiempo real.
- Toast notification en la esquina inferior cuando cambia el estado.

---

## 8. Actualizaciones del sistema

Cuando subas una nueva versión del `index.html` o del `service-worker.js`:

1. Cambiá la línea `const CACHE_VERSION = "v4.0.0"` en `service-worker.js` a un número mayor (ej: `"v4.0.1"`).
2. Subí los cambios a GitHub.
3. Los usuarios verán un toast: **"Hay una nueva versión instalada. Recargá para aplicarla."**
4. Al recargar, se descarga la nueva versión y los caches viejos se borran automáticamente.

---

## 9. Privacidad y datos

🔒 **Cero datos salen del dispositivo.**

- Incidentes → `localStorage` del navegador
- Personas + fotos → `IndexedDB` del navegador
- Tiles del mapa → `Cache Storage` del Service Worker
- Las únicas conexiones de red son: tiles de OpenStreetMap (mapa público) y librerías Leaflet/XLSX al primer load (después se cachean).

Si vaciás los datos del navegador, se borran. **Hacé exportaciones Excel periódicas como respaldo institucional.**

---

## 10. Diagnóstico rápido

| Problema | Causa probable | Solución |
|---|---|---|
| Botón "Instalar" no aparece | Ya está instalada o navegador no soporta PWA | Probar en Chrome / Edge actualizado |
| No funciona offline | Service Worker no se registró | Abrir DevTools → Application → Service Workers, ver errores |
| Mapa gris en zona no visitada | Tile no cacheado | Pre-cargar zonas con conexión |
| Datos perdidos tras limpiar navegador | Storage local borrado | Restaurar desde el backup JSON / Excel |
| "No se pudo cargar el mapa" | Sin internet en primer load | Hay que abrir online la primera vez |

---

## 11. Soporte de navegadores

- ✅ Chrome / Edge (Android + Windows + Linux + Mac) — soporte completo PWA
- ✅ Samsung Internet (Android) — soporte completo
- ⚠️ Safari (iPhone / iPad) — funciona como web, instalable vía "Compartir → Agregar a pantalla principal", pero el soporte de Service Worker en iOS es limitado
- ⚠️ Firefox Desktop — funciona pero la instalación tipo app es limitada en escritorio
- ❌ Internet Explorer — no soportado

---

**Versión:** v4.0.0 PWA  
**Estructura:** Single-page app + Service Worker + IndexedDB + LocalStorage  
**Sin backend, sin servidor, sin base de datos externa.**
