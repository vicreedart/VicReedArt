"use client";
import { useEffect, useRef } from "react";
type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}
export function Turnstile({
  siteKey,
  onToken,
  onError,
  resetKey,
}: {
  siteKey: string;
  onToken: (token: string) => void;
  onError: () => void;
  resetKey: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onToken, onError });
  useEffect(() => {
    callbacks.current = { onToken, onError };
  }, [onToken, onError]);
  useEffect(() => {
    let id: string | undefined;
    let active = true;
    const render = () => {
      if (active && host.current && window.turnstile && id === undefined)
        id = window.turnstile.render(host.current, {
          sitekey: siteKey,
          action: "commission",
          theme: "light",
          size: "flexible",
          callback: (token: string) => callbacks.current.onToken(token),
          "expired-callback": () => callbacks.current.onToken(""),
          "error-callback": () => callbacks.current.onError(),
        });
    };
    let script = document.querySelector<HTMLScriptElement>(
      "script[data-turnstile]",
    );
    if (!script) {
      script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "true";
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);
    const failure = () => callbacks.current.onError();
    script.addEventListener("error", failure);
    render();
    return () => {
      active = false;
      script?.removeEventListener("load", render);
      script?.removeEventListener("error", failure);
      if (id !== undefined) window.turnstile?.remove(id);
    };
  }, [siteKey, resetKey]);
  return <div ref={host} className="turnstile-widget" />;
}
