import type { WeddingData } from "@/components/templates/types";

export type WeddingActivity = NonNullable<WeddingData["activities"]>[number];

export const DEFAULT_WEDDING_ACTIVITIES: WeddingActivity[] = [
    { time: "០៦:៣០ ព្រឹក", title: "ពិធីហែជំនូន", description: "ជួបជុំសាច់ញាតិ និងហែជំនូនចូលរោងជ័យ", icon: null, order: 0 },
    { time: "០៧:៣០ ព្រឹក", title: "ពិធីសូត្រមន្ត", description: "និមន្តព្រះសង្ឃចម្រើនព្រះបរិត្ត និងប្រសិទ្ធពរជ័យ", icon: null, order: 1 },
    { time: "០៨:៣០ ព្រឹក", title: "ពិធីកាត់សក់", description: "ពិធីកាត់សក់បង្កក់សិរីជូនគូស្វាមីភរិយាថ្មី", icon: null, order: 2 },
    { time: "០៩:៣០ ព្រឹក", title: "ពិធីសំពះផ្ទឹម", description: "គោរពតាមប្រពៃណី និងសុំសេចក្តីសុខពីបុព្វការីជន", icon: null, order: 3 },
    { time: "១០:៣០ ព្រឹក", title: "ពិធីបង្វិលពពិល", description: "សាច់ញាតិចូលរួមជូនពរគូស្វាមីភរិយាថ្មី", icon: null, order: 4 },
    { time: "១១:០០ ព្រឹក", title: "ពិធីបាចផ្កាស្លា", description: "បាចផ្កាស្លា និងជូនពរជ័យដល់គូស្វាមីភរិយាថ្មី", icon: null, order: 5 },
    { time: "១១:៣០ ព្រឹក", title: "ពិធីចងដៃ", description: "សាច់ញាតិចងដៃ និងជូនពរជ័យដល់គូស្វាមីភរិយាថ្មី", icon: null, order: 6 },
    { time: "០៥:០០ ល្ងាច", title: "ពិធីជប់លៀង", description: "ទទួលស្វាគមន៍ភ្ញៀវកិត្តិយស និងពិសាភោជនាហារ", icon: null, order: 7 },
];

export const DEFAULT_ENGAGEMENT_ACTIVITIES: WeddingActivity[] = [
    { time: "០៧:០០ ព្រឹក", title: "ជួបជុំគ្រួសារ និងភ្ញៀវកិត្តិយស", description: "ស្វាគមន៍ភ្ញៀវ និងរៀបចំកន្លែងប្រារព្ធពិធី", icon: null, order: 0 },
    { time: "០៨:០០ ព្រឹក", title: "ពិធីសែនព្រេន", description: "រៀបចំពិធីសែនព្រេនតាមទំនៀមទម្លាប់គ្រួសារ", icon: null, order: 1 },
    { time: "០៩:០០ ព្រឹក", title: "ពិធីប្រគល់ចិញ្ចៀន និងជំនូន", description: "គ្រួសារទាំងពីរប្រគល់ចិញ្ចៀន និងជំនូនជូនគូដណ្តឹង", icon: null, order: 2 },
    { time: "១០:០០ ព្រឹក", title: "ពិធីជូនពរ និងថតរូបអនុស្សាវរីយ៍", description: "សាច់ញាតិ និងភ្ញៀវកិត្តិយសចូលរួមជូនពរគូដណ្តឹង", icon: null, order: 3 },
    { time: "១១:០០ ព្រឹក", title: "ពិសាអាហារថ្ងៃត្រង់", description: "អញ្ជើញភ្ញៀវកិត្តិយសពិសាអាហារជាមួយគ្រួសារ", icon: null, order: 4 },
];

export const getDefaultActivitiesForEventType = (eventType: "wedding" | "anniversary") =>
    eventType === "anniversary" ? DEFAULT_ENGAGEMENT_ACTIVITIES : DEFAULT_WEDDING_ACTIVITIES;

export const matchesDefaultActivities = (
    activities: readonly WeddingActivity[],
    defaults: readonly WeddingActivity[],
) =>
    activities.length === defaults.length
    && activities.every((activity, index) =>
        activity.time?.trim() === defaults[index].time?.trim()
        && activity.title?.trim() === defaults[index].title?.trim()
        && (activity.description || "").trim() === (defaults[index].description || "").trim(),
    );
