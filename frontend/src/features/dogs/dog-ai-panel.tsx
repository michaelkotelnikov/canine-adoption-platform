"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiBaseUrl } from "@/lib/api/client";
import { consumeSseJson } from "@/lib/sse";
import { isStandaloneFrontend } from "@/lib/standalone";

type ChatMessage = { role: "user" | "assistant"; content: string };

type DogAiPanelProps = {
  dogId: number;
  dogName: string;
  hero?: ReactNode;
  leftRail?: ReactNode;
  betweenOverviewAndChat?: ReactNode;
};

export function DogAiPanel({
  dogId,
  dogName,
  hero,
  leftRail,
  betweenOverviewAndChat,
}: DogAiPanelProps) {
  const [overview, setOverview] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("canine_access_token") : null;

  const runOverview = useCallback(async () => {
    if (!token) return;
    setOverviewLoading(true);
    setOverview("");
    const url = `${getApiBaseUrl()}/dogs/${dogId}/ai/overview`;
    let sawDelta = false;
    let sawError = false;
    try {
      await consumeSseJson(
        url,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
        },
        (ev) => {
          if (ev.type === "delta" && typeof ev.text === "string") {
            sawDelta = true;
            setOverview((o) => o + ev.text);
          } else if (ev.type === "error") {
            sawError = true;
            const msg =
              typeof ev.message === "string"
                ? ev.message
                : "AI overview failed. Check Mistral API key and backend logs.";
            setOverview((o) => (o ? `${o}\n\n${msg}` : msg));
          }
        },
      );
      if (!sawDelta && !sawError) {
        setOverview((o) =>
          o ||
          "No overview text was streamed. Set MISTRAL_API_KEY for the backend container and try again.",
        );
      }
    } catch {
      setOverview((o) => o || "Could not load overview. Check Mistral API key and login.");
    } finally {
      setOverviewLoading(false);
    }
  }, [dogId, token]);

  const sendChat = useCallback(async () => {
    if (!token || !input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setChatLoading(true);

    const apiMessages = nextMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let assistant = "";
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    const url = `${getApiBaseUrl()}/dogs/${dogId}/ai/chat`;
    try {
      await consumeSseJson(
        url,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: apiMessages }),
        },
        (ev) => {
          if (ev.type === "delta" && typeof ev.text === "string") {
            assistant += ev.text;
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") {
                copy[copy.length - 1] = { role: "assistant", content: assistant };
              }
              return copy;
            });
          } else if (ev.type === "error") {
            const msg =
              typeof ev.message === "string"
                ? ev.message
                : "AI chat failed. Check Mistral API key and backend logs.";
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") {
                copy[copy.length - 1] = { role: "assistant", content: msg };
              }
              return copy;
            });
          }
        },
      );
    } catch {
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && !last.content) {
          copy[copy.length - 1] = {
            role: "assistant",
            content: "Sorry, the chat request failed.",
          };
        }
        return copy;
      });
    } finally {
      setChatLoading(false);
    }
  }, [dogId, input, messages, token]);

  const overviewCard = (
    <Card className="flex min-h-0 min-w-0 flex-col border-l-[3px] border-l-primary/30">
      <CardHeader className="flex shrink-0 flex-col gap-2 space-y-0 pb-3">
        <CardTitle className="font-display text-sm leading-tight text-primary">AI overview</CardTitle>
        <Button
          type="button"
          size="sm"
          className="w-full shrink-0 rounded-full"
          onClick={() => void runOverview()}
          disabled={overviewLoading || !token}
        >
          {overviewLoading ? "Generating…" : "Generate"}
        </Button>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
        <p className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-text-body">
          {overview || "Press Generate for a streaming summary powered by Mistral."}
        </p>
      </CardContent>
    </Card>
  );

  const chatCard = (
    <Card className="flex min-h-0 w-full flex-col">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="font-display text-base text-primary">
          Ask about {dogName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="max-h-[min(24rem,50dvh)] min-h-0 flex-1 space-y-2 overflow-y-auto rounded-xl border border-border bg-canvas-alt/50 p-3 text-sm">
          {messages.length === 0 ? (
            <p className="text-text-muted">Your conversation will appear here.</p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-xl bg-primary/10 px-3 py-2"
                    : "mr-8 rounded-xl bg-muted px-3 py-2"
                }
              >
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-text-muted">
                  {m.role}
                </span>
                <p className="mt-0.5 whitespace-pre-wrap text-text-body">{m.content}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question…"
            onKeyDown={(e) => e.key === "Enter" && !chatLoading && void sendChat()}
            disabled={chatLoading}
          />
          <Button
            type="button"
            variant="shelter"
            className="shrink-0"
            onClick={() => void sendChat()}
            disabled={chatLoading}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const disabledCard = (body: ReactNode) => (
    <Card className="flex h-full min-h-0 min-w-0 flex-col border-l-[3px] border-l-primary/20">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="font-display text-base text-primary">
          AI overview & chat
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto text-sm text-text-secondary">
        {body}
      </CardContent>
    </Card>
  );

  /** Fluid three-column band: metadata | hero | overview; stacked on small screens. */
  const profileBand = (overviewSlot: ReactNode) => {
    if (hero == null || leftRail == null) return null;
    return (
      <div className="mx-auto grid w-full grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
        <Card className="order-2 flex w-full min-w-0 flex-col overflow-hidden border-l-[3px] border-l-primary/25 lg:order-1">
          <CardHeader className="shrink-0 space-y-0 border-b border-border/50 px-5 py-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Profile
            </p>
          </CardHeader>
          <CardContent className="flex flex-col px-5 pb-5 pt-0">
            {leftRail}
          </CardContent>
        </Card>
        <div className="order-1 flex w-full min-w-0 flex-col lg:order-2">
          <div className="w-full">{hero}</div>
        </div>
        <div className="order-3 flex w-full min-w-0 flex-col lg:order-3">{overviewSlot}</div>
      </div>
    );
  };

  if (isStandaloneFrontend()) {
    if (hero && leftRail) {
      return (
        <div className="flex w-full min-w-0 flex-col gap-8">
          {profileBand(
            disabledCard(
              <>
                Disabled in standalone preview. Run the full stack with{" "}
                <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-text-body">
                  make up
                </code>{" "}
                and set{" "}
                <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-text-body">
                  MISTRAL_API_KEY
                </code>{" "}
                to try AI features for {dogName}.
              </>,
            ),
          )}
          {betweenOverviewAndChat}
        </div>
      );
    }
    if (hero) {
      return (
        <div className="w-full min-w-0 space-y-8">
          <div className="mx-auto grid w-full gap-6 lg:w-max lg:grid-cols-[11rem_11rem] lg:items-stretch lg:gap-6">
            <div className="flex min-h-0 min-w-0 flex-col items-stretch">{hero}</div>
            <div className="flex min-h-0 min-w-0 flex-col">
              {disabledCard(
                <>
                  Disabled in standalone preview. Run the full stack with{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-text-body">
                    make up
                  </code>{" "}
                  and set{" "}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-text-body">
                    MISTRAL_API_KEY
                  </code>{" "}
                  to try AI features for {dogName}.
                </>,
              )}
            </div>
          </div>
          {betweenOverviewAndChat}
        </div>
      );
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-primary">AI overview & chat</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-text-secondary">
          Disabled in standalone preview. Run the full stack with{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-text-body">make up</code>{" "}
          and set{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-text-body">
            MISTRAL_API_KEY
          </code>{" "}
          to try AI features for {dogName}.
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    if (hero && leftRail) {
      return (
        <div className="flex w-full min-w-0 flex-col gap-8">
          {profileBand(
            disabledCard(
              <>Log in to generate an AI overview and ask follow-up questions about {dogName}.</>,
            ),
          )}
          {betweenOverviewAndChat}
        </div>
      );
    }
    if (hero) {
      return (
        <div className="w-full min-w-0 space-y-8">
          <div className="mx-auto grid w-full gap-6 lg:w-max lg:grid-cols-[11rem_11rem] lg:items-stretch lg:gap-6">
            <div className="flex min-h-0 min-w-0 flex-col items-stretch">{hero}</div>
            <div className="flex min-h-0 min-w-0 flex-col">
              {disabledCard(
                <>Log in to generate an AI overview and ask follow-up questions about {dogName}.</>,
              )}
            </div>
          </div>
          {betweenOverviewAndChat}
        </div>
      );
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-primary">AI overview & chat</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-text-secondary">
          Log in to generate an AI overview and ask follow-up questions about {dogName}.
        </CardContent>
      </Card>
    );
  }

  if (hero && leftRail) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-8">
        {profileBand(overviewCard)}
        {betweenOverviewAndChat}
        <div className="flex min-w-0 flex-col">{chatCard}</div>
      </div>
    );
  }

  if (hero) {
    return (
      <div className="w-full min-w-0 space-y-8">
        <div className="mx-auto grid w-full gap-6 lg:w-max lg:grid-cols-[11rem_11rem] lg:items-stretch lg:gap-6">
          <div className="flex min-h-0 min-w-0 flex-col items-stretch">{hero}</div>
          <div className="flex min-h-0 min-w-0 flex-col">{overviewCard}</div>
        </div>
        {betweenOverviewAndChat}
        {chatCard}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {overviewCard}
      {chatCard}
    </div>
  );
}
