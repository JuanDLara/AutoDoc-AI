# AutoDoc AI - Entorno Visual de Documentación con LLM

AutoDoc AI es una plataforma web inteligente y premium diseñada para automatizar la documentación de código fuente utilizando modelos locales de LLM mediante Ollama. Combina un backend robusto en Flask con persistencia de base de datos SQL y una interfaz de usuario interactiva y fluida construida en React y Tailwind CSS.

---

## 🌟 Características Principales

- **Doble Tipo de Entrada**: 
  - **Editor de Texto**: Pega y edita tu código directamente en un editor con tipografía optimizada.
  - **Carga de Archivos (Drag & Drop)**: Arrastra y suelta archivos de código directamente en el navegador. Se leerán automáticamente y el frontend detectará el lenguaje de programación basándose en la extensión.
- **Tipos de Documentación**:
  - **Comentarios Internos (Docstrings)**: Genera el código fuente documentado internamente con docstrings y comentarios profesionales (estilo Google, JSDoc, etc.).
  - **Guía Externa (Markdown)**: Genera un documento técnico exhaustivo en Markdown que explica la arquitectura, funciones, parámetros, retornos, ejemplos de uso y oportunidades de mejora del código.
  - **Ambas Generaciones**: Genera de forma paralela y simultánea tanto la versión con docstrings como la guía en Markdown en tiempo real.
- **Visualización Organizada**:
  - Pestaña para visualizar y descargar el **Código Documentado** con resaltado de sintaxis nativo (Prism.js).
  - Pestaña para leer la **Guía Markdown** renderizada como HTML enriquecido (Tailwind Typography).
  - **Vista Dividida (Split View)** para comparar ambos resultados lado a lado en tiempo real.
- **Historial Persistente en Base de Datos**:
  - Toda documentación generada exitosamente se almacena automáticamente en una base de datos.
  - Incluye fusión inteligente: si generas código interno y guía externa para el mismo archivo simultáneamente, se consolidan en un único elemento de historial.
  - Panel lateral interactivo para consultar, cargar o eliminar documentaciones previas de la base de datos.
- **Detección Dinámica de Modelos**: Consulta en tiempo real qué modelos de LLM están instalados en tu Ollama local para seleccionarlos desde la barra de navegación.

---

## 🛠️ Requisitos Previos

1. **Python 3.8+** instalado.
2. **Node.js (v18+) y npm** instalados para el frontend de React.
3. **Ollama corriendo localmente**:
   - Asegúrate de que Ollama esté activo en `http://localhost:11434`.
   - Descarga un modelo de programación, por ejemplo `qwen2.5-coder:3b`:
     ```bash
     ollama pull qwen2.5-coder:3b
     ```

---

## 🚀 Instalación y Configuración

### 1. Clonar e Instalar Backend (Flask)
Asegúrate de tener el entorno virtual activo e instala las dependencias de Python:
```bash
pip install -r requirements.txt
```
*Las dependencias incluyen: `flask`, `flask-cors`, `flask-sqlalchemy` y `psycopg2-binary`.*

### 2. Configurar la Base de Datos

#### Opción A: PostgreSQL (Recomendado)
1. **Iniciar el servicio PostgreSQL en Windows**:
   - Abre el **Services Manager** (Win+R, escribe `services.msc`)
   - Busca `postgresql-x64-XX` (donde XX es la versión)
   - Haz clic derecho → **Start**

   O desde línea de comandos como administrador:
   ```bash
   net start postgresql-x64-16
   ```

2. **Crear la base de datos**:
   ```bash
   # Abre pgAdmin o usa psql desde la terminal
   psql -U postgres
   CREATE DATABASE llm_project;
   \q
   ```

3. **Configurar el archivo `.env`**:
   El proyecto ya incluye un archivo `.env` con la configuración por defecto:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/llm_project
   ```
   
   Si tu contraseña o usuario son diferentes, edita el archivo `.env`:
   ```
   DATABASE_URL=postgresql://tu_usuario:tu_contraseña@localhost:5432/llm_project
   ```

4. **Inicializar la base de datos**:
   ```bash
   python init_db.py
   ```

#### Opción B: SQLite (Por defecto)
No requiere configuración previa. Creará un archivo `documentation.db` local automáticamente al iniciar.

### 3. Instalar Frontend (React)
Accede a la carpeta `frontend` e instala los paquetes:
```bash
cd frontend
npm install
```

---

## 💻 Instrucciones de Ejecución

Para iniciar la aplicación, abre dos terminales independientes:

### Terminal 1: Servidor Flask (Backend)
Desde la raíz del proyecto, ejecuta:
```bash
.venv\Scripts\python app.py
```
*El backend se ejecutará en `http://127.0.0.1:5000`.*

### Terminal 2: Servidor Vite (Frontend React)
Desde la carpeta `frontend/`, ejecuta:
```bash
npm run dev
```
*El cliente se ejecutará en `http://localhost:5173/`.*

---

## 📂 Estructura del Proyecto

```text
├── app.py                  # Servidor backend Flask y endpoints de API
├── models.py               # Modelo SQLAlchemy para persistir el historial
├── main.py                 # Envoltura del cliente Ollama (OllamaLLM)
├── documenter.py           # Clase auxiliar de documentación
├── requirements.txt        # Dependencias de Python
├── documentation.db        # Base de datos SQLite local (autocreada)
├── frontend/               # Aplicación React
│   ├── index.html          # HTML principal con fuentes premium
│   ├── tailwind.config.js  # Configuración de Tailwind CSS
│   ├── src/
│   │   ├── main.jsx        # Entrada de React
│   │   ├── App.jsx         # Componente principal y gestión de estado
│   │   ├── index.css       # Estilos globales y clases de Tailwind
│   │   └── components/     # Componentes interactivos
│   │       ├── Navbar.jsx      # Selector de modelo y estado
│   │       ├── HistoryList.jsx # Panel lateral del historial en BD
│   │       ├── CodeInput.jsx   # Drag & Drop y opciones de generación
│   │       └── OutputView.jsx  # Pestañas y resaltado Prism/Markdown
```
