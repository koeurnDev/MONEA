"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

interface DangerZoneProps {
    onShowDeleteAccount: () => void;
}

export function DangerZone({ onShowDeleteAccount }: DangerZoneProps) {
    return (
        <Card className="border-none bg-red-500/[0.03] shadow-[0_8px_60px_rgba(239,68,68,0.05)] dark:shadow-none rounded-[3rem] overflow-hidden p-1 mt-10">
            <CardHeader className="p-10 pb-6">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/10 text-red-600 text-[10px] font-black tracking-[0.3em] uppercase mb-4 w-fit">
                    <AlertTriangle size={14} /> DANGER ZONE
                </div>
                <CardTitle className="text-2xl font-black text-foreground font-kantumruy tracking-tight">តំបន់គ្រោះថ្នាក់ (Danger Zone)</CardTitle>
                <CardDescription className="font-kantumruy text-sm mt-2 opacity-60 leading-relaxed max-w-xl">
                    មុខងារទាំងនេះអាចប៉ះពាល់ដល់ទិន្នន័យគណនីរបស់អ្នកជាអចិន្ត្រៃយ៍។ សូមប្រុងប្រយ័ត្នខ្ពស់មុនពេលសម្រេចចិត្តប្រើប្រាស់។
                </CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 bg-white dark:bg-red-950/10 rounded-[2.5rem] border border-red-500/10 shadow-sm group hover:border-red-500/20 transition-all">
                    <div className="space-y-2">
                        <p className="text-lg font-black font-kantumruy text-red-600 flex items-center gap-3">
                            <Trash2 size={20} /> លុបគណនីអ្នកប្រើប្រាស់
                        </p>
                        <p className="text-[13px] text-muted-foreground font-kantumruy opacity-70 leading-relaxed max-w-md italic">
                            រាល់ទិន្នន័យដែលបានរក្សាទុកទាំងអស់រួមមាន កូនកំលោះ-កូនក្រមុំ ភ្ញៀវ និងចំណងដៃ នឹងត្រូវលុបជាស្ថាពរ និងមិនអាចយកមកវិញបានទេ។
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onShowDeleteAccount}
                        className="rounded-[1.2rem] font-black font-kantumruy text-xs uppercase tracking-widest px-8 h-12 bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all active:scale-95 border-none group-hover:scale-[1.02]"
                    >
                        លុបឥឡូវនេះ
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
