'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DecisionRecord } from '@/contexts/decisions-context';
import { Sparkles, Send, User, Bot, Loader2, Zap, HelpCircle, Brain } from 'lucide-react';
import { askCopilot } from '@/lib/api/copilot-api';

interface Props {
  decision: DecisionRecord | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structured?: { answer: string; reason: string; impact: string };
  timestamp: number;
}

const QUICK_PROMPTS = [
  { label: 'Why this decision?',       template: 'Why this decision?' },
  { label: 'What if delay +12h?',      template: 'What if we delay arrival by 12 hours?' },
  { label: 'Cheapest safe option?',    template: 'What is the cheapest safe option?' },
  { label: 'Compare all options',      template: 'Compare all alternatives side by side.' },
  { label: 'Reduce throughput?',       template: 'What if we reduce refinery throughput instead?' },
];

export function AICopilotPanel({ decision }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset chat when decision changes, plant context message
  useEffect(() => {
    if (!decision) {
      setMessages([]);
      setConversationId(null);
      return;
    }
    setMessages([
      {
        id: `ctx-${decision.id}`,
        role: 'assistant',
        content: `I'm NEMO Copilot. I have full context on "${decision.title}" with confidence ${decision.confidence}%. Ask me anything about this recommendation.`,
        timestamp: Date.now(),
      },
    ]);
  }, [decision?.id, decision?.title, decision?.confidence, decision]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  const send = useCallback((text: string) => {
    if (!text.trim() || !decision || isThinking) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    (async () => {
      try {
        const res = await askCopilot({
          message: text.trim(),
          decisionId: decision.id,
          conversationId: conversationId || undefined,
          context: { vesselId: decision.vesselId, vesselName: decision.vesselName, category: decision.category },
        });

        if (res?.conversationId) setConversationId(res.conversationId);

        if (res) {
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: res.message,
              structured: res.structured
                ? {
                    answer: res.structured.answer,
                    reason: res.structured.reason,
                    impact: res.structured.impact,
                  }
                : undefined,
              timestamp: Date.now(),
            },
          ]);
          return;
        }
      } catch (error) {
        console.error('Copilot API failed, using local fallback', error);
      }

      const reply = generateReply(text.trim(), decision);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', ...reply, timestamp: Date.now() },
      ]);
    })().finally(() => setIsThinking(false));
  }, [decision, isThinking, conversationId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  if (!decision) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Brain className="mx-auto h-10 w-10 text-[#404040]" />
          <p className="mt-3 text-xs text-[#525252]">AI Copilot becomes active when a decision is selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex-none border-b border-[#2a2a2a] bg-[#0f0f0f]/95 backdrop-blur-md px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#3b82f6]/30 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5">
            <Sparkles className="h-4 w-4 text-[#3b82f6]" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#0f0f0f] bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold tracking-tight text-[#f5f5f5]">NEMO Copilot</div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#525252]">
              Reasoning Engine <span className="text-[#3b82f6]">v2.4</span>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-400">
            Live
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m) => (
          <Message key={m.id} msg={m} />
        ))}

        {isThinking && (
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md border border-[#3b82f6]/30 bg-[#3b82f6]/10">
              <Bot className="h-3 w-3 text-[#3b82f6]" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Analyzing...
            </div>
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div className="flex-none border-t border-[#2a2a2a] bg-[#0f0f0f]/60 px-4 py-2">
        <div className="flex flex-wrap gap-1">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => send(p.template)}
              disabled={isThinking}
              className="flex items-center gap-1 rounded border border-[#2a2a2a] bg-[#141414] px-1.5 py-0.5 text-[10px] text-[#a3a3a3] transition-colors hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/5 hover:text-[#3b82f6] disabled:opacity-50"
            >
              <Zap className="h-2.5 w-2.5" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex-none border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 py-4">
        <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-3.5 py-2 focus-within:border-[#3b82f6]/50 focus-within:ring-1 focus-within:ring-[#3b82f6]/20 transition-all shadow-inner">
          <HelpCircle className="h-4 w-4 flex-none text-[#404040]" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask NEMO anything..."
            disabled={isThinking}
            className="flex-1 bg-transparent text-[13px] text-[#f5f5f5] placeholder:text-[#404040] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3b82f6] text-white transition-all hover:bg-[#2563eb] disabled:opacity-30 disabled:grayscale"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[9px] font-medium text-[#404040] uppercase tracking-widest">
          Sovereign AI Decision Support
        </p>
      </form>
    </div>
  );
}

/* ——— Message render ——— */

function Message({ msg }: { msg: ChatMessage }) {
  if (msg.role === 'user') {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-tr-none border border-[#3b82f6]/20 bg-[#3b82f6]/5 px-4 py-2.5 text-[13px] leading-relaxed text-[#f5f5f5] shadow-sm">
          {msg.content}
        </div>
        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] shadow-sm">
          <User className="h-3.5 w-3.5 text-[#737373]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg border border-[#3b82f6]/30 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
        <Bot className="h-3.5 w-3.5 text-[#3b82f6]" />
      </div>
      <div className="min-w-0 flex-1">
        {msg.structured ? (
          <div className="rounded-2xl rounded-tl-none border border-[#2a2a2a] bg-[#111111] p-4 space-y-3 text-[13px] leading-relaxed shadow-sm">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#3b82f6]">Synthesized Answer</div>
              <div className="mt-1 text-[#f5f5f5] font-medium">{msg.structured.answer}</div>
            </div>
            <div className="rounded-lg bg-[#1a1a1a] p-2.5">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#525252]">Engine Reasoning</div>
              <div className="mt-1 text-[#a3a3a3] text-[12px]">{msg.structured.reason}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#525252]">Projected Impact</div>
              <div className="mt-1 text-[#737373] text-[12px] italic">{msg.structured.impact}</div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl rounded-tl-none border border-[#2a2a2a] bg-[#111111] px-4 py-2.5 text-[13px] leading-relaxed text-[#f5f5f5] shadow-sm">
            {msg.content}
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— Rule-based reply generator (mock agent) ——— */

function generateReply(prompt: string, decision: DecisionRecord): Pick<ChatMessage, 'content' | 'structured'> {
  const p = prompt.toLowerCase();
  const d = decision;

  // Why this decision?
  if (p.includes('why this') || p.includes('why was') || p.includes('why do you')) {
    const topFactor = d.reasoningFactors?.[0];
    return {
      content: '',
      structured: {
        answer: `I recommend "${d.recommendation}" with ${d.confidence}% confidence.`,
        reason: topFactor
          ? `The dominant factor is ${topFactor.factor} (${Math.round(topFactor.weight * 100)}% weight): ${topFactor.summary}`
          : d.reasoning[0] || d.cause,
        impact: `Net cost change ${fmt(d.costImpact)}, ETA ${d.delayHoursImpact >= 0 ? '+' : ''}${d.delayHoursImpact}h, risk delta ${d.riskDelta >= 0 ? '+' : ''}${d.riskDelta}.`,
      },
    };
  }

  // What if delay?
  if (p.includes('delay') && (p.includes('what if') || p.includes('12 hour') || p.includes('hours'))) {
    return {
      content: '',
      structured: {
        answer: 'A 12-hour delay would not substantially change the recommendation.',
        reason: `Buffer at destination is ${d.comparison?.recommended.bufferDays.toFixed(1) || '3.8'}d — a 12h shift consumes ~0.5d of buffer, still above the 2.5d safety threshold. However, berth availability at receiving port would need to be re-confirmed.`,
        impact: 'Estimated incremental demurrage: ~$48K. Risk delta unchanged. Recommendation holds.',
      },
    };
  }

  // Cheapest safe option
  if (p.includes('cheapest') || p.includes('lowest cost') || p.includes('save money')) {
    const cheapestAlt = d.alternatives?.slice().sort((a, b) => a.deltaCost - b.deltaCost)[0];
    return {
      content: '',
      structured: {
        answer: cheapestAlt ? `The cheapest feasible option is: ${cheapestAlt.label}.` : `The recommended path already optimizes cost at ${fmt(d.costImpact)}.`,
        reason: cheapestAlt ? `Incremental cost ${fmt(cheapestAlt.deltaCost)} and delay ${cheapestAlt.deltaDelayHours > 0 ? '+' : ''}${cheapestAlt.deltaDelayHours}h. Caveat: ${cheapestAlt.rejectionReason}` : 'Other alternatives were more expensive or higher risk.',
        impact: cheapestAlt ? `If forced, expect risk shift of ${cheapestAlt.deltaRisk > 0 ? '+' : ''}${cheapestAlt.deltaRisk}.` : 'No further cost savings available within policy constraints.',
      },
    };
  }

  // Compare options
  if (p.includes('compare') || p.includes('all options') || p.includes('alternatives')) {
    const count = d.alternatives?.length ?? 0;
    if (count === 0) {
      return { content: `Only the primary recommendation was considered feasible for this scenario. The Evidence Explorer lists the sources that ruled others out.` };
    }
    const lines = d.alternatives!.map((a) => {
      return `• **${a.label}** — ${fmt(a.deltaCost)}, ${a.deltaDelayHours > 0 ? '+' : ''}${a.deltaDelayHours}h, Δrisk ${a.deltaRisk > 0 ? '+' : ''}${a.deltaRisk}. ${a.rejectionReason}`;
    });
    return {
      content: `Compared ${count} alternatives against the recommended path:\n\n${lines.join('\n')}\n\nRecommended beats all on the blended cost+risk+delay score.`,
    };
  }

  // Throughput
  if (p.includes('throughput') || p.includes('refinery')) {
    return {
      content: '',
      structured: {
        answer: 'Reducing refinery throughput is not the optimal response here.',
        reason: 'Throughput cuts cost $620K/day in lost margin. This recommendation already preserves refinery supply without touching operations.',
        impact: 'If throughput were cut by 20% for 48h: -$1.24M margin, +2.1d buffer, but downstream product commitments at risk.',
      },
    };
  }

  // Default fallback
  return {
    content: `I'd be happy to elaborate. For this decision, the critical inputs are: ${d.reasoning.slice(0, 2).join('; ')}. Try asking "Why this decision?", "Compare all options", or "What if delay +12h?"`,
  };
}

function fmt(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : v > 0 ? '+' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}
