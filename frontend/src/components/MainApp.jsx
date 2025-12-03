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
  X,
  Eye,
  MessageSquare,
  Sparkles,
  Mic,
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
  const [previewFile, setPreviewFile] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

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
      setPreviewFile(null);
    }
  };

  const suggestedPrompts = [
    "Summarize the key points",
    "What are the main topics?",
    "Explain this in simple terms",
    "Find specific information",
    "Compare sections",
    "Extract data points",
    "Generate insights",
    "Create a summary",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1d2e",
        display: "flex",
        position: "relative",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "3.5rem",
          background: "#13151f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "1rem 0",
          gap: "1.5rem",
          borderRight: "1px solid #2a2d3a",
        }}
      >
        <div
          style={{
            width: "2rem",
            height: "2rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Sparkles size={18} style={{ color: "#ffffff" }} />
        </div>

        <button
          onClick={() => setShowSidebar(!showSidebar)}
          style={{
            width: "2rem",
            height: "2rem",
            background: "#d97706",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MessageSquare size={18} style={{ color: "#ffffff" }} />
        </button>

        <Bell
          size={20}
          style={{ color: "#6b7280", cursor: "pointer", marginTop: "0.5rem" }}
        />
        <FileText size={20} style={{ color: "#6b7280", cursor: "pointer" }} />
        <Upload size={20} style={{ color: "#6b7280", cursor: "pointer" }} />
        <Settings size={20} style={{ color: "#6b7280", cursor: "pointer" }} />

        <div style={{ flex: 1 }}></div>

        <User
          size={24}
          style={{
            color: "#6b7280",
            cursor: "pointer",
            padding: "0.25rem",
            borderRadius: "50%",
            border: "2px solid #6b7280",
          }}
        />
      </div>

      {/* Chat History Sidebar */}
      {showSidebar && (
        <div
          style={{
            width: "16rem",
            background: "#13151f",
            borderRight: "1px solid #2a2d3a",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              color: "#9ca3af",
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Chat History
          </h3>
          {uploadedFiles.length > 0 && (
            <div
              style={{
                background: "#1a1d2e",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                marginBottom: "0.5rem",
                cursor: "pointer",
              }}
            >
              <p
                style={{
                  color: "#e5e7eb",
                  fontSize: "0.875rem",
                  margin: 0,
                }}
              >
                Current Session
              </p>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "0.75rem",
                  margin: "0.25rem 0 0 0",
                }}
              >
                {uploadedFiles.length} document(s)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!documentAnalyzed ? (
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
                textAlign: "center",
                marginBottom: "3rem",
              }}
            >
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 400,
                  color: "#e5e7eb",
                  margin: "0 0 1rem 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "2rem" }}>✨</span>
                Document Intelligence
              </h1>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "1.125rem",
                  margin: 0,
                }}
              >
                Upload your documents and start asking questions
              </p>
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: "45rem",
              }}
            >
              {uploadError && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem 1rem",
                    background: "#7f1d1d",
                    border: "1px solid #991b1b",
                    borderRadius: "0.75rem",
                    color: "#fecaca",
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
                  background: "#232530",
                  borderRadius: "1.5rem",
                  padding: "1.5rem",
                  border: "1px solid #2a2d3a",
                }}
              >
                <div
                  style={{
                    border: "2px dashed #4b5563",
                    borderRadius: "1rem",
                    padding: "3rem",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#1a1d2e",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#6b7280";
                    e.currentTarget.style.background = "#1f2232";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#4b5563";
                    e.currentTarget.style.background = "#1a1d2e";
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
                            color: "#9ca3af",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        <p
                          style={{
                            color: "#e5e7eb",
                            fontWeight: 500,
                            marginBottom: "0.5rem",
                            fontSize: "1.125rem",
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
                            color: "#6b7280",
                          }}
                        />
                        <p
                          style={{
                            color: "#e5e7eb",
                            fontWeight: 500,
                            marginBottom: "0.5rem",
                            fontSize: "1.125rem",
                          }}
                        >
                          Drop files here or click to upload
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          Supports PDF, DOC, DOCX, TXT • Multiple files allowed
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: "1.5rem" }}>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#9ca3af",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Uploaded files:
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      {uploadedFiles.map((fileName, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "0.75rem 1rem",
                            background: "#1a1d2e",
                            color: "#e5e7eb",
                            fontSize: "0.875rem",
                            borderRadius: "0.5rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: "1px solid #2a2d3a",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <FileText size={16} style={{ color: "#9ca3af" }} />
                            {fileName}
                          </div>
                          <button
                            onClick={() => setPreviewFile(fileName)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "0.25rem",
                            }}
                          >
                            <Eye size={16} style={{ color: "#6b7280" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              maxWidth: "50rem",
              margin: "0 auto",
              width: "100%",
              padding: "2rem 1rem",
            }}
          >
            {uploadedFiles.length > 0 && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "#232530",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                  border: "1px solid #2a2d3a",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <CheckCircle2 size={18} style={{ color: "#10b981" }} />
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#9ca3af",
                    }}
                  >
                    Active documents:
                  </span>
                  {uploadedFiles.map((fileName, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "0.25rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "#1a1d2e",
                          color: "#e5e7eb",
                          fontSize: "0.75rem",
                          borderRadius: "9999px",
                          border: "1px solid #2a2d3a",
                        }}
                      >
                        {fileName}
                      </span>
                      <button
                        onClick={() => setPreviewFile(fileName)}
                        style={{
                          background: "#1a1d2e",
                          border: "1px solid #2a2d3a",
                          borderRadius: "9999px",
                          padding: "0.25rem 0.5rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Eye size={14} style={{ color: "#6b7280" }} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={clearChat}
                  style={{
                    fontSize: "0.875rem",
                    color: "#ef4444",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Trash2 size={16} />
                  Clear
                </button>
              </div>
            )}

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    paddingTop: "2rem",
                  }}
                >
                  <h2
                    style={{
                      color: "#e5e7eb",
                      fontSize: "1.5rem",
                      fontWeight: 400,
                      marginBottom: "2rem",
                    }}
                  >
                    What would you like to know?
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(10rem, 1fr))",
                      gap: "0.75rem",
                      maxWidth: "40rem",
                      margin: "0 auto",
                    }}
                  >
                    {suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputMessage(prompt)}
                        style={{
                          padding: "0.75rem 1rem",
                          background: "#232530",
                          border: "1px solid #2a2d3a",
                          borderRadius: "0.75rem",
                          color: "#9ca3af",
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#2a2d3a";
                          e.currentTarget.style.color = "#e5e7eb";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#232530";
                          e.currentTarget.style.color = "#9ca3af";
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
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
                      maxWidth: "75%",
                      padding: "1rem 1.25rem",
                      borderRadius: "1.25rem",
                      background:
                        msg.type === "user"
                          ? "#2563eb"
                          : msg.error
                          ? "#7f1d1d"
                          : "#232530",
                      color: "#e5e7eb",
                      fontSize: "0.9375rem",
                      lineHeight: 1.6,
                      border:
                        msg.type === "user" ? "none" : "1px solid #2a2d3a",
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
                      padding: "1rem 1.25rem",
                      borderRadius: "1.25rem",
                      background: "#232530",
                      border: "1px solid #2a2d3a",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.375rem" }}>
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
                background: "#232530",
                borderRadius: "1.5rem",
                padding: "0.75rem 1rem",
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                border: "1px solid #2a2d3a",
              }}
            >
              <button
                style={{
                  padding: "0.5rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Upload size={20} style={{ color: "#6b7280" }} />
              </button>
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AI..."
                style={{
                  flex: 1,
                  padding: "0.5rem 0",
                  border: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  fontSize: "0.9375rem",
                  background: "transparent",
                  color: "#e5e7eb",
                }}
                disabled={isSending}
              />
              <button
                style={{
                  padding: "0.5rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mic size={20} style={{ color: "#6b7280" }} />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#d97706",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.75rem",
                  cursor:
                    inputMessage.trim() && !isSending
                      ? "pointer"
                      : "not-allowed",
                  opacity: !inputMessage.trim() || isSending ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {isSending ? (
                  <Loader2
                    size={18}
                    style={{
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setPreviewFile(null)}
        >
          <div
            style={{
              background: "#1a1d2e",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "50rem",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              border: "1px solid #2a2d3a",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  color: "#e5e7eb",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {previewFile}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                <X size={24} style={{ color: "#6b7280" }} />
              </button>
            </div>
            <div
              style={{
                background: "#232530",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                color: "#9ca3af",
                minHeight: "20rem",
                border: "1px solid #2a2d3a",
              }}
            >
              <p style={{ margin: 0 }}>
                Document preview is not available. The content has been uploaded
                and analyzed successfully.
              </p>
            </div>
          </div>
        </div>
      )}

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
