import Link from 'next/link';
import { ClickableCodeBlock } from './clickable-code-block';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">llms.py</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Lightweight OpenAI compatible CLI, server gateway and OSS Open WebUI alternative
            for Local and Cloud LLMs
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/docs"
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
          <a
            href="https://github.com/ServiceStack/llms"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-semibold"
          >
            View on GitHub
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
          <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100">🪶 Ultra-Lightweight</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300">
                Single file with just one aiohttp dependency. Perfect for ComfyUI and minimal environments.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100">🌐 Multi-Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300">
                Access 160+ models from OpenAI, Anthropic, Google, Grok, Groq, Ollama, and more.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100">💻 ChatGPT-like UI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300">
                Fast, privacy-focused web interface with dark mode and built-in analytics.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-muted">
          <h3 className="font-semibold mb-4">Quick Install</h3>
          <ClickableCodeBlock>pip install llms-py</ClickableCodeBlock>
        </div>
      </div>
    </main>
  );
}
