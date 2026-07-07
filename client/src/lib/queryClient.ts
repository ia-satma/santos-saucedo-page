import { QueryClient, QueryFunction } from "@tanstack/react-query";

export const isStaticSite = import.meta.env.VITE_STATIC_SITE === "true";
const staticBaseUrl = `${import.meta.env.BASE_URL}static-api`;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  if (isStaticSite) {
    throw new Error(`Static Pages build cannot perform ${method} ${url}`);
  }

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

function queryKeyToPath(queryKey: readonly unknown[]) {
  const [first, second] = queryKey;

  if (typeof first !== "string") {
    return queryKey.join("/");
  }

  if (first === "/api/search" && typeof second === "string") {
    return `/api/search?q=${encodeURIComponent(second)}`;
  }

  if (queryKey.length === 1) {
    return first;
  }

  return queryKey.map((part) => String(part)).join("/");
}

async function readStaticJson(relativePath: string) {
  const res = await fetch(`${staticBaseUrl}/${relativePath}`, {
    credentials: "same-origin",
  });
  await throwIfResNotOk(res);
  return res.json();
}

function filterSearchResults(index: any, query: string) {
  const normalized = query.toLowerCase().trim();
  if (normalized.length < 2) {
    return { team: [], practiceGroups: [], industryGroups: [], news: [] };
  }

  const includes = (value: unknown) =>
    String(value ?? "").toLowerCase().includes(normalized);

  return {
    team: (index.team || [])
      .filter((item: any) =>
        [item.name, item.title, item.titleEs, item.role, item.roleEs, item.bio, item.bioEs].some(includes),
      )
      .slice(0, 10),
    practiceGroups: (index.practiceGroups || [])
      .filter((item: any) =>
        [item.name, item.nameEs, item.description, item.descriptionEs].some(includes),
      )
      .slice(0, 5),
    industryGroups: (index.industryGroups || [])
      .filter((item: any) =>
        [item.name, item.nameEs, item.description, item.descriptionEs].some(includes),
      )
      .slice(0, 5),
    news: (index.news || [])
      .filter((item: any) =>
        [item.title, item.titleEs, item.excerpt, item.excerptEs, item.content, item.contentEs].some(includes),
      )
      .slice(0, 5),
  };
}

async function getStaticQueryData(queryKey: readonly unknown[]) {
  const apiPath = queryKeyToPath(queryKey);
  if (!apiPath.startsWith("/api/")) {
    return undefined;
  }

  const url = new URL(apiPath, window.location.origin);
  const pathname = url.pathname.replace(/^\/api\//, "");

  if (pathname.startsWith("admin/") || pathname.startsWith("agents/") || pathname.startsWith("audits/")) {
    throw new Error("Admin routes require a backend server.");
  }

  if (pathname === "search") {
    const index = await readStaticJson("search-index.json");
    return filterSearchResults(index, url.searchParams.get("q") || "");
  }

  if (pathname.startsWith("translations/")) {
    return {};
  }

  const cleanPath = pathname.replace(/\/$/, "");
  return readStaticJson(`${cleanPath}.json`);
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    if (isStaticSite) {
      return await getStaticQueryData(queryKey);
    }

    const res = await fetch(queryKeyToPath(queryKey), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

const FIVE_MINUTES = 5 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: FIVE_MINUTES,
      gcTime: TEN_MINUTES,
      retry: (failureCount, error) => {
        if (error instanceof Error) {
          const status = parseInt(error.message.split(':')[0]);
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: false,
    },
  },
});
