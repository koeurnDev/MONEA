// Client-side wrappers for API endpoints that used to be Next.js server actions

export async function submitGuestbookEntry(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    let res: Response;
    try {
        res = await fetch('/api/guestbook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch {
        throw new Error("មិនអាចភ្ជាប់ទៅសេវាបានទេ។ សូមពិនិត្យអ៊ីនធឺណិត ហើយព្យាយាមម្តងទៀត។");
    }
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({})) as { message?: string; error?: string };
        const messages: Record<number, string> = {
            400: "សូមពិនិត្យឈ្មោះ និងពាក្យជូនពររបស់អ្នក។",
            403: "ការផ្ទៀងផ្ទាត់ CAPTCHA មិនបានជោគជ័យ។ សូមព្យាយាមម្តងទៀត។",
            404: "រកមិនឃើញធៀបអញ្ជើញនេះទេ។",
            429: "អ្នកបានផ្ញើសារច្រើនពេក។ សូមរង់ចាំបន្តិចសិន។",
            503: "ការផ្ទៀងផ្ទាត់មិនអាចប្រើបានឥឡូវនេះ។ សូមព្យាយាមពេលក្រោយ។",
        };
        throw new Error(messages[res.status] || error.message || error.error || "ផ្ញើពាក្យជូនពរមិនបានជោគជ័យ។ សូមព្យាយាមម្តងទៀត។");
    }
    
    return res.json();
}
