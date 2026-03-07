import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ScannerView from "./ScannerView";

export default async function ScannerPage() {
    const user = await getServerUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            <ScannerView weddingId={user.weddingId} />
        </div>
    );
}
