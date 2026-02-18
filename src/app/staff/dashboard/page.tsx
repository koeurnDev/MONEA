"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StaffRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/gifts");
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting to Gifts...</p>
        </div>
    );
}
