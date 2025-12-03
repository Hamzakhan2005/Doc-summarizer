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
  Settings,
  Bell,
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
        background: "#e8dcc6",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          background: "#d4c5ab",
          padding: "0.75rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #b8a687",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Bot size={28} style={{ color: "#6b7280" }} />
          <h1
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#4b5563",
              margin: 0,
            }}
          >
            Ragbot
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Settings size={22} style={{ color: "#6b7280", cursor: "pointer" }} />
          <Bell size={22} style={{ color: "#6b7280", cursor: "pointer" }} />
          <User
            size={28}
            style={{
              color: "#6b7280",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "50%",
              border: "2px solid #6b7280",
            }}
          />
        </div>
      </nav>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: "60rem",
          margin: "0 auto",
          width: "100%",
          padding: "1rem",
        }}
      >
        {!documentAnalyzed && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "1rem",
                padding: "2rem",
                width: "100%",
                maxWidth: "35rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Upload size={24} style={{ color: "#6b7280" }} />
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
                  border: "2px dashed #d1d5db",
                  borderRadius: "0.75rem",
                  padding: "3rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#f9fafb",
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
                          color: "#6b7280",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      <p
                        style={{
                          color: "#4b5563",
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
                          color: "#4b5563",
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
                      color: "#4b5563",
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
                          background: "#d4c5ab",
                          color: "#4b5563",
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
          </div>
        )}

        {documentAnalyzed && (
          <>
            {uploadedFiles.length > 0 && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "#f3f4f6",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
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
                  <CheckCircle2 size={18} style={{ color: "#059669" }} />
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#4b5563",
                    }}
                  >
                    Active documents:
                  </span>
                  {uploadedFiles.map((fileName, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "#d4c5ab",
                        color: "#4b5563",
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

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {messages.length === 0 && (
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
                      color: "#9ca3af",
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
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "0.875rem 1rem",
                      borderRadius: "1rem",
                      background:
                        msg.type === "user"
                          ? "#a8b5a0"
                          : msg.error
                          ? "#f3a8a8"
                          : "#b0c4d1",
                      color: "#2d3748",
                      fontSize: "0.9375rem",
                      lineHeight: 1.5,
                      wordWrap: "break-word",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}

              {isSending && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  <div
                    style={{
                      padding: "0.875rem 1rem",
                      borderRadius: "1rem",
                      background: "#b0c4d1",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <div
                        style={{
                          width: "0.5rem",
                          height: "0.5rem",
                          background: "#6b7280",
                          borderRadius: "9999px",
                          animation: "bounce 1s infinite",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "0.5rem",
                          height: "0.5rem",
                          background: "#6b7280",
                          borderRadius: "9999px",
                          animation: "bounce 1s infinite 0.15s",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "0.5rem",
                          height: "0.5rem",
                          background: "#6b7280",
                          borderRadius: "9999px",
                          animation: "bounce 1s infinite 0.3s",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div
              style={{
                padding: "1rem",
                background: "#ffffff",
                borderRadius: "1.5rem",
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <button
                style={{
                  padding: "0.625rem",
                  background: "#9eb8c9",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Upload size={20} style={{ color: "#374151" }} />
              </button>
              <button
                style={{
                  padding: "0.625rem",
                  background: "#9eb8c9",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={20} style={{ color: "#374151" }} />
              </button>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: "0.625rem 1rem",
                  border: "none",
                  borderRadius: "1.5rem",
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  fontSize: "0.9375rem",
                  background: "transparent",
                  color: "#374151",
                }}
                rows="1"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
                style={{
                  padding: "0.625rem",
                  background: "#9eb8c9",
                  border: "none",
                  borderRadius: "50%",
                  cursor:
                    inputMessage.trim() && !isSending
                      ? "pointer"
                      : "not-allowed",
                  opacity: !inputMessage.trim() || isSending ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                {isSending ? (
                  <Loader2
                    size={20}
                    style={{
                      color: "#374151",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <Send size={20} style={{ color: "#374151" }} />
                )}
              </button>
            </div>
          </>
        )}
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
