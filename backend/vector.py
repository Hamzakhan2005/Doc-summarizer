import os
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"
import pdfplumber
import fitz
from PIL import Image
import pytesseract

from chromadb import PersistentClient
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


# Use local DB stored in ./chroma_db
client = PersistentClient(path="chroma_db")
collection = client.get_or_create_collection("docs")


# OCR for scanned PDFs
def extract_text_ocr(page):
    pix = page.get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    return pytesseract.image_to_string(img)


# Extract text from any PDF
def extract_text_from_pdf(path):
    text = ""

    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
    except:
        pass

    # If pdfplumber failed (maybe image PDF), use PyMuPDF
    if len(text.strip()) < 50:
        doc = fitz.open(path)
        for p in doc:
            text += extract_text_ocr(p) + "\n"

    return text


# Embedder
embedder = OllamaEmbeddings(model="nomic-embed-text")


def create_chunks(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=900,
        chunk_overlap=150
    )
    return splitter.split_text(text)


def store_embeddings(chunks):
    for i, chunk in enumerate(chunks):
        emb = embedder.embed_query(chunk)

        collection.add(
            documents=[chunk],
            embeddings=[emb],
            ids=[f"chunk-{i}"]
        )

    # ❌ NO CLIENT.PERSIST — PersistentClient saves automatically


def query_similar(text, k=4):
    emb = embedder.embed_query(text)
    results = collection.query(
        query_embeddings=[emb],
        n_results=k
    )
    return results
