import os
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"
os.environ["Ollama_Log_Encoding"] = "utf-8"
import locale
locale.setlocale(locale.LC_ALL, "en_US.UTF-8")



import pdfplumber
import fitz
from PIL import Image
import pytesseract  

pytesseract.pytesseract.tesseract_cmd = r"D:\Temp Downloads\tesseract.exe"

from chromadb import PersistentClient
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

client = None  # <-- FIX

def set_client(c):
    global client
    client = c

# client = PersistentClient(path="chroma_db")
embedder = OllamaEmbeddings(model="nomic-embed-text")

COLLECTION_NAME = "docs"



def get_collection():
    global client
    return client.get_or_create_collection(COLLECTION_NAME)


def extract_text_ocr(page):
    pix = page.get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    return pytesseract.image_to_string(img)


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

    
    if len(text.strip()) < 50:
        doc = fitz.open(path)
        for p in doc:
            text += extract_text_ocr(p) + "\n"

    return text



embedder = OllamaEmbeddings(model="nomic-embed-text")


def create_chunks(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=900,
        chunk_overlap=150
    )
    return splitter.split_text(text)


def store_embeddings(chunks,collection):
    for i, chunk in enumerate(chunks):
        emb = embedder.embed_query(chunk)

        collection.add(
            documents=[chunk],
            embeddings=[emb],
            ids=[f"chunk-{i}"]
        )

  


def query_similar(text, k=4):
    if client is None:
        raise Exception("Chroma client is not initialized. Upload a PDF first.")

    emb = embedder.embed_query(text)
    collection = client.get_collection(COLLECTION_NAME)

    results = collection.query(
        query_embeddings=[emb],
        n_results=k
    )
    return results

