import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Loader2, Sparkles, X, Send } from "lucide-react";
import React, { useState, useEffect, useRef, FormEvent } from "react";

type Message = {
    role: 'user' | 'model';
    text: string;
};

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize or clean up chat session when chatbot is opened/closed
    useEffect(() => {
        if (isOpen) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are a friendly and helpful text-based assistant for the StarLight video platform. Keep your answers concise and relevant to a video platform user.',
                },
            });
            setMessages([{ role: 'model', text: 'Hello! How can I help you with StarLight today?' }]);
        } else {
            // Cleanup on close
            chatRef.current = null;
            setMessages([]);
            setInput('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const streamResponse = await chatRef.current.sendMessageStream({ message: userMessage.text });
            
            // Add a new empty model message to stream into
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of streamResponse) {
                const c = chunk as GenerateContentResponse;
                const chunkText = c.text;
                if (chunkText) {
                    setMessages(prev => {
                        const lastMessage = prev[prev.length - 1];
                        // Ensure we are only updating the last message if it's a model's message
                        if (lastMessage.role === 'model') {
                            const updatedMessage = { ...lastMessage, text: lastMessage.text + chunkText };
                            return [...prev.slice(0, -1), updatedMessage];
                        }
                        return prev;
                    });
                }
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isOpen ? 'w-full max-w-sm h-[32rem]' : 'w-14 h-14'}`}>
            {isOpen ? (
                <div className="w-full h-full flex flex-col bg-[var(--background-secondary)] rounded-2xl shadow-2xl border border-[var(--border-primary)] animate-in fade-in zoom-in-95">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-[var(--border-primary)] flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        </div>
                        <h3 className="font-bold">Starlight Assistant</h3>
                      </div>
                      <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                             <div key={index} className={`flex gap-3 text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-[hsl(var(--accent-color))] text-white rounded-br-none' : 'bg-[var(--background-tertiary)] rounded-bl-none'}`}>
                                    {msg.text}
                                    {isLoading && msg.role === 'model' && index === messages.length - 1 && (
                                        <span className="inline-block w-1.5 h-4 bg-black dark:bg-white ml-1 animate-pulse"></span>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <div className="flex-shrink-0 p-3 border-t border-[var(--border-primary)]">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything..."
                                disabled={isLoading}
                                className="w-full p-2.5 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="p-3 bg-[hsl(var(--accent-color))] text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-[hsl(var(--accent-color))] rounded-full flex items-center justify-center text-white shadow-lg animate-glow hover:scale-105 transition-transform">
                    <Sparkles className="w-7 h-7" />
                </button>
            )}
        </div>
    );
};
