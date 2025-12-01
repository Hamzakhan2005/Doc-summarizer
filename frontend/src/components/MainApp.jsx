import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  Send,
  Trash2,
  LogOut,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const MainApp = () => {
  const [user, setUser] = useState({
    username: "Tester",
    email: "test@demo.com",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [documentAnalyzed, setDocumentAnalyzed] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        const validTypes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "application/msword",
        ];

        if (
          validTypes.includes(file.type) ||
          file.name.match(/\.(pdf|docx|doc|txt)$/i)
        ) {
          formData.append("file", file);
        }
      });

      const uploadRes = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        setUploadedFiles([...uploadedFiles, ...files.map((f) => f.name)]);

        setIsAnalyzing(true);
        const summaryRes = await fetch(`${API_URL}/summary`);
        const { summary } = await summaryRes.json();

        setMessages([
          {
            type: "bot",
            content: `I've analyzed your document(s). Here's a summary:\n\n${summary}\n\nFeel free to ask me any questions about the content!`,
            timestamp: new Date(),
          },
        ]);

        setDocumentAnalyzed(true);
        setIsAnalyzing(false);
      } else {
        const errorData = await uploadRes.json();
        setUploadError(errorData.detail || "Upload failed");
      }
    } catch (err) {
      setUploadError("Network error. Please try again.");
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !documentAnalyzed) return;

    const userMessage = {
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsSending(true);

    try {
      const res = await fetch(
        `${API_URL}/ask?query=${encodeURIComponent(inputMessage)}`,
        {
          method: "POST",
        }
      );

      if (res.ok) {
        const data = await res.json();
        const botMessage = {
          type: "bot",
          content: data.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const botMessage = {
          type: "bot",
          content:
            "Sorry, I encountered an error processing your question. Please try again.",
          timestamp: new Date(),
          error: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      const botMessage = {
        type: "bot",
        content: "Network error. Please check your connection and try again.",
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, botMessage]);
    }

    setIsSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all messages and uploaded documents?"
      )
    ) {
      setMessages([]);
      setUploadedFiles([]);
      setDocumentAnalyzed(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #eef2ff, #f3e8ff, #fce7f3)",
      }}
    >
      <nav
        style={{
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: "1rem 1.5rem",
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                padding: "0.5rem",
                background: "#e0e7ff",
                borderRadius: "0.5rem",
              }}
            >
              <Bot size={28} style={{ color: "#4f46e5" }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                }}
              >
                RAG Chatbot
              </h1>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                Ask questions about your documents
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#111827",
                  margin: 0,
                }}
              >
                {user?.username || "User"}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                {user?.email}
              </p>
            </div>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "#ef4444",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "all 0.2s",
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "1rem 1.5rem",
          height: "calc(100vh - 6rem)",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {!documentAnalyzed && (
            <div
              style={{
                padding: "1.5rem",
                borderBottom: "1px solid #e5e7eb",
                background: "linear-gradient(to right, #eef2ff, #f3e8ff)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Upload size={20} style={{ color: "#4f46e5" }} />
                Upload Documents to Begin
              </h2>

              {uploadError && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "0.5rem",
                    color: "#dc2626",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <AlertCircle size={16} />
                  {uploadError}
                </div>
              )}

              <div
                style={{
                  border: "2px dashed #c7d2fe",
                  borderRadius: "0.75rem",
                  padding: "3rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#ffffff",
                  transition: "border-color 0.2s",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.doc,.docx"
                  multiple
                  style={{ display: "none" }}
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  style={{ cursor: "pointer", display: "block" }}
                >
                  {uploading || isAnalyzing ? (
                    <>
                      <Loader2
                        style={{
                          width: "3rem",
                          height: "3rem",
                          margin: "0 auto 1rem",
                          color: "#4f46e5",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      <p
                        style={{
                          color: "#374151",
                          fontWeight: 500,
                          marginBottom: "0.5rem",
                        }}
                      >
                        {isAnalyzing
                          ? "Analyzing documents..."
                          : "Uploading..."}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload
                        style={{
                          width: "3rem",
                          height: "3rem",
                          margin: "0 auto 1rem",
                          color: "#9ca3af",
                        }}
                      />
                      <p
                        style={{
                          color: "#374151",
                          fontWeight: 500,
                          marginBottom: "0.5rem",
                        }}
                      >
                        Click to upload or drag and drop
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        Supports: PDF, DOC, DOCX, TXT • Multiple files allowed
                      </p>
                    </>
                  )}
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Uploaded files:
                  </p>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {uploadedFiles.map((fileName, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "#e0e7ff",
                          color: "#3730a3",
                          fontSize: "0.875rem",
                          borderRadius: "9999px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <FileText size={14} />
                        {fileName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {documentAnalyzed && uploadedFiles.length > 0 && (
            <div
              style={{
                padding: "1rem",
                borderBottom: "1px solid #e5e7eb",
                background: "#f9fafb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <CheckCircle2 size={18} style={{ color: "#16a34a" }} />
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  Active documents:
                </span>
                {uploadedFiles.map((fileName, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "0.25rem 0.5rem",
                      background: "#e0e7ff",
                      color: "#3730a3",
                      fontSize: "0.75rem",
                      borderRadius: "9999px",
                    }}
                  >
                    {fileName}
                  </span>
                ))}
              </div>
              <button
                onClick={clearChat}
                style={{
                  fontSize: "0.875rem",
                  color: "#dc2626",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
            {messages.length === 0 && documentAnalyzed && (
              <div
                style={{
                  textAlign: "center",
                  paddingTop: "3rem",
                  paddingBottom: "3rem",
                }}
              >
                <Bot
                  size={64}
                  style={{
                    width: "4rem",
                    height: "4rem",
                    margin: "0 auto 1rem",
                    color: "#d1d5db",
                  }}
                />
                <p style={{ color: "#6b7280", fontSize: "1.125rem" }}>
                  Start asking questions about your documents!
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.type === "user" ? "flex-end" : "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    maxWidth: "48rem",
                    flexDirection: msg.type === "user" ? "row-reverse" : "row",
                  }}
                >
                  <div
                    style={{
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background: msg.type === "user" ? "#4f46e5" : "#e5e7eb",
                      color: msg.type === "user" ? "#ffffff" : "#374151",
                    }}
                  >
                    {msg.type === "user" ? (
                      <User size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>
                  <div
                    style={{
                      borderRadius: "1rem",
                      padding: "0.75rem 1rem",
                      background:
                        msg.type === "user"
                          ? "#4f46e5"
                          : msg.error
                          ? "#fef2f2"
                          : "#f3f4f6",
                      color:
                        msg.type === "user"
                          ? "#ffffff"
                          : msg.error
                          ? "#7f1d1d"
                          : "#111827",
                      border: msg.error ? "1px solid #fecaca" : "none",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.875rem",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {msg.content}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        marginTop: "0.5rem",
                        opacity: 0.7,
                        margin: "0.5rem 0 0 0",
                      }}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isSending && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{ display: "flex", gap: "0.75rem", maxWidth: "48rem" }}
                >
                  <div
                    style={{
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background: "#e5e7eb",
                      color: "#374151",
                    }}
                  >
                    <Bot size={18} />
                  </div>
                  <div
                    style={{
                      borderRadius: "1rem",
                      padding: "0.75rem 1rem",
                      background: "#f3f4f6",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <div
                        style={{
                          width: "0.5rem",
                          height: "0.5rem",
                          background: "#9ca3af",
                          borderRadius: "9999px",
                          animation: "bounce 1s infinite",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "0.5rem",
                          height: "0.5rem",
                          background: "#9ca3af",
                          borderRadius: "9999px",
                          animation: "bounce 1s infinite 0.15s",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "0.5rem",
                          height: "0.5rem",
                          background: "#9ca3af",
                          borderRadius: "9999px",
                          animation: "bounce 1s infinite 0.3s",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {documentAnalyzed && (
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                padding: "1rem",
                background: "#ffffff",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-end",
                }}
              >
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about your documents..."
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.75rem",
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                    fontSize: "0.875rem",
                  }}
                  rows="2"
                  disabled={isSending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isSending}
                  style={{
                    padding: "0.75rem",
                    background: "#4f46e5",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "0.75rem",
                    cursor:
                      inputMessage.trim() && !isSending
                        ? "pointer"
                        : "not-allowed",
                    opacity: !inputMessage.trim() || isSending ? 0.5 : 1,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    transition: "all 0.2s",
                  }}
                >
                  {isSending ? (
                    <Loader2
                      size={24}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Send size={24} />
                  )}
                </button>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginTop: "0.5rem",
                  margin: "0.5rem 0 0 0",
                }}
              >
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.5rem); }
        }
      `}</style>
    </div>
  );
};

export default MainApp;
