"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Save, Loader2, Sparkles, AlertCircle, CheckCircle2, FileText, StickyNote, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";

export default function NotesPage() {
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch existing notes
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch("/api/wedding/notes");
                if (res.ok) {
                    const data = await res.json();
                    setNotes(data.notes || "");
                } else {
                    setError("មិនអាចទាញយកទិន្នន័យបានទេ។");
                }
            } catch (err) {
                setError("មានបញ្ហាក្នុងការតភ្ជាប់។");
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/wedding/notes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            });
            if (res.ok) {
                setLastSaved(new Date());
            } else {
                setError("រក្សាទុកមិនបានសម្រេច។");
            }
        } catch (err) {
            setError("មានបញ្ហាក្នុងការរក្សាទុក។");
        } finally {
            setSaving(false);
        }
    };

    // Auto-save logic (optional, but let's provide a save button for manual control too)
    const debouncedNotes = useDebounce(notes, 3000);
    useEffect(() => {
        if (debouncedNotes && !loading && notes !== "") {
            // handleSave(); // We can choose to auto-save or not. Let's keep it manual for now.
        }
    }, [debouncedNotes]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                <p className="text-slate-400 font-khmer animate-pulse">កំពុងផ្ទុកកំណត់ត្រា...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6 md:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-kantumruy">កំណត់ត្រា</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Internal Organizer Notes</span>
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-[10px] text-slate-400 font-bold font-khmer">សម្រាប់តែអ្នករៀបចំ</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {lastSaved && (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-bold font-khmer">បានរក្សាទុកនៅម៉ោង {lastSaved.toLocaleTimeString('km-KH')}</span>
                        </div>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        រក្សាទុក (Save)
                    </Button>
                </div>
            </div>

            {/* Main Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 md:p-12 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/50 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <StickyNote className="w-5 h-5 text-red-500" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">កន្លែងកត់ត្រាព័ត៌មានសំខាន់ៗ</h3>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-pulse">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-bold font-khmer">{error}</p>
                        </div>
                    )}

                    <div className="relative group">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="សរសេរព័ត៌មានសំខាន់ៗនៅទីនេះ (ឧ៖ លេខទូរស័ព្ទជាងថតរូប, បញ្ជីឈ្មោះអ្នកមកជួយការ, ឬការចងចាំផ្សេងៗ...)"
                            className="w-full min-h-[500px] bg-slate-50/50 border border-slate-100 rounded-3xl p-8 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-200 transition-all font-kantumruy leading-relaxed text-lg resize-none"
                        />
                        <div className="absolute bottom-6 right-8 flex items-center gap-2 text-slate-300 group-focus-within:text-slate-400 transition-colors">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Organizer Memo Space</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                        <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2 group hover:bg-white transition-all">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors">
                                <History className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Persistence</h4>
                            <p className="text-[11px] text-slate-400 font-khmer">រាល់កំណត់ត្រារបស់អ្នកនឹងត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិក្នុងប្រព័ន្ធ។</p>
                        </div>
                        <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2 group hover:bg-white transition-all">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Usage</h4>
                            <p className="text-[11px] text-slate-400 font-khmer">អ្នកអាចប្រើវាសម្រាប់កត់ត្រាលេខទូរស័ព្ទសំខាន់ៗ ឬអ្វីដែលត្រូវធ្វើ (To-do list)។</p>
                        </div>
                        <div className="p-6 bg-slate-100/50 rounded-2xl border border-slate-200 border-dashed flex items-center justify-center text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">Monea Premium <br /> Internal Admin Center</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
