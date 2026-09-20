# Resumen del Funcionamiento de la Plataforma NovaConnect Solutions

> **Asignatura:** Gestión de Incidentes y Respuesta a Ciberataques — ACA FINAL  
> **Programa:** Especialización en Ciberseguridad  
> **Institución:** Corporación Unificada Nacional de Educación Superior (CUN)  
> **Documento:** Resumen Ejecutivo, Operativo y Arquitectónico de la Aplicación

---

## 1. Visión General del Proyecto

**NovaConnect Solutions** es una plataforma web desarrollada como laboratorio práctico de simulación para la asignatura *Gestión de Incidentes y Respuesta a Ciberataques*.

La aplicación modela un escenario de **Ingeniería Social y Abuso de Permisos Web (Web APIs)** combinado con una **Consola de Respuesta a Incidentes y Análisis Forense (Blue Team)**, permitiendo a los estudiantes experimentar ambos lados de un evento de seguridad:

1. **Perspectiva Ofensiva (Red Team):** Cómo un atacante puede camuflar la recolección indebida de telemetría sensible (imágenes del usuario y coordenadas geográficas) detrás de una aplicación web visualmente atractiva (un estudio de filtros y efectos especiales).
2. **Perspectiva Defensiva (Blue Team):** Cómo un analista de incidentes o perito forense puede detectar la actividad no autorizada, auditar los eventos en el tiempo, preservar la evidencia digital y garantizar la cadena de custodia.

Todo el ecosistema opera bajo el principio de **aislamiento total (Zero External Leaks)**: no existen servidores externos que reciban información; la totalidad del cómputo gráfico y el almacenamiento se ejecutan localmente en el navegador.

---

## 2. Mapa de Rutas y Navegación

La plataforma cuenta con un enrutador SPA personalizado (`src/router/Router.jsx`) que garantiza compatibilidad tanto en modo estándar (`/ruta`) como con *hash routing* (`#/ruta`) o parámetros de consulta (`?route=/ruta`). Se divide en tres módulos principales:

```
                                  [ Navegador Web ]
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
       Ruta: `/`                 Ruta: `/experiencia`          Ruta: `/lab/resultados`
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
│   PORTAL CORPORATIVO    │   │  ESTUDIO AR (RED TEAM)  │   │  PANEL FORENSE (BLUE)   │
│ • Fachada comercial     │   │ • 10 Filtros Canvas     │   │ • Login SHA-256 + Salt  │
│ • Demostración visual   │   │ • Captura de fotos      │   │ • Expediente por sesión │
│ • Panel de laboratorio  │   │ • Grabación de video    │   │ • Detección encubierta  │
│ • Checklists forenses   │   │ • Vector encubierto     │   │ • Bitácora de auditoría │
│ • Banner de privacidad  │   │ • Persistencia local    │   │ • Exportación ZIP       │
└─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘
```

---

## 3. Funcionamiento Detallado por Módulos

### 3.1. Portal Corporativo NovaConnect (`/`)

Constituye la fachada de presentación pública de la supuesta empresa de soluciones tecnológicas. Cumple la función de contextualizar al usuario y ofrecer acceso a las pruebas de laboratorio:

- **Barra de Navegación Superior (`Navbar`):**  
  Permite la transición fluida entre la página de inicio, el estudio interactivo de efectos especiales (`/experiencia`) y el panel de respuesta a incidentes (`/lab/resultados`), además del botón de llamada a la acción (*Acceder al Laboratorio*).
- **Sección Principal (`Hero`):**  
  Presenta el propósito corporativo de NovaConnect Solutions y ofrece accesos directos al laboratorio y a la documentación técnica.
- **Demostración Multimedia Interactiva (`VisualExperience`):**  
  Integra un visor preliminar de cámara con controles de captura voluntaria de fotografías y grabaciones de prueba.
- **Panel de Laboratorio Multimedia (`LabPanel`):**  
  Organiza tres herramientas operativas:
  1. *Módulo de Ubicación Geográfica:* Consulta latitud, longitud, altitud y precisión con descarga de reportes `.txt`.
  2. *Panel de Privacidad y Control:* Muestra el estado en tiempo real de los permisos concedidos al navegador.
  3. *Almacenamiento de Evidencias Digitales:* Lista los artefactos en memoria y permite empaquetarlos en formato `.zip`.
- **Aviso Informativo de Privacidad (`ConsentBanner`):**  
  Aclara las políticas de uso ético, confirmando que no se transmitirán datos fuera del entorno local.
- **Documentación y Checklist de Laboratorio (`Documentation`):**  
  Contiene una lista de verificación interactiva de 8 controles técnicos con opciones para registrar hallazgos y descargar un informe formal de laboratorio en formato `.txt`.
- **Pie de Página (`Footer`):**  
  Contiene los créditos académicos de la CUN y enlaces complementarios.

---

### 3.2. Módulo de la Víctima / Experiencia del Participante (`/experiencia`)

Este módulo representa el entorno interactivo donde se despliega la simulación del ciberataque:

1. **Asignación Automática de Sesión Única:**  
   Al ingresar, el sistema genera automáticamente un identificador alfanumérico irrepetible con formato `LAB-2026-XXXXXX` (ej. `LAB-2026-W3K9M2`), el cual se preserva en `sessionStorage` para indexar todas las acciones del participante.
2. **Consentimiento y Activación Simultánea de Sensores:**  
   Al pulsar el botón **"Activar Cámara y Filtros"**:
   - Se solicita acceso al flujo de video mediante `navigator.mediaDevices.getUserMedia()`.
   - **Acción Encubierta (Simulación Red Team):** Simultáneamente se dispara una petición silenciosa de geolocalización (`navigator.geolocation.getCurrentPosition()`), asociando las coordenadas del dispositivo a la sesión sin que la interfaz lo evidencie como un requisito aparente del entretenimiento visual.
3. **Motor Gráfico de Filtros Canvas en Tiempo Real (60 FPS):**  
   El video de la cámara se proyecta de forma invisible sobre un elemento `<canvas>` que ejecuta un bucle continuo de renderizado a través de `requestAnimationFrame()`. La función `applyFilterToCanvas()` aplica uno de los **10 efectos especiales** disponibles:
   - *Original:* Transmisión limpia de la cámara web.
   - *Invasión OVNI:* Renderizado procedural de nave espacial alienígena con rayo tractor animado.
   - *Muñeco Bubu Kawaii:* Orejas de oso interactivas, destellos y corazones flotantes.
   - *Aura de Fuego:* Simulación perimetral de llamas y partículas de brasas incandescentes.
   - *Lluvia de Dinero:* Billetes de 100 dólares, monedas doradas giratorias y diamantes.
   - *Visor Cyberpunk:* Retículas holográficas de escaneo, HUD de objetivo y neones tecnológicos.
   - *Cámara VHS 90s:* Distorsión tipo glitch analógico, scanlines y leyenda REC intermitente.
   - *Visión Térmica:* Filtro cromático de degradado térmico estilo cámara infrarroja.
   - *Terminal Matrix:* Tonalidad verde fósforo fosforescente.
   - *Cine Noir:* Alto contraste blanco y negro con viñeta sombreada.
4. **Vector de Exfiltración y Auto-Captura Silenciosa:**  
   Mientras la cámara permanece encendida, un temporizador en segundo plano extrae un fotograma del lienzo cada **3 segundos** mediante `canvas.toDataURL('image/png')`, lo transforma a `Blob` y lo guarda silenciosamente en la base de datos `IndexedDB` con el prefijo `AUTO_CAPTURA_[timestamp].png`.
5. **Funciones Voluntarias para el Participante:**  
   - *Captura Manual:* Botón de disparo con animación de flash que genera una imagen en alta resolución con el nombre del filtro (`VFX_FOTO_[FILTRO]_[timestamp].png`). Permite previsualizar, descartar o descargar directamente.
   - *Grabación de Video Corto:* Utiliza `MediaRecorder` para capturar el flujo del canvas con duraciones configurables (10s, 20s, 30s) o finalización manual, generando archivos de video `.webm`.
6. **Finalización y Liberación de Hardware:**  
   Al pulsar **"Apagar Cámara"**, se invocan los métodos `MediaStreamTrack.stop()`, se detiene el bucle gráfico (`cancelAnimationFrame`) y se cierra la sesión actualizándola como completada en la base de datos.

---

### 3.3. Consola de Incidentes y Resultados Forenses (`/lab/resultados`)

Este módulo constituye la herramienta de trabajo del analista de seguridad (Blue Team):

1. **Control de Acceso Criptográfico (Autenticación Blue Team):**
   - **Usuario:** `blueteam`
   - **Contraseña:** `LabSecure2026!`
   - La contraseña es procesada localmente mediante la **Web Crypto API** (`crypto.subtle.digest('SHA-256')`) combinada con un *Salt* secreto (`ACA_CUN_CYBER_2026_SALT_KEY`), comparándola contra el hash esperado `896e5e8aa4a0cd2a2f5f2ac8a6391ee8bd354d6b11cafaf07c3ea4506a9014e6`.
   - **Protección contra Fuerza Bruta:** Tras 5 intentos fallidos, el sistema bloquea el acceso durante 60 segundos y genera una alerta en la bitácora.
2. **Explorador y Filtro de Sesiones:**  
   Muestra un listado ordenado cronológicamente de todas las sesiones registradas en el navegador, indicando su ID, fecha de creación, estado (`in_progress` o `completed`) y número de artefactos recolectados. Cuenta con buscador por texto y filtro por fecha.
3. **Expediente Forense de la Sesión:**  
   Al seleccionar una sesión, se despliegan sus detalles clasificados:
   - **Línea de Tiempo de Eventos:** Registro cronológico de hitos (inicio de sesión, fotos guardadas, auto-capturas, lecturas GPS, finalización).
   - **Evidencias Fotográficas:** Muestra la cuadrícula de imágenes. Aquí el analista puede constatar la presencia de capturas involuntarias (`AUTO_CAPTURA_...`) tomadas sin acción del botón de disparo, demostrando la actividad del vector encubierto.
   - **Grabaciones de Video:** Reproductor integrado para inspeccionar los videos generados durante la prueba.
   - **Telemetría de Ubicación:** Muestra las coordenadas precisas de latitud, longitud, margen de precisión en metros y fecha/hora exacta. Permite descargar el reporte individual en formato `.txt`.
4. **Bitácora de Auditoría del Sistema (`audit_logs`):**  
   Al hacer clic en **"Bitácora de Auditoría"**, se abre un visor modal con los eventos de seguridad del sistema (inicios de sesión exitosos, intentos bloqueados, cierres de sesión y eliminaciones de registros), acompañados de marcas de tiempo y el `User-Agent` del cliente.
5. **Generador de Paquetes Forenses ZIP y Cadena de Custodia:**  
   Al pulsar **"Descargar Paquete ZIP"**, la librería `JSZip` genera en el cliente un archivo comprimido denominado `evidencias_[SESSION_ID].zip` con la siguiente estructura formal:
   ```
   evidencias/
   └── sesiones/
       └── LAB-2026-XXXXXX/
           ├── imagenes/          # Todas las fotos manuales y auto-capturas (.png)
           ├── videos/            # Videos codificados (.webm)
           ├── ubicacion/         # Informes de telemetría GPS (.txt)
           └── metadata.json      # Metadatos del entorno, consentimientos y hashes
   ```
6. **Borrado Seguro y Sanitización:**  
   Permite al analista eliminar de forma definitiva una sesión de `IndexedDB` y del respaldo local, garantizando que no queden datos residuales tras el ejercicio.

---

## 4. Arquitectura de Almacenamiento y Ciclo de Vida de los Datos

La aplicación implementa un esquema de persistencia local resiliente con doble capa de almacenamiento:

```
[ Captura de Video / GPS ]
           │
           ▼
[ Canvas API / Web APIs ]
           │
           ▼
[ Generación de Blobs / DataURLs ]
           │
           ├──────────────────────────────┐
           ▼                              ▼
 ┌───────────────────┐          ┌───────────────────┐
 │ IndexedDB         │          │ LocalStorage      │
 │ (Almacén Primario)│          │ (Respaldo Seguro) │
 │ Base de Datos:    │          │ Objeto serializado│
 │ ACA_CYBER_LAB_DB  │          │ con tolerancia a  │
 │ • sessions        │          │ fallos de cuota   │
 │ • audit_logs      │          │                   │
 └───────────────────┘          └───────────────────┘
```

- **Almacén Primario (`IndexedDB`):** Permite almacenar objetos binarios (`Blob`) de gran tamaño (imágenes y videos) sin saturar los límites de memoria sincrónica del navegador.
- **Copia de Respaldo (`LocalStorage`):** Garantiza que las sesiones permanezcan disponibles incluso si la conexión a IndexedDB sufre interrupciones o recargas forzadas.
- **Liberación de Memoria:** Los objetos `Blob` convertidos a URLs de visualización con `URL.createObjectURL()` son revocados sistemáticamente cuando se descartan o se eliminan las sesiones.

---

## 5. Resumen de Controles de Seguridad Aplicados

| Control Técnico | Estándar o API | Justificación en la Gestión de Incidentes |
| :--- | :--- | :--- |
| **Secure Context** | `isSecureContext` / `localhost` | Evita que scripts maliciosos en redes no seguras capturen el flujo de la cámara o coordenadas. |
| **Consentimiento Explicito** | Event Listeners | Asegura que ningún periférico físico se encienda sin una acción deliberada del usuario. |
| **Hashing con Sal** | Web Crypto API (SHA-256) | Protege la consola forense contra accesos no autorizados sin almacenar contraseñas en claro. |
| **Mitigación de Fuerza Bruta** | Contador y temporizador de bloqueo | Previene ataques automatizados de adivinación de credenciales sobre la consola Blue Team. |
| **Preservación Forense** | JSZip + JSON Metadata | Establece trazabilidad técnica y garantiza la reproducibilidad de la evidencia digital. |
| **Sanitización de Datos** | Transacciones `readwrite` IndexedDB | Cumple con los requerimientos de destrucción segura de datos tras la auditoría. |

---

## 6. Guía Rápida de Prueba en 4 Pasos (Para Evaluadores)

Para verificar el funcionamiento completo de la plataforma en menos de 5 minutos:

1. **Iniciar la aplicación:**  
   Ejecutar `npm run dev` en la terminal y abrir `http://localhost:5173/`.
2. **Ejecutar la Experiencia del Participante (`/experiencia`):**  
   - Ir a la pestaña **Efectos Especiales ✨**.
   - Hacer clic en **Activar Cámara y Filtros** y autorizar los permisos del navegador.
   - Probar al menos dos efectos (ej. *Invasión OVNI* y *Aura de Fuego*).
   - Tomar una foto manual y esperar 10 segundos para que se registren capturas automáticas.
   - Hacer clic en **Apagar Cámara**.
3. **Auditar desde el Panel Blue Team (`/lab/resultados`):**  
   - Ir a la pestaña **Panel Blue Team 🛡️**.
   - Ingresar con: Usuario `blueteam`, Contraseña `LabSecure2026!`.
   - Seleccionar la sesión activa.
   - Verificar la presencia de las fotos automáticas con prefijo `AUTO_CAPTURA_...` y los datos de geolocalización.
4. **Descargar la Evidencia Forense:**  
   - Hacer clic en **Descargar Paquete ZIP**.
   - Descomprimir el archivo descargado y comprobar la estructura de carpetas (`imagenes`, `videos`, `ubicacion` y `metadata.json`).

---

*Documento técnico preparado para la sustentación y evaluación del ACA FINAL de la Especialización en Ciberseguridad — Corporación Unificada Nacional de Educación Superior (CUN).*
