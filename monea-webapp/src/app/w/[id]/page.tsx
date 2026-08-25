import { Suspense } from "react";
import WeddingDataView from "./_components/WeddingDataView";
import { WeddingSkeleton } from "./_components/WeddingSkeleton";
import { useParams, useSearchParams } from "react-router-dom";

export default function Page() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    
    if (!id) return null;

    return (
        <Suspense fallback={<WeddingSkeleton />}>
            <WeddingDataView 
                id={id} 
                template={searchParams.get("template") || undefined}
                guestId={searchParams.get("guestId") || undefined}
            />
        </Suspense>
    );
}