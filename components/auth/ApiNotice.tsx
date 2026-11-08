"use client";
import * as React from "react";
export function ApiNotice() {
  const [message, setMessage] = React.useState<string | null>(null);
  React.useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; status: number }>).detail;
      if (detail.status !== 401) setMessage(`Request failed (${detail.status}): ${detail.message}`);
    };
    window.addEventListener("orthosense:api-error", listener);
    return () => window.removeEventListener("orthosense:api-error", listener);
  }, []);
  return message ? <div role="alert" className="fixed bottom-4 left-4 right-4 z-[100] rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900"><p>{message}</p><button className="mr-4 underline" onClick={() => window.location.reload()}>Reload to retry</button><button className="underline" onClick={() => setMessage(null)}>Dismiss</button></div> : null;
}
