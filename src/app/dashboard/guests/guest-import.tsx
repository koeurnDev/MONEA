"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function GuestImport({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Map keys to expected format (Name, Phone, Group)
            // Assumes generic column matching or first row headers
            const formattedGuests = data.map((row: any) => ({
                name: row.Name || row.name || row["ឈ្មោះ"] || "Unknown",
                phone: row.Phone || row.phone || row["ទូរស័ព្ទ"]?.toString() || "",
                group: row.Group || row.group || row["ក្រុម"] || "Friend",
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
                        alert(`Import failed: ${errorData.error || 'Unknown error'}`);
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> នាំចូល Excel (Import)
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>នាំចូលបញ្ជីភ្ញៀវ (Import Guests)</DialogTitle>
                    <DialogDescription>
                        ម៉ូដែល Excel (.xlsx) ដែលមានជួរឈរ៖ <strong>Name, Phone, Group</strong>។
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg">
                    <label className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-600">
                            {loading ? "កំពុងនាំចូល..." : "ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ Excel"}
                        </span>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={loading}
                        />
                    </label>
                </div>
            </DialogContent>
        </Dialog>
    );
}
