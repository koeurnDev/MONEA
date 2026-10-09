/**
 * Utilities for adding wedding events to Google Calendar and Apple / Outlook (.ics)
 */

export function generateGoogleCalendarUrl({
    title,
    description,
    location,
    startDate,
    endDate
}: {
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate?: Date;
}): string {
    const end = endDate || new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // default 4 hours duration
    const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        details: description,
        location: location,
        dates: `${formatTime(startDate)}/${formatTime(end)}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile({
    title,
    description,
    location,
    startDate,
    endDate,
    fileName = "wedding-invitation.ics",
    allDay = false
}: {
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    fileName?: string;
    allDay?: boolean;
}) {
    const end = endDate || new Date(startDate.getTime() + (allDay ? 24 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000));
    const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");
    const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
    const escapeText = (value: string) => value
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//MONEA Platform//Wedding Invitation//KM",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@monea.com`,
        `DTSTAMP:${formatTime(new Date())}`,
        `${allDay ? "DTSTART;VALUE=DATE" : "DTSTART"}:${allDay ? formatDate(startDate) : formatTime(startDate)}`,
        `${allDay ? "DTEND;VALUE=DATE" : "DTEND"}:${allDay ? formatDate(end) : formatTime(end)}`,
        `SUMMARY:${escapeText(title)}`,
        `DESCRIPTION:${escapeText(description)}`,
        `LOCATION:${escapeText(location)}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
