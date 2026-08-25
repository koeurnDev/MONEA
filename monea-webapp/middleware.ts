import { next } from '@vercel/edge';

export const config = {
  // Only run this middleware on wedding links
  matcher: ['/w/:id']
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  
  // 1. Detect Social Media Bots
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /bot|facebook|whatsapp|telegram|twitter|linkedin|pinterest|slack/i.test(userAgent);

  // If it's a real user or not a wedding page, let Vercel handle it normally (serve Vite app)
  if (!isBot || !url.pathname.startsWith('/w/')) {
    return next();
  }

  // 2. Extract Wedding ID
  const parts = url.pathname.split('/');
  const id = parts[2];
  if (!id) return next();

  try {
    // 3. Fetch wedding data from your existing public API
    // Ensure this API endpoint matches your actual backend route
    // Use the actual Cloudflare Worker API URL
    const apiUrl = `https://monea-api.seabkoeurn64.workers.dev/api/wedding/${id}`;
    const apiResponse = await fetch(apiUrl);
    
    if (apiResponse.ok) {
      const wedding = await apiResponse.json(); // The API returns the object directly, not wrapped in { data: ... }
      
      if (wedding && !wedding.error) {
        // Prepare SEO Data
        const title = `${wedding.groomName || 'កូនកំលោះ'} & ${wedding.brideName || 'កូនក្រមុំ'} - អាពាហ៍ពិពាហ៍`;
        const date = wedding.date ? new Date(wedding.date).toLocaleDateString('km-KH') : '';
        const description = `សូមអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ${date ? `នៅថ្ងៃទី ${date}` : ''}`;
        
        // Find a cover image from the gallery, fallback to default
        const coverImage = wedding.galleryItems && wedding.galleryItems.length > 0 
            ? wedding.galleryItems[0].url 
            : `${url.origin}/og-image.png`;
        const image = coverImage;

        // 4. Fetch the static Vite index.html
        const htmlResponse = await fetch(new URL('/index.html', request.url));
        if (!htmlResponse.ok) return next();
        let html = await htmlResponse.text();

        // 5. Inject Open Graph Tags for the Bot
        html = html.replace(
          '</title>',
          `</title>
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="${request.url}" />
          <meta name="twitter:card" content="summary_large_image" />`
        );

        // 6. Return the modified HTML to the Bot
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 's-maxage=60, stale-while-revalidate',
          },
        });
      }
    }
  } catch (error) {
    console.error('Edge SEO Error:', error);
  }

  // Fallback to normal serving if API fails
  return next();
}
