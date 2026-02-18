const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = "cmlmznhjp0000scw7f0shshg7"; // superadmin@konyg.com

    // 1. Create Wedding
    const wedding = await prisma.wedding.create({
        data: {
            userId,
            groomName: "សារ៉ាត់",
            brideName: "ទេវី",
            location: "សណ្ឋាគារ រ៉េស៊ីដង់ សុខា ភ្នំពេញ",
            date: new Date("2026-12-25T18:00:00Z"),
            eventType: "wedding",
            templateId: "modern-full",
            status: "ACTIVE",
            packageType: "PREMIUM",
            themeSettings: JSON.stringify({
                primaryColor: "#E11D48",
                fontStyle: "modern",
                welcomeMessage: "WELCOME TO OUR WEDDING",
                labels: {
                    galleryTitle: "រូបភាពអនុស្សាវរីយ៍",
                    storyTitle: "ដំណើររឿងរបស់យើង",
                    timelineTitle: "កម្មវិធី",
                    guestbookTitle: "សៀវភៅភ្ញៀវ & ជូនពរ"
                },
                bankAccounts: [
                    { bankName: "ABA", accountName: "SARATH & DEVI", accountNumber: "000 123 456", qrUrl: "" }
                ]
            })
        }
    });

    console.log("Created Wedding:", wedding.id);

    // 2. Create Guests
    const guestsData = [
        { name: "លោក ហេង សំណាង", phone: "012345678", group: "មិត្តភក្តិ", source: "ភ្នំពេញ", hasArrived: true, weddingId: wedding.id },
        { name: "អ្នកស្រី ចាន់ ធីតា", phone: "098765432", group: "គ្រួសារ", source: "សៀមរាប", hasArrived: true, weddingId: wedding.id },
        { name: "លោក ថន សុភ័ក្ត្រ", phone: "011223344", group: "មិត្តរួមការងារ", source: "បាត់ដំបង", hasArrived: false, weddingId: wedding.id },
        { name: "កញ្ញា លី សុជាតា", phone: "077889900", group: "មិត្តភក្តិ", source: "ភ្នំពេញ", hasArrived: true, weddingId: wedding.id },
        { name: "លោក ម៉ៅ វុទ្ធី", phone: "088112233", group: "គ្រួសារ", source: "កណ្តាល", hasArrived: false, weddingId: wedding.id },
    ];

    for (const guest of guestsData) {
        await prisma.guest.create({ data: guest });
    }
    console.log("Created Guests");

    // 3. Create Gifts
    const giftsData = [
        { amount: 50, currency: "USD", method: "ABA", weddingId: wedding.id },
        { amount: 100, currency: "USD", method: "Cash", weddingId: wedding.id },
        { amount: 200000, currency: "KHR", method: "Wing", weddingId: wedding.id },
        { amount: 120000, currency: "KHR", method: "Cash", weddingId: wedding.id },
        { amount: 30, currency: "USD", method: "ABA", weddingId: wedding.id },
    ];

    for (const gift of giftsData) {
        await prisma.gift.create({ data: gift });
    }
    console.log("Created Gifts");

    // 4. Create Guestbook Entries
    const guestbookData = [
        { guestName: "លោក ហេង សំណាង", message: "សូមអោយមានសេចក្តីសុខ និងសុភមង្គលក្នុងជីវិតអាពាហ៍ពិពាហ៍!", weddingId: wedding.id },
        { guestName: "អ្នកស្រី ចាន់ ធីតា", message: "ជូនពរក្មួយៗទាំងពីរស្រលាញ់គ្នារហូតដល់ចាស់កោងខ្នង!", weddingId: wedding.id },
        { guestName: "កញ្ញា លី សុជាតា", message: "Wishing you a lifetime of love and happiness together!", weddingId: wedding.id },
    ];

    for (const entry of guestbookData) {
        await prisma.guestbookEntry.create({ data: entry });
    }
    console.log("Created Guestbook Entries");
}

main().catch(console.error).finally(() => prisma.$disconnect());
