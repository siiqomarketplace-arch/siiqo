// src/types/creditRecord.ts

import { jsPDF } from "jspdf";

export interface CreditRecordItem {
    id: string;
    customerName: string;
    customerPhone: string;
    amount: number;
    description: string;
    dateCreated: string;
    dueDate: string;
    status: "pending" | "paid" | "overdue" | "deleted";
    paymentProbability?: number;
    riskScore?: number;
    aiInsights?: string[];
}

export interface CreditRecordData {
    businessName?: string; // Optional: if you want to include business info in credit report header
    businessAddress?: string; // Optional
    businessPhone?: string; // Optional
    credits: CreditRecordItem[];
    totalPending: number;
    totalCollected: number;
    generationDate: string; // The formatted date/time for the report
}

// Function signature for PDF generator functions for credit records
export type CreditRecordPdfGeneratorFunction = (data: CreditRecordData) => jsPDF;
