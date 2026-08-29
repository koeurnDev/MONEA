import { Helmet } from 'react-helmet-async';
import PageTransition from "@/components/layout/PageTransition";
import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>Monea - រៀបចំមង្គលការ និងកម្មវិធីផ្សេងៗយ៉ាងងាយស្រួល</title>
        <meta name="description" content="Monea ជួយអ្នកបង្កើតលិខិតអញ្ជើញឌីជីថល គ្រប់គ្រងភ្ញៀវ និងកត់ត្រាចំណងដៃបានយ៉ាងងាយស្រួលនិងមានប្រសិទ្ធភាព។" />
        <meta property="og:title" content="Monea - Digital Invitation & Guest Management" />
        <meta property="og:description" content="Monea ជួយអ្នកបង្កើតលិខិតអញ្ជើញឌីជីថល គ្រប់គ្រងភ្ញៀវ និងកត់ត្រាចំណងដៃបានយ៉ាងងាយស្រួលនិងមានប្រសិទ្ធភាព។" />
        <meta property="og:image" content="/og-image.png" />
      </Helmet>

      <PageTransition>
        <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-[#FAF8F5] dark:bg-[#09090B]">
          <NavBar />
          {/* 3D Floating Wedding Cards Hero */}
          <Hero />
          
          {/* Ultra-Clean Footer */}
          <footer className="w-full py-4 border-t border-border/40 text-center text-xs text-muted-foreground font-kantumruy">
            <p>© 2026 MONEA • រៀបចំមង្គលការ និងកម្មវិធីផ្សេងៗយ៉ាងងាយស្រួល</p>
          </footer>
        </div>
      </PageTransition>
    </>
  );
}
