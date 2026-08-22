declare module '@otplib/preset-browser' {
    export const authenticator: {
        generateSecret(): string;
        keyuri(user: string, service: string, secret: string): string;
        check(token: string, secret: string): boolean;
        generate(secret: string): string;
        verify(options: { token: string; secret: string }): boolean;
    };
    export const totp: {
        generate(secret: string): string;
        check(token: string, secret: string): boolean;
        verify(options: { token: string; secret: string }): boolean;
    };
    export const hotp: {
        generate(secret: string, counter: number): string;
        check(token: string, secret: string, counter: number): boolean;
    };
}
