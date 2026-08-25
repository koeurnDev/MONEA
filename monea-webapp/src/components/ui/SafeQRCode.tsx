import React from "react";
import QRCode from "react-qr-code";

export interface SafeQRCodeProps extends React.SVGProps<SVGSVGElement> {
    value: string;
    size?: number;
    bgColor?: string;
    fgColor?: string;
    level?: "L" | "M" | "Q" | "H";
    title?: string;
}

/**
 * Universal Safe QRCode component that seamlessly handles ESM/CJS interop in Vite & React 19.
 */
export const SafeQRCode: React.FC<SafeQRCodeProps> = (props) => {
    const Component: any = (QRCode as any)?.default || QRCode;
    return <Component {...props} />;
};

export default SafeQRCode;
