type CalendarEvent = {
    title: string;
    description?: string;
    location?: string;
    startTime: string | Date; // ISO string or Date object
    endTime?: string | Date;
    durationHours?: number;
};

export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
    const start = new Date(event.startTime);
    const end = event.endTime
        ? new Date(event.endTime)
        : new Date(start.getTime() + (event.durationHours || 4) * 60 * 60 * 1000);

    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${formatDate(start)}/${formatDate(end)}`,
        details: event.description || "",
        location: event.location || "",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const downloadIcsFile = (event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const end = event.endTime
        ? new Date(event.endTime)
        : new Date(start.getTime() + (event.durationHours || 4) * 60 * 60 * 1000);

    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `DTSTART:${formatDate(start)}`,
        `DTEND:${formatDate(end)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ""}`,
        `LOCATION:${event.location || ""}`,
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "wedding-event.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
