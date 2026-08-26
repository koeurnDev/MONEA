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
    fileName = "wedding-invitation.ics"
}: {
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    fileName?: string;
}) {
    const end = endDate || new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
    const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//MONEA Platform//Wedding Invitation//KM",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@monea.com`,
        `DTSTAMP:${formatTime(new Date())}`,
        `DTSTART:${formatTime(startDate)}`,
        `DTEND:${formatTime(end)}`,
        `SUMMARY:${title.replace(/\n/g, "\\n")}`,
        `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
        `LOCATION:${location.replace(/\n/g, "\\n")}`,
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
