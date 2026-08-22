interface Activity {
    id: string;
    time: string;
    title: string;
    description?: string | null;
}

interface TimelineProps {
    activities: Activity[];
}

export default function Timeline({ activities }: TimelineProps) {
    return (
        <section className="p-6 bg-zinc-950 text-white font-siemreap">
            <h3 className="text-center text-pink-500 text-xl mb-8 font-kantumruy underline underline-offset-8 decoration-pink-500/30 text-wedding-title">
                កម្មវិធីបុណ្យ
            </h3>

            {activities.length > 0 ? (
                <div className="space-y-6 max-w-sm mx-auto">
                    {activities.map((event) => (
                        <div key={event.id} className="flex items-start gap-4 group">
                            {/* Time Badge */}
                            <div className="bg-pink-900/30 border border-pink-500/30 text-pink-400 text-xs px-3 py-1.5 rounded-full font-bold shrink-0 mt-0.5 min-w-[85px] text-center">
                                {event.time}
                            </div>

                            {/* Content */}
                            <div className="border-l-2 border-pink-500/20 pl-4 py-1 pb-4 group-last:border-l-0">
                                <h4 className="text-base font-bold text-gray-100 mb-1">{event.title}</h4>
                                {event.description && (
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {event.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-10">
                    មិនទាន់មានកម្មវិធីលម្អិត
                </div>
            )}
        </section>
    );
}
