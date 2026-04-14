'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [notes, setNotes] = useState('');
  const [plan, setPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const generatePlan = async () => {
    setIsLoading(true);
    setIsDone(false);
    setPlan('');
    setCopied(false);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error('Failed to generate plan');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setPlan((prev) => prev + chunk);
      }

      setIsDone(true);
    } catch (err) {
      console.error(err);
      setPlan('Error generating plan. Check your ANTHROPIC_API_KEY in .env.local.');
      setIsDone(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPlan = async () => {
    await navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-14">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-500 font-bold text-xs tracking-widest uppercase">Affluo</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-600 text-xs tracking-widest uppercase">Task OS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Daily Execution Planner</h1>
          <p className="text-zinc-500 text-sm mt-1">{today}</p>
        </div>

        {/* Input form */}
        <div className="mb-8">
          <label className="block text-zinc-500 text-xs font-medium mb-2 uppercase tracking-widest">
            Context for today <span className="text-zinc-700 normal-case font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Exam tomorrow, meeting with a client, low energy, specific focus area..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-700 text-sm resize-none focus:outline-none focus:border-zinc-600 transition-colors leading-relaxed"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) generatePlan();
            }}
          />
          <button
            onClick={generatePlan}
            disabled={isLoading}
            className="mt-3 w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-colors text-sm uppercase tracking-widest"
          >
            {isLoading ? 'Generating...' : 'Generate Plan'}
          </button>
          <p className="text-zinc-700 text-xs mt-2 text-center">⌘ + Enter to generate</p>
        </div>

        {/* Plan output */}
        {(plan || isLoading) && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-8 py-8">
              {isLoading && !plan && (
                <div className="flex items-center gap-2 text-zinc-600 text-sm">
                  <span className="animate-pulse">Building your plan</span>
                  <span className="animate-pulse delay-75">.</span>
                  <span className="animate-pulse delay-150">.</span>
                  <span className="animate-pulse delay-300">.</span>
                </div>
              )}

              {plan && (
                <div className="plan-content">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-white mb-6 pb-4 border-b border-zinc-800 leading-tight">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-orange-500 font-semibold text-xs uppercase tracking-widest mt-8 mb-3 first:mt-0">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-white font-semibold text-sm mt-4 mb-2">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-zinc-300 text-sm leading-relaxed mb-3">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-2 mb-4">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-zinc-300 text-sm flex gap-2.5 leading-relaxed">
                          <span className="text-orange-500 flex-shrink-0 mt-0.5">→</span>
                          <span>{children}</span>
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-white font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="text-zinc-400 not-italic">{children}</em>
                      ),
                      hr: () => (
                        <hr className="border-zinc-800 my-6" />
                      ),
                      code: ({ children }) => (
                        <code className="text-orange-400 bg-zinc-900 px-1.5 py-0.5 rounded text-xs font-mono">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {plan}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {isDone && plan && (
              <div className="px-8 py-4 border-t border-zinc-800 flex items-center gap-4">
                <button
                  onClick={copyPlan}
                  className="text-zinc-600 hover:text-white text-xs uppercase tracking-widest transition-colors"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <span className="text-zinc-800">·</span>
                <button
                  onClick={generatePlan}
                  className="text-zinc-600 hover:text-orange-500 text-xs uppercase tracking-widest transition-colors"
                >
                  Regenerate
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-zinc-800 text-xs">Affluo Task OS — built for execution</p>
        </div>
      </div>
    </main>
  );
}
