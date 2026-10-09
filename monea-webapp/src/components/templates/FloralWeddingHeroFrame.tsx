import React from 'react';

interface FloralWeddingHeroFrameProps {
  coupleNames?: {
    groom: string;
    bride: string;
  };
  subtitle?: string;
  date?: string;
  className?: string;
}

export function FloralWeddingHeroFrame({
  coupleNames = { groom: 'Sreynich', bride: 'Dara' },
  subtitle = 'We Invite You',
  date = 'Saturday, 18 October 2026',
  className = '',
}: FloralWeddingHeroFrameProps) {
  return (
    <section
      className={`relative isolate min-h-[720px] w-full overflow-hidden bg-[#f5f2ee] px-4 py-8 sm:px-6 ${className}`}
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <img
          src="/bg/Green Floral Illustrated Wedding Invitation.svg"
          alt="Floral wedding invitation frame"
          className="h-full w-full select-none object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-[#f8f4ee]/10" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[760px] items-center justify-center px-2 py-10 sm:px-6">
        <div className="relative z-10 w-full text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-[#5a5f56] sm:text-xs">
            {subtitle}
          </p>

          <h1 className="mt-6 text-4xl font-serif font-bold tracking-[0.02em] text-[#2d342b] sm:text-5xl md:text-[72px]">
            {coupleNames.groom}
          </h1>

          <div className="my-4 text-3xl text-[#7d8c6d]">♥</div>

          <h1 className="text-4xl font-serif font-bold tracking-[0.02em] text-[#2d342b] sm:text-5xl md:text-[72px]">
            {coupleNames.bride}
          </h1>

          <div className="my-6 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#8a9c7a]" />
            <span className="text-xl text-[#7a8d68]">✦</span>
            <span className="h-px w-12 bg-[#8a9c7a]" />
          </div>

          <p className="text-sm tracking-[0.18em] text-[#434c41] sm:text-base">
            {date}
          </p>
        </div>
      </div>
    </section>
  );
}

export default FloralWeddingHeroFrame;
