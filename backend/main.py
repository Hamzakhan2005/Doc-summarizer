# from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
# from typing import Optional
# from datetime import datetime
# import PyPDF2
# import docx
# import io
# import os
# from dotenv import load_dotenv
# load_dotenv()
# from openai import OpenAI



# # ==================== CONFIG ====================
# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
# client = OpenAI(api_key=OPENAI_API_KEY)
# # ==================== APP ====================




# # ==================== FILE EXTRACTION ====================
# def extract_text_from_pdf(file_content: bytes) -> str:
#     try:
#         pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
#         text = ""
#         for page in pdf_reader.pages:
#             text += page.extract_text() + "\n"
#         return text.strip()
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

# def extract_text_from_docx(file_content: bytes) -> str:
#     try:
#         doc = docx.Document(io.BytesIO(file_content))
#         return "\n".join([p.text for p in doc.paragraphs]).strip()
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Error reading DOCX: {str(e)}")

# def extract_text_from_txt(file_content: bytes) -> str:
#     try:
#         return file_content.decode("utf-8").strip()
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Error reading TXT: {str(e)}")

# def extract_text_from_file(file: UploadFile) -> str:
#     content = file.file.read()
#     filename = file.filename.lower()
#     if filename.endswith(".pdf"):
#         return extract_text_from_pdf(content)
#     elif filename.endswith(".docx") or filename.endswith(".doc"):
#         return extract_text_from_docx(content)
#     elif filename.endswith(".txt"):
#         return extract_text_from_txt(content)
#     else:
#         raise HTTPException(
#             status_code=400,
#             detail="Unsupported file type. Use PDF, DOCX, DOC, or TXT."
#         )

# # ==================== SUMMARIZATION ====================
# def generate_summary_fallback(text: str) -> str:
#     sentences = text.replace("\n", " ").split(".")
#     sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
#     summary_sentences = sentences[:5]  # first 5 sentences
#     summary = ". ".join(summary_sentences)
#     return summary + "." if summary else "Unable to generate summary."


# def generate_summary_openai(text: str) -> str:
#     try:
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",  # or "gpt-4o-mini" if available
#             messages=[
#                 {"role": "system", "content": "You are a helpful assistant that summarizes text concisely."},
#                 {"role": "user", "content": text[:4000]}
#             ],
#             max_tokens=500,
#             temperature=0.7
#         )
#         return response.choices[0].message.content.strip()
#     except Exception as e:
#         print("OpenAI error:", e)
#         return generate_summary_fallback(text)

# def generate_summary(text: str) -> str:
#     if not text or len(text.strip()) < 50:
#         raise HTTPException(status_code=400, detail="Text too short to summarize.")
#     return generate_summary_openai(text) if OPENAI_API_KEY else generate_summary_fallback(text)

# # ==================== ROUTES ====================
# @app.get("/")
# def root():
#     return {"message": "Document Summarizer API", "version": "1.0.0"}

# @app.get("/health")
# def health_check():
#     return {"status": "healthy", "timestamp": datetime.utcnow()}



# @app.post("/summarize/")
# async def summarize_document(file: UploadFile = File(None), text: str = Form(None)):
#     if file:
#         contents = await file.read()
#         decoded_text = contents.decode("utf-8")
#         input_text = decoded_text
#     elif text:
#         input_text = text
#     else:
#         return {"summary": "No content provided."}

#     # Call OpenAI to summarize
#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=[
#             {"role": "system", "content": "You are a helpful assistant that summarizes text."},
#             {"role": "user", "content": f"Summarize this:\n{input_text}"}
#         ],
#         max_tokens=150
#     )

#     summary = response.choices[0].message.content
#     return {"summary": summary}




from fastapi import FastAPI, UploadFile, File
from vector import extract_text_from_pdf, create_chunks, store_embeddings
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
    path = f"temp/{file.filename}"
    os.makedirs("temp", exist_ok=True)

    with open(path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_pdf(path)
    chunks = create_chunks(text)
    store_embeddings(chunks)

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