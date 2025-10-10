import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Search,
  Trash2,
  Download,
  LogOut,
  Eye,
  Plus,
  X,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const MainApp = () => {
  const [user, setUser] = useState({
    username: "Tester",
    email: "test@demo.com",
  });
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes/`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/msword",
      ];
      if (
        validTypes.includes(selectedFile.type) ||
        selectedFile.name.match(/\.(pdf|docx|doc|txt)$/i)
      ) {
        setFile(selectedFile);
      } else {
        alert("Please upload a PDF, DOC, DOCX, or TXT file");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSummary("");
    setError("");

    try {
      const formData = new FormData();
      if (activeTab === "upload" && file) {
        formData.append("file", file);
      } else if (activeTab === "text" && textInput.trim()) {
        formData.append("text", textInput);
      } else {
        setError("Please provide content to summarize");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/summarize/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        fetchNotes();
        setFile(null);
        setTextInput("");
        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.value = "";
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Summarization failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`${API_URL}/api/notes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchNotes();
        setSelectedNote(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[100vh] bg-gradient-to-br from-[#eff6ff] via-[#eef2ff] to-[#f5f3ff]">
      {/* Navigation */}
      <nav className="bg-[#ffffff] shadow-[0_4px_12px_rgba(0,0,0,0.05)] px-[24px] py-[16px] sticky top-0 z-[50]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-[12px]">
            <div className="p-[8px] bg-[#e0e7ff] rounded-[8px]">
              <FileText size={24} className="text-[#4f46e5]" />
            </div>
            <div>
              <h1 className="text-[20px] font-[700] text-[#1f2937]">
                Doc Summarizer
              </h1>
              <p className="text-[12px] text-[#6b7280]">AI-Powered Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-[16px]">
            <div className="text-right hidden md:block">
              <p className="text-[14px] font-[500] text-[#1f2937]">
                {user?.username || "User"}
              </p>
              <p className="text-[12px] text-[#6b7280]">{user?.email}</p>
            </div>
            <button
              //     onClick={handleLogout}
              className="flex items-center gap-[8px] px-[16px] py-[8px] bg-[#ef4444] text-[#ffffff] rounded-[8px] hover:bg-[#dc2626] transition shadow-[0_2px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto p-[16px] md:p-[24px]">
        <div className="grid lg:grid-cols-2 gap-[24px]">
          {/* Upload Section */}
          <div className="bg-[#ffffff] rounded-[16px] shadow-[0_6px_16px_rgba(0,0,0,0.08)] p-[24px] h-fit">
            <h2 className="text-[24px] font-[700] text-[#1f2937] mb-[16px] flex items-center gap-[8px]">
              <Plus size={24} className="text-[#4f46e5]" />
              Summarize Content
            </h2>

            <div className="flex gap-[8px] mb-[24px]">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-[12px] rounded-[8px] font-[500] transition ${
                  activeTab === "upload"
                    ? "bg-[#4f46e5] text-[#ffffff] shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                    : "bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]"
                }`}
              >
                <Upload className="inline mr-[8px]" size={18} />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab("text")}
                className={`flex-1 py-[12px] rounded-[8px] font-[500] transition ${
                  activeTab === "text"
                    ? "bg-[#4f46e5] text-[#ffffff] shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                    : "bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]"
                }`}
              >
                <FileText className="inline mr-[8px]" size={18} />
                Paste Text
              </button>
            </div>

            {error && (
              <div className="mb-[16px] p-[12px] bg-[#fef2f2] border border-[#fecaca] rounded-[8px] text-[#dc2626] text-[14px]">
                {error}
              </div>
            )}

            <div>
              {activeTab === "upload" ? (
                <div className="border-[2px] border-dashed border-[#d1d5db] rounded-[12px] p-[48px] text-center hover:border-[#818cf8] transition cursor-pointer bg-[#f9fafb]">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt,.pdf,.doc,.docx"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload
                      className="mx-auto mb-[16px] text-[#9ca3af]"
                      size={48}
                    />
                    <p className="text-[#374151] font-[500] mb-[8px]">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-[14px] text-[#6b7280]">
                      Supports: PDF, DOC, DOCX, TXT (Max 10MB)
                    </p>
                  </label>
                </div>
              ) : (
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your document text here for instant summarization..."
                  className="w-[97%] h-[256px] px-[16px] py-[12px] border border-[#d1d5db] rounded-[12px] focus:ring-[2px] focus:ring-[#4f46e5] focus:border-transparent outline-none resize-none"
                />
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || (!file && !textInput.trim())}
                className="w-full mt-[16px] bg-[#4f46e5] text-[#ffffff] py-[12px] rounded-[12px] font-[500] hover:bg-[#4338ca] transition disabled:opacity-[0.5] disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-[8px]">
                    <div className="w-[20px] h-[20px] border-[2px] border-[#ffffff] border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </span>
                ) : (
                  "Generate Summary"
                )}
              </button>
            </div>

            {summary && (
              <div className="mt-[24px] p-[16px] bg-gradient-to-r from-[#ecfdf5] to-[#d1fae5] border border-[#bbf7d0] rounded-[12px]">
                <div className="flex items-center justify-between mb-[8px]">
                  <h3 className="font-[700] text-[#065f46] flex items-center gap-[8px]">
                    <Eye size={20} />
                    Summary Generated!
                  </h3>
                  <button
                    onClick={() => setSummary("")}
                    className="text-[#6b7280] hover:text-[#374151]"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-[#374151] leading-[1.6]">{summary}</p>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="bg-[#ffffff] rounded-[16px] shadow-[0_6px_16px_rgba(0,0,0,0.08)] p-[24px]">
            <h2 className="text-[24px] font-[700] text-[#1f2937] mb-[16px] flex items-center justify-between">
              <span className="flex items-center gap-[8px]">
                <FileText size={24} className="text-[#4f46e5]" />
                My Notes ({notes.length})
              </span>
            </h2>

            <div className="relative mb-[16px]">
              <Search
                className="absolute left-[12px] top-[50%] translate-y-[-50%] text-[#9ca3af]"
                size={20}
              />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-[40px] pr-[16px] py-[12px] border border-[#d1d5db] rounded-[12px] focus:ring-[2px] focus:ring-[#4f46e5] focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-[12px] max-h-[600px] overflow-y-auto pr-[8px]">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-[64px]">
                  <FileText
                    size={64}
                    className="mx-auto text-[#d1d5db] mb-[16px]"
                  />
                  <p className="text-[#9ca3af] text-[18px]">No notes yet</p>
                  <p className="text-[#9ca3af] text-[14px]">
                    Start summarizing documents to create your first note!
                  </p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border border-[#e5e7eb] rounded-[12px] p-[16px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition cursor-pointer bg-gradient-to-r from-[#ffffff] to-[#f9fafb]"
                    onClick={() =>
                      setSelectedNote(
                        selectedNote?.id === note.id ? null : note
                      )
                    }
                  >
                    <div className="flex justify-between items-start mb-[8px]">
                      <h3 className="font-[600] text-[#1f2937] flex-1 pr-[8px]">
                        {note.title || "Untitled Note"}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                        className="text-[#ef4444] hover:text-[#b91c1c] p-[4px] hover:bg-[#fef2f2] rounded-[4px]"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p
                      className={`text-[#4b5563] text-[14px] ${
                        selectedNote?.id === note.id ? "" : "line-clamp-3"
                      }`}
                    >
                      {note.summary}
                    </p>

                    {note.tags && note.tags.length > 0 && (
                      <div className="mt-[12px] flex gap-[8px] flex-wrap">
                        {note.tags.map(
                          (tag, i) =>
                            tag && (
                              <span
                                key={i}
                                className="px-[8px] py-[4px] bg-[#e0e7ff] text-[#3730a3] text-[12px] rounded-[9999px] font-[500]"
                              >
                                {tag}
                              </span>
                            )
                        )}
                      </div>
                    )}

                    <div className="mt-[12px] flex items-center justify-between text-[12px] text-[#9ca3af]">
                      <span>
                        {new Date(note.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-[#4f46e5] font-[500]">
                        {selectedNote?.id === note.id
                          ? "Click to collapse"
                          : "Click to expand"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainApp;
