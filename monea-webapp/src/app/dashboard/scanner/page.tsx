import ScannerView from "./ScannerView";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function ScannerPage() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/sign-in" replace />;
    }

    return (
        <div className="space-y-6">
            <ScannerView weddingId={user.weddingId} />
        </div>
    );
}
