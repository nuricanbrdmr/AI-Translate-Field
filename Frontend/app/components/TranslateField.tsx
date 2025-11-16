'use client';
import { useEffect, useMemo, useState } from 'react';

export type LangCode = 'tr' | 'en' | 'de' | 'fr' | 'ar' | 'es' | 'it' | 'ru' | 'nl' | 'pt' | 'zh' | 'ja' | 'ko';

export const AVAILABLE_LANGS: { code: LangCode; label: string }[] = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'ru', label: 'Русский' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'pt', label: 'Português' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
];

type Props = {
    label: string;
    sourcePlaceholder?: string;
    value: string;
    onChangeSource: (text: string) => void;
    onChangeTranslations?: (translations: Record<string, string>) => void;
    initialTranslations?: Record<string, string>;
};

export default function TranslateField({ label, sourcePlaceholder, value, onChangeSource, onChangeTranslations, initialTranslations }: Props) {
    const [selectedLangs, setSelectedLangs] = useState<LangCode[]>(['tr', 'en', 'de', 'fr', 'ar', 'ru']);
    const [sourceLang, setSourceLang] = useState<'auto' | LangCode>('auto');
    const [translations, setTranslations] = useState<Record<string, string>>(initialTranslations || {});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialTranslations && Object.keys(initialTranslations).length > 0) {
            setTranslations(initialTranslations);
            // Add languages from initialTranslations to selectedLangs if not already present
            const existingLangs = Object.keys(initialTranslations) as LangCode[];
            setSelectedLangs(prev => {
                const combined = [...new Set([...prev, ...existingLangs])];
                return combined as LangCode[];
            });
        }
    }, [initialTranslations]);

    const canTranslate = useMemo(() => value.trim().length > 0 && selectedLangs.length > 0, [value, selectedLangs]);

    const doTranslate = async () => {
        if (!canTranslate) return;
        setLoading(true);
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: value, targetLangs: selectedLangs, sourceLang })
            });
            const data = await res.json();
            const updated = { ...translations, ...data };
            setTranslations(updated);
            onChangeTranslations?.(updated);
        } finally {
            setLoading(false);
        }
    };

    const handleTranslationChange = (lang: string, text: string) => {
        const updated = { ...translations, [lang]: text };
        setTranslations(updated);
        onChangeTranslations?.(updated);
    };

    return (
        <section className="rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-900/50">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}</h3>
            </div>

            <div className="grid gap-3">
                <textarea className="rounded-lg border px-3 py-2 outline-none ring-0 focus:border-zinc-400 dark:bg-transparent" rows={4} placeholder={sourcePlaceholder} value={value} onChange={e => onChangeSource(e.target.value)} />

                <div className="flex items-center gap-3">
                    <button onClick={doTranslate} className="rounded-lg bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white" disabled={!canTranslate || loading}>
                        {loading ? 'Çevriliyor...' : 'Ai ile Çevir'}
                    </button>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_LANGS.map(({ code, label }) => {
                            const active = selectedLangs.includes(code);
                            return (
                                <button
                                    type="button"
                                    key={code}
                                    onClick={() => setSelectedLangs(prev => active ? prev.filter(c => c !== code) : [...prev, code])}
                                    className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900' : 'hover:border-zinc-400 dark:bg-transparent'}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {Object.keys(translations).length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                    {selectedLangs.map((lang) => (
                        <details key={lang} className="group overflow-hidden rounded-lg border">
                            <summary className="flex cursor-pointer select-none items-center justify-between bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                                <span>{lang.toUpperCase()}</span>
                                <span className="text-xs text-zinc-500 group-open:hidden">(aç)</span>
                                <span className="hidden text-xs text-zinc-500 group-open:inline">(kapat)</span>
                            </summary>
                            <div className="px-3 pb-3 pt-2">
                                <textarea className="w-full rounded-lg border px-3 py-2 outline-none ring-0 focus:border-zinc-400 dark:bg-transparent" rows={3} value={translations[lang] || ''} onChange={(e) => handleTranslationChange(lang, e.target.value)} />
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </section>
    );
}


