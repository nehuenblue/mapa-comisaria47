# 🚨 FASE 3 — Comisaría N° 47 (Mapa del Delito)

Sistema multiusuario en tiempo real con personas, fotos en alta calidad,
buscador global y sistema completo de reportes.

---

## 📦 Archivos a subir a GitHub

Después de descargar de Claude:

| Archivo | Destino en el repo |
|---|---|
| `index.html` | raíz |
| `service-worker.js` | raíz (versión `v6.0.0`) |
| `firestore.rules` | raíz (subir reglas a Firebase Console) |
| `storage.rules` | raíz (subir reglas a Firebase Console) |

> Otros archivos (`manifest.json`, `firebase-config.js`, `icons/`) **no se modificaron**, dejá los que ya tenés.

---

## ⚙️ Pasos de despliegue (en orden)

### 1) Subir el `index.html` y el `service-worker.js` a GitHub

- Reemplazar los archivos en tu repo `nehuenblue/mapa-comisaria47`
- Commit + push
- Esperar 1 minuto a que GitHub Pages publique

### 2) Actualizar las reglas de Firestore

1. Andá a Firebase Console → Firestore Database → pestaña **Reglas**
2. Borrá todo el contenido del editor
3. Pegá el contenido de `firestore.rules`
4. Click en **Publicar**
5. Esperá ~30 segundos a que diga "Reglas publicadas"

### 3) Actualizar las reglas de Storage

1. Firebase Console → **Storage** → pestaña **Reglas**
2. Borrá todo el contenido del editor
3. Pegá el contenido de `storage.rules`
4. Click en **Publicar**

### 4) Limpiar caché en cada dispositivo (la primera vez)

En cada PC/celular que ya tenía la versión vieja:

- F12 → pestaña Application → Storage → click **"Clear site data"** con todos los checkboxes marcados
- Cerrar el navegador completamente
- Volver a abrir y entrar a la URL

Esto fuerza al Service Worker a tomar la versión nueva.

### 5) Verificar funcionamiento

1. Login con cualquier rol activo
2. El footer debe decir: **"Sistema v6.0 · Firebase (Fase 3: personas + fotos en línea + reportes) · operativo"**
3. Pill de sincronización: 🟢 SINCRONIZADO
4. En la card de personas, debajo del input de búsqueda, debería aparecer el toggle 🌐 "Buscar en TODOS los módulos"
5. En operaciones, los botones de exportar deberían mostrar dropdown "📊 Exportar ▾" + "📅 Reportes por período"

---

## ✨ Nuevas funcionalidades (Fase 3)

### 🌐 Buscador global de personas

- Toggle abajo del campo de búsqueda
- Al activar: filtra por nombre, DNI, ISA/ICA-/ICA+, motivo, domicilio, lugar nac., nacionalidad **en los 4 módulos a la vez**
- Cada resultado muestra un **chip con el módulo de origen**:
  - ⏱️ DEM (Demorados, amarillo)
  - 🔒 DET (Detenidos, rojo)
  - ⚖️ CON (Contraventores, violeta)
  - 🆔 IDE (Identificados, cyan)
- Click en un resultado de **otro módulo**: cambia automáticamente al módulo correspondiente

### 📷 Fotos en alta calidad

Las fotos se suben a Firebase Storage con estos parámetros:
- Máximo 1600×1600 píxeles (escala manteniendo aspect ratio)
- Calidad JPEG 92% (sin pérdida visible)
- Tamaño promedio: ~250-400 KB
- Tamaño máximo aceptado del archivo original: 8 MB
- Path en Storage: `fotos_personas/{personaId}.jpg`

**Capacidad gratuita (plan Spark):** ~14.000 fotos = ~38 años a 30 procedimientos/mes.

### 📊 Sistema completo de exportes

Botón **"📊 Exportar ▾"** despliega menú con:

**Operaciones:**
- Incidentes (toda la base) — todos los datos sin filtros
- Incidentes filtrados — los que aparecen actualmente en pantalla
- CSV de incidentes

**Personas:**
- ⏱️ Demorados (toda la base)
- 🔒 Detenidos (toda la base)
- ⚖️ Contraventores (toda la base)
- 🆔 Identificados (toda la base)
- 📚 Todas las personas (4 módulos juntos en un Excel multi-hoja)

**General:**
- Todo el sistema (Excel multi-hoja con incidentes + 4 módulos + resumen)
- Backup JSON liviano (datos sin fotos)
- Backup ZIP completo (incluye fotos en alta resolución descargadas de Storage)

**Cada Excel incluye:**
- Hoja "DETALLE" con todos los datos por fila
- Hoja "POR_TIPO_DE_EVENTO"
- Hoja "POR_ZONA"
- Hoja "POR_GRAVEDAD"
- Hoja "POR_ESTADO"
- Hoja "POR_OPERADOR"
- Hoja "POR_DIA" (cronograma)
- Hoja "MAPA_COORDENADAS" (lat/lng para Google Earth/QGIS)
- Hoja "CRITICOS_Y_ALTA" (solo gravedad alta y crítica)
- Hoja "RESUMEN_GENERAL"

### 📅 Reportes por período flexible

Botón **"📅 Reportes por período"** abre modal con:

**Rangos rápidos:**
- Este mes
- Últimos 3 meses
- Últimos 6 meses
- Último año
- Toda la base

**Período personalizado:**
- Desde: calendario
- Hasta: calendario

**Resumen automático en vivo:**
- Total de incidentes en el rango
- Distribución por gravedad/estado
- Cantidad de operadores que registraron
- Cantidad de incidentes finalizados (que se podrían borrar)

**Acciones disponibles:**
- 📥 Descargar Excel completo del período
- 🗑 Borrar **incidentes finalizados** del período (opcional, después de descargar)

**Reglas de seguridad del borrado:**
- Solo admin y supervisor ven el botón "Reportes por período"
- Solo se pueden borrar incidentes **finalizados** (los abiertos/en curso quedan)
- Hay que descargar el reporte ANTES de poder borrar
- Hay que marcar 2 casillas de confirmación
- Hay que escribir literalmente "BORRAR PERIODO desde a hasta" como confirmación final
- Las **personas y fotos NUNCA se borran** automáticamente
- Cada borrado queda registrado en colección `historico` con resumen estadístico permanente

### 👤 Permisos actualizados

| Acción | Lectura | Operador | Supervisor | Admin |
|---|---|---|---|---|
| Ver datos | ✅ | ✅ | ✅ | ✅ |
| Crear incidentes/personas | ❌ | ✅ | ✅ | ✅ |
| Editar lo propio | ❌ | ✅ | ✅ | ✅ |
| Editar de otros | ❌ | ❌ | ✅ | ✅ |
| Editar finalizados | ❌ | ❌ | ✅ | ✅ |
| Borrar incidentes/personas | ❌ | ❌ | ✅ | ✅ |
| Subir/borrar fotos | ❌ | ✅ | ✅ | ✅ |
| Generar reportes | ✅ | ✅ | ✅ | ✅ |
| **Generar reportes por período** | ❌ | ❌ | ✅ | ✅ |
| **Borrar período (vaciar mes)** | ❌ | ❌ | ✅ | ✅ |
| Ver auditoría | ❌ | ❌ | ✅ | ✅ |
| Crear/editar usuarios | ❌ | ❌ | ❌ | ✅ |
| Cambiar roles | ❌ | ❌ | ❌ | ✅ |

### 📜 Auditoría automática

Cada vez que se exporta algo o se hace un borrado, queda registrado en colección `auditoria` con:
- Acción realizada (export_incidentes, export_personas, borrado_periodo, etc.)
- Cantidad de registros
- UID y email del usuario
- Rol
- Timestamp del servidor
- User Agent

Solo supervisor/admin puede leer la colección de auditoría.

---

## 👥 Crear nuevos usuarios (procedimiento)

⚠ **IMPORTANTE — Bug del espacio**

Cuando se crean campos en Firestore Console, hay que tener mucho cuidado de **NO dejar espacios al final** del nombre del campo. Si quedan espacios, las reglas no encuentran el campo y el usuario no puede acceder.

### Pasos para dar de alta a un usuario

1. **Authentication → Add user**
   - Email: `usuario@dominio.com`
   - Contraseña inicial (que después el usuario va a cambiar)
   - Click "Add user"
   - **Copiá el UID** que se generó (algo como `aBcD1234...`)

2. **Firestore → colección `usuarios` → Add document**
   - Document ID: pegar el **UID** copiado del paso 1
   - Agregar campos uno por uno (sin espacios al final):

   | Campo | Tipo | Valor de ejemplo |
   |---|---|---|
   | `displayName` | string | `Pérez Juan` |
   | `email` | string | `usuario@dominio.com` |
   | `rol` | string | `operador` (o `supervisor` / `admin` / `lectura`) |
   | `activo` | boolean | `true` |
   | `comisaria` | string | `Comisaría N° 47` |
   | `creadoEn` | timestamp | (fecha actual) |

3. **Verificar que NO haya espacios**: cliqueá en cada nombre de campo, mirá que no termine en " " (espacio en blanco). Si hay espacio: borrá el campo y recrealo.

4. El usuario ya puede iniciar sesión.

### Para desactivar un usuario

- Firestore → `usuarios/{uid}` → editar campo `activo` → poner `false`
- El usuario seguirá pudiendo loguearse pero la app le mostrará "Cuenta deshabilitada"

### Para cambiar el rol de un usuario

- Firestore → `usuarios/{uid}` → editar campo `rol`
- El cambio toma efecto al siguiente login del usuario

---

## 🆘 Troubleshooting común

### "permission-denied" al cargar incidentes/personas

**Causa más común:** el doc de usuario tiene campos con espacio al final.

**Solución:**
1. F12 → Console
2. Pegar:
   ```js
   console.log(JSON.stringify(window.AUTH_STATE.profile, null, 2));
   ```
3. Si ves campos como `"activo "` (con espacio): borrá ese campo en Firestore y recrealo sin espacio.

### "ReferenceError: XXXX is not defined" al apretar botones

**Causa:** estás corriendo una versión vieja del HTML cacheada por el SW.

**Solución:**
1. F12 → Application → Storage → Clear site data
2. Cerrar navegador completo
3. Volver a abrir

### Foto no sube

**Causa común:** archivo > 8 MB.

**Solución:** redimensionar antes con cualquier visor de imágenes, o usar una foto más chica.

### "ERR_BLOCKED_BY_CLIENT" en logs

**Causa:** alguna extensión del navegador (privacy badger, ublock) está bloqueando llamadas a Firebase.

**Solución:** whitelistear el dominio `firebase.googleapis.com` y `firestore.googleapis.com`. Es ruido, no afecta funcionamiento real.

---

## 📊 Estructura de datos en Firestore

### Colección `usuarios/{uid}`
```json
{
  "displayName": "Pérez Juan",
  "email": "perez@gmail.com",
  "rol": "operador",
  "activo": true,
  "comisaria": "Comisaría N° 47",
  "creadoEn": "<timestamp>"
}
```

### Colección `incidentes/{id}`
```json
{
  "tipo": "Accidente de tránsito",
  "zona": "Villa Pehuenia",
  "gravedad": "Alta",
  "estado": "En curso",
  "fecha": "2026-05-07",
  "hora": "14:30",
  "lat": -38.9032,
  "lng": -71.1865,
  "referencia": "RP 13 km 12",
  "descripcion": "Choque frontal...",
  "movil": "Móvil 47-3",
  "operadorUid": "aBcD1234",
  "operadorNombre": "Pérez Juan",
  "operadorEmail": "perez@gmail.com",
  "creadoEn": "<timestamp>",
  "modificadoEn": "<timestamp>",
  "modificadoPor": "aBcD1234"
}
```

### Colección `personas/{id}`
```json
{
  "tipo": "demorados",
  "estado": "ISA",
  "nombre": "García María",
  "dni": "30123456",
  "sexo": "F",
  "nacimiento": "1985-03-12",
  "nacionalidad": "Argentina",
  "lugarNac": "Neuquén",
  "domicilio": "Calle Falsa 123",
  "motivo": "Demora por...",
  "observaciones": "...",
  "fecha": "2026-05-07",
  "hora": "14:30",
  "fotoStoragePath": "fotos_personas/abc123.jpg",
  "fotoURL": "https://firebasestorage.googleapis.com/...",
  "operadorUid": "aBcD1234",
  "operadorNombre": "Pérez Juan",
  "creadoEn": "<timestamp>",
  "modificadoEn": "<timestamp>",
  "modificadoPor": "aBcD1234"
}
```

### Colección `auditoria/{id}` (append-only)
```json
{
  "accion": "export_incidentes_all",
  "cantidad": 47,
  "uid": "aBcD1234",
  "email": "lupica@gmail.com",
  "rol": "supervisor",
  "timestamp": "<timestamp>",
  "userAgent": "Mozilla/5.0 ..."
}
```

### Colección `historico/{id}` (cierres de período, permanente)
```json
{
  "tipo": "borrado_periodo",
  "desde": "2026-03-01",
  "hasta": "2026-05-31",
  "borrados": 138,
  "total_periodo": 145,
  "por_gravedad": { "Alta": 35, "Media": 58, ... },
  "por_estado": { "Finalizado": 138, "Anulado": 7 },
  "por_tipo": { "Accidente de tránsito": 47, ... },
  "por_zona": { "Villa Pehuenia": 65, ... },
  "uid": "aBcD1234",
  "email": "nehuen@gmail.com",
  "rol": "admin",
  "timestamp": "<timestamp>"
}
```

---

## 🔧 Mantenimiento mensual recomendado

### Al final de cada mes (sugerido)

1. Login como admin o supervisor
2. Click en **"📅 Reportes por período"**
3. Seleccionar **"Este mes"**
4. Verificar el resumen
5. Click en **"📥 Descargar Excel completo"** → guardar en disco/pendrive
6. (Opcional) marcar las 2 casillas y click **"🗑 Borrar incidentes finalizados del período"**
7. El sistema guarda automáticamente el resumen estadístico en colección `historico`

### Cada 3-6 meses

Hacer un **backup ZIP completo**:
1. Click en **"📊 Exportar ▾"**
2. Click en **"Backup ZIP completo (con fotos HD)"**
3. Guardar el ZIP en disco externo

Eso te asegura que tenés copia de TODO, incluyendo fotos originales en alta resolución, en caso de cualquier problema con Firebase.

---

## 📞 Datos del proyecto

- **Repositorio**: `nehuenblue/mapa-comisaria47`
- **URL pública**: `https://nehuenblue.github.io/mapa-comisaria47/`
- **Proyecto Firebase**: `comisaria-47-neuquen`
- **Plan Firebase**: Spark (gratuito) — suficiente para uso normal
- **Versión actual**: Sistema v6.0 (Fase 3)
