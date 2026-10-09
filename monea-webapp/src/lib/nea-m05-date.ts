import copy from "@/i18n/nea-m05.json";

type Locale = keyof typeof copy;

function toKhmerDigits(value: number): string {
    return String(value).replace(/\d/g, (digit) => "០១២៣៤៥៦៧៨៩"[Number(digit)]);
}

export function formatNeaM05DateParts(date: Date, locale: Locale): string[] {
    const text = copy[locale];
    return [
        text.weekdays[date.getDay()],
        locale === "km" ? toKhmerDigits(date.getDate()) : String(date.getDate()),
        text.months[date.getMonth()],
        locale === "km" ? toKhmerDigits(date.getFullYear()) : String(date.getFullYear()),
    ];
}

export function formatNeaM05Date(date: Date, locale: Locale): string {
    const [weekday, day, month, year] = formatNeaM05DateParts(date, locale);
    return locale === "km"
        ? `${weekday} ${day} ${month} ${year}`
        : `${weekday}, ${month} ${day}, ${year}`;
}
