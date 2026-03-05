import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

/**
 * Standard API error response helper
 */
export function errorResponse(message: string, status: number = 500, errors?: any) {
    // Filter out potentially sensitive internal error details in production
    const sanitizedDetails = process.env.NODE_ENV === "production" && errors
        ? "Internal validation error"
        : errors;

    return NextResponse.json(
        {
            error: message,
            ...(sanitizedDetails && { details: sanitizedDetails }),
            timestamp: new Date().toISOString()
        },
        { status }
    );
}

/**
 * Validates request body against a Zod schema
 */
export async function validateRequest<T>(req: Request, schema: ZodSchema<T>): Promise<{ data?: T; error?: NextResponse }> {
    try {
        const body = await req.json();
        const data = schema.parse(body);
        return { data };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                error: errorResponse("Validation Failed", 400, error.issues.map(e => ({ path: e.path, message: e.message })))
            };
        }
        return { error: errorResponse("Invalid JSON payload", 400) };
    }
}
