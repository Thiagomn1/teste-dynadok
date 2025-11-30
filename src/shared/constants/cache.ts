export const CacheTTL = {
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 3600,
  DEFAULT: 3600,
} as const;

export const CacheKeys = {
  CLIENTE_LIST: "clientes:list",
  CLIENTE_BY_ID: (id: string) => `cliente:${id}`,
} as const;
