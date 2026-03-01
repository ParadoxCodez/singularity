import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    background: '#0A0A0F',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background grid */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Purple glow orb */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
                    }}
                />

                {/* Top label */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '32px',
                        background: 'rgba(124,58,237,0.15)',
                        border: '1px solid rgba(124,58,237,0.3)',
                        borderRadius: '100px',
                        padding: '8px 20px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#A855F7',
                        }}
                    />
                    <span style={{ color: '#A855F7', fontSize: '16px', letterSpacing: '0.15em' }}>
                        PERSONAL GROWTH OS
                    </span>
                </div>

                {/* Main heading */}
                <div
                    style={{
                        fontSize: '80px',
                        fontWeight: 700,
                        color: 'white',
                        textAlign: 'center',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                        maxWidth: '900px',
                        marginBottom: '24px',
                    }}
                >
                    Build the habits that define you.
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: '24px',
                        color: '#6B6B8A',
                        textAlign: 'center',
                        maxWidth: '600px',
                        lineHeight: 1.5,
                        marginBottom: '48px',
                    }}
                >
                    Habits · Journal · Spending · Analytics
                </div>

                {/* Bottom wordmark */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <div
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '16px',
                        }}
                    >
                        S
                    </div>
                    <span
                        style={{
                            color: 'white',
                            fontSize: '18px',
                            letterSpacing: '0.2em',
                            fontWeight: 600,
                        }}
                    >
                        SINGULARITY
                    </span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    )
}
