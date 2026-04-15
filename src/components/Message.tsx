import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import { User, Bot, Terminal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MessageProps {
  role: 'user' | 'model';
  content: string;
}

export const Message: React.FC<MessageProps> = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <div className={cn(
      "flex w-full gap-4 py-6 px-4 md:px-6 transition-colors",
      isUser ? "bg-transparent" : "bg-muted/30 border-y border-border/50"
    )}>
      <Avatar className={cn(
        "h-8 w-8 rounded-sm border",
        isUser ? "bg-primary/10 border-primary/20" : "bg-primary border-primary"
      )}>
        <AvatarFallback className="rounded-sm bg-transparent">
          {isUser ? <User className="h-4 w-4 text-primary" /> : <Terminal className="h-4 w-4 text-primary-foreground" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {isUser ? "USER_ID_01" : "REHAN_BHAI_v1.0"}
          </span>
        </div>
        
        <div className="prose prose-invert max-w-none break-words font-sans text-sm leading-relaxed">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                
                const copyToClipboard = () => {
                  navigator.clipboard.writeText(codeString);
                };

                return !inline ? (
                  <div className="relative group my-4">
                    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-muted border border-border rounded text-[10px] font-mono text-muted-foreground uppercase tracking-tighter z-10 flex items-center gap-2">
                      <span>{match ? match[1] : 'code'}</span>
                      <button 
                        onClick={copyToClipboard}
                        className="hover:text-primary transition-colors ml-2 border-l border-border pl-2 flex items-center gap-1"
                        title="Copy Code"
                      >
                        <Terminal className="h-2.5 w-2.5" />
                        <span>COPY</span>
                      </button>
                    </div>
                    <pre className={cn(
                      "overflow-x-auto rounded-lg border border-border bg-black/50 p-4 font-mono text-xs leading-normal",
                      className
                    )}>
                      <code {...props}>{children}</code>
                    </pre>
                  </div>
                ) : (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-xs" {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <div className="mb-4 last:mb-0">{children}</div>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-foreground/90">{children}</li>,
              h1: ({ children }) => <h1 className="text-xl font-bold mb-4 text-primary">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold mb-3 text-primary/90">{children}</h2>,
              h3: ({ children }) => <h3 className="text-md font-bold mb-2 text-primary/80">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
