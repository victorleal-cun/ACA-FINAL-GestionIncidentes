# INFORME TÉCNICO DE GESTIÓN DE INCIDENTES — BLUE TEAM

---

## 1. Portada

* **Título del Documento:** Plan Integral de Controles Preventivos y Procedimiento Operativo de Respuesta a Incidentes (Phishing y Abuso de Web APIs)
* **Asignatura:** Gestión de Incidentes y Respuesta a Ciberataques (Actividad de Construcción Aplicada — ACA FINAL)
* **Programa Académico:** Especialización en Ciberseguridad
* **Institución:** Corporación Unificada Nacional de Educación Superior (CUN)
* **Fecha de Emisión:** Septiembre de 2026
* **Empresa Auditada / Caso de Estudio:** NovaConnect Solutions S.A.S.
* **Equipo Defensivo (Blue Team - Roles de Pair Analysis):**
  * **Driver (Analista Forense Principal):** [Nombre del Integrante 1] — *Responsable de la investigación de telemetría, inspección de registros en consola y documentación de controles técnicos.*
  * **Navigator (Gestor de Incidentes y Políticas):** [Nombre del Integrante 2] — *Responsable de la estructuración del procedimiento de 6 fases, matriz de severidad, gobernanza y revisión cruzada.*

---

## 2. Resumen Ejecutivo

El presente documento establece la estrategia defensiva, la arquitectura de controles preventivos y el **Procedimiento Operativo de Respuesta a Incidentes de Ciberseguridad (IRP)** para la empresa ficticia **NovaConnect Solutions S.A.S.**, tras la simulación controlada de un ataque de ingeniería social que explotó el abuso de permisos web (captura no advertida de video y geolocalización satelital).

A través del ejercicio, el equipo **Blue Team** identificó que los vectores de amenaza contemporáneos trascienden el robo tradicional de contraseñas, aprovechando la confianza del empleado en aplicaciones visuales aparentemente legítimas para exfiltrar datos biométricos y de ubicación mediante Web APIs del navegador. 

Para mitigar este riesgo de manera concreta y aplicable, se propone un esquema de defensa en profundidad distribuido en tres ejes: **Controles Preventivos** (humanos, técnicos y organizacionales), un **Procedimiento de Respuesta a Incidentes de 6 Fases** (alineado con los estándares internacionales NIST SP 800-61 Rev. 2 e ISO/IEC 27035) y un **Esquema de Preservación Forense** con cadena de custodia basado en la consola de resultados implementada en la organización.

---

## 3. Contexto de la Empresa Ficticia: NovaConnect Solutions S.A.S.

Para garantizar que las directrices sean específicas y ejecutables, se define la siguiente línea base organizacional:

* **Razón Social:** NovaConnect Solutions S.A.S.
* **Sector Económico:** Servicios B2B de Integración Tecnológica, Telecomunicaciones Corporativas y Consultoría en Ciberseguridad.
* **Tamaño de la Organización:** Empresa mediana en expansión (180 empleados directos y 40 contratistas remotos).
* **Distribución de Sedes:** Sede central administrativa y operativa en Bogotá D.C., con personal en modalidad híbrida y remota a nivel nacional.
* **Infraestructura Tecnológica:** 
  * Entorno híbrido: Directorio activo en la nube (Microsoft Entra ID / Office 365) con estaciones de trabajo administradas con Windows 11 Pro.
  * Flota de endpoints: Portátiles corporativos equipados con cámaras web y navegadores basados en Chromium (Google Chrome y Microsoft Edge).
* **Activos Críticos de Información:**
  1. *Datos de Clientes y Contratos Corporativos:* Propuestas comerciales, diagramas de topología de red y acuerdos de confidencialidad (NDAs).
  2. *Infraestructura de Conectividad:* Plataformas internas de soporte, VPNs de acceso a clientes y servidores de telemetría.
  3. *Privacidad y Seguridad Física del Personal:* Coordenadas geográficas de los analistas remotos e imágenes de sus espacios de trabajo (riesgo de espionaje corporativo y extorsión).

---

## 4. Controles Preventivos Propuestos

### 4.1. Políticas de Concientización y Cultura de Seguridad (Eje Humano)
* **Capacitación Continua en Ingeniería Social y Permisos Web:**  
  Talleres semestrales obligatorios para todo el personal. Se enfatiza en el **Principio de Menor Privilegio aplicado a los permisos del navegador**: enseñar a los empleados a cuestionar *por qué* un sitio web solicita permisos de geolocalización o cámara si la tarea encomendada no lo requiere estrictamente.
* **Simulacros de Phishing Periódicos:**  
  Ejecución trimestral de campañas controladas emulando pretexto interno (bienestar, invitaciones a eventos, encuestas de clima). A los usuarios que autoricen accesos indebidos no se les sanciona, sino que se les redirige de inmediato a una cápsula de reentrenamiento interactivo de 10 minutos.
* **Política y Botón de Reporte Rápido de Correos/Enlaces:**  
  Implementación del botón de alerta *"Reportar Enlace/Correo Sospechoso"* en el cliente de correo y chat institucional. Se establece como métrica corporativa el *Tiempo Medio de Reporte (MTTR)* por parte de los colaboradores.

### 4.2. Controles Técnicos (Eje Tecnológico)
* **Filtrado Avanzado de Enlaces y Pasarela de Navegación (Secure Web Gateway - SWG):**  
  Inspección y reescritura de URLs en correos electrónicos mediante soluciones EOP/Defender for Office 365 con análisis en sandbox (Safe Links). Bloqueo de dominios recién creados (con antigüedad menor a 30 días) y sitios sin categorización comercial reconocida.
* **Restricción Centralizada de Permisos de Hardware (GPO / Intune MDM):**  
  Configuración mediante directiva de grupo (GPO) y Microsoft Intune para navegadores corporativos (Chrome/Edge):
  * **Cámara y Micrófono:** Establecer por defecto en `Preguntar siempre`, bloqueando la persistencia de autorizaciones permanentes sin excepción.
  * **Geolocalización:** Deshabilitar completamente la API de ubicación (`GeolocationBlockedForUrls: ["*"]`) a nivel de política corporativa para estaciones de trabajo de escritorio y portátiles empresariales, permitiendo únicamente excepciones documentadas en una lista blanca aprobada por el CISO.
* **Segmentación de Red y Aislamiento de Endpoints:**  
  Microsegmentación de red VLAN: los equipos de usuarios finales no tienen visibilidad directa sobre las subredes de servidores críticos ni consolas de gestión de infraestructura sin pasar por un Firewall de Próxima Generación (NGFW).
* **Autenticación Multifactor Resistente a Phishing (MFA FIDO2):**  
  Exigir autenticación basada en claves de seguridad físicas (FIDO2 / WebAuthn) o autenticador con coincidencia de números (*Number Matching*), eliminando el uso de SMS o tokens OTP susceptibles a proxys inversos (tipo Evilginx).
* **Bloqueo y Detección de Herramientas de Tunneling Inverso no Autorizadas:**  
  Monitoreo y bloqueo por EDR/Firewall perimetral de agentes y tráfico saliente hacia servicios de túneles públicos de desarrollo (ej. `ngrok`, `serveo.net`, `localtunnel`, `packetriot`), frecuentemente utilizados por actores Red Team para exponer servidores locales sin infraestructura formal.

### 4.3. Controles Organizacionales (Eje de Gobernanza)
* **Procedimiento de Homologación de Software y Herramientas Externas:**  
  Prohibición explícita en la Política de Seguridad de la Información (PSI) de utilizar aplicaciones web de terceros no evaluadas previamente por el equipo de ciberseguridad.
* **Monitoreo y Correlación de Eventos de Dispositivos (SIEM / EDR):**  
  Configuración de reglas de correlación en el SIEM para alertar cuando un proceso de navegador (`chrome.exe`, `msedge.exe`) mantenga un descriptor abierto a la cámara web o invoque servicios de localización de Windows por más de un umbral continuo sin aplicaciones de videoconferencia autorizadas en ejecución (Teams/Zoom).

---

## 5. Procedimiento de Respuesta a Incidentes (IRP de 6 Fases)

Aplicación del marco metodológico al escenario del ataque simulado por el Red Team:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1.ACTIVACIÓN │ ──> │ 2.SEVERIDAD  │ ──> │ 3.CONTENCIÓN │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
┌──────────────┐     ┌──────────────┐            ▼
│   6.CIERRE   │ <── │5.RECUPERACIÓN│ <── ┌──────────────┐
└──────────────┘     └──────────────┘     │4.ERRADICACIÓN│
                                          └──────────────┘
```

### Fase 1: Detección y Activación
* **Mecanismos de Detección:**
  * *Reporte de Usuario:* El empleado voluntario o un compañero nota un comportamiento inusual tras interactuar con la página de filtros (ej. parpadeo de LED de cámara o solicitud anómala de GPS) y abre un ticket prioritario mediante el canal de incidentes (`soc@novaconnect.com` o extensión de emergencia).
  * *Detección Tecnológica:* El EDR alerta sobre la conexión de un endpoint corporativo hacia una URL anómala (`localhost:5173` o subdominio de tunneling no corporativo) con acceso continuo a recursos multimedia.
* **Criterio de Activación:** Recepción del reporte con confirmación de que al menos un usuario autorizó permisos web. Se declara formalmente el incidente y se asigna al Analista Blue Team Líder.

### Fase 2: Clasificación de Severidad y Alcance
* **Matriz de Clasificación (Nivel Asignado: SEVERIDAD MEDIA / ALTA):**
  * **Criterio de Impacto:** Compromiso potencial de datos biométricos (rostro de colaboradores) y telemetría de ubicación exacta (coordenadas de la vivienda o sede física).
  * **Alcance Preliminar:** 1 estación de trabajo confirmada (`LAB-2026-X8K9P2`), con riesgo de propagación si el enlace fue compartido en canales de comunicación interna (Teams/Slack).
  * **Clasificación de Tipo de Incidente:** *Ciberespionaje / Phishing con Abuso de Web APIs del Navegador*.

### Fase 3: Contención Inmediata
1. **Contención en Red:**  
   * Incorporar de inmediato la URL/dominio y direcciones IP del servidor señuelo en la lista negra (Blacklist) del Firewall perimetral, proxy corporativo y DNS Sinkhole.
2. **Aislamiento del Endpoint:**  
   * Aislar temporalmente la estación de trabajo comprometida a nivel de red mediante el EDR (Network Quarantine), manteniendo exclusivamente el canal de telemetría forense con el SOC.
3. **Revocación de Permisos y Sesiones:**  
   * Ordenar el cierre forzado de las instancias del navegador (`taskkill /F /IM msedge.exe /IM chrome.exe`).
   * Purgar el almacenamiento del navegador (cookies, caché e IndexedDB).
   * Revocar todas las sesiones activas del usuario en Microsoft Entra ID para impedir cualquier movimiento lateral.

### Fase 4: Erradicación y Análisis Forense
1. **Inspección de la Consola Forense (`/lab/resultados`):**  
   * El analista Blue Team inicia sesión en el panel privado con autenticación criptográfica SHA-256 (`blueteam`).
   * Se localiza la sesión `LAB-2026-X8K9P2` y se audita el expediente:
     * Comprobación de 3 fotografías automáticas encubiertas (`AUTO_CAPTURA_...`) y 1 fotografía manual.
     * Identificación de las coordenadas GPS exactas capturadas y su margen de error (14.20 m).
     * Revisión de la bitácora de auditoría inmutable (`audit_logs`) para determinar tiempos exactos de permanencia.
2. **Preservación de Evidencias Digitales:**  
   * Descarga del paquete estructurado `evidencias_LAB-2026-X8K9P2.zip` con su archivo de integridad `metadata.json` para garantizar la **Cadena de Custodia**.
3. **Sanitización del Almacén:**  
   * Ejecución del borrado seguro de la sesión en IndexedDB y almacenamiento local tras asegurar la copia forense.
4. **Remoción de Vectores Residuales:**  
   * Escaneo completo con EDR/Antivirus en el equipo afectado para descartar la persistencia de ejecutables secundarios o descargas automáticas asociadas.

### Fase 5: Recuperación y Validación
1. **Restablecimiento Seguro del Endpoint:**  
   * Restablecer los perfiles del navegador a su configuración de fábrica gestionada por Intune (bloqueo estricto de cámara/ubicación).
   * Desactivar el aislamiento de red del equipo previa verificación de integridad.
2. **Monitoreo Reforzado (Ventana de Observación de 48 Horas):**  
   * Configurar una regla de detección personalizada en el SIEM para rastrear cualquier petición futura hacia dominios similares o intentos de acceso a Web APIs en toda la flota de endpoints.
3. **Validación del Servicio:**  
   * Confirmar con el usuario el retorno seguro a sus actividades laborales ordinarias.

### Fase 6: Cierre y Lecciones Aprendidas (Post-Incident Review)
1. **Reunión de Retrospectiva (Post-Mortem):**  
   * Sesión conjunta entre Blue Team, Red Team y el Comité de Seguridad de la Información.
2. **Hallazgos Clave Identificados:**  
   * La interfaz amigable y los filtros de realidad aumentada fueron un señuelo sumamente efectivo para sortear el sentido crítico del usuario.
   * La política corporativa no bloqueaba por defecto el sensor de geolocalización en los navegadores de escritorio.
3. **Planes de Acción y Actualización de Lineamientos:**  
   * Despliegue inmediato de la GPO de bloqueo universal de geolocalización para todos los endpoints corporativos.
   * Inclusión del caso real analizado (anonimizado) como ejemplo práctico en la próxima campaña de concientización de NovaConnect Solutions.
   * Archivo del informe final de incidente con código de expediente `IR-2026-0920-NC`.

---

## 6. Conclusiones del Blue Team

### 6.1. Controles Prioritarios Recomendados
1. **Gestión Centralizada de Políticas de Navegador (GPO/MDM):** Bloquear el acceso no condicional a APIs de geolocalización a nivel de directiva institucional constituye la medida con mayor relación costo-beneficio para neutralizar este vector.
2. **Visibilidad Forense Local:** Contar con mecanismos estructurados de preservación como la consola Blue Team (`IndexedDB`, metadatos JSON y bitácoras inmutables) facilita una respuesta rápida y estructurada ante incidentes de fuga de telemetría.

### 6.2. Brechas de Seguridad Identificadas
* Confianza desmedida del usuario ante pretextos de bienestar o recreación interna.
* Ausencia de alertas nativas en los sistemas de monitoreo de red convencional frente a tráfico cifrado hacia Web APIs estándar que operan íntegramente en el cliente.

### 6.3. Valor Agregado del Trabajo en Parejas (Pair Programming / Pair Analysis)
* La dinámica **Driver / Navigator** durante el ejercicio defensivo permitió que mientras un integrante ejecutaba las acciones de contención técnica, inspección de registros en la consola forense y extracción de evidencias en ZIP, el segundo integrante validaba la trazabilidad de la cadena de custodia, la severidad del impacto organizacional y la rigurosidad frente a los marcos NIST e ISO 27035, evitando sesgos de confirmación y garantizando un informe robusto.

---

## 7. Anexos

### Anexo 1: Checklist de Verificación Operativa Blue Team
* [x] Identificación y registro formal del incidente.
* [x] Aislamiento del equipo objetivo mediante EDR.
* [x] Extracción y descarga del paquete de evidencias ZIP (`evidencias_LAB-2026-XXXXXX.zip`).
* [x] Verificación de la integridad del archivo `metadata.json` y cálculo de hash SHA-256.
* [x] Revocación de permisos de hardware en el navegador del cliente.
* [x] Purgado y sanitización de registros temporales en `IndexedDB`.
* [x] Notificación al CISO y emisión del informe final de lecciones aprendidas.

### Anexo 2: Modelo de Datos del Registro Forense (`metadata.json`)
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
  "locationsSummary": [
    {
      "latitude": 4.653421,
      "longitude": -74.083612,
      "accuracy": 14.2,
      "timestamp": "2026-09-20T18:41:35.000Z"
    }
  ],
  "environment": {
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "platform": "Win32",
    "language": "es-CO"
  }
}
```

### Anexo 3: Diagrama Lógico de Contención y Respuesta en Red
```
[ INTERNET / ATACANTE ]
          │
          ▼  (Bloqueo DNS Sinkhole / FW)
  [ Firewall NGFW ] ──x (Tráfico señuelo revocado)
          │
  [ Red Corporativa ]
          │
    ┌─────┴─────────────────────────┐
    ▼                               ▼
[ Switch / VLAN Segmentada ]   [ Consola Blue Team (/lab/resultados) ]
    │                               ▲
    ▼ (Aislamiento EDR)             │ (Auditoría Forense & Exportación ZIP)
[ Endpoint Comprometido ] ──────────┘
```

---

*Fin del Informe Técnico de Blue Team — Documento Académico Especialización en Ciberseguridad CUN.*
