"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, EmptyState, SectionHeader, TextField } from "@/app/components/ui";

export default function DajjalAIChat({ session, language = "id" }) {
  const id = language === "id";
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadConversation = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/dajjalai-chat", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to load chat.");
      setConversationId(data.conversation?.id || null);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message || "Unable to load chat.");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { loadConversation(); }, [loadConversation]);

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending || !session?.access_token) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/dajjalai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: text, conversationId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "Chat request failed.");
      setConversationId(data.conversation.id);
      setMessages((current) => [
        ...current,
        { id: `user-${Date.now()}`, role: "user", content: text },
        data.message,
      ]);
      setDraft("");
    } catch (err) {
      setError(err.message || "Chat request failed.");
    } finally {
      setSending(false);
    }
  }

  function startNewChat() {
    if (sending) return;
    setConversationId(null);
    setMessages([]);
    setDraft("");
    setError("");
  }

  return (
    <Card className="ui-stack">
      <SectionHeader
        title={id ? "Chat dengan DAJJAL AI" : "Chat with DAJJAL AI"}
        description={id
          ? "Percakapan nyata yang mengambil memori privat dari Memory Core sebelum AI menjawab."
          : "A real conversation that retrieves private Memory Core context before generating an answer."}
        actions={<Button size="sm" variant="secondary" onClick={startNewChat} disabled={sending}>
          {id ? "Percakapan Baru" : "New Chat"}
        </Button>}
      />
      <div className="ui-cluster">
        <Badge variant="success">Gemini</Badge>
        <Badge>{id ? "Memory Core aktif" : "Memory Core connected"}</Badge>
        <Badge>{id ? "Admin only" : "Admin only"}</Badge>
      </div>

      <div className="ui-stack" aria-live="polite">
        {loading ? <p className="ui-caption">{id ? "Memuat percakapan…" : "Loading conversation…"}</p> : null}
        {!loading && messages.length === 0 ? (
          <EmptyState
            title={id ? "Mulai percakapan pertama" : "Start your first conversation"}
            description={id
              ? "Coba tanyakan identitas DAJJAL AI, fondasi proyek, atau keputusan yang sudah tersimpan."
              : "Ask about DAJJAL AI identity, project foundations, or previously stored decisions."}
          />
        ) : null}
        {messages.map((item) => (
          <Card key={item.id} className="ui-stack">
            <div className="ui-cluster">
              <Badge variant={item.role === "assistant" ? "success" : "neutral"}>
                {item.role === "assistant" ? "DAJJAL AI" : (id ? "Kamu" : "You")}
              </Badge>
              {item.role === "assistant" && item.retrieved_memories?.length ? (
                <Badge>{item.retrieved_memories.length} {id ? "memori digunakan" : "memories used"}</Badge>
              ) : null}
              {item.model ? <span className="ui-caption">{item.model}</span> : null}
            </div>
            <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: 0 }}>{item.content}</p>
            {item.role === "assistant" && item.retrieved_memories?.length ? (
              <details>
                <summary className="ui-caption">{id ? "Lihat memori yang digunakan" : "View retrieved memories"}</summary>
                <ul className="ui-list">
                  {item.retrieved_memories.map((memory, index) => (
                    <li key={memory.id || memory.slug || index}>
                      <strong>{memory.title}</strong>
                      <span className="ui-caption"> · {Math.round((memory.similarity || 0) * 100)}% · {memory.memory_type}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </Card>
        ))}
      </div>

      {error ? <p className="ui-field-error" role="alert">{error}</p> : null}
      <form className="ui-stack" onSubmit={sendMessage}>
        <TextField
          as="textarea"
          label={id ? "Pesan" : "Message"}
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={id ? "Tulis pesan untuk DAJJAL AI…" : "Write a message to DAJJAL AI…"}
          maxLength={4000}
          disabled={sending || loading}
          required
        />
        <div className="ui-cluster" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <span className="ui-caption">{draft.length}/4000</span>
          <Button type="submit" loading={sending} disabled={loading || !draft.trim() || !session?.access_token}>
            {sending ? (id ? "DAJJAL AI sedang berpikir…" : "DAJJAL AI is thinking…") : (id ? "Kirim Pesan" : "Send Message")}
          </Button>
        </div>
      </form>
      <p className="ui-caption">
        {id
          ? "Riwayat chat disimpan privat untuk akun admin. Chat tidak otomatis menjadi memori permanen."
          : "Chat history is stored privately for the admin account. Conversations are not automatically promoted to permanent memory."}
      </p>
    </Card>
  );
}
