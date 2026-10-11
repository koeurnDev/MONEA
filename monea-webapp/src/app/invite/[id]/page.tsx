import { lazy, Suspense } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { WeddingSkeleton } from "@/app/w/[id]/_components/WeddingSkeleton";

const WeddingDataView = lazy(() => import("@/app/w/[id]/_components/WeddingDataView"));

export default function InvitationPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    
    if (!id) return null;

    const guestNameParam = searchParams.get("to");
    const guestName = guestNameParam ? decodeURIComponent(guestNameParam) : undefined;
    const guestId = searchParams.get("g") || searchParams.get("guestId") || undefined;
    const template = searchParams.get("template") || undefined;

    return (
        <Suspense fallback={<WeddingSkeleton />}>
            <WeddingDataView
                id={id}
                template={template}
                guestId={guestId}
                guestName={guestName}
            />
        </Suspense>
    );
}
