from main import OllamaLLM
import os

class CodeDocumenter:
    """Genera documentación para código usando Ollama"""
    
    def __init__(self, model: str = "qwen2.5-coder:3b"):
        self.llm = OllamaLLM(model)
        self.system_prompt = """Eres un experto en documentación de código. 
Tu tarea es generar documentación clara y concisa para el código proporcionado.
Incluye:
- Descripción de lo que hace el código
- Parámetros (si aplica)
- Retornos (si aplica)
- Ejemplos de uso (si es relevante)
Responde en formato Markdown."""
    
    def document_function(self, code: str) -> str:
        """Genera documentación para una función"""
        prompt = f"""Genera documentación para el siguiente código:

```python
{code}
```

Proporciona documentación completa en formato Markdown."""
        return self.llm.generate(prompt, system_prompt=self.system_prompt)
    
    def document_class(self, code: str) -> str:
        """Genera documentación para una clase"""
        prompt = f"""Genera documentación para la siguiente clase:

```python
{code}
```

Proporciona documentación completa en formato Markdown, incluyendo descripción de la clase y sus métodos."""
        return self.llm.generate(prompt, system_prompt=self.system_prompt)
    
    def document_file(self, filepath: str) -> str:
        """Genera documentación para un archivo completo"""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Archivo no encontrado: {filepath}")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            code = f.read()
        
        prompt = f"""Genera documentación para el siguiente archivo:

```python
{code}
```

Proporciona documentación completa en formato Markdown."""
        return self.llm.generate(prompt, system_prompt=self.system_prompt)

if __name__ == "__main__":
    # Ejemplo de uso
    documenter = CodeDocumenter()
    
    sample_code = """
def calculate_sum(a: int, b: int) -> int:
    return a + b
"""
    
    print("=== Documentación generada ===")
    doc = documenter.document_function(sample_code)
    print(doc)
