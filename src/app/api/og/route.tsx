export const dynamic = 'force-dynamic';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// We fetch the font as an ArrayBuffer and pass it to Sentry for the image generation
const fetchFont = async (name: string, weight: number = 400) => {
    try {
        const url = `https://fonts.googleapis.com/css2?family=${name}:wght@${weight}&display=swap`;
        const css = await (await fetch(url)).text();
        const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
        if (!resource) return null;
        return await (await fetch(resource[1])).arrayBuffer();
    } catch (e) {
        console.error(`Failed to fetch font ${name}:`, e);
        return null;
    }
};

export async function GET(req: NextRequest) {
    const fontData = await fetchFont('Kantumruy+Pro', 700);
    const serifFontData = await fetchFont('Playfair+Display', 700);

    try {
        const { searchParams } = new URL(req.url);

        // Parameters
        const groom = searchParams.get('groom') || 'Groom';
        const bride = searchParams.get('bride') || 'Bride';
        const date = searchParams.get('date') || '';
        const eventType = searchParams.get('type') || 'wedding';
        const image = searchParams.get('image') || '';

        // Clean up date format if provided
        let formattedDate = date;
        if (date) {
            try {
                formattedDate = new Date(date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Asia/Phnom_Penh'
                });
            } catch (e) {
                formattedDate = date;
            }
        }

        const title = eventType === 'anniversary' ? 'ANNIVERSARY CELEBRATION' : 'WEDDING INVITATION';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1a1a1a',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background Image / Overlay */}
                    {image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={image}
                            alt="Preview Background"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.4,
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #2c1a1a 0%, #1a1a2e 100%)',
                                opacity: 0.8,
                            }}
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)',
                        }}
                    />

                    {/* Content Container */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            padding: '40px 60px',
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            textAlign: 'center',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '18px',
                                letterSpacing: '8px',
                                color: '#D4AF37',
                                marginBottom: '15px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                opacity: 0.9,
                            }}
                        >
                            {title}
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '30px',
                                marginBottom: '15px',
                            }}
                        >
                            <h1
                                style={{
                                    fontSize: '72px',
                                    color: 'white',
                                    margin: 0,
                                    fontWeight: 'bold',
                                }}
                            >
                                {groom}
                            </h1>
                            <span
                                style={{
                                    fontSize: '48px',
                                    color: '#D4AF37',
                                    fontStyle: 'italic',
                                }}
                            >
                                &
                            </span>
                            <h1
                                style={{
                                    fontSize: '72px',
                                    color: 'white',
                                    margin: 0,
                                    fontWeight: 'bold',
                                }}
                            >
                                {bride}
                            </h1>
                        </div>

                        {formattedDate && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '15px',
                                }}
                            >
                                <div style={{ width: '100px', height: '1.5px', backgroundColor: 'rgba(212, 175, 55, 0.5)' }} />
                                <p
                                    style={{
                                        fontSize: '28px',
                                        color: '#D4AF37',
                                        margin: 0,
                                        fontWeight: '300',
                                        letterSpacing: '3px',
                                    }}
                                >
                                    {formattedDate}
                                </p>
                            </div>
                        )}
                        
                        <div style={{ marginTop: '25px', display: 'flex', color: 'white', fontSize: '16px', opacity: 0.8, letterSpacing: '2px' }}>
                             SAVE THE DATE
                        </div>
                    </div>

                    {/* Branding */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <span style={{ color: 'white', opacity: 0.5, fontSize: '14px' }}>E-Invitation by</span>
                        <span style={{ color: '#D4AF37', fontSize: '22px', fontWeight: 'bold', letterSpacing: '5px' }}>MONEA</span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                fonts: [
                    ...(fontData ? [{
                        name: 'KhmerFont',
                        data: fontData,
                        style: 'normal' as const,
                        weight: 700 as const,
                    }] : []),
                    ...(serifFontData ? [{
                        name: 'SerifFont',
                        data: serifFontData,
                        style: 'normal' as const,
                        weight: 700 as const,
                    }] : [])
                ]
            }
        );
    } catch (e: any) {
        console.error(e.message);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
