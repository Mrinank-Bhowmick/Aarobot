// ChatbotWindow.tsx
import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function ChatbotWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    // Simulate API call
    const res = await fetch("https://dummyjson.com/products/1");
    const data = await res.json();
    const botMessage: Message = {
      role: "bot",
      content: `Bot says: ${data.title}`,
    };
    setMessages((msgs) => [...msgs, botMessage]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <Card className="flex flex-col h-full w-full max-w-2xl mx-auto p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-lg">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded px-3 py-2 max-w-xs text-sm ${
                msg.role === "user"
                  ? "bg-neutral-200 dark:bg-neutral-800 text-right"
                  : "bg-blue-100 dark:bg-blue-900"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </Card>
  );
}
