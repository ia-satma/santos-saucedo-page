import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod/v3";

// The application keeps its validation API on zod/v3 while the patched Zod 4
// package is used by the Drizzle adapter. The runtime schemas remain identical.
export function createInsertSchema(...args: any[]): any {
  const factory = createSchemaFactory({ zodInstance: z as any });
  const mixed = (factory.createInsertSchema as any)(...args);
  return z.object((mixed as any).shape);
}
