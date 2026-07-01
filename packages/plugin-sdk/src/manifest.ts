import { z } from 'zod';

export const PluginManifestSchema = z.object({
  id: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, "ID must be lowercase alphanumeric and dashes only"),
  name: z.string().min(1).max(100),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semantic (e.g. 1.0.0)"),
  author: z.string().optional(),
  description: z.string().max(500).optional(),
  entryPoint: z.string().default('dist/index.js'),
  permissions: z.array(z.enum(['read_chat', 'send_chat', 'moderate_chat', 'network', 'filesystem'])).default([]),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Parses and validates a raw manifest object.
 * Throws an error if invalid.
 */
export function parseManifest(data: unknown): PluginManifest {
  return PluginManifestSchema.parse(data);
}
