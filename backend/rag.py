
from vector import query_similar
import subprocess
import json

LLM_MODEL = "qwen2.5:1.5b"   # or ""

def run_llm(prompt):
    result = subprocess.run(
        ["ollama", "run", LLM_MODEL],
        input=prompt,
        text=True,
        capture_output=True
    )
    return result.stdout


def answer_question(query):
    results = query_similar(query)

    contexts = "\n\n".join(results["documents"][0])

    prompt = f"""
You are an intelligent RAG assistant. Use ONLY the following context to answer.

Context:
{contexts}

Question: {query}

Answer clearly and concisely. If answer not found, say "Not in document".
"""
    return run_llm(prompt)


def summarize_document():
    results = query_similar("summary of document", k=10)
    contexts = "\n\n".join(results["documents"][0])

    prompt = f"""
Summarize the full document below in simple terms:

{contexts}
"""

    return run_llm(prompt)
