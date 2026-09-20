# NovaConnect Solutions — Plataforma de Laboratorio Académico

> **Actividad Académica:** Gestión de Incidentes y Respuesta a Ciberataques  
> **Programa:** Especialización en Ciberseguridad — Corporación Unificada Nacional de Educación Superior (CUN)  
> **Propósito:** Demostración controlada de permisos web (Web APIs), procesamiento multimedia en tiempo real y preservación de evidencias digitales para análisis Red Team / Blue Team.

---

## 1. Declaración de Principios de Seguridad y Privacidad

Esta aplicación ha sido diseñada e implementada bajo estrictas directrices éticas y normativas de ciberseguridad:

1. **Cero Captura Automática:** Ningún dispositivo multimedia (cámara, micrófono) ni sensor de geolocalización se activa al cargar o navegar en la página.
2. **Consentimiento Explícito e Informado:** Cada solicitud de permiso se encuentra precedida por un aviso visual claro que describe el uso exacto que se le dará al dispositivo.
3. **Aislamiento Local (Zero External Leaks):** Todo el procesamiento de imágenes (filtros Canvas) y codificación de video (MediaRecorder) ocurre en la memoria RAM y GPU local del navegador. No se transmiten imágenes, videos, coordenadas ni datos personales a servidores externos.
4. **Cero Rastreadores o Telemetría Oculta:** La aplicación carece de bibliotecas de analítica, cookies de terceros o túneles de comunicación encubiertos.
5. **Liberación Total de Recursos:** Al pulsar *Detener cámara*, *Detener seguimiento* o *Reiniciar experiencia*, se cancelan todas las pistas (`MediaStreamTrack.stop()`), se detienen los temporizadores y se revocan las URLs en memoria (`URL.revokeObjectURL()`).

---

## 2. Tecnologías y Web APIs Utilizadas

- **Framework & Build:** React 18 + Vite
- **Estilos:** Vanilla CSS moderno con Design Tokens (Custom Properties), efectos de Glassmorphism, animaciones CSS y diseño responsive multi-dispositivo.
- **MediaDevices API (`getUserMedia`):** Captura de video en vivo bajo autorización explícita.
- **HTML5 Canvas API:** Procesamiento frame-a-frame de efectos visuales (Filtro cinematográfico Teal & Orange, Tonalidad cálida, Viñeta de iluminación suave, Marco decorativo y Sistema de partículas dinámicas).
- **MediaRecorder API:** Codificación y grabación de video corto con límite configurable (10s, 20s, 30s) y temporizador en vivo.
- **Geolocation API (`getCurrentPosition` & `watchPosition`):** Consulta de coordenadas y seguimiento periódico con control de inicio/fin manual.
- **IndexedDB (`ACA_CYBER_LAB_DB`):** Capa de persistencia local estructurada en el navegador para sesiones (`LAB-2026-XXXXXX`), evidencias multimedia (Blobs), registros GPS y bitácora de auditoría.
- **Web Crypto API (`crypto.subtle` / SHA-256):** Autenticación y hash criptográfico con sal para el acceso restringido del Blue Team.
- **JSZip & FileSaver.js:** Empaquetado y descarga estructurada de evidencias en paquete `.zip` según el estándar del laboratorio.

---

## 3. Arquitectura de Dos Rutas (Red Team / Blue Team)

La aplicación implementa una separación completa entre la experiencia visual del participante y el panel de análisis forense:

| Ruta | Nombre del Módulo | Propósito y Seguridad |
| :--- | :--- | :--- |
| `/` | **Portal NovaConnect** | Página corporativa de demostración con acceso directo a la experiencia. |
| `/experiencia` | **Experiencia del Participante** | Landing cinematográfica interactiva con filtros Canvas, foto, video, geolocalización voluntaria e identificador de sesión único (`LAB-2026-XXXXXX`). |
| `/lab/resultados` | **Panel Privado Blue Team** | Dashboard restringido protegido por autenticación SHA-256. Permite auditar sesiones, consultar evidencias, visualizar videos, exportar reportes TXT oficiales y descargar paquetes ZIP. |

### Credenciales de Acceso para Blue Team (`/lab/resultados`):
- **Usuario:** `blueteam`
- **Contraseña:** `LabSecure2026!`

---

## 4. Requisitos del Sistema e Instalación

### Requisitos Previos
- Node.js versión 18 o superior (probado en v20 LTS).
- Navegador web moderno: Google Chrome, Microsoft Edge, Mozilla Firefox o Safari.

### Instalación y Ejecución Local

1. Abrir una terminal en la carpeta raíz del proyecto:
   ```bash
   cd "c:\Users\Administrador\Documents\Especializacion CBIERSEGURIDAD\GESTIÓN DE INCIDENTES Y RESPUESTA A CIBERATAQUES\ACA FINAL"
   ```

2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo local de Vite:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador la dirección indicada en la terminal (usualmente `http://localhost:5173/`).
   *(Nota: Los navegadores modernos consideran `localhost` como un origen seguro (Secure Context), lo que permite habilitar las Web APIs de cámara y geolocalización sin requerir certificados SSL externos).*

5. Para compilar la versión de producción optimizada:
   ```bash
   npm run build
   ```

---

## 4. Guía Paso a Paso para Pruebas de Laboratorio

### A. Prueba de Cámara y Efectos Visuales
1. Navega hasta la sección **Experiencia Visual** o haz clic en **Acceder al Laboratorio** en el menú.
2. Lee el banner de aviso de consentimiento previo.
3. Haz clic en el botón **Activar cámara**.
4. El navegador desplegará el cuadro de diálogo estándar solicitando permiso. Selecciona **Permitir**.
5. Observa el encendido del LED de estado y la vista previa en vivo con HUD de laboratorio.
6. En la parte inferior del visor, activa y desactiva los filtros visuales:
   - *Cinematográfico*: Ajuste de color Teal & Orange.
   - *Tonalidad Cálida*: Realce de frecuencias rojas y ámbar.
   - *Iluminación Suave*: Viñeta perimetral con degradado radial.
   - *Partículas*: Simulación de partículas flotantes animadas.
   - *Marco Decorativo*: Borde corporativo con acentos en las esquinas.
7. Haz clic en **Detener cámara** para verificar la liberación inmediata del dispositivo.

### B. Prueba de Captura Voluntaria de Fotografías
1. Con la cámara activa, selecciona el formato deseado: **PNG** (calidad sin compresión) o **JPEG**.
2. Haz clic en **Tomar fotografía**.
3. Se abrirá la ventana modal de revisión donde podrás:
   - Inspeccionar la captura con los efectos aplicados.
   - Verificar el nombre generado automáticamente con fecha y hora (`novaconnect_captura_YYYYMMDD_HHmmss.png`).
   - Elegir entre **Descartar imagen**, **Guardar en evidencias de sesión** o **Descargar ahora**.
4. Confirma que el contador de capturas en el panel se actualice.

### C. Prueba de Grabación de Video Corto
1. En la tarjeta de grabación, selecciona la duración máxima deseada (ej. 10s o 30s).
2. Haz clic en **Iniciar grabación voluntaria**.
3. Verifica la activación del indicador rojo pulsante **REC** y el temporizador en formato `MM:SS`.
4. Deja transcurrir el tiempo hasta el límite automático, o haz clic en **Detener grabación** antes de que termine.
5. Comprueba la previsualización del video generado en el reproductor integrado y haz clic en **Descargar video**.

### D. Prueba del Módulo de Ubicación Geográfica
1. En la sección **Panel de Laboratorio Multimedia**, ubica la tarjeta **Ubicación del Laboratorio**.
2. Haz clic en **Compartir mi ubicación**.
3. Autoriza la solicitud del navegador cuando aparezca la ventana emergente.
4. Verifica que se muestren las coordenadas reales de latitud, longitud, precisión en metros y fecha/hora.
5. Prueba el botón **Iniciar seguimiento periódico** y observa el cambio de estado. Luego haz clic en **Detener seguimiento**.
6. Haz clic en **Descargar registro (.txt)** y revisa el archivo `registro_ubicacion_lab.txt` generado.

### E. Prueba de Almacenamiento de Evidencias
1. Desplázate hasta la tarjeta **Almacenamiento de Evidencias Digitales**.
2. Observa el listado de archivos generados durante la sesión (fotos, videos y reportes de texto).
3. Selecciona archivos individuales mediante las casillas de verificación.
4. Haz clic en **Descargar paquete ZIP estructurado** para obtener un archivo `.zip` que contendrá la siguiente estructura organizada:
   ```
   evidencias_laboratorio/
   ├── imagenes/
   │   └── novaconnect_captura_YYYYMMDD_HHmmss.png
   ├── videos/
   │   └── novaconnect_video_YYYYMMDD_HHmmss.webm
   ├── registros/
   │   └── registro_ubicacion_lab.txt
   └── README_evidencias.txt
   ```
5. Si tu navegador es compatible con Chromium (Chrome/Edge), prueba la opción **Elegir carpeta de destino (API Nativa)** para seleccionar una carpeta física en tu equipo.

---

## 5. Explicación de las Limitaciones del Sandbox del Navegador

Por razones de seguridad arquitectónica, los navegadores web modernos ejecutan el código JavaScript dentro de un **sandbox** aislado:

- **Restricción de Acceso al Disco:** Una página web no tiene permisos directos para escribir o modificar archivos arbitrarios en el sistema operativo del cliente sin intervención del usuario.
- **Acceso Autorizado mediante File System Access API:** APIs modernas como `window.showDirectoryPicker()` permiten al usuario conceder explícitamente acceso de lectura/escritura a un directorio específico seleccionado.
- **Fallback Estándar (Descargas / Blobs):** En entornos donde la API nativa de directorios no está disponible o es restringida por políticas de seguridad, el estándar web seguro es la instanciación de objetos `Blob` en memoria y la activación voluntaria del evento de descarga (`saveAs` / `HTMLAnchorElement.download`).

---

## 6. Lista de Verificación de Seguridad y Hallazgos Blue Team

| ID | Control de Seguridad | Verificación Realizada | Resultado |
|:---|:---|:---|:---:|
| **SEC-01** | Origen seguro (Secure Context) | Ejecución restringida a `localhost` o HTTPS | **APROBADO** |
| **SEC-02** | No activación encubierta | Dispositivos multimedia inactivos al renderizar | **APROBADO** |
| **SEC-03** | Política de seguridad de contenido (CSP) | Meta CSP restrictivo en `index.html` sin conexiones externas | **APROBADO** |
| **SEC-04** | Cero telemetría externa | Sin peticiones de red hacia servicios de analítica o CDNs no autorizadas | **APROBADO** |
| **SEC-05** | Liberación de descriptores de medios | Tracks multimedia cerrados con `.stop()` al pulsar detener o reiniciar | **APROBADO** |
| **SEC-06** | Limpieza de memoria volatil | `URL.revokeObjectURL()` invocado al eliminar capturas | **APROBADO** |
| **SEC-07** | Integridad de datos | Sin coordenadas ficticias ante permisos denegados | **APROBADO** |

---

## 7. Procedimiento de Limpieza de Archivos y Datos de Prueba

Para restablecer el entorno de pruebas a su estado inicial:

1. En el panel **Privacidad y Control**, haz clic en el botón **Eliminar capturas temporales** para liberar los blobs en la memoria del navegador.
2. Haz clic en **Reiniciar experiencia completa** para apagar cualquier sensor activo y restablecer todos los contadores a cero.
3. Para borrar los permisos concedidos en el navegador:
   - Haz clic en el icono del candado o configuración al lado izquierdo de la barra de direcciones URL del navegador.
   - Selecciona **Restablecer permisos** o cambia Cámara y Ubicación a **Preguntar (predeterminado)** o **Bloquear**.
4. Elimina de tu carpeta de descargas del equipo los archivos descargados durante el laboratorio (`.png`, `.webm`, `.txt`, `.zip`).

---

*Proyecto desarrollado para fines estrictamente didácticos en la Especialización en Ciberseguridad — CUN.*
