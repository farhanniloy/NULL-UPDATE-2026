import { PrismaClient } from '@prisma/client';

let prisma;

// If DATABASE_URL isn't set (e.g., during local static builds or CI without env),
// export a mock proxy that provides safe defaults for read operations so the
// build doesn't fail. Write operations will throw a clear error to avoid
// accidental mutations without a database configured.
if (!process.env.DATABASE_URL) {
  const modelHandler = {
    get(target, prop) {
      // Provide common model methods with safe defaults
      if (prop === 'findMany') return async () => [];
      if (prop === 'findUnique' || prop === 'findFirst') return async () => null;
      if (prop === 'count') return async () => 0;
      if (prop === 'create') return async (data) => {
        throw new Error('Prisma not configured: cannot perform create when DATABASE_URL is not set');
      };
      if (prop === 'update' || prop === 'delete') return async () => {
        throw new Error('Prisma not configured: cannot perform write operations when DATABASE_URL is not set');
      };
      // default fallback
      return async () => [];
    },
  };

  const proxy = new Proxy({}, {
    get(target, prop) {
      if (prop === '$transaction') return async (arr) => Promise.all(arr);
      // Return a model proxy (e.g., prisma.post)
      return new Proxy({}, modelHandler);
    },
  });

  prisma = proxy;
} else {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  }
}

export default prisma;
