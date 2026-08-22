"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CalendarIcon, MapPin, User, Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { moneaClient } from "@/lib/api-client";

const formSchema = z.object({
    groomName: z.string().min(2, "សូមបញ្ចូលឈ្មោះកូនកំលោះ"),
    brideName: z.string().min(2, "សូមបញ្ចូលឈ្មោះកូនក្រមុំ"),
    date: z.date({ message: "សូមជ្រើសរើសកាលបរិច្ឆេទ" }),
    location: z.string().optional(),
});

export default function CreateWeddingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            groomName: "",
            brideName: "",
            location: "",
        },
    });

    const { watch, trigger, setValue } = form;
    const formData = watch();

    const nextStep = async () => {
        let valid = false;
        if (step === 1) {
            valid = await trigger(["groomName", "brideName"]);
        } else if (step === 2) {
            valid = await trigger(["date"]);
        }

        if (valid) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    async function onSubmit() {
        setIsLoading(true);
        // Ensure all fields are valid
        const valid = await trigger();
        if (!valid) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await moneaClient.post<any>("/api/wedding", formData);

            if (res.status === 200 || res.status === 201) {
                await mutate("/api/auth/me");
                router.push("/dashboard");
                router.refresh();
            } else {
                console.error(`Failed to create wedding: Status ${res.status}`, res.error);
                
                if (res.error === "Wedding already exists" || res.status === 409) {
                    await mutate("/api/auth/me");
                    router.push("/dashboard");
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 py-10">
            <Card className="w-full max-w-lg border border-border shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                        <Heart className="w-6 h-6 text-red-600 fill-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold font-kantumruy">
                        {step === 1 && "ឈ្មោះគូស្នេហ៍"}
                        {step === 2 && "កាលបរិច្ឆេទសំខាន់"}
                        {step === 3 && "ទីតាំងនិងបញ្ចប់"}
                    </CardTitle>
                    <CardDescription>
                        ជំហានទី {step} នៃ 3
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Step 1: Names */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label>ឈ្មោះកូនកំលោះ (Groom)</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            className="pl-10 h-12 text-lg bg-background border-border"
                                            placeholder="ឈ្មោះកូនកំលោះ"
                                            value={formData.groomName}
                                            onChange={(e) => setValue("groomName", e.target.value)}
                                        />
                                    </div>
                                    {form.formState.errors.groomName && <p className="text-red-500 text-sm">{form.formState.errors.groomName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>ឈ្មោះកូនក្រមុំ (Bride)</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            className="pl-10 h-12 text-lg bg-background border-border"
                                            placeholder="ឈ្មោះកូនក្រមុំ"
                                            value={formData.brideName}
                                            onChange={(e) => setValue("brideName", e.target.value)}
                                        />
                                    </div>
                                    {form.formState.errors.brideName && <p className="text-red-500 text-sm">{form.formState.errors.brideName.message}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Date */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center">
                                <Label className="self-start">ជ្រើសរើសថ្ងៃមង្គលការ</Label>
                                <Calendar
                                    mode="single"
                                    selected={formData.date}
                                    onSelect={(date) => date && setValue("date", date)}
                                    className="rounded-md border border-border shadow p-4 w-full flex justify-center bg-card"
                                    classNames={{
                                        day_selected: "bg-red-600 text-white hover:bg-red-600 focus:bg-red-600"
                                    }}
                                />
                                {form.formState.errors.date && <p className="text-red-500 text-sm">{form.formState.errors.date.message}</p>}
                            </div>
                        )}

                        {/* Step 3: Location & Finish */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label>ទីតាំង (តំណរភ្ជាប់ Google Maps)</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            className="pl-10 h-12 bg-background border-border"
                                            placeholder="https://maps.app.goo.gl/..."
                                            value={formData.location}
                                            onChange={(e) => setValue("location", e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground/60">អ្នកអាចដាក់ទីតាំងនៅពេលក្រោយបាន</p>
                                </div>

                                <div className="rounded-lg bg-muted/50 p-4 space-y-3 border border-border">
                                    <h4 className="font-semibold text-foreground">សូមពិនិត្យព័ត៌មាន៖</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        <span>កូនកំលោះ:</span>
                                        <span className="font-medium text-foreground">{formData.groomName}</span>
                                        <span>កូនក្រមុំ:</span>
                                        <span className="font-medium text-foreground">{formData.brideName}</span>
                                        <span>កាលបរិច្ឆេទ:</span>
                                        <span className="font-medium text-foreground">{formData.date ? format(formData.date, 'dd MMM yyyy') : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-6">
                    {step > 1 ? (
                        <Button variant="outline" onClick={prevStep} className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> ត្រឡប់
                        </Button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step < 3 ? (
                        <Button onClick={nextStep} className="gap-2 bg-red-600 hover:bg-red-700">
                            បន្ទាប់ <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={onSubmit} disabled={isLoading} className="gap-2 bg-red-600 hover:bg-red-700 min-w-[120px]">
                            {isLoading ? "កំពុងបង្កើត..." : "បញ្ចប់ & បង្កើត"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
