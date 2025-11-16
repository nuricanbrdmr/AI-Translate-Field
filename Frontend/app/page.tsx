import Link from "next/link";

export default function Home() {
  return (
    <main className="relative mx-auto grid min-h-[80vh] max-w-5xl place-items-center px-6">
      <div className="flex w-full flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-zinc-600 dark:text-zinc-300">
          AI Translate Field • Gemini + Libre fallback
        </div>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          İçeriğini Türkçe yaz, geri kalanı otomatik çevrilsin
        </h1>
        <p className="max-w-2xl text-pretty text-zinc-600 dark:text-zinc-400">
          Seçtiğin dillere akıllı çeviri, düzenlenebilir alanlar ve çok dilli içerik kaydı. Hemen yeni içerik eklemeye başla.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/new-content" className="rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
            Yeni İçerik Oluştur
          </Link>
          <Link href="/projects" className="rounded-lg border px-5 py-2.5 font-medium transition hover:border-zinc-400">
            Projeleri Görüntüle
          </Link>
          <a href="https://ai.google.dev/" target="_blank" className="rounded-lg border px-5 py-2.5 font-medium transition hover:border-zinc-400">
            Gemini Docs
          </a>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 -z-10 h-[40vh] translate-y-[-20%] bg-[radial-gradient(1000px_400px_at_center,rgba(0,0,0,0.06),transparent)] dark:bg-[radial-gradient(1000px_400px_at_center,rgba(255,255,255,0.08),transparent)]" />
    </main>
  );
}
