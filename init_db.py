"""
Script para inicializar la base de datos PostgreSQL
"""
import os
from dotenv import load_dotenv
from app import app, db
from models import HistoryItem

# Cargar variables de entorno
load_dotenv()

def init_database():
    """Inicializa la base de datos y crea las tablas"""
    with app.app_context():
        try:
            # Crear todas las tablas
            db.create_all()
            print("✓ Base de datos inicializada correctamente")
            print("✓ Tablas creadas:")
            print("  - history_items")
            
            # Verificar conexión
            db.session.execute(db.text("SELECT 1"))
            print("✓ Conexión a PostgreSQL exitosa")
            
            # Mostrar información de la base de datos
            db_url = os.environ.get('DATABASE_URL', 'No configurada')
            print(f"\nConectado a: {db_url}")
            
        except Exception as e:
            print(f"✗ Error al inicializar la base de datos: {e}")
            raise

if __name__ == "__main__":
    print("=== Inicializando Base de Datos PostgreSQL ===")
    init_database()
    print("\n=== Proceso completado ===")
