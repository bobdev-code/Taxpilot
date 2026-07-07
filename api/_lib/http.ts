export type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export type ApiRequest = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

export function methodNotAllowed(res: JsonResponse, allowed: string[]) {
  res.status(405).json({
    error: "Method not allowed",
    allowed
  });
}

export function readQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
