import os
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, HistoryItem
from main import OllamaLLM
import datetime
import ollama

# Cargar variables de entorno desde .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de base de datos
db_url = os.environ.get('DATABASE_URL')
if db_url:
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///documentation.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Crear tablas
with app.app_context():
    try:
        db.create_all()
        print("Base de datos inicializada correctamente.")
    except Exception as e:
        print(f"Error al inicializar la base de datos: {e}")

@app.route('/api/models', methods=['GET'])
def get_models():
    try:
        client = ollama.Client(host='http://localhost:11434')
        models_data = client.list()
        model_names = [m.model for m in models_data.models]
        return jsonify({"models": model_names})
    except Exception as e:
        print(f"Error al listar modelos de Ollama: {e}")
        return jsonify({"models": ["qwen2.5-coder:3b"]})

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        items = HistoryItem.query.order_by(HistoryItem.created_at.desc()).all()
        return jsonify([item.to_dict() for item in items])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history/<int:item_id>', methods=['GET'])
def get_history_item(item_id):
    try:
        item = HistoryItem.query.get_or_404(item_id)
        return jsonify(item.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history/<int:item_id>', methods=['DELETE'])
def delete_history_item(item_id):
    try:
        item = HistoryItem.query.get_or_404(item_id)
        db.session.delete(item)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/document-stream', methods=['POST'])
def document_stream():
    data = request.json or {}
    code = data.get('code', '')
    style = data.get('style', 'inline')  # 'inline' | 'external'
    language = data.get('language', 'python')
    model = data.get('model', 'qwen2.5-coder:3b')
    filename = data.get('filename', '')

    if style == 'inline':
        system_prompt = (
            "Eres un desarrollador senior experto en documentación. "
            "Tu tarea es tomar el código provisto y documentarlo internamente. "
            "Agrega docstrings profesionales y comentarios explicativos claros para bloques complejos. "
            "DEBES devolver ÚNICAMENTE el código fuente modificado con la documentación. "
            "NO incluyas introducciones, explicaciones de texto adicionales fuera del código, "
            "ni bloques de código con formato markdown (como ```python ... ```). Devuelve solo el código ejecutable."
        )
        prompt = f"Documenta internamente este código en {language} con docstrings y comentarios:\n\n{code}"
    else:
        system_prompt = (
            "Eres un redactor técnico y desarrollador experto. "
            "Tu tarea es generar una guía de documentación externa en formato Markdown para el código provisto. "
            "Incluye una descripción general de lo que hace el archivo, explicaciones de la estructura de clases/funciones, "
            "parámetros, retornos, ejemplos de uso y posibles mejoras de diseño. Usa un formato Markdown muy organizado."
        )
        prompt = f"Genera una guía de documentación en Markdown para este código en {language}:\n\n{code}"

    llm = OllamaLLM(model)

    def generate():
        full_response = []
        try:
            for chunk in llm.generate_stream(prompt, system_prompt=system_prompt):
                full_response.append(chunk)
                yield chunk
            
            # Guardar en base de datos
            with app.app_context():
                documented = "".join(full_response)
                
                if style == 'inline':
                    # Si el modelo retorna bloques de código markdown, limpiarlos
                    cleaned = documented.strip()
                    if cleaned.startswith("```"):
                        lines = cleaned.splitlines()
                        if lines[0].startswith("```"):
                            lines = lines[1:]
                        if lines and lines[-1].strip() == "```":
                            lines = lines[:-1]
                        documented = "\n".join(lines)

                # Buscar un ítem idéntico creado en los últimos 20 segundos para unir corridas paralelas ("Ambos")
                time_threshold = datetime.datetime.utcnow() - datetime.timedelta(seconds=20)
                existing = HistoryItem.query.filter(
                    HistoryItem.original_code == code,
                    HistoryItem.created_at >= time_threshold
                ).order_by(HistoryItem.created_at.desc()).first()

                if existing:
                    if style == 'inline':
                        existing.documented_code = documented
                    else:
                        existing.markdown_guide = documented
                    db.session.commit()
                else:
                    item = HistoryItem(
                        filename=filename or None,
                        language=language,
                        original_code=code,
                        documented_code=documented if style == 'inline' else None,
                        markdown_guide=documented if style == 'external' else None
                    )
                    db.session.add(item)
                    db.session.commit()
        except Exception as e:
            yield f"\n[Error en streaming: {str(e)}]"

    return Response(stream_with_context(generate()), mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)