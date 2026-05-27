import ollama
from typing import Optional

class OllamaLLM:
    def __init__(self, model: str = "qwen2.5-coder:3b"):
        self.model = model
        self.client = ollama.Client(host='http://localhost:11434')
    
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Genera una respuesta usando el modelo LLM"""
        response = self.client.chat(
            model=self.model,
            messages=[
                {'role': 'system', 'content': system_prompt or 'Eres un asistente útil.'},
                {'role': 'user', 'content': prompt}
            ]
        )
        return response['message']['content']
    
    def generate_stream(self, prompt: str, system_prompt: Optional[str] = None):
        """Genera una respuesta en streaming"""
        stream = self.client.chat(
            model=self.model,
            messages=[
                {'role': 'system', 'content': system_prompt or 'Eres un asistente útil.'},
                {'role': 'user', 'content': prompt}
            ],
            stream=True
        )
        
        for chunk in stream:
            if 'message' in chunk and 'content' in chunk['message']:
                yield chunk['message']['content']

if __name__ == "__main__":
    # Ejemplo de uso
    llm = OllamaLLM()
    
    print("=== Generación simple ===")
    response = llm.generate("¿Qué es Python?")
    print(response)
    
    print("\n=== Generación con streaming ===")
    print("Respuesta: ", end="", flush=True)
    for chunk in llm.generate_stream("Explícame qué es una función en Python"):
        print(chunk, end="", flush=True)
    print()
