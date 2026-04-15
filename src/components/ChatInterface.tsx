import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Shield, Zap, Cpu, Info, Key } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from './Message';
import { sendMessageStream } from '@/src/services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'SYSTEM_BOOT: REHAN_BHAI_v1.0 initialized.\n\nBol bhai, kya kaam hai? Main tera unfiltered AI assistant hoon. Kuch bhi puch, main sab handle kar loonga.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('REHAN_BHAI_API_KEY') || '');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('REHAN_BHAI_API_KEY', apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const newMessages = [...messages, userMessage];
    let assistantContent = '';

    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
      const stream = sendMessageStream(newMessages, apiKey);
      for await (const chunk of stream) {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'model') {
            return [...prev.slice(0, -1), { ...last, content: assistantContent }];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          const errorMsg = 'ERROR: Quota Exceeded (429). Bhai, Google ne limit laga di hai. Maine model switch kar diya hai (Flash mode), ab try kar. Agar phir bhi na chale toh thodi der baad aana.';
          if (last.role === 'model' && last.content === '') {
            return [...prev.slice(0, -1), { ...last, content: errorMsg }];
          }
          return [...prev, { role: 'model', content: errorMsg }];
        });
      } else {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          const errorMsg = 'ERROR: Connection lost. System breach detected. Try again.';
          if (last.role === 'model' && last.content === '') {
            return [...prev.slice(0, -1), { ...last, content: errorMsg }];
          }
          return [...prev, { role: 'model', content: errorMsg }];
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background font-mono selection:bg-primary/30 selection:text-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Terminal className="h-6 w-6 text-primary animate-pulse" />
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tighter uppercase">REHAN_BHAI_AI</h1>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-primary rounded-full" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Status: ONLINE // ENCRYPTED</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
              <Shield className="h-3 w-3 text-primary" />
              <span>Firewall: ACTIVE</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
              <Zap className="h-3 w-3 text-primary" />
              <span>Uptime: 99.9%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
              <Cpu className="h-3 w-3 text-primary" />
              <span>Core: GEMINI-3.1-PRO</span>
            </div>
          </div>

          <Popover>
            <PopoverTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 rounded-full hover:bg-primary/10")}>
              <Info className="h-4 w-4 text-primary" />
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-card border-border shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Key className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">API Configuration</h4>
                </div>
                <div className="space-y-4 text-[11px] leading-relaxed text-muted-foreground">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                      <Key className="h-3 w-3 text-primary" />
                      Your Gemini API Key
                    </label>
                    <Input 
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Paste your API key here..."
                      className="h-8 bg-black/50 border-border text-xs focus-visible:ring-primary/50"
                    />
                    <p className="text-[9px] italic">
                      Bhai, ye key tere browser mein save rahegi. Agar key nahi hai toh default use hogi (agar set hai).
                    </p>
                  </div>

                  <div className="bg-black/50 p-3 rounded border border-border space-y-2">
                    <p className="font-bold text-foreground">Kaha se milegi?</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li><a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary hover:underline">Google AI Studio</a> par jao.</li>
                      <li>Nayi API key generate karo.</li>
                      <li>Waha se copy karke yaha paste kar do.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="max-w-4xl mx-auto pb-32">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Message role={msg.role} content={msg.content} />
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && messages[messages.length - 1].content === '' && (
            <div className="flex gap-4 py-6 px-6 bg-muted/30 border-y border-border/50">
              <div className="h-8 w-8 rounded-sm bg-primary flex items-center justify-center">
                <Terminal className="h-4 w-4 text-primary-foreground animate-pulse" />
              </div>
              <div className="flex items-center gap-1">
                <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-1 w-1 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/20 rounded-lg blur opacity-30 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex items-center bg-card border border-border rounded-lg overflow-hidden shadow-2xl">
              <div className="pl-4 text-primary">
                <Terminal className="h-4 w-4" />
              </div>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Enter command or message..."
                className="flex-1 border-none bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50 h-14 font-mono text-sm"
              />
              <div className="pr-2">
                <Button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-10 w-10 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-center text-muted-foreground uppercase tracking-[0.2em]">
            Secure Channel // End-to-End Encrypted // REHAN_BHAI Protocol
          </p>
        </div>
      </div>
    </div>
  );
};
