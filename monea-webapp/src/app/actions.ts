// Client-side wrappers for API endpoints that used to be Next.js server actions

export async function uploadImage(formData: FormData) {
    const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
    });
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Upload failed");
    }
    
    return res.json();
}

export async function submitGuestbookEntry(formData: FormData) {
    // Note: formData should contain weddingId, guestName, message, honeypot, turnstileToken
    const res = await fetch('/api/guestbook', {
        method: 'POST',
        body: formData, // the Hono backend should be able to parse multipart/form-data
    });
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Submission failed");
    }
    
    return res.json();
}
