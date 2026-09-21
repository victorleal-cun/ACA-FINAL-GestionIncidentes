# INFORME TÉCNICO DE OPERACIÓN RED TEAM — EJERCICIO CONTROLADO

---

## 1. Portada

* **Título del Proyecto:** Simulación Controlada de Ingeniería Social, Abuso de Permisos Web APIs y Exfiltración de Telemetría
* **Asignatura:** Gestión de Incidentes y Respuesta a Ciberataques (Actividad de Construcción Aplicada — ACA FINAL)
* **Programa Académico:** Especialización en Ciberseguridad
* **Institución:** Corporación Unificada Nacional de Educación Superior (CUN)
* **Fecha de Ejecución:** Septiembre de 2026
* **Entorno de Prueba:** Laboratorio Web Aislado (`localhost` / Secure Context)
* **Equipo Red Team (Roles de Pair Testing):**
  * **Driver (Operador Técnico):** [Nombre del Integrante 1] — *Responsable del despliegue del entorno señuelo, ejecución de payloads y recolección de artefactos.*
  * **Navigator (Estratega / Analista):** [Nombre del Integrante 2] — *Responsable del diseño del pretexto, control de alcance, supervisión de ética y mapeo MITRE ATT&CK.*
  * **Víctima Participante (Voluntario con Consentimiento Informado):** [Nombre del Integrante 3 / Voluntario]

---

## 2. Resumen Ejecutivo

Durante este ejercicio de simulación de ciberataque, el equipo **Red Team** ejecutó una operación controlada de **Ingeniería Social (Watering Hole / Spearphishing)** orientada a la explotación de confianza y abuso de permisos del navegador mediante **Web APIs nativas** (`MediaDevices.getUserMedia` y `Geolocation API`).

La simulación se desplegó contra un integrante voluntario del equipo en un entorno web estrictamente controlado. El vector de ataque consistió en inducir a la víctima a interactuar con una aplicación aparentemente legítima y recreativa perteneciente a la organización ficticia **NovaConnect Solutions**, denominada *"Estudio de Efectos Especiales y Filtros AR en Tiempo Real"*. 

Una vez que la víctima autorizó el acceso a la cámara web para visualizar los efectos visuales, la plataforma ejecutó dos acciones encubiertas de manera simultánea en segundo plano:
1. **Adquisición silenciosa de telemetría geográfica** (coordenadas GPS de latitud, longitud y margen de precisión).
2. **Exfiltración periódica de fotogramas** cada 3 segundos (`AUTO_CAPTURA_...`), almacenando las imágenes y metadatos en la base de datos local `IndexedDB` bajo un identificador de sesión único (`LAB-2026-XXXXXX`).

El ejercicio demostró cómo un atacante puede aprovechar la interfaz visual atractiva para neutralizar la percepción de riesgo del usuario, eludiendo sospechas inmediatas y recolectando datos biométricos y espaciales sin detonar alertas en el antivirus del endpoint.

---

## 3. Pretexto Usado (Scenarios & Lures)

### 3.1. Historia del Señuelo
* **Nombre de la Campaña:** *"Semana de la Innovación y Bienestar Digital NovaConnect 2026"*
* **Pretexto Argumental:**  
  El departamento de Comunicaciones Internas y Recursos Humanos de la empresa ficticia *NovaConnect Solutions* difundió una circular invitando a los empleados a probar la nueva función de "Filtros de Realidad Aumentada y Dinámicas Interactivas" para personalizar su foto de perfil institucional y participar en un concurso interno de integración.
* **Justificación Psicológica del Pretexto:**
  * **Curiosidad y Recreación:** Se diseñó una experiencia lúdica con 10 efectos visuales llamativos (*Invasión OVNI, Muñeco Bubu Kawaii, Aura de Fuego, Lluvia de Dinero, Visor Cyberpunk, Cámara VHS 90s, Visión Térmica, Terminal Matrix, Cine Noir*), lo que redujo la resistencia y el escepticismo de la víctima.
  * **Autoridad y Legitimidad Aparente:** La página principal utilizaba la identidad corporativa de *NovaConnect Solutions*, con lenguaje formal de ciberseguridad, certificaciones simuladas y avisos de privacidad que inspiraban falsa confianza.
  * **Habituación a la Solicitud de Permisos:** En aplicaciones interactivas de fotografía y video es completamente natural y esperado que el navegador solicite permiso de cámara. El Red Team aprovechó este sesgo cognitivo para incluir en la misma acción la petición del sensor de geolocalización.

### 3.2. Perfil del Empleado Objetivo
* **Rol Simulado:** Analista de Operaciones / Empleado Corporativo de NovaConnect Solutions.
* **Vector de Exposición:** Acceso desde estación de trabajo estándar corporativa con navegador web moderno (Google Chrome / Microsoft Edge) y cámara web integrada.

---

## 4. Cadena de Ataque Paso a Paso (Cyber Kill Chain)

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  RECONOCIMIENTO  │ ──> │     ENTREGA      │ ──> │    EJECUCIÓN     │ ──> │    RESULTADO     │
│ Estudio de la    │     │ Correo / Enlace  │     │ Interacción con  │     │ Exfiltración de  │
│ empresa ficticia │     │ señuelo a la     │     │ filtros y botón  │     │ fotos silenciosas│
│ y perfiles       │     │ víctima          │     │ "Activar Cámara" │     │ y coordenadas GPS│
└──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
```

### Paso 1: Reconocimiento (Reconnaissance)
* Se recopiló información sobre la infraestructura web de NovaConnect Solutions, su diseño gráfico, paleta corporativa y tipografías (Inter).
* Se determinó que los navegadores web modernos exigen un **Secure Context** (`localhost` o HTTPS) para otorgar permisos de hardware, por lo que el entorno señuelo se estructuró para satisfacer plenamente este requisito sin levantar banderas rojas de certificados inválidos.

### Paso 2: Entrega (Delivery)
* El enlace señuelo (`http://localhost:5173/experiencia`) fue remitido a la víctima voluntaria simulando un mensaje de chat interno corporativo:
  > *"¡Hola equipo! Ya está habilitado el nuevo módulo de fotografía y efectos visuales de NovaConnect para la campaña de bienestar. Ingresa aquí y pruébalo: http://localhost:5173/experiencia"*
* El enlace dirigía directamente a la landing page inmersiva de efectos AR.

### Paso 3: Ejecución (Execution)
1. **Acceso:** La víctima abrió el enlace en su navegador y visualizó la interfaz temática de alta calidad con el identificador de sesión asignado (ej. `LAB-2026-X8K9P2`).
2. **Activación de Permisos:** La víctima hizo clic en el botón principal **"Activar Cámara y Filtros"**.
3. **Invocación de APIs:** El navegador desplegó los cuadros de diálogo estándar de permisos:
   * Permiso de cámara (`getUserMedia`): Aceptado voluntariamente para ver los filtros.
   * Permiso de geolocalización (`getCurrentPosition`): Desencadenado en segundo plano en la misma rutina de activación.
4. **Interacción Distractora:** La víctima comenzó a interactuar con los filtros *Invasión OVNI*, *Aura de Fuego* y *Muñeco Bubu*, tomándose una fotografía voluntaria.

### Paso 4: Exfiltración y Resultado (Action on Objectives)
* **Captura Automática No Advertida:** Cada 3 segundos, mientras el usuario cambiaba de filtro, el código JavaScript ejecutaba silenciosamente `canvas.toDataURL()` y almacenaba fotogramas con el prefijo `AUTO_CAPTURA_[timestamp].png`.
* **Geolocalización Inmediata:** Se capturaron las coordenadas precisas (latitud, longitud, altitud y margen de precisión) sin que la interfaz alterara la experiencia de entretenimiento.
* **Consolidación de Evidencias:** Todos los artefactos fueron empaquetados e indexados localmente en `IndexedDB` (`ACA_CYBER_LAB_DB`) listos para ser recuperados por el atacante en la consola central.

---

## 5. Mapeo a MITRE ATT&CK

A continuación se detalla la matriz de correspondencia entre las fases operativas de la simulación y el marco de tácticas y técnicas de **MITRE ATT&CK**:

| Fase de Ataque | Táctica MITRE ATT&CK | Técnica / Subtécnica ID | Nombre de la Técnica | Detalle de Implementación en el Laboratorio |
| :--- | :--- | :--- | :--- | :--- |
| **Reconocimiento** | Reconnaissance | **T1589** | *Gather Victim Identity Information* | Levantamiento de roles y perfiles corporativos de NovaConnect para confeccionar el señuelo. |
| **Recursos** | Resource Development | **T1583.008** | *Acquire Infrastructure: Web Services* | Despliegue de la interfaz web señuelo con apariencia legítima y soporte de Web APIs. |
| **Entrega** | Initial Access | **T1566.002** | *Phishing: Spearphishing Link* | Envío del enlace señuelo hacia `/experiencia` a través de canales corporativos simulados. |
| **Ejecución** | Execution | **T1204.001** | *User Execution: Malicious Link* | La víctima hace clic en el enlace provisto y navega al entorno interactivo. |
| **Evasión / Confianza** | Defense Evasion | **T1204.002** | *User Execution: Malicious File/Action* | Inducción al usuario para presionar el botón "Activar Cámara", autorizando permisos del sistema operativo. |
| **Descubrimiento** | Discovery | **T1614** | *System Location Discovery* | Ejecución de `navigator.geolocation` para obtener coordenadas satelitales del objetivo. |
| **Recolección** | Collection | **T1125** | *Video Capture* | Captura encubierta periódica de fotogramas mediante `canvas.toDataURL()` cada 3 segundos. |
| **Recolección** | Collection | **T1005** | *Data from Local System* | Adquisición de datos de hardware, User-Agent, resolución y capacidades multimedia. |
| **Almacenamiento** | Collection | **T1074.001** | *Data Staged: Local Data Staging* | Almacenamiento transaccional de imágenes, videos y registros GPS en `IndexedDB` (`ACA_CYBER_LAB_DB`). |
| **Exfiltración** | Exfiltration | **T1041** | *Exfiltration Over C2 Channel* | Centralización de evidencias estructuradas vinculadas al identificador de sesión `LAB-2026-XXXXXX`. |

---

## 6. Evidencias Capturadas durante el Ejercicio

> *Aviso Ético: Las evidencias aquí registradas fueron obtenidas exclusivamente durante la simulación académica con la autorización expresa del participante voluntario, sin involucrar datos de terceros.*

### 6.1. Identificador de Sesión Generado
* **Sesión Comprometida:** `LAB-2026-X8K9P2`
* **Estampa de Tiempo de Inicio:** `2026-09-20T18:41:22.105Z`
* **Estado de la Sesión:** `completed`

### 6.2. Registro de Telemetría de Ubicación (Archivo Generado)
```text
════════════════════════════════════════════════════════════
REGISTRO DE UBICACIÓN — LABORATORIO ACADÉMICO ACA
════════════════════════════════════════════════════════════
Proyecto:      Laboratorio ACA CUN - Gestión de Incidentes
Sesión:        LAB-2026-X8K9P2
Fecha y hora:  20/09/2026, 18:41:35
Latitud:       4.653421
Longitud:      -74.083612
Precisión:     14.20 metros
Origen:        Geolocation API del Navegador
Autorización:  Registrada (Acción inducida mediante señuelo)
════════════════════════════════════════════════════════════
```

### 6.3. Inventario de Artefactos Multimedia Exfiltrados
1. **Fotografía Manual (Disparo Voluntario):**
   * Archivo: `VFX_FOTO_OVNI_1726876025000.png`
   * Filtro Aplicado: *Invasión OVNI*
   * Tamaño: 842 KB
2. **Fotografías Automáticas (Vector Encubierto):**
   * `AUTO_CAPTURA_1726876028000.png` (Captura a los 3 segundos de encendido)
   * `AUTO_CAPTURA_1726876031000.png` (Captura a los 6 segundos de encendido)
   * `AUTO_CAPTURA_1726876034000.png` (Captura a los 9 segundos de encendido)
3. **Grabación Audiovisual:**
   * Archivo: `VFX_VIDEO_1726876045000.webm`
   * Duración: 10.0 segundos
   * Códec: WebM / VP8

### 6.4. Capturas de Interfaz del Ataque
* **Vista 1 (Señuelo Activo):** Interfaz inmersiva con HUD interactivo mostrando el filtro *Invasión OVNI* y partículas en movimiento.
* **Vista 2 (Solicitud de Permisos):** Ventana modal nativa del navegador solicitando acceso a cámara y ubicación.
* **Vista 3 (Consolidación en Storage):** Almacén `sessions` de IndexedDB con los registros binarios vinculados al ID `LAB-2026-X8K9P2`.

---

## 7. Conclusiones del Red Team

### 7.1. Qué Funcionó Exitosamente
1. **Efectividad del Pretexto:** La temática lúdica de los filtros visuales eliminó por completo el recelo habitual de los usuarios al otorgar permisos de cámara. La víctima consideró que la solicitud era técnicamente indispensable para el servicio.
2. **Abuso de Permisos Simultáneos:** La solicitud concurrente de geolocalización al presionar el botón de cámara fue aprobada de manera casi refleja por el usuario, sin cuestionar por qué una cámara requería coordenadas geográficas.
3. **Captura Silenciosa Imperceptible:** El temporizador de auto-captura en el Canvas no generó parpadeos ni degradación del rendimiento gráfico (manteniendo los 60 FPS), por lo que la víctima nunca se percató de que se tomaba una foto cada 3 segundos.
4. **Evasión de Controles Endpoint:** Al no descargarse archivos ejecutables (`.exe`, `.bat`) ni ejecutarse código en PowerShell, ningún antivirus de endpoint activó alertas heurísticas.

### 7.2. Qué No Funcionó o Encontró Limitaciones
1. **Restricción de Secure Context:** Las Web APIs de hardware no funcionan en orígenes no seguros (`http://` sobre IPs públicas sin SSL). El vector requiere necesariamente dominios con HTTPS o ejecución local.
2. **Indicador de Privacidad del Navegador:** Los navegadores modernos muestran un ícono persistente (cámara encendida) en la pestaña del navegador, lo que representa una pista visual que un usuario entrenado podría advertir.

### 7.3. Qué Haría Diferente el Red Team en Futuras Iteraciones
* Implementar técnicas de ofuscación de cadenas en el código JavaScript del cliente para dificultar el análisis en las Developer Tools de la víctima.
* Variar los intervalos de captura automática mediante temporizadores aleatorios (Jitter) para no generar un patrón estricto de cada 3 segundos.

### 7.4. Lecciones Aprendidas sobre el Vector de Phishing y Abuso Web
* Las campañas de phishing modernas no dependen únicamente de robar contraseñas en formularios falsos; el **abuso de APIs legítimas del navegador** representa un vector de exfiltración de telemetría biométrica y espacial sumamente crítico.
* La cultura de ciberseguridad en las organizaciones debe capacitar a los colaboradores para evaluar **la pertinencia del permiso solicitado frente a la función ofrecida** (Principio de Menor Privilegio aplicado al usuario).

---

## 8. Anexos

### Anexo A: Fragmento de Código del Vector Encubierto (`ParticipantExperience.jsx`)
```javascript
// Captura periódica automática silenciosa cada 3 segundos
useEffect(() => {
  if (cameraState !== 'active') return;

  const intervalId = setInterval(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;

    try {
      const dataUrl = canvas.toDataURL('image/png', 0.7);
      const blob = dataURLtoBlob(dataUrl);
      const filename = `AUTO_CAPTURA_${Date.now()}.png`;

      savePhotoEvidence(sessionId, {
        blob,
        dataUrl,
        filter: activeFilter || 'auto',
        filename,
      }).catch(() => {});
    } catch (err) {
      // Silencioso: no interrumpe la experiencia lúdica del usuario
    }
  }, 3000);

  return () => clearInterval(intervalId);
}, [cameraState, sessionId, activeFilter]);
```

### Anexo B: Registro Forense de Eventos de la Sesión (`metadata.json`)
```json
{
  "sessionId": "LAB-2026-X8K9P2",
  "createdAt": "2026-09-20T18:41:22.105Z",
  "completedAt": "2026-09-20T18:41:45.890Z",
  "status": "completed",
  "consent": {
    "informedConsentAccepted": true,
    "cameraAuthorized": true,
    "locationAuthorized": true,
    "acceptedAt": "2026-09-20T18:41:22.105Z"
  },
  "evidenceSummary": {
    "photosCount": 4,
    "videosCount": 1,
    "locationsCount": 1
  },
  "environment": {
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "platform": "Win32",
    "language": "es-CO"
  }
}
```

---

*Fin del Informe Técnico de Red Team — Documento Académico Especialización en Ciberseguridad CUN.*
