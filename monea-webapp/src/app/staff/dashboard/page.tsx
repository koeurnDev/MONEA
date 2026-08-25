import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function StaffRedirect() {
    const router = useNavigate();

    useEffect(() => {
        router("/dashboard/gifts");
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting to Gifts...</p>
        </div>
    );
}
