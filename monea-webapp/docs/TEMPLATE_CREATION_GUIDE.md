# MONEA: បង្កើត Template ថ្មី

ឯកសារនេះណែនាំ flow បច្ចុប្បន្នសម្រាប់បន្ថែម invitation template ក្នុង `monea-webapp`។ Frontend ប្រើ React, TypeScript និង Vite; កុំចម្លងឧទាហរណ៍ Next.js ឬ API ដែលមិនមាននៅក្នុង codebase នេះ។

## ផែនទីឯកសារសំខាន់

| តួនាទី | ឯកសារ |
| --- | --- |
| Props, settings និង configuration contract | `src/components/templates/types.ts` |
| Definitions រួមសម្រាប់ registry និង catalog | `src/components/templates/template-config.ts` |
| Normalization និង visibility helpers | `src/components/templates/shared/template-settings.ts` |
| Renderer រួមសម្រាប់ route ទាំងអស់ | `src/components/templates/TemplateRenderer.tsx` |
| UI ជ្រើស template | `src/app/dashboard/design/components/Step1Template.tsx` |
| Preview និង invitation routes | `src/app/preview/page.tsx`, `src/app/invite/[id]/page.tsx`, `src/app/w/[id]/_components/WeddingDataView.tsx` |
| Layout controls សម្រាប់រូបភាព | `src/app/dashboard/design/hooks/useDesignWizard.ts`, `src/app/dashboard/design/components/Step4Media.tsx` |
| Contract tests | `scripts/template-contract.test.mjs` |

`TEMPLATE_DEFINITIONS` ក្នុង `template-config.ts` ជា source of truth តែមួយសម្រាប់ metadata និង lazy component។ `TEMPLATE_REGISTRY` និង `TEMPLATE_CATALOG` ត្រូវបានបង្កើតពី definitions នោះ។ ប្រើ `selectable: false` សម្រាប់ template ដែលមិនបង្ហាញក្នុង wizard តាម catalog ឋិតិវន្ត។ Availability ដែល Admin គ្រប់គ្រងអាចបើក template ទាំងនោះសម្រាប់ការជ្រើសរើសថ្មីបាន។

> ចំណាំ៖ availability សម្រាប់ជ្រើសរើសថ្មីត្រូវបានរក្សាទុកក្នុង API Worker តាម `lib/template-availability.ts` ហើយគ្រប់គ្រងតាម `/admin/master/templates`។ ពេលបន្ថែម template ត្រូវបន្ថែម ID ទៅ availability defaults និង contract test របស់ Worker ផងដែរ។ ការបិទ template លាក់វាពីការជ្រើសរើសថ្មី ប៉ុន្តែមិនប៉ះពាល់ដល់ invitation ដែលកំពុងប្រើវាទេ។ មុន deploy API Worker ដែលប្រើ field នេះ ត្រូវអនុវត្ត `drizzle/migrations/0002_template_availability.sql` លើ database ជាមុន។

Platform Owner អាចកែឈ្មោះ, ពិពណ៌នា, cover និងប្រភេទកម្មវិធីរបស់ template តាមទំព័រគ្រប់គ្រងដដែល។ ទិន្នន័យនេះត្រូវបានរក្សាទុកក្នុង `SystemConfig.templateMetadata` ហើយបង្ហាញក្នុង picker ពេល runtime; កុំប្តូរ `id` ឬសន្មត់ថា metadata អាចប្តូរ layout របស់ component បាន។ Cover ថ្មីត្រូវបាន upload ទៅ Cloudinary folder `template-covers`; រក្សាទុក URL HTTPS ពី Cloudinary តែប៉ុណ្ណោះ។

## ជំហានបន្ថែម template

### 1. កំណត់ `id` និងរៀបចំ component

ប្រើ `kebab-case` សម្រាប់ ID ដែលមានស្ថិរភាព និងកុំប្តូរវាបន្ទាប់ពីបានរក្សាទុកក្នុងទិន្នន័យអតិថិជន។ ដាក់ component មេនៅ `src/components/templates/` ហើយបំបែក section ជាឯកសាររងក្នុង folder ដែលមានឈ្មោះដូច ID នៅពេលសមស្រប។

```tsx
import type { TemplateProps } from "./types";
import { isSectionVisible } from "./shared/template-settings";

export default function MyNewTemplate({ wedding, guestName, config }: TemplateProps) {
    const showTimeline = isSectionVisible(config, "timeline");

    return (
        <main className="mx-auto min-h-screen w-full max-w-[540px]">
            {showTimeline && wedding.activities.length > 0 && (
                <section aria-label={config.labels.scheduleTitle || "Schedule"}>
                    {/* Render this template's schedule design. */}
                </section>
            )}
        </main>
    );
}
```

ប្រើ `TemplateProps` ពី `types.ts`; កុំបង្កើត WeddingData type ស្ទួន។ `wedding.themeSettings` និង field ជាច្រើនអាចទទេ ឬ `null` បាន ដូច្នេះប្រើ optional chaining និង fallback តាមតម្រូវការ។

### 2. បន្ថែមក្នុង definitions រួម

ក្នុង `src/components/templates/template-config.ts` បន្ថែម entry មួយក្នុង `TEMPLATE_DEFINITIONS` ដោយដាក់ metadata និង component ជាមួយគ្នា៖

```ts
"my-new-template": {
    code: "M-XX",
    id: "my-new-template",
    title: "ឈ្មោះបង្ហាញ",
    description: "ការពិពណ៌នាខ្លី",
    eventType: "both",
    image: "/images/templates/my-new-template/thumbnail.webp",
    primaryColor: "#A27A43",
    isFree: false,
    comingSoon: false,
    selectable: true,
    component: lazy(() => import("./MyNewTemplate")),
},
```

Component ត្រូវមាន default export និងប្រើ `TemplateProps` ដែលរួមមាន `wedding`, `config`, និង `guestName`។ កុំបន្ថែម entry ដាច់ដោយឡែកទៅ registry ឬ catalog។ រូបដែលយោងដោយ path `/...` ត្រូវដាក់ក្នុង `public/`។

### 4. ភ្ជាប់ editor controls ដែល template ត្រូវការ

- ពិនិត្យ `TEMPLATE_LAYOUTS` និងការប្រើវាក្នុង `useDesignWizard.ts` / `Step4Media.tsx`។ បន្ថែម layout entry ប្រសិនបើ template មានរូបភាព ឬ crop controls ផ្ទាល់ខ្លួន។
- ពិនិត្យ `Step5Extra.tsx` និង `PreviewSync.tsx` ប្រសិនបើមាន setting ថ្មី ឬការកែ theme ដែលត្រូវបង្ហាញភ្លាមក្នុង live preview។
- កុំបង្កើត field ក្នុង `themeSettings` ដោយគ្មាន type. បន្ថែម field ទៅ `WeddingData` ក្នុង `types.ts` ហើយភ្ជាប់ការរក្សាទុក/preview តាម pattern ដែលមាន។
- ប្រើ `config.labels.scheduleTitle` សម្រាប់ចំណងជើងកម្មវិធី និង `isSectionVisible(config, "timeline")` សម្រាប់ការគ្រប់គ្រងផ្នែក។ កុំអាន legacy key ក្នុង template component; alias ត្រូវបាន normalize នៅ `TemplateRenderer`។
- ប្រើ `GuestbookSection` ពី `src/components/templates/shared/GuestbookSection.tsx` និង `isSectionVisible(config, "guestbook")` ដើម្បីផ្តល់ UI ជូនពរដែលអាចប្រើឡើងវិញបាន។ Component រួមនេះប្រើ `/api/guestbook` សម្រាប់ទាញ និងបញ្ជូនសារ។
- សម្រាប់ឪពុកម្តាយ ប្រើ `themeSettings.parents` ជាមុន ហើយអាចប្រើ `wedding.groomFather` ជា fallback សម្រាប់ទិន្នន័យចាស់។ កុំបង្ហាញ placeholder ឈ្មោះឪពុក ឬម្ដាយ ប្រសិនបើ field ទទេ។

## ស្តង់ដាររចនា និងឥរិយាបថ

- **Mobile-first:** សាកល្បង viewport ទទឹង 360–390px មុន desktop; កុំឲ្យអក្សរខ្មែរ ឬប៊ូតុងកាត់/លើគ្នា។ Invitation គួររក្សាទទឹង content សមរម្យ និងកុំបង្កើត horizontal scroll។
- **Sections ស្រេចចិត្ត:** គោរព `config.visibility` តាម `isSectionVisible` និងលាក់ section ដែលគ្មានទិន្នន័យតាម UX របស់ template។ ប្រើ key canonical `showTimeline`; adapter ទទួលយក `showSchedule` សម្រាប់ទិន្នន័យចាស់ប៉ុណ្ណោះ។
- **Visibility controls:** បង្ហាញ control តាម `visibilityControls` ក្នុង template definition ប៉ុណ្ណោះ។ Template ដែលប្រើ standard controls បង្ហាញ story, gallery, timeline និង guestbook។
- **ព័ត៌មានមាតាបិតា:** បង្ហាញតែឈ្មោះដែលមានតម្លៃពិត (មួយ ឬពីរនាក់ក៏បាន) ហើយលាក់ផ្នែកនោះទាំងមូល ប្រសិនបើគ្រប់ field ទទេ។
- **Story និង gallery:** គោរព toggle `showStory` និងបង្ហាញ section តែពេលមាន story text ឬ story image ដែលអ្នកប្រើបានផ្តល់។
- **Contract validation:** រត់ `npm run test:templates` និង `npm run build` មុនបញ្ចូល template ថ្មី។
- **ពណ៌:** ប្រើ CSS variables/palette helper ឬ setting របស់ template តាម pattern ដែលមាន។ កុំសន្មតថា hard-coded color នឹងធ្វើតាម color picker។
- **រូបភាព:** ប្រើ URL ដែលមានក្នុង wedding data, lazy-load រូបខាងក្រោម fold និងកំណត់ `alt` ដែលមានន័យ (ឬ `alt=""` សម្រាប់រូបតុបតែង)។
- **សំឡេង:** កុំសន្មតថា browser អនុញ្ញាត autoplay។ ចាប់ផ្តើមចាក់តែបន្ទាប់ពី user gesture ហើយរក្សាប៊ូតុងបិទ/បើកឲ្យអាចប្រើបាន។
- **Preview editor:** ពិនិត្យ custom event `FORCE_REVEAL` និង live-preview sync ប្រសិនបើ template មាន envelope ឬ cover screen ដើម្បីឲ្យអ្នករចនាអាចមើល sections ខាងក្នុងបាន។

## ពិនិត្យមុនបញ្ចប់

1. ស្វែងរក ID ថ្មីក្នុង `template-config.ts` និង `index.ts` ហើយធានាថាត្រូវគ្នា។
2. ពិនិត្យវាបង្ហាញក្នុង wizard សម្រាប់ event type ត្រឹមត្រូវ និងអាចជ្រើសរើសបាន។
3. សាកល្បង preview និង public invite ដោយទិន្នន័យពេញ និងទទេ (រួមទាំងឪពុក/ម្ដាយតែម្នាក់)។
4. សាកល្បងលើ mobile និង desktop; ពិនិត្យ story/gallery/visibility, រូបភាព, ពណ៌, map/gift/music តាម feature ដែល template ផ្តល់។
5. ពី `monea-webapp/` រត់៖

```bash
npm run build
```

Build នេះរត់ TypeScript check (`tsc`) មុនបង្កើត production bundle។ បើមាន test ឬ lint ដែលពាក់ព័ន្ធនឹង feature ដែលបានកែ សូមរត់វាបន្ថែម។

## ការរៀបចំរួមដែលគួរកែលម្អ

ការចុះឈ្មោះ template បច្ចុប្បន្នត្រូវកែពីរឯកសារដាច់ពីគ្នា ហើយ template មាន registry/catalog មិនស្មើគ្នា។ កុំផ្លាស់ប្តូររចនាសម្ព័ន្ធនេះដោយស្ងាត់ៗ ព្រោះវាប៉ះពាល់ wizard និង invitation URL។ ការធ្វើឲ្យវាជា registry metadata តែមួយ គួរធ្វើជាការងារដាច់ដោយឡែក មាន migration/test សម្រាប់ ID ដែលបានរក្សាទុករួច និង fallback behavior។
