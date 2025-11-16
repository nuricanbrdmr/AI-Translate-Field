'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import TranslateField from '../components/TranslateField';

type Project = {
    _id: string;
    title: Record<string, string>;
    description: Record<string, string>;
    ranking: number;
    link: string;
    technologies: string[];
};

const LANG_OPTIONS = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
    { code: 'ru', label: 'Русский' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'pt', label: 'Português' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
];

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState<string>('tr');
    const [editing, setEditing] = useState<Project | null>(null);
    const [editSourceLang, setEditSourceLang] = useState<string>('tr');
    const [viewing, setViewing] = useState<Project | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editTitleI18n, setEditTitleI18n] = useState<Record<string, string>>({});
    const [editDescI18n, setEditDescI18n] = useState<Record<string, string>>({});
    const [editLink, setEditLink] = useState('');
    const [editRanking, setEditRanking] = useState<number | ''>('');
    const [editTechnologies, setEditTechnologies] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const url = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/project/list` : 'http://localhost:4000/api/project/list';
                const res = await fetch(url, { cache: 'no-store' });
                const data = await res.json();
                if (res.ok && data?.success) {
                    setProjects(data.projects || []);
                } else {
                    setProjects([]);
                }
            } catch (_) {
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const visible = useMemo(() => {
        const firstValue = (m?: Record<string, string>) => m ? (Object.values(m)[0] ?? '') : '';
        const pick = (m?: Record<string, string>) => (m?.[lang] ?? m?.['tr'] ?? firstValue(m));
        return projects
            .slice()
            .sort((a, b) => (b.ranking || 0) - (a.ranking || 0))
            .map((p) => ({
                ...p,
                _title: pick(p.title),
                _description: pick(p.description)
            }));
    }, [projects, lang]);

    const handleEdit = (p: Project) => {
        setEditing(p);
        const keys = Object.keys(p.title || {});
        const base = keys.includes('tr') ? 'tr' : (keys[0] || 'tr');
        setEditSourceLang(base);
        const sourceTitle = p.title?.[base] ?? '';
        const sourceDesc = p.description?.[base] ?? '';
        const omitKey = (m?: Record<string, string>, k?: string) => {
            const copy: Record<string, string> = { ...(m || {}) };
            if (k && k in copy) delete copy[k];
            return copy;
        };
        setEditTitle(sourceTitle);
        setEditDesc(sourceDesc);
        setEditTitleI18n(omitKey(p.title, base));
        setEditDescI18n(omitKey(p.description, base));
        setEditLink(p.link);
        setEditRanking(p.ranking);
        setEditTechnologies(p.technologies?.join(', ') || '');
    };

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/project/update/${editing._id}` : `http://localhost:4000/api/project/update/${editing._id}`;
            const payload: any = {
                title: { [editSourceLang]: editTitle, ...editTitleI18n },
                description: { [editSourceLang]: editDesc, ...editDescI18n },
                link: editLink,
                ranking: editRanking,
                technologies: editTechnologies
            };

            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data?.success) {
                const updated = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/project/list` : 'http://localhost:4000/api/project/list', { cache: 'no-store' });
                const listData = await updated.json();
                if (updated.ok && listData?.success) {
                    setProjects(listData.projects || []);
                }
                setEditing(null);
                alert('Proje güncellendi');
            } else {
                alert(data?.message || 'Güncelleme başarısız');
            }
        } catch {
            alert('Beklenmeyen bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;
        setDeleting(id);
        try {
            const url = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/project/remove/${id}` : `http://localhost:4000/api/project/remove/${id}`;
            const res = await fetch(url, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok && data?.success) {
                setProjects(prev => prev.filter(p => p._id !== id));
                alert('Proje silindi');
            } else {
                alert(data?.message || 'Silme başarısız');
            }
        } catch {
            alert('Beklenmeyen bir hata oluştu');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="mx-auto max-w-5xl p-6">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center justify-center rounded-lg border p-2 transition hover:border-zinc-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight">Projeler</h1>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500">Dil</span>
                    <select className="rounded-lg border px-2 py-1 text-sm dark:bg-transparent" value={lang} onChange={(e) => setLang(e.target.value)}>
                        {LANG_OPTIONS.map(({ code, label }) => (
                            <option key={code} value={code}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-sm text-zinc-500">Yükleniyor...</div>
            ) : visible.length === 0 ? (
                <div className="text-sm text-zinc-500">Kayıt bulunamadı.</div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {visible.map((p) => (
                        <article key={p._id} className="rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-900/50">
                            <div className="mb-1 text-xs text-zinc-500">Rank: {p.ranking}</div>
                            <h3 className="mb-1 text-lg font-semibold">{p._title}</h3>
                            <p className="line-clamp-4 text-sm text-zinc-600 dark:text-zinc-400">{p._description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {p.technologies?.map((t) => (
                                    <span key={t} className="rounded-full border px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-300">{t}</span>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-2">
                                <a className="text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100" href={p.link} target="_blank">Siteyi Aç</a>
                                <div className="flex gap-2">
                                    <button onClick={() => setViewing(p)} className="rounded-lg border px-3 py-1 text-xs transition hover:border-zinc-400">Detay</button>
                                    <button onClick={() => handleEdit(p)} className="rounded-lg border px-3 py-1 text-xs transition hover:border-zinc-400">Düzenle</button>
                                    <button onClick={() => handleDelete(p._id)} disabled={deleting === p._id} className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                                        {deleting === p._id ? 'Siliniyor...' : 'Sil'}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {viewing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setViewing(null)}>
                    <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border bg-white p-6 shadow-lg dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setViewing(null)} className="absolute right-4 top-4 text-xl text-zinc-500 hover:text-zinc-700">×</button>
                        <h2 className="mb-4 text-xl font-semibold">Proje Detayları</h2>

                        <div className="grid gap-6">
                            <section className="rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-900/50">
                                <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Başlık</h3>
                                <div className="space-y-4">
                                    {viewing.title?.['tr'] !== undefined && (
                                        <div>
                                            <div className="mb-1 text-xs text-zinc-500">Türkçe</div>
                                            <div className="rounded-lg border bg-zinc-50 px-3 py-2 dark:bg-zinc-800">{viewing.title['tr']}</div>
                                        </div>
                                    )}
                                    {Object.entries(viewing.title || {}).filter(([code]) => code !== 'tr').map(([code, text]) => (
                                        <div key={code}>
                                            <div className="mb-1 text-xs text-zinc-500">{LANG_OPTIONS.find(l => l.code === code)?.label || code.toUpperCase()}</div>
                                            <div className="rounded-lg border bg-zinc-50 px-3 py-2 dark:bg-zinc-800">{text}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-900/50">
                                <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Açıklama</h3>
                                <div className="space-y-4">
                                    {viewing.description?.['tr'] !== undefined && (
                                        <div>
                                            <div className="mb-1 text-xs text-zinc-500">Türkçe</div>
                                            <div className="rounded-lg border bg-zinc-50 px-3 py-2 dark:bg-zinc-800 whitespace-pre-wrap">{viewing.description['tr']}</div>
                                        </div>
                                    )}
                                    {Object.entries(viewing.description || {}).filter(([code]) => code !== 'tr').map(([code, text]) => (
                                        <div key={code}>
                                            <div className="mb-1 text-xs text-zinc-500">{LANG_OPTIONS.find(l => l.code === code)?.label || code.toUpperCase()}</div>
                                            <div className="rounded-lg border bg-zinc-50 px-3 py-2 dark:bg-zinc-800 whitespace-pre-wrap">{text}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-900/50">
                                <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Detaylar</h3>
                                <div className="grid gap-3">
                                    <div>
                                        <div className="mb-1 text-xs text-zinc-500">Link</div>
                                        <a href={viewing.link} target="_blank" className="text-sm text-blue-600 hover:underline dark:text-blue-400">{viewing.link}</a>
                                    </div>
                                    <div>
                                        <div className="mb-1 text-xs text-zinc-500">Ranking</div>
                                        <div className="rounded-lg border bg-zinc-50 px-3 py-2 dark:bg-zinc-800">{viewing.ranking}</div>
                                    </div>
                                    <div>
                                        <div className="mb-1 text-xs text-zinc-500">Technologies</div>
                                        <div className="flex flex-wrap gap-2">
                                            {viewing.technologies?.map((t) => (
                                                <span key={t} className="rounded-full border bg-zinc-50 px-2 py-1 text-xs dark:bg-zinc-800">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setViewing(null)} className="rounded-lg border px-4 py-2 text-sm transition hover:border-zinc-400">Kapat</button>
                                <button onClick={() => { setViewing(null); handleEdit(viewing); }} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500">
                                    Düzenle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
                    <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border bg-white p-6 shadow-lg dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setEditing(null)} className="absolute right-4 top-4 text-xl text-zinc-500 hover:text-zinc-700">×</button>
                        <h2 className="mb-4 text-xl font-semibold">Projeyi Düzenle</h2>

                        <div className="grid gap-6">
                            <TranslateField
                                label="Başlık Çevirisi"
                                sourcePlaceholder="Kaynak dilde başlık..."
                                value={editTitle}
                                onChangeSource={setEditTitle}
                                onChangeTranslations={(t) => setEditTitleI18n(t)}
                                initialTranslations={editTitleI18n}
                            />

                            <TranslateField
                                label="Açıklama Çevirisi"
                                sourcePlaceholder="Kaynak dilde açıklama..."
                                value={editDesc}
                                onChangeSource={setEditDesc}
                                onChangeTranslations={(t) => setEditDescI18n(t)}
                                initialTranslations={editDescI18n}
                            />

                            <section className="rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-900/50">
                                <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Detaylar</h3>
                                <div className="grid gap-3">
                                    <label className="text-xs text-zinc-500">Kaynak Dil</label>
                                    <select className="rounded-lg border px-2 py-2 text-sm dark:bg-transparent" value={editSourceLang} onChange={e => setEditSourceLang(e.target.value)}>
                                        {LANG_OPTIONS.map(({ code, label }) => (
                                            <option key={code} value={code}>{label}</option>
                                        ))}
                                    </select>

                                    <label className="text-xs text-zinc-500">Link</label>
                                    <input className="rounded-lg border px-3 py-2 outline-none ring-0 focus:border-zinc-400 dark:bg-transparent" value={editLink} onChange={e => setEditLink(e.target.value)} />

                                    <label className="mt-3 text-xs text-zinc-500">Ranking</label>
                                    <input type="number" className="rounded-lg border px-3 py-2 outline-none ring-0 focus:border-zinc-400 dark:bg-transparent" value={editRanking} onChange={e => setEditRanking(e.target.value === '' ? '' : Number(e.target.value))} />

                                    <label className="mt-3 text-xs text-zinc-500">Technologies (virgülle ayır)</label>
                                    <input className="rounded-lg border px-3 py-2 outline-none ring-0 focus:border-zinc-400 dark:bg-transparent" value={editTechnologies} onChange={e => setEditTechnologies(e.target.value)} />
                                </div>
                            </section>

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setEditing(null)} className="rounded-lg border px-4 py-2 text-sm transition hover:border-zinc-400">İptal</button>
                                <button onClick={handleSave} disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60">
                                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


