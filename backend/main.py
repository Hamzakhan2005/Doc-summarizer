
from fastapi.middleware.cors import CORSMiddleware
import shutil


from fastapi import FastAPI, UploadFile, File
from vector import (
    extract_text_from_pdf,
    create_chunks,
    store_embeddings,
    get_collection
)

from rag import answer_question, summarize_document

import os
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"
app = FastAPI(
    title="Document Summarizer API",
    description="AI-powered document summarization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Reset temp folder
    shutil.rmtree("temp", ignore_errors=True)
    os.makedirs("temp", exist_ok=True)

    # 🔥 Reset chroma db completely
    shutil.rmtree("chroma_db", ignore_errors=True)

    # This recreates an empty chroma DB
    collection = get_collection()

    # Save uploaded PDF
    path = f"temp/{file.filename}"
    with open(path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_pdf(path)
    chunks = create_chunks(text)

    store_embeddings(chunks, collection)

    return {"status": "ok", "chunks": len(chunks)}


@app.get("/summary")
def get_summary():
    return {"summary": summarize_document()}


@app.post("/ask")
async def ask(query: str):
    answer = answer_question(query)
    return {"answer": answer}

# ==================== RUN SERVER ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )