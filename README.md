
# 📄 AI Document Assistant (RAG-Based PDF Question Answering)

An end-to-end **RAG (Retrieval-Augmented Generation)** system that allows users to upload PDFs, extract text, generate embeddings, store them in ChromaDB, and ask contextual questions — all through a clean chat-style UI.

This project works entirely on **CPU**, requires **no GPU**, and runs fully locally using **Ollama** or any LLM backend you choose.

---

## 🚀 Features

### 🔹 **1. PDF Upload & Processing**

* Extracts text from PDFs (supports scanned PDFs via OCR if enabled)
* Cleans, preprocesses, and chunks the text
* Automatically deletes temporary files after processing

### 🔹 **2. RAG Pipeline**

* Embeddings generated using local embedding models
* Stores vectors in **ChromaDB**
* Removes old collections before adding new ones
  (Ensures each session uses only the latest uploaded document)

### 🔹 **3. Intelligent Q&A**

* Users can ask questions based on the uploaded document
* The system retrieves relevant chunks + generates accurate answers
* Also provides **document summaries** and **key insights**

### 🔹 **4. Chat UI (Frontend)**

* Clean React-based chat interface
* Shows user messages, bot responses, loading states
* Supports:

  * PDF preview
  * Error states
  * Multi-turn Q&A
  * Summary generation

### 🔹 **5. Backend (FastAPI / Python)**

* Handles PDF ingestion
* Runs OCR/text extraction
* Creates embeddings + stores vectors
* Performs retrieval based on user queries
* Calls LLM for final answer

### 🔹 **6. Automatic Cleanup**

* New upload → old ChromaDB collection deleted
* Temporary PDF files cleaned
* Ensures fresh state on each request

### 🔹 **7. Optional Docker Support**

* Isolated environment
* No Python path issues
* Can be deployed anywhere

---

## 🏗️ Architecture

```
                 ┌────────────────────┐
                 │       React UI     │
                 │  (Chat Interface)  │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │     FastAPI API    │
                 ├────────────────────┤
                 │ File Upload        │
                 │ PDF Extraction     │
                 │ Embedding Creation │
                 │ Vector Search      │
                 │ LLM Response       │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │     ChromaDB       │
                 │ (Vector Storage)   │
                 └────────────────────┘
```

---

## 📁 Project Structure

```
/frontend
   ├── src
   │    ├── components
   │    └── App.jsx
   └── ...

/backend
   ├── main.py
   ├── rag.py
   ├── utils.py
   ├── temp_uploads/
   └── chroma_db/
```

---

## ⚙️ Tech Stack

### **Frontend**

* React (Vite)
* Tailwind CSS
* Lucide Icons

### **Backend**

* Python FastAPI
* PyMuPDF / pdfplumber for extraction
* ChromaDB for vector storage
* Sentence Transformers / Ollama Embeddings
* Local LLM (Ollama or any API)

---

## 🧠 RAG Workflow

1. **Upload PDF**
   → File saved temporarily
2. **Extract text**
   → Clean + chunk
3. **Delete old vector collections**
4. **Generate embeddings**
5. **Store in ChromaDB**
6. **Ask a question**
   → Retrieve top chunks
   → Answer using LLM

---

## ▶️ Running the Project

### **Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### **Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## 🧹 Automatic Cleanup Logic

Old session data ⟶ **automatically removed**

* old PDF files (temp folder)
* old ChromaDB collections
* stale embeddings

Backend ensures **fresh collection per upload**.



## 📌 Future Improvements

* Add GPU acceleration (optional)
* Add multi-document support
* Add persistent user sessions
* Add authentication
* Add streaming responses


