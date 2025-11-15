import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Required for static export
export const revalidate = false;

const server = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});

// For static export: generate search indexes at build time
export const GET = server.staticGET;

