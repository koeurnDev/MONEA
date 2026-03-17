"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SmoothScroll from '@/components/layout/SmoothScroll';
import PageTransition from '@/components/layout/PageTransition';

export default function TermsAndConditionsPage() {
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
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">លក្ខខណ្ឌប្រើប្រាស់ (Terms & Conditions)</h1>
                            <p className="text-white/50">ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ {new Date().toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</p>
                        </div>

                        <div className="prose prose-invert prose-pink max-w-none text-white/80 space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">១. ការយល់ព្រមតាមលក្ខខណ្ឌ</h2>
                                <p>លក្ខខណ្ឌទាំងនេះ គឺជាកិច្ចព្រមព្រៀងដែលមានចំណងផ្លូវច្បាប់រវាងអ្នក ទាំងក្នងនាមបុគ្គល ឬតំណាងឱ្យអង្គភាពមួយ (&quot;អ្នក&quot;) និង MONEA (&quot;យើង&quot; &quot;យើងខ្ញុំ&quot; ឬ &quot;របស់យើង&quot;) ទាក់ទងនឹងការចូលប្រើប្រាស់របស់អ្នកទៅកាន់គេហទំព័ររបស់យើង ព្រមទាំងទម្រង់ប្រព័ន្ធផ្សព្វផ្សាយ ប៉ុស្តិ៍ប្រព័ន្ធផ្សព្វផ្សាយ គេហទំព័រទូរស័ព្ទ ឬកម្មវិធីទូរស័ព្ទផ្សេងទៀត ដែលទាក់ទង តភ្ជាប់ ឬមានការតភ្ជាប់ផ្សេងៗមកកាន់នេះ (ហៅជារួមថា &quot;គេហទំព័រ&quot;)។</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">២. សិទ្ធិកម្មសិទ្ធិបញ្ញា</h2>
                                <p>លើកលែងតែមានការចង្អុលបង្ហាញផ្សេងពីនេះ គេហទំព័រគឺជាកម្មសិទ្ធិផ្តាច់មុខរបស់យើង ហើយរាល់កូដប្រភព មូលដ្ឋានទិន្នន័យ មុខងារ កម្មវិធី ការរចនាគេហទំព័រ សំឡេង វីដេអូ អត្ថបទ រូបថត និងក្រាហ្វិកនៅលើគេហទំព័រ (ហៅជារួមថា &quot;ខ្លឹមសារ&quot;) ព្រមទាំងពាណិជ្ជសញ្ញា សញ្ញាសេវាកម្ម និងស្លាកសញ្ញាដែលមាននៅក្នុងនោះ (&quot;សញ្ញាសម្គាល់&quot;) ត្រូវបានកាន់កាប់ ឬគ្រប់គ្រងដោយពួកយើង ឬត្រូវបានផ្តល់អាជ្ញាប័ណ្ណមកឱ្យយើង ហើយត្រូវបានការពារដោយច្បាប់រក្សាសិទ្ធិ និងច្បាប់ពាណិជ្ជសញ្ញា ព្រមទាំងសិទ្ធិកម្មសិទ្ធិបញ្ញាផ្សេងៗ និងច្បាប់ប្រកួតប្រជែងមិនស្មោះត្រង់។</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">៣. ការបញ្ជាក់របស់អ្នកប្រើប្រាស់</h2>
                                <p>ដោយប្រើប្រាស់គេហទំព័រ អ្នកតំណាង និងធានាថា៖</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>រាល់ព័ត៌មានចុះឈ្មោះដែលអ្នកបានបញ្ជូននឹងពិតប្រាកដ ត្រឹមត្រូវ បច្ចុប្បន្ន និងពេញលេញ។</li>
                                    <li>អ្នកនឹងរក្សាភាពត្រឹមត្រូវនៃព័ត៌មានបែបនេះ និងធ្វើបច្ចុប្បន្នភាពព័ត៌មានចុះឈ្មោះបែបនេះភ្លាមៗនៅពេលចាំបាច់។</li>
                                    <li>អ្នកមានសមត្ថភាពផ្លូវច្បាប់ ហើយអ្នកយល់ព្រមអនុលោមតាមលក្ខខណ្ឌទាំងនេះ។</li>
                                    <li>អ្នកមិនមែនជាអនីតិជននៅក្នុងយុត្តាធិការដែលអ្នករស់នៅនោះទេ។</li>
                                    <li>អ្នកនឹងមិនចូលប្រើគេហទំព័រតាមរយៈមធ្យោបាយស្វ័យប្រវត្តិ ឬមិនមែនមនុស្សឡើយ ទោះជាតាមរយៈរូបយន្ត ស្គ្រីប ឬមធ្យោបាយផ្សេងទៀតក៏ដោយ។</li>
                                    <li>អ្នកនឹងមិនប្រើប្រាស់គេហទំព័រសម្រាប់គោលបំណងខុសច្បាប់ ឬគ្មានការអនុញ្ញាតឡើយ។</li>
                                    <li>ការប្រើប្រាស់គេហទំព័ររបស់អ្នកនឹងមិនបំពានលើច្បាប់ ឬបទប្បញ្ញត្តិជាធរមានណាមួយឡើយ។</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">៤. ការចុះឈ្មោះអ្នកប្រើប្រាស់</h2>
                                <p>អ្នកអាចត្រូវបានតម្រូវឱ្យចុះឈ្មោះជាមួយគេហទំព័រ។ អ្នកយល់ព្រមរក្សាពាក្យសម្ងាត់របស់អ្នកជាសម្ងាត់ ហើយអ្នកនឹងទទួលខុសត្រូវរាល់ការប្រើប្រាស់គណនី និងពាក្យសម្ងាត់របស់អ្នក។ យើងរក្សាសិទ្ធិក្នុងការលុប ដកយកមកវិញ ឬផ្លាស់ប្តូរឈ្មោះអ្នកប្រើប្រាស់ដែលអ្នកបានជ្រើសរើស ប្រសិនបើយើងសម្រេចតាមឆន្ទានុសិទ្ធិរបស់យើងតែម្នាក់ឯងថាឈ្មោះអ្នកប្រើប្រាស់នោះមិនសមរម្យ អាសអាភាស ឬមានការជំទាស់។</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">៥. សកម្មភាពហាមឃាត់</h2>
                                <p>អ្នកមិនអាចចូលប្រើប្រាស់ ឬប្រើប្រាស់គេហទំព័រសម្រាប់គោលបំណងណាមួយក្រៅពីអ្វីដែលយើងបានធ្វើឱ្យមាននោះទេ។ គេហទំព័រប្រហែលជានឹងមិនត្រូវបានប្រើប្រាស់ទាក់ទងនឹងការខិតខំប្រឹងប្រែងផ្នែកពាណិជ្ជកម្មណាមួយឡើយ លើកលែងតែមានការគាំទ្រ ឬអនុម័តជាពិសេសពីយើង។</p>
                                <p className="mt-4">ក្នុងនាមជាអ្នកប្រើប្រាស់គេហទំព័រ អ្នកយល់ព្រមថាមិន៖</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>ទាញយកទិន្នន័យ ឬខ្លឹមសារផ្សេងទៀតពីគេហទំព័រជាប្រព័ន្ធ ដើម្បីបង្កើត ឬចងក្រង ដោយផ្ទាល់ ឬដោយប្រយោល នូវបណ្តុំ ការចងក្រង មូលដ្ឋានទិន្នន័យ ឬថតឯកសារដោយគ្មានការអនុញ្ញាតជាលាយលក្ខណ៍អក្សរពីយើង។</li>
                                    <li>បោកបញ្ឆោត ឬបំភាន់យើង និងអ្នកប្រើប្រាស់ផ្សេងទៀត ជាពិសេសក្នុងការព្យាយាមស្វែងយល់ពីព័ត៌មានគណនីដ៏រសើប ដូចជាពាក្យសម្ងាត់របស់អ្នកប្រើប្រាស់ជាដើម។</li>
                                    <li>គេចវេស បិទ ឬរំខានដល់មុខងារទាក់ទងនឹងសុវត្ថិភាពនៃគេហទំព័រ។</li>
                                    <li>បង្អាប់ បង្ខូចកេរ្តិ៍ឈ្មោះ ឬបង្កគ្រោះថ្នាក់ក្នុងគំនិតរបស់យើង មកលើយើង និង/ឬគេហទំព័រ។</li>
                                    <li>ប្រើប្រាស់ព័ត៌មានណាមួយដែលទទួលបានពីគេហទំព័រ ដើម្បីបៀតបៀន រំលោភបំពាន ឬបង្កគ្រោះថ្នាក់ដល់អ្នកដទៃ។</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">៦. ការកែប្រែ និងការរំខាន</h2>
                                <p>យើងរក្សាសិទ្ធិក្នុងការផ្លាស់ប្តូរ កែប្រែ ឬលុបខ្លឹមសារនៃគេហទំព័រនៅពេលណាក៏បាន ឬដោយហេតុផលណាមួយតាមឆន្ទានុសិទ្ធិរបស់យើងដោយមិនចាំបាច់ជូនដំណឹងជាមុន។ ទោះជាយ៉ាងណាក៏ដោយ យើងមិនមានកាតព្វកិច្ចក្នុងការធ្វើបច្ចុប្បន្នភាពព័ត៌មានណាមួយនៅលើគេហទំព័ររបស់យើងនោះទេ។ យើងក៏រក្សាសិទ្ធិក្នុងការកែប្រែ ឬបញ្ឈប់ផ្នែកទាំងអស់ ឬមួយផ្នែកនៃគេហទំព័រដោយមិនមានការជូនដំណឹងនៅពេលណាមួយ។ យើងនឹងមិនទទួលខុសត្រូវចំពោះអ្នក ឬភាគីទីបីណាមួយឡើយ ចំពោះការកែប្រែ ការផ្លាស់ប្តូរតម្លៃ ការផ្អាក ឬការបញ្ឈប់ដំណើរការគេហទំព័រ។</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">៧. ទំនាក់ទំនងមកយើង</h2>
                                <p>ដើម្បីដោះស្រាយពាក្យបណ្តឹងទាក់ទងនឹងគេហទំព័រ ឬទទួលបានព័ត៌មានបន្ថែមទាក់ទងនឹងការប្រើប្រាស់គេហទំព័រ សូមទាក់ទងមកយើងតាមរយៈ៖</p>
                                <p className="mt-4">
                                    <strong>អ៊ីមែល៖</strong> support@monea.com<br />
                                    <strong>ទូរស័ព្ទ៖</strong> +855 (0) 12 345 678
                                </p>
                            </section>
                        </div>
                    </main>

                    {/* Minimal Footer */}
                    <footer className="border-t border-white/10 py-8">
                        <div className="container mx-auto px-6 text-center">
                            <p className="text-white/30 text-sm">© {new Date().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'Asia/Phnom_Penh' })} MONEA. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </PageTransition>
        </SmoothScroll>
    );
}
