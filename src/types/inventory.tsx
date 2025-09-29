
// import { jsPDF } from "jspdf";

// export interface InventoryItemPdf {
//     id: number;
//     name: string;
//     model: string;
//     currentStock: number;
//     minStock: number;
//     unitPrice: number;
//     category: string;
//     lastRestocked: string;
//     salesThisMonth?: number;
// }

// export interface OrderPdf {
//     id: string;
//     supplier: string;
//     items: string;
//     status: string;
//     expectedDelivery: string;
//     totalValue: number;
// }

// export interface InventoryReportData {
//     reportType: 'inventory';
//     inventoryItems: InventoryItemPdf[];
//     generationDate: string;
//     businessName?: string;
//     businessAddress?: string;
//     businessPhone?: string;
// }

// export interface OrderReportData {
//     reportType: 'orders';
//     orders: OrderPdf[];
//     generationDate: string;
//     businessName?: string;
//     businessAddress?: string;
//     businessPhone?: string;
// }

// export type InventoryAndOrderReportData = InventoryReportData | OrderReportData;

// export type InventoryOrderPdfGeneratorFunction = (data: InventoryAndOrderReportData) => jsPDF;


export interface InventoryItemPdf {
    id: number | string;
    name: string;
    model: string;
    currentStock: number;
    minStock: number;
    unitPrice: number;
    category: string;
    lastRestocked: string;
    salesThisMonth: number;
}

export interface OrderPdf {
    id: string;
    supplier: string;
    items: string;
    status: string;
    expectedDelivery: string;
    totalValue: number;
}

// Base report data interface
interface BaseReportData {
    generationDate: string;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessLogo?: string | null; // <--- ADD THIS
}

export interface InventoryReportData extends BaseReportData {
    reportType: 'inventory';
    inventoryItems: InventoryItemPdf[];
}

export interface OrderReportData extends BaseReportData {
    reportType: 'orders';
    orders: OrderPdf[];
}

export type InventoryAndOrderReportData = InventoryReportData | OrderReportData;

export type InventoryOrderPdfGeneratorFunction = (data: InventoryAndOrderReportData) => Promise<Blob>;