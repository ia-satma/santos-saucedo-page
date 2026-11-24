import type { ReactNode } from "react";

type VisibilityHelpProps = {
  title: string;
  children: ReactNode;
};

export function VisibilityHelp({ title, children }: VisibilityHelpProps) {
  return (
    <details className="relative inline-block align-middle">
      <summary
        className="flex h-5 w-5 cursor-pointer list-none items-center justify-center rounded-full border border-slate-400 text-[11px] font-semibold text-slate-600 hover:border-slate-700 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        aria-label={`Ayuda sobre ${title}`}
        title={`Ayuda sobre ${title}`}
      >
        i
      </summary>
      <div className="absolute right-0 top-7 z-20 w-64 rounded-md border border-slate-200 bg-white p-3 text-left text-xs font-normal leading-relaxed text-slate-600 shadow-lg">
        <strong className="mb-1 block text-slate-900">{title}</strong>
        {children}
      </div>
    </details>
  );
}
