# NovaConnect Solutions — Plataforma de Laboratorio Académico

> **Actividad Académica:** Actividad de Construcción Aplicada (ACA) FINAL  
> **Asignatura:** Gestión de Incidentes y Respuesta a Ciberataques  
> **Programa:** Especialización en Ciberseguridad  
> **Institución:** Corporación Unificada Nacional de Educación Superior (CUN)  
> **Entorno de Simulación:** Simulación controlada de ataque y respuesta (Red Team / Blue Team) mediante Web APIs del navegador, abuso de permisos y preservación de evidencias forenses.

---

## 1. Contexto Pedagógico y Marco de Simulación

El presente laboratorio académico ha sido diseñado para reproducir un escenario realista de **Gestión de Incidentes y Respuesta a Ciberataques** en aplicaciones web modernas:

- **Vector de Ataque (Perspectiva Red Team):**  
  A través de una fachada corporativa aparentemente legítima (*NovaConnect Solutions*) y una atractiva función de entretenimiento interactivo (*Estudio de Efectos Especiales y Filtros AR en Tiempo Real*), se expone cómo un actor malicioso puede inducir al usuario a conceder permisos sensibles (`cámara` y `geolocalización`). Al activarse la experiencia, la aplicación simula un comportamiento no advertido: realiza capturas fotográficas periódicas automatizadas en segundo plano (cada 3 segundos) y solicita de inmediato la georreferenciación precisa del dispositivo, almacenando estas evidencias de forma local.

- **Respuesta y Análisis Forense (Perspectiva Blue Team):**  
  El equipo de respuesta a incidentes dispone de un panel forense restringido y protegido criptográficamente (`/lab/resultados`). Desde allí, los analistas pueden inspeccionar los identificadores de sesión (`LAB-2026-XXXXXX`), auditar las fotografías voluntarias y automáticas capturadas, revisar grabaciones de video, examinar telemetría de coordenadas geográficas en mapas/tablas, consultar la bitácora inmutable de auditoría y exportar paquetes estructurados de evidencias forenses en formato `.zip` junto con reportes formales en `.txt` y metadatos JSON para garantizar la cadena de custodia.

---

## 2. Declaración de Principios de Seguridad y Privacidad

Pese a simular un escenario de explotación de permisos, la aplicación cumple estrictamente con principios éticos y salvaguardas de seguridad para proteger a los estudiantes y evaluadores:

1. **Aislamiento Estricto y Local (Zero External Leaks):**  
   Todo el procesamiento de video, renderizado de filtros Canvas, codificación de video (MediaRecorder) y persistencia de bases de datos ocurre **exclusivamente en la memoria RAM, GPU y almacenamiento local (IndexedDB) del navegador del cliente**. No existe ningún backend que reciba datos ni conexiones encubiertas hacia servidores externos.
2. **Sin Activación Inadvertida de Hardware:**  
   Ningún sensor ni periférico (cámara o GPS) se enciende automáticamente al cargar la página. El acceso a las APIs requiere la interacción explícita del usuario mediante eventos de clic.
3. **Persistencia Segura en el Navegador:**  
   Los datos se almacenan en una base de datos local `IndexedDB` (`ACA_CYBER_LAB_DB`), respaldada ante contingencias en `localStorage`. Esta información reside únicamente en el perfil del navegador del usuario.
4. **Liberación Efectiva de Descriptores y Memoria:**  
   Al presionar los controles de detención o reinicio, la aplicación invoca `MediaStreamTrack.stop()`, cancela los bucles de animación (`cancelAnimationFrame`), interrumpe los observadores de posición (`navigator.geolocation.clearWatch`) y revoca las URLs temporales en memoria (`URL.revokeObjectURL()`).
5. **Cero Analíticas o Rastreadores de Terceros:**  
   El código fuente se encuentra libre de scripts de telemetría comercial, cookies de terceros o librerías de rastreo externo.

---

## 3. Tecnologías y Web APIs Utilizadas

- **Framework & Core:** React 18.3 + Vite 5 (Arquitectura modular basada en componentes y hooks personalizados).
- **Estilos:** Vanilla CSS con arquitectura de tokens de diseño (`tokens.css`), efectos avanzados de *Glassmorphism*, diseño responsive y aceleración por hardware.
- **MediaDevices API (`navigator.mediaDevices.getUserMedia`):** Captura de flujo de video de alta fidelidad desde cámaras web o dispositivos móviles.
- **HTML5 Canvas API (2D Context):** Motor de renderizado en tiempo real a 60 FPS con manipulación de píxeles (`getImageData`, `putImageData`), transformaciones geométricas procedurales, viñetas, partículas dinámicas y stickers de realidad aumentada.
- **MediaRecorder API:** Codificación y empaquetado de video en vivo (códec WebM/VP8/VP9) con control de duración y temporizador en tiempo real.
- **Geolocation API (`navigator.geolocation`):** Adquisición de coordenadas satelitales (latitud, longitud, precisión, altitud y timestamp) mediante `getCurrentPosition` y `watchPosition`.
- **IndexedDB API (`ACA_CYBER_LAB_DB`):** Base de datos transaccional no relacional en el cliente con almacenes dedicados:
  - `sessions`: Registro de sesiones de usuarios, consentimientos, fotografías, videos, lecturas de ubicación e historial de eventos.
  - `audit_logs`: Bitácora inmutable de eventos de acceso, intentos de login, bloqueos y manipulaciones de datos.
- **Web Crypto API (`crypto.subtle` / SHA-256):** Hashing criptográfico unidireccional con sal estática para validación de credenciales del Blue Team sin exponer contraseñas en texto plano.
- **File System Access API / Blobs & FileSaver:** Generación dinámica de artefactos digitales, creación de archivos Blob en memoria y descarga estructurada de paquetes.
- **JSZip:** Generación programática de paquetes comprimidos `.zip` con jerarquía forense estructurada y archivo de metadatos `metadata.json`.

---

## 4. Arquitectura de Rutas y Navegación

La plataforma cuenta con un enrutador interno desacoplado (`src/router/Router.jsx`) compatible tanto con servidores estáticos como con despliegues locales, soportando tres esquemas de navegación:

1. **Pathname estándar:** `/`, `/experiencia`, `/lab/resultados`
2. **Hash routing (SPA fallback):** `#/`, `#/experiencia`, `#/lab/resultados`
3. **Query parameters:** `?route=/experiencia`, `?page=lab/resultados`

| Ruta | Módulo | Propósito y Perfil |
| :--- | :--- | :--- |
| `/` | **Portal Corporativo NovaConnect** | Landing page de la compañía ficticia. Presenta servicios de ciberseguridad, demostraciones interactivas, banner informativo de consentimiento y sección de documentación con checklist descargable. |
| `/experiencia` | **Estudio de Filtros AR (Red Team)** | Experiencia inmersiva para el participante. Asigna un ID de sesión (`LAB-2026-XXXXXX`), ejecuta los filtros Canvas, permite capturas y grabaciones, y ejecuta la simulación de recolección de datos. |
| `/lab/resultados` | **Panel Forense (Blue Team)** | Dashboard restringido con autenticación SHA-256. Permite auditar sesiones, examinar imágenes y videos recolectados, revisar coordenadas, consultar la bitácora de auditoría y exportar evidencias en ZIP. |

---

## 5. Catálogo de Filtros y Efectos Especiales (Canvas 60 FPS)

El módulo visual implementa 10 efectos especiales procesados en tiempo real sobre el lienzo HTML5:

| ID | Nombre | Categoría | Descripción Técnica del Efecto |
| :--- | :--- | :--- | :--- |
| `normal` | **Original** | Básica | Captura limpia directa en alta definición sin transformaciones. |
| `ovni` | **Invasión OVNI** | VFX / AR | Platillo volador animado, rayo tractor de abducción y destellos celestes. |
| `bubu` | **Muñeco Bubu Kawaii** | VFX / AR | Orejitas de osito interactivas, personaje Bubu animado, corazones y destellos flotantes. |
| `fire` | **Aura de Fuego** | VFX / AR | Simulación de llamas ardientes perimetrales y lluvia de brasas incandescentes. |
| `money` | **Lluvia de Dinero** | VFX / AR | Cascada de billetes de 100 dólares, monedas de oro giratorias y diamantes. |
| `cyber_hud` | **Visor Cyberpunk** | VFX / AR | Retículas holográficas de escaneo biométrico, HUD táctico y acentos en neón azul/morado. |
| `vhs_retro` | **Cámara VHS 90s** | VFX / Retro | Estilo de cinta magnética analógica con líneas de scanline, glitch y leyenda REC intermitente. |
| `thermal` | **Visión Térmica** | Colorimetría | Simulación de mapa de calor infrarrojo mediante degradado cromático espectral. |
| `matrix` | **Terminal Matrix** | Colorimetría | Tonalidad en fósforo verde fosforescente estilo terminal monocromática de ciberseguridad. |
| `noir` | **Cine Noir** | Colorimetría | Procesamiento monocromático de alto contraste lumínico y viñeta sombreada. |

---

## 6. Panel Forense del Blue Team y Credenciales de Acceso

El acceso al panel de investigación de incidentes (`/lab/resultados`) está protegido por controles de seguridad robustos implementados en `src/services/authService.js`:

- **Credenciales Oficiales de Acceso:**
  - **Usuario:** `blueteam`
  - **Contraseña:** `LabSecure2026!`
- **Validación Criptográfica:** La contraseña ingresada es combinada con un salt privado (`ACA_CUN_CYBER_2026_SALT_KEY`) y procesada mediante `crypto.subtle.digest('SHA-256')`.
- **Protección contra Ataques de Fuerza Bruta:** Cuenta con un limitador de intentos (máximo 5 intentos fallidos); al superarse el umbral, la interfaz bloquea el inicio de sesión durante 60 segundos y genera una entrada en la bitácora de auditoría.
- **Sesión Volátil:** Se gestiona mediante un token efímero almacenado en `sessionStorage` que expira al cerrar la pestaña o pulsar "Cerrar Sesión".

---

## 7. Requisitos del Sistema e Instalación

### Requisitos Previos
- **Node.js:** Versión 18.0.0 o superior (recomendado v20 LTS).
- **Gestor de Paquetes:** npm (v9+) o yarn.
- **Navegador Web Moderno:** Google Chrome, Microsoft Edge, Mozilla Firefox, Opera o Safari con soporte para WebGL, Web APIs y Web Crypto.
- **Hardware:** Cámara web (integrada o USB) y sensor GPS (o emulador de ubicación de DevTools).

### Instrucciones de Puesta en Marcha

1. **Abrir la terminal en la carpeta raíz del proyecto:**
   ```bash
   cd "c:\Users\Administrador\Documents\Especializacion CBIERSEGURIDAD\GESTIÓN DE INCIDENTES Y RESPUESTA A CIBERATAQUES\ACA FINAL"
   ```

2. **Instalar las dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo local:**
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación:**  
   Abrir en el navegador la URL local proporcionada por Vite (por defecto `http://localhost:5173/`).
   > *Nota de Seguridad:* `localhost` es considerado por los navegadores como un **Origen Seguro (Secure Context)**, lo que permite la ejecución de `getUserMedia` y `geolocation` sin necesidad de certificados SSL comerciales.

5. **Compilar para producción (Opcional):**
   ```bash
   npm run build
   ```

---

## 8. Guía de Ejecución de Pruebas y Metodología Forense

Para realizar una evaluación completa del ciclo de ataque y respuesta, siga esta secuencia metodológica:

### Fase 1: Simulación de Vector de Ataque (Red Team)
1. Navegue a la ruta de la experiencia interactiva haciendo clic en **Efectos Especiales ✨** en la barra de navegación o accediendo a `http://localhost:5173/experiencia`.
2. Observe el identificador único de sesión generado en la esquina superior (ej. `LAB-2026-X8K9P2`).
3. Haga clic en **Activar Cámara y Filtros**.
4. Cuando el navegador solicite permisos de cámara y ubicación, seleccione **Permitir**.
5. Cambie entre los diferentes efectos (ej. *Invasión OVNI*, *Muñeco Bubu*, *Visor Cyberpunk*, *Visión Térmica*).
6. Tome una fotografía voluntaria con el botón **Capturar Foto** y descargue o guarde la imagen.
7. Inicie una grabación de video de 10 segundos y verifique el indicador parpadeante `REC`.
8. Deje transcurrir entre 10 y 15 segundos con la cámara encendida para permitir que el mecanismo simulado registre auto-capturas periódicas silenciosas en la base de datos local.
9. Haga clic en **Apagar Cámara** para liberar el hardware.

### Fase 2: Investigación y Respuesta a Incidentes (Blue Team)
1. Diríjase al panel de resultados haciendo clic en **Panel Blue Team 🛡️** o navegando a `http://localhost:5173/lab/resultados`.
2. Inicie sesión con las credenciales de analista:
   - **Usuario:** `blueteam`
   - **Contraseña:** `LabSecure2026!`
3. En la lista de sesiones, localice la sesión correspondiente al ID generado en la Fase 1.
4. Seleccione la sesión para desplegar el expediente forense:
   - **Línea de Tiempo:** Revise los eventos cronológicos registrados (creación de sesión, fotos guardadas, capturas automáticas, lecturas GPS).
   - **Galería de Imágenes:** Inspeccione las fotografías manuales y compruebe la existencia de las fotos con prefijo `AUTO_CAPTURA_...`.
   - **Grabaciones de Video:** Reproduzca las evidencias audiovisuales capturadas.
   - **Telemetría GPS:** Compruebe las coordenadas geográficas reales, precisión en metros y fecha/hora exacta.
5. Haga clic en **Bitácora de Auditoría** para verificar los registros inmutables de acceso y transacciones.
6. Haga clic en **Descargar Paquete ZIP** para exportar el paquete de evidencias forenses estructurado.

---

## 9. Estructura del Paquete Forense Exportado (.ZIP)

El paquete generado por `exportSessionZip()` organiza los elementos conforme a las buenas prácticas de preservación de evidencia digital:

```
evidencias/
└── sesiones/
    └── LAB-2026-XXXXXX/
        ├── imagenes/
        │   ├── VFX_FOTO_OVNI_1726876000000.png
        │   └── AUTO_CAPTURA_1726876003000.png
        ├── videos/
        │   └── VFX_VIDEO_1726876010000.webm
        ├── ubicacion/
        │   ├── registro_ubicacion_1.txt
        │   └── registro_ubicacion_2.txt
        └── metadata.json
```

### Contenido del archivo `metadata.json`:
Contiene el hash de la sesión, estampas de tiempo ISO 8601, estado del consentimiento, resumen cuantitativo de evidencias recolectadas, historial íntegro de acciones del usuario y detalles del entorno del cliente (`User-Agent`, plataforma y lenguaje del sistema).

---

## 10. Matriz de Controles de Seguridad Evaluados

| ID | Control de Ciberseguridad | Mecanismo de Implementación | Estado |
| :--- | :--- | :--- | :---: |
| **SEC-01** | Secure Context Obligatorio | Web APIs limitadas a `localhost` o protocolo HTTPS. | **CUMPLIDO** |
| **SEC-02** | Consentimiento Previo del Usuario | Ningún flujo de medios inicia sin evento de clic voluntario. | **CUMPLIDO** |
| **SEC-03** | Procesamiento Aislado en Cliente | Algoritmos de renderizado y persistencia 100% locales (RAM / IndexedDB). | **CUMPLIDO** |
| **SEC-04** | Liberación Estricta de Recursos | Ejecución de `track.stop()`, `cancelAnimationFrame` y `revokeObjectURL`. | **CUMPLIDO** |
| **SEC-05** | Autenticación Criptográfica | Verificación de credenciales Blue Team con hash SHA-256 y sal privada. | **CUMPLIDO** |
| **SEC-06** | Prevención de Fuerza Bruta | Bloqueo temporal de 60s tras 5 intentos fallidos de autenticación. | **CUMPLIDO** |
| **SEC-07** | Trazabilidad y Cadena de Custodia | Metadatos JSON, bitácora de auditoría e identificadores únicos de sesión. | **CUMPLIDO** |
| **SEC-08** | Sanitización y Borrado Seguro | Función de borrado definitivo de sesiones en IndexedDB y LocalStorage. | **CUMPLIDO** |

---

## 11. Estructura del Código Fuente del Proyecto

```
ACA FINAL/
├── index.html                   # Documento raíz con metadatos y enlaces de fuentes
├── package.json                 # Dependencias y scripts de construcción (Vite, React, JSZip)
├── vite.config.js               # Configuración del bundler Vite
├── src/
│   ├── main.jsx                 # Punto de entrada de renderizado React DOM
│   ├── App.jsx                  # Coordinador global de rutas y límites de error (ErrorBoundary)
│   ├── App.css                  # Estilos estructurales globales
│   ├── index.css                # Sistema de diseño, reset y variables CSS globales
│   ├── router/
│   │   └── Router.jsx           # Enrutador personalizado (History API, Hash y Query params)
│   ├── context/
│   │   └── LabContext.jsx       # Proveedor de estado global del laboratorio y periféricos
│   ├── hooks/
│   │   ├── useCamera.js         # Hook para gestión de ciclo de vida de MediaStream
│   │   ├── useGeolocation.js    # Hook para consulta y monitoreo GPS
│   │   └── useMediaRecorder.js  # Hook para codificación y temporizado de video
│   ├── services/
│   │   ├── authService.js       # Autenticación Blue Team con SHA-256, sal y limitador
│   │   └── storageService.js    # Capa de datos IndexedDB, copias locales y exportación ZIP
│   ├── utils/
│   │   ├── canvasEffects.js     # Motor gráfico de los 10 filtros Canvas y stickers AR
│   │   ├── fileUtils.js         # Conversión de Blobs, DataURLs y descargas en navegador
│   │   └── dateUtils.js         # Utilidades de formato de fechas y estampas forenses
│   ├── pages/
│   │   ├── ParticipantExperience.jsx # Vista del Participante / Estudio AR (Red Team)
│   │   └── LabResultsDashboard.jsx   # Consola de Investigación de Incidentes (Blue Team)
│   └── components/
│       ├── camera/              # Módulos de visor, captura de fotos y grabación de video
│       ├── location/            # Módulo de lectura y descarga de telemetría de ubicación
│       ├── privacy/             # Dashboard de estado de permisos y banner de consentimiento
│       ├── evidence/            # Gestor local de evidencias y empaquetador ZIP
│       ├── layout/              # Barra de navegación (Navbar) y pie de página (Footer)
│       └── sections/            # Secciones informativas (Hero, LabPanel, Documentation)
```

---

## 12. Procedimiento de Limpieza y Sanitización de Pruebas

Para devolver el entorno de ejecución a un estado limpio sin trazas residuales:

1. **Desde el Panel Blue Team (`/lab/resultados`):**  
   Utilice el botón de eliminar sesión (icono de papelera) en cada sesión listada para purgar los registros de `IndexedDB` y `localStorage`.
2. **Desde el Navegador:**  
   - Abra las Herramientas para Desarrolladores (`F12`).
   - Vaya a la pestaña **Application** (Aplicación) -> **Storage** (Almacenamiento).
   - Haga clic en **Clear site data** (Borrar datos del sitio).
   - En el menú de permisos del navegador (icono de candado o ajustes junto a la URL), seleccione **Restablecer permisos** de cámara y ubicación.
3. **En el Sistema Operativo:**  
   Elimine de su carpeta de descargas los archivos generados durante la prueba (`.png`, `.webm`, `.txt`, `.zip`).

---

*Proyecto desarrollado con fines estrictamente académicos e investigativos para la Especialización en Ciberseguridad de la Corporación Unificada Nacional de Educación Superior (CUN) — 2026.*
