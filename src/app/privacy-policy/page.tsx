"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SmoothScroll from '@/components/layout/SmoothScroll';
import PageTransition from '@/components/layout/PageTransition';

export default function PrivacyPolicyPage() {
    return (
        <SmoothScroll>
            <PageTransition>
                <div className="min-h-screen bg-black text-white font-kantumruy">
                    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2 group text-white/70 hover:text-white transition-colors">
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                ត្រឡប់ក្រោយ
                            </Link>
                            <span className="font-bold text-xl tracking-widest text-white">MONEA</span>
                            <div className="w-[84px]"></div> {/* Spacer for centering */}
                        </div>
                    </header>

                    <main className="container mx-auto px-6 pt-32 pb-24 max-w-4xl space-y-12">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">គោលការណ៍ឯកជនភាព (Privacy Policy)</h1>
                            <p className="text-white/50">ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ {new Date().toLocaleDateString()}</p>
                        </div>

                        <div className="prose prose-invert prose-pink max-w-none text-white/80 space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">១. សេចក្តីផ្តើម</h2>
                                <p>សូមស្វាគមន៍មកកាន់ MONEA ("យើង" "របស់យើង" ឬ "ពួកយើង")។ យើងគោរពសិទ្ធិឯកជនភាពរបស់អ្នក និងប្តេជ្ញាការពារទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក។ គោលការណ៍ឯកជនភាពនេះនឹងជម្រាបជូនអ្នកអំពីរបៀបដែលយើងថែរក្សាទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកនៅពេលអ្នកចូលមើលគេហទំព័ររបស់យើង (មិនថាអ្នកចូលមើលពីទីណាក៏ដោយ) និងប្រាប់អ្នកអំពីសិទ្ធិឯកជនភាពរបស់អ្នក ព្រមទាំងរបៀបដែលច្បាប់ការពារអ្នក។</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">២. ទិន្នន័យដែលយើងប្រមូលអំពីអ្នក</h2>
                                <p>ទិន្នន័យផ្ទាល់ខ្លួន ឬព័ត៌មានផ្ទាល់ខ្លួន មានន័យថាព័ត៌មានណាមួយអំពីបុគ្គលដែលអាចកំណត់អត្តសញ្ញាណជននោះបាន។ យើងអាចប្រមូល ប្រើប្រាស់ រក្សាទុក និងផ្ទេរប្រភេទផ្សេងៗនៃទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក ដែលយើងបានដាក់ជាក្រុមដូចខាងក្រោម៖</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li><strong>ទិន្នន័យអត្តសញ្ញាណ៖</strong> រួមមាន នាមត្រកូល នាមខ្លួន ឈ្មោះអ្នកប្រើប្រាស់ ឬគ្រឿងសម្គាល់ស្រដៀងគ្នា។</li>
                                    <li><strong>ទិន្នន័យទំនាក់ទំនង៖</strong> រួមមាន អាសយដ្ឋានអ៊ីមែល និងលេខទូរស័ព្ទ។</li>
                                    <li><strong>ទិន្នន័យបច្ចេកទេស៖</strong> រួមមាន អាសយដ្ឋានពិធីការអ៊ីនធឺណិត (IP) ទិន្នន័យចូលប្រើប្រាស់របស់អ្នក ប្រភេទ និងកំណែកម្មវិធីរុករក ការកំណត់តំបន់ពេលវេលា និងទីតាំង។</li>
                                    <li><strong>ទិន្នន័យប្រវត្តិរូប៖</strong> រួមមាន ឈ្មោះអ្នកប្រើប្រាស់ និងពាក្យសម្ងាត់របស់អ្នក ការទិញ ឬការបញ្ជាទិញដែលធ្វើឡើងដោយអ្នក ចំណូលចិត្តរបស់អ្នក មតិកែលម្អ និងការឆ្លើយតបការស្ទង់មតិ។</li>
                                    <li><strong>ទិន្នន័យព្រឹត្តិការណ៍៖</strong> រួមមាន ព័ត៌មានលម្អិតអំពីព្រឹត្តិការណ៍ (ឧទាហរណ៍ ពិធីមង្គលការ) ដែលអ្នកបង្កើតដោយប្រើប្រាស់វេទិការបស់យើង រួមទាំងបញ្ជីឈ្មោះភ្ញៀវ និងព័ត៌មានលម្អិតនៃព្រឹត្តិការណ៍។</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">៣. របៀបដែលយើងប្រើប្រាស់ទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក</h2>
                                <p>យើងនឹងប្រើប្រាស់ទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកតែនៅពេលដែលច្បាប់អនុញ្ញាតប៉ុណ្ណោះ។ ជាទូទៅ យើងនឹងប្រើប្រាស់ទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកក្នុងកាលៈទេសៈដូចខាងក្រោម៖</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>នៅពេលដែលយើងត្រូវអនុវត្តកិច្ចសន្យាដែលយើងរៀបនឹងចុះ ឬបានចុះជាមួយអ្នក (ឧទាហរណ៍ ការផ្តល់សេវាកម្មលិខិតអញ្ជើញឌីជីថលរបស់យើង)។</li>
                                    <li>នៅពេលដែលវាចាំបាច់សម្រាប់ផលប្រយោជន៍ស្របច្បាប់របស់យើង (ឬរបស់ភាគីទីបី) ហើយផលប្រយោជន៍ និងសិទ្ធិជាមូលដ្ឋានរបស់អ្នក មិនគ្របដណ្តប់លើផលប្រយោជន៍ទាំងនោះ។</li>
                                    <li>នៅពេលដែលយើងត្រូវអនុលោមតាមកាតព្វកិច្ចផ្លូវច្បាប់។</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">៤. សុវត្ថិភាពទិន្នន័យ</h2>
                                <p>យើងបានបង្កើតនូវវិធានការសុវត្ថិភាពសមស្រប ដើម្បីការពារទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកពីការបាត់បង់ដោយចៃដន្យ ការប្រើប្រាស់ ឬការចូលប្រើដោយគ្មានការអនុញ្ញាត ការផ្លាស់ប្តូរ ឬការលាតត្រដាង។ លើសពីនេះ យើងកំណត់ការចូលប្រើប្រាស់ទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកសម្រាប់តែបុគ្គលិក ភ្នាក់ងារ អ្នកម៉ៅការ និងភាគីទីបីផ្សេងទៀតដែលមានតម្រូវការអាជីវកម្មដើម្បីដឹង។ ពួកគេនឹងដំណើរការទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកតាមការណែនាំរបស់យើងប៉ុណ្ណោះ ហើយពួកគេស្ថិតនៅក្រោមកាតព្វកិច្ចរក្សាការសម្ងាត់។</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">៥. ការរក្សាទុកទិន្នន័យ</h2>
                                <p>យើងនឹងរក្សាទុកទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នករយៈពេលយូរតាមតម្រូវការសមហេតុផល ដើម្បីបំពេញគោលបំណងដែលយើងប្រមូលវា រួមទាំងសម្រាប់គោលបំណងបំពេញតាមតម្រូវការច្បាប់ បទប្បញ្ញត្តិ ពន្ធទារ គណនេយ្យ ឬការរាយការណ៍ផ្សេងៗ។ យើងអាចរក្សាទុកទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកក្នុងរយៈពេលយូរជាងនេះ ក្នុងករណីមានបណ្តឹង ឬប្រសិនបើយើងជឿជាក់យ៉ាងសមហេតុផលថាមានទស្សនវិស័យនៃបណ្តឹងផ្លូវច្បាប់ទាក់ទងនឹងទំនាក់ទំនងរបស់យើងជាមួយអ្នក។</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">៦. សិទ្ធិស្របច្បាប់របស់អ្នក</h2>
                                <p>ស្ថិតក្រោមកាលៈទេសៈមួយចំនួន អ្នកមានសិទ្ធិក្រោមច្បាប់ការពារទិន្នន័យទាក់ទងនឹងទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក រួមមានសិទ្ធិក្នុងការ៖</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>ស្នើសុំចូលប្រើប្រាស់ទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក។</li>
                                    <li>ស្នើសុំកែប្រែទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក។</li>
                                    <li>ស្នើសុំលុបទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក។</li>
                                    <li>បដិសេធចំពោះការដំណើរការទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក។</li>
                                    <li>ស្នើសុំដាក់កំហិតការដំណើរការទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក។</li>
                                    <li>ស្នើសុំផ្ទេរទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក។</li>
                                    <li>សិទ្ធិក្នុងការដកការយល់ព្រម។</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">៧. ទំនាក់ទំនងមកយើង</h2>
                                <p>ប្រសិនបើអ្នកមានសំណួរណាមួយអំពីគោលការណ៍ឯកជនភាពនេះ ឬការអនុវត្តឯកជនភាពរបស់យើង សូមទាក់ទងមកយើងតាមរយៈ៖</p>
                                <p className="mt-4">
                                    <strong>អ៊ីមែល៖</strong> privacy@monea.com<br />
                                    <strong>ទូរស័ព្ទ៖</strong> +855 (0) 12 345 678
                                </p>
                            </section>
                        </div>
                    </main>

                    {/* Minimal Footer */}
                    <footer className="border-t border-white/10 py-8">
                        <div className="container mx-auto px-6 text-center">
                            <p className="text-white/30 text-sm">© {new Date().getFullYear()} MONEA. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </PageTransition>
        </SmoothScroll>
    );
}
