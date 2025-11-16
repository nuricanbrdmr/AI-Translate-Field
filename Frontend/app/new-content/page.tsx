'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import TranslateField, { AVAILABLE_LANGS } from '../components/TranslateField';

// use shared types from TranslateField

export default function NewContentPage() {
    const [titleTr, setTitleTr] = useState('');
    const [descTr, setDescTr] = useState('');
    const [titleI18n, setTitleI18n] = useState<Record<string, string>>({});
    const [descI18n, setDescI18n] = useState<Record<string, string>>({});
    const [sourceLang, setSourceLang] = useState<string>('tr');
    const [autoDetect, setAutoDetect] = useState<boolean>(false);
    const [link, setLink] = useState('');
    const [ranking, setRanking] = useState<number | ''>('');
    const [technologies, setTechnologies] = useState('');
    // image removed
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const canSubmit = useMemo(() => !!titleTr && !!descTr && !!link && !!ranking, [titleTr, descTr, link, ranking]);

    // translation moved into reusable component instances

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            let finalSource = sourceLang;
            if (autoDetect) {
                try {
                    const det = await fetch('/api/detect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: titleTr || descTr }) });
                    const dj = await det.json();
                    if (det.ok && dj?.lang) finalSource = dj.lang;
                } catch { }
            }
            const payload: any = {
                title: { [finalSource]: titleTr, ...titleI18n },
                description: { [finalSource]: descTr, ...descI18n },
                link,
                ranking,
                technologies, // comma separated
            };

            const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/project/add` : 'http://localhost:4000/api/project/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || !data?.success) {
                alert(data?.message || 'Kaydetme başarısız');
            } else {
                alert('Proje eklendi');
                // reset
                setTitleTr('');
                setDescTr('');
                setTitleI18n({});
                setDescI18n({});
                setLink('');
                setRanking('');
                setTechnologies('');
                // image removed
            }
        } catch (e) {
            alert('Beklenmeyen bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center justify-center rounded-lg border p-2 transition hover:border-zinc-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight">Yeni İçerik</h1>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>Kaynak Dil</span>
                    <select className="rounded-lg border px-2 py-1 text-xs dark:bg-transparent" value={sourceLang} onChange={e => setSourceLang(e.target.value)} disabled={autoDetect}>
                        {AVAILABLE_LANGS.map(({ code, label }) => (
                            <option key={code} value={code}>{label}</option>
                        ))}
                    </select>
                    <label className="flex items-center gap-1">
                        <input type="checkbox" checked={autoDetect} onChange={e => setAutoDetect(e.target.checked)} />
                        <span>Otomatik algıla</span>
                    </label>
                </div>
            </div>

            <div className="grid gap-6">
                <TranslateField
                    label="Başlık"
                    sourcePlaceholder="Kaynak dilde başlık..."
                    value={titleTr}
                    onChangeSource={setTitleTr}
                    onChangeTranslations={(t) => setTitleI18n(t)}
                />

                <TranslateField
                    label="Açıklama"
                    sourcePlaceholder="Kaynak dilde açıklama..."
                    value={descTr}
                    onChangeSource={setDescTr}
                    onChangeTranslations={(t) => setDescI18n(t)}
                />

                {/* Results now live inside TranslateField components */}

                <section className="rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-900/50">
                    <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Detaylar</h2>
                    <div className="grid gap-3">
                        <label className="text-xs text-zinc-500">Link</label>
                        <input className="rounded-lg border px-3 py-2 outline-none ring-0 focus:border-zinc-400 dark:bg-transparent" value={link} onChange={e => setLink(e.target.value)} />

                        <label className="mt-3 text-xs text-zinc-500">Ranking</label>
                        <input type="number" className="rounded-lg border px-3 py-2 outline-none ring-0 focus:border-zinc-400 dark:bg-transparent" value={ranking} onChange={e => setRanking(e.target.value === '' ? '' : Number(e.target.value))} />

                        <label className="mt-3 text-xs text-zinc-500">Technologies (virgülle ayır)</label>
                        <input className="rounded-lg border px-3 py-2 outline-none ring-0 focus:border-zinc-400 dark:bg-transparent" value={technologies} onChange={e => setTechnologies(e.target.value)} />
                    </div>
                </section>

                <div className="sticky bottom-4 z-10 flex justify-end">
                    <button onClick={handleSubmit} className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60" disabled={!canSubmit || submitting}>
                        {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
