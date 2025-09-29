

import { jsPDF } from "jspdf";

// types/invoice.ts
export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number | null;
    unit_price: number | null;
}

export interface InvoiceData {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessLogo: string | null; // <--- THIS NEW PROPERTY IS CRUCIAL
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    items: InvoiceItem[];
    discount: number | null;
    tax: number | null;
    total: number;
    invoiceType: "invoice" | "receipt" | "";
    bankName: string;
    accountName: string;
    accountNumber: string;
}

export interface AddTextOptions {
    x: number;
    align?: 'left' | 'center' | 'right';
    lineHeight?: number;
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    fontFamily?: string;
    textColor?: [number, number, number];
}

export interface YCursor {
    current: number;
}

// export type PdfGeneratorFunction = (data: InvoiceData) => jsPDF;

export type PdfGeneratorFunction = (data: InvoiceData) => Promise<Blob>;