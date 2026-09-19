import React, { useState } from "react";
import { Cpu, Send, Code, ShieldCheck, Database, Table, HelpCircle, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";
import { NLAnalyticsResponse } from "../types";
import { queryNLAnalyticsApi } from "../api";

interface MessageItem {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  analyticsResult?: NLAnalyticsResponse;
}

export const NLAnalyticsChat: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "initial-1",
      sender: "ai",
      text: "Hello! I am your AI Analytics Assistant. You can ask me questions about resource inventory, organizations, transfer trends, category demands, or success rates. Every answer is verified against the relational database via validated SQL.",
      timestamp: "Just now",
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSqlIds, setExpandedSqlIds] = useState<Record<string, boolean>>({});

  const sampleQuestions = [
    "How many resources were transferred this month?",
    "Which category has the highest number of resources?",
    "How many organizations participated?",
    "What is the total number of successful transfers?",
    "Which resource category is most requested?",
    "What is the success rate?",
    "How many requests are still pending?",
    "Which organization has contributed the most resources?",
    "Show transfer trends for the last 6 months."
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: MessageItem[] = [
      ...messages,
      {
        id: userMsgId,
        sender: "user",
        text: q,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    ];
    setMessages(newMessages);
    setInputQuery("");
    setIsLoading(true);

    try {
      const result = await queryNLAnalyticsApi(q);
      const aiMsgId = `ai-${Date.now()}`;
      setMessages([
        ...newMessages,
        {
          id: aiMsgId,
          sender: "ai",
          text: result.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          analyticsResult: result
        }
      ]);
      // Auto expand SQL for quick transparency
      setExpandedSqlIds(prev => ({ ...prev, [aiMsgId]: true }));
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `Query error: ${err.message || "Unable to process question against database."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSqlView = (id: string) => {
    setExpandedSqlIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Natural-Language Analytics Assistant
              </h2>
            </div>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Ask operational and statistical questions in plain English. The AI converts your question to ANSI SQL, verifies safety rules, executes the query against MySQL, and explains real data rows without hallucination.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg text-stone-600 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Read-Only SQL Whitelist Active</span>
          </div>
        </div>
      </div>

      {/* Suggested Questions Grid */}
      <div className="bg-stone-50/70 border border-stone-200 rounded-xl p-4">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-stone-700 mb-2.5">
          <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
          <span>Suggested Questions (Click to execute instantly):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sq)}
              className="text-xs bg-white hover:bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200 transition text-left cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col min-h-[480px]">
        <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const res = msg.analyticsResult;
            const isExpanded = expandedSqlIds[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-stone-100 text-stone-900 rounded-tl-none border border-stone-200/80"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      isUser ? "text-blue-200 text-right" : "text-stone-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* If AI has SQL Analytics transparency metadata */}
                {res && (
                  <div className="max-w-2xl w-full mt-2">
                    <button
                      onClick={() => toggleSqlView(msg.id)}
                      className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition bg-indigo-50/70 border border-indigo-200 px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>{isExpanded ? "Hide SQL & Database Transparency" : "View Executed SQL & Raw Data"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-4 bg-stone-900 text-stone-100 rounded-xl space-y-3 font-mono text-xs border border-stone-800 shadow-inner">
                        {/* Safety & Execution Metrics */}
                        <div className="flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-800 pb-2">
                          <div className="flex items-center space-x-1.5 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Security Check: SELECT ONLY Whitelisted</span>
                          </div>
                          <span>Execution: {res.executionTimeMs}ms • {res.rowCount} row(s)</span>
                        </div>

                        {/* Generated SQL */}
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                            Validated SQL Statement:
                          </span>
                          <p className="text-blue-300 bg-stone-950 p-2.5 rounded border border-stone-800 break-all select-all">
                            {res.validatedSQL}
                          </p>
                        </div>

                        {/* Database Result Rows */}
                        {res.data && res.data.length > 0 && (
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                              Database Rows Returned:
                            </span>
                            <div className="overflow-x-auto bg-stone-950 rounded border border-stone-800 max-h-48">
                              <table className="w-full text-left text-[11px]">
                                <thead className="bg-stone-900 text-stone-300 border-b border-stone-800">
                                  <tr>
                                    {Object.keys(res.data[0]).map((col) => (
                                      <th key={col} className="p-2 font-semibold">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-800 text-stone-300">
                                  {res.data.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-stone-900/50">
                                      {Object.values(row).map((val: any, cIdx) => (
                                        <td key={cIdx} className="p-2">
                                          {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-stone-100 rounded-2xl rounded-tl-none px-4 py-3 border border-stone-200 flex items-center space-x-2 text-xs text-stone-600">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Translating question to SQL and querying database...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question (e.g., 'What is the success rate?', 'Which category has the highest number of resources?')..."
              className="flex-1 bg-white border border-stone-300 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
