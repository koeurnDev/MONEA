import { Helmet } from 'react-helmet-async';
import PageTransition from "@/components/layout/PageTransition";
import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { Features, HowItWorks, FinalCTA } from "@/components/landing/LandingSections";
import { Footer } from "@/components/landing/StaticSections";

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>Monea - រៀបចំមង្គលការ និងកម្មវិធីផ្សេងៗយ៉ាងងាយស្រួល</title>
        <meta name="description" content="Monea ជួយអ្នកបង្កើតលិខិតអញ្ជើញឌីជីថល គ្រប់គ្រងភ្ញៀវ និងកត់ត្រាចំណងដៃបានយ៉ាងងាយស្រួលនិងមានប្រសិទ្ធភាព។" />
        <link rel="canonical" href="https://monea-webapp.pages.dev/" />
        <meta property="og:title" content="Monea - Digital Invitation & Guest Management" />
        <meta property="og:description" content="Monea ជួយអ្នកបង្កើតលិខិតអញ្ជើញឌីជីថល គ្រប់គ្រងភ្ញៀវ និងកត់ត្រាចំណងដៃបានយ៉ាងងាយស្រួលនិងមានប្រសិទ្ធភាព។" />
        <meta property="og:url" content="https://monea-webapp.pages.dev/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://monea-webapp.pages.dev/branding/logo-light.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://monea-webapp.pages.dev/branding/logo-light.png" />
      </Helmet>

      <PageTransition>
        <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-[#FAF8F5] dark:bg-[#09090B]">
          <NavBar />
          {/* 3D Floating Wedding Cards Hero */}
          <Hero />
          <Features />
          <HowItWorks />
          <FinalCTA />
          
          <Footer />
        </div>
      </PageTransition>
    </>
  );
}
