"use client";

import { useState, type FormEvent } from "react";

export function SearchBox({
  placeholder = "Search a city…",
  onSearch,
}: {
  placeholder?: string;
  onSearch: (city: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-md border border-hairline bg-panel px-3 py-2 font-mono text-sm text-slate-100 outline-none placeholder:text-ink2 focus:border-teal"
      />
      <button
        type="submit"
        className="rounded-md bg-amber px-4 py-2 font-mono text-xs font-medium uppercase tracking-wide text-ink transition hover:bg-amber/90"
      >
        Scan
      </button>
    </form>
  );
}
