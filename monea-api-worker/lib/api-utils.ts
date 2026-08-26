import { ZodError, ZodSchema } from "zod";

/**
 * Standard API error response helper — CF Workers & Edge compatible.
 * Uses Web standard Response (no NextResponse dependency).
 */
export function errorResponse(message: string, status: number = 500, errors?: any) {
    const sanitizedDetails = process.env.NODE_ENV === "production" && errors
        ? "Internal validation error"
        : errors;

    return Response.json(
        {
            error: message,
            ...(sanitizedDetails && { details: sanitizedDetails }),
            timestamp: new Date().toISOString(),
        },
        { status },
    );
}

/**
 * Validates request body against a Zod schema — CF Workers compatible.
 */
export async function validateRequest<T>(req: Request, schema: ZodSchema<T>): Promise<{ data?: T; error?: Response }> {
    try {
        const body = await req.json();
        const data = schema.parse(body);
        return { data };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                error: errorResponse("Validation Failed", 400, error.issues.map(e => ({ path: e.path, message: e.message }))),
            };
        }
        return { error: errorResponse("Invalid JSON payload", 400) };
    }
}
