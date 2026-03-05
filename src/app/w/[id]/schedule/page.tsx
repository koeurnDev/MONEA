import { prisma } from "@/lib/prisma";
import { Clock, Calendar, MapPin } from "lucide-react";

async function getActivities(weddingId: string) {
    return await prisma.activity.findMany({
        where: { weddingId },
        orderBy: { order: 'asc' },
    });
}

export default async function SchedulePage({ params }: { params: { id: string } }) {
    const activities = await getActivities(params.id);

    return (
        <div className="min-h-screen bg-[#FFFDF5] p-4 pb-24">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-moul text-red-900">កម្មវិធីការ</h1>
                    {/* Add back button or home link if needed */}
                </div>

                {activities.length > 0 ? (
                    <div className="relative border-l-2 border-red-200 ml-4 space-y-8">
                        {activities.map((activity, index) => (
                            <div key={activity.id} className="relative pl-6">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-600 border-2 border-[#FFFDF5]"></div>

                                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
                                    <div className="flex items-center gap-2 text-red-600 font-bold font-siemreap mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{activity.time}</span>
                                    </div>
                                    <h3 className="text-lg font-moul text-gray-800 mb-2">{activity.title}</h3>
                                    {activity.description && (
                                        <p className="text-gray-600 text-sm font-siemreap leading-relaxed">
                                            {activity.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-red-200 mx-auto mb-4" />
                        <h3 className="text-xl font-moul text-gray-400 mb-2">មិនទាន់មានកម្មវិធី</h3>
                        <p className="text-gray-400 font-siemreap">សូមរង់ចាំការអាប់ដេតពេលក្រោយ</p>
                    </div>
                )}
            </div>
        </div>
    );
}
