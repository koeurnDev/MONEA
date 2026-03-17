"use client";

import { useState } from "react";
// Dynamic loading for XLSX to save bundle size
const loadXLSX = () => import("xlsx");
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function GuestImport({ onSuccess, className }: { onSuccess: () => void, className?: string }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            const XLSX = await loadXLSX();
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Map keys to expected format (Name, Phone, Group)
            // Assumes generic column matching or first row headers
            const formattedGuests = data.map((row: any) => ({
                name: row["ឈ្មោះភ្ញៀវ"] || row["ឈ្មោះ"] || row["នាម និង គោតមនាម"] || row["Guest Name"] || row.Name || row.name || "Unknown",
                group: row["មកពីណា / ទីតាំង"] || row["មកពីណា"] || row["ទីតាំង"] || row["អញ្ជើញមកពី"] || row["Location/Group"] || row.Group || row.group || "Friend",
            }));

            if (formattedGuests.length > 0) {
                try {
                    const res = await fetch("/api/guests/bulk", {
                        method: "POST",
                        body: JSON.stringify({ guests: formattedGuests })
                    });
                    if (res.ok) {
                        setOpen(false);
                        onSuccess();
                    } else {
                        const errorData = await res.json();
                        const fullError = errorData.message || errorData.error || 'Unknown error';
                        alert(`Import failed: ${fullError}`);
                        console.error("Full Import Error:", errorData);
                    }
                } catch (error) {
                    console.error("Import error:", error);
                    alert("A connection error occurred. Please check your internet and try again.");
                }
            }
            setLoading(false);
        };

        reader.readAsBinaryString(file);
    };

    const downloadTemplate = async () => {
        const XLSX = await loadXLSX();
        const headers = ["ឈ្មោះភ្ញៀវ", "មកពីណា / ទីតាំង"];
        const sampleData = [
            ["សុក តារា", "កំពត"],
            ["កែវ មុន្នី", "ព្រៃវែង"]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Guest Template");

        XLSX.writeFile(workbook, "Monea_Guest_Template.xlsx");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-9 px-3 border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-kantumruy font-bold transition-all text-[11px]",
                        className
                    )}
                >
                    <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-600 shrink-0" /> នាំចូល
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl bg-card">
                <DialogHeader className="pt-4 px-2 mb-2">
                    <DialogTitle className="text-3xl font-black font-kantumruy tracking-tight text-foreground">
                        នាំចូលបញ្ជីភ្ញៀវ
                    </DialogTitle>
                    <DialogDescription className="font-kantumruy font-medium text-muted-foreground text-base mt-2">
                        សូមជ្រើររើសឯកសារ Excel (.xlsx) ដែលមានជួរឈរ៖ <strong className="text-foreground font-bold bg-muted px-2 py-0.5 rounded">ឈ្មោះភ្ញៀវ</strong> និង <strong className="text-foreground font-bold bg-muted px-2 py-0.5 rounded">មកពីណា / ទីតាំង</strong> ។
                        <span className="block mt-2 text-sm text-amber-600 font-bold">
                            * លេខរៀង (No.) នឹងត្រូវបានរៀបចំដោយស្វ័យប្រវត្តិដោយប្រព័ន្ធ។
                        </span>
                        <span className="block mt-4">
                            <Button
                                variant="link"
                                onClick={downloadTemplate}
                                className="p-0 h-auto text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                            >
                                <Download className="w-4 h-4" /> ទាញយកឯកសារគំរូ (Download Sample Template)
                            </Button>
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <div className="p-2">
                    <div className="flex items-center justify-center w-full">
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-56 bg-muted/50 hover:bg-muted border-2 border-dashed border-border hover:border-red-600/50 rounded-3xl transition-all group">
                            <div className="w-16 h-16 mb-4 rounded-2xl bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="h-8 w-8 text-red-600" />
                            </div>
                            <span className="text-lg font-bold text-foreground font-kantumruy">
                                {loading ? "កំពុងទាញបញ្ចូលទិន្នន័យ..." : "ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ Excel"}
                            </span>
                            <span className="text-sm text-muted-foreground font-kantumruy mt-2">អនុញ្ញាតត្រឹមឯកសារ: .xlsx, .xls</span>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={loading}
                            />
                        </label>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
