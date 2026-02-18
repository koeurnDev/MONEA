import React from 'react';

export default function FontTestPage() {
    return (
        <div className="p-10 space-y-8 bg-white text-black min-h-screen">
            <h1 className="text-4xl font-bold mb-4">Font System Check</h1>

            <section className="space-y-4 border-b pb-8">
                <h2 className="text-2xl text-gray-500 uppercase tracking-wider">Moul (Headings) - variable: --font-kantumruy</h2>
                <div className="space-y-2">
                    <p className="font-kantumruy text-4xl">ពិធីមង្គលការ (4xl)</p>
                    <p className="font-kantumruy text-2xl">សិរីសួស្តី ជ័យមង្គល (2xl)</p>
                    <p className="font-kantumruy text-base">សូមស្វាគមន៍មកកាន់គេហទំព័រ (base)</p>
                    <p className="font-kantumruy text-2xl">Testing 'font-kantumruy' alias: ពិធីមង្គលការ</p>
                </div>
            </section>

            <section className="space-y-4 border-b pb-8">
                <h2 className="text-2xl text-gray-500 uppercase tracking-wider">Kantumruy Pro (Body) - variable: --font-kantumruy</h2>
                <div className="space-y-2 font-sans">
                    <p className="font-light">Weight 300: នេះគឺជាអក្សរស្រាល (Light)</p>
                    <p className="font-normal">Weight 400: នេះគឺជាអក្សរធម្មតា (Normal)</p>
                    <p className="font-medium">Weight 500: នេះគឺជាអក្សរមធ្យម (Medium)</p>
                    <p className="font-semibold">Weight 600: នេះគឺជាអក្សរពាក់កណ្តាលដិត (SemiBold)</p>
                    <p className="font-bold">Weight 700: នេះគឺជាអក្សរដិត (Bold)</p>
                </div>
                <div className="mt-4">
                    <p className="font-khmer text-xl">Testing 'font-khmer' alias: នេះគឺជាអក្សរខ្មែរ</p>
                </div>
            </section>

            <section className="space-y-4 border-b pb-8">
                <h2 className="text-2xl text-gray-500 uppercase tracking-wider">Suwannaphum (Optional) - variable: --font-suwannaphum</h2>
                <div className="space-y-2">
                    <p className="font-suwannaphum text-2xl">អក្សរសម្រាប់អត្ថបទវែងៗ (Suwannaphum)</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl text-gray-500 uppercase tracking-wider">Latin / Script Fonts</h2>
                <div className="space-y-2">
                    <p className="font-great-vibes text-4xl">Great Vibes: Mr. & Mrs. Smith</p>
                    <p className="font-playfair text-4xl">Playfair Display: Wedding Invitation</p>
                    <p className="font-handwriting text-4xl">Dancing Script: Save the Date</p>
                </div>
            </section>
        </div>
    );
}
