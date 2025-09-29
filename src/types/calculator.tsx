// // // src/types/calculationReport.ts

// // import { jsPDF } from "jspdf";

// // export interface CalculationReportData {
// //     productCategory: string;
// //     costPerItemNum: number;
// //     quantityNum: number;
// //     shippingCostNum: number;
// //     otherExpensesNum: number;
// //     profitMarginNum: number;
// //     totalItemCost: number;
// //     totalCost: number;
// //     profitAmount: number;
// //     suggestedSellingPrice: number;
// //     pricePerItem: number;
// //     netProfit: number;
// //     generationDate: string; // For the "CalculatorDate" part
// // }

// // // Function signature for PDF generator functions for calculation reports
// // export type CalculationReportPdfGeneratorFunction = (data: CalculationReportData) => jsPDF;


// // src/types/calculator.ts

// export interface ItemCalculationData {
//     id: string; // Unique ID for React keys and identifying items
//     productCategory: string;
//     costPerItemNum: number;
//     quantityNum: number;
//     itemTotalCost: number; // Base cost for this item (costPerItemNum * quantityNum)
//     itemProfitAmount: number; // Profit derived for this item based on global margin
//     itemSuggestedSellingPrice: number; // Selling price for this item (itemTotalCost + itemProfitAmount)
//     pricePerUnit: number; // itemSuggestedSellingPrice / quantityNum
// }

// export interface CalculationReportData {
//     // Global inputs/parameters
//     profitMarginNum: number;
//     shippingCostNum: number;
//     otherExpensesNum: number;

//     // Array of detailed item calculations
//     items: ItemCalculationData[];

//     // Summary totals (pre-calculated for convenience in components/PDF)
//     totalItemsBaseCost: number; // Sum of all itemTotalCost from `items`
//     totalItemsProfit: number; // Sum of all itemProfitAmount from `items`
//     totalItemsRevenueBeforeGlobalExpenses: number; // Sum of all itemSuggestedSellingPrice from `items`

//     // Final consolidated figures for the entire calculation
//     totalExpenditure: number; // totalItemsBaseCost + shippingCostNum + otherExpensesNum (total money spent)
//     finalSuggestedSellingPrice: number; // totalItemsRevenueBeforeGlobalExpenses + shippingCostNum + otherExpensesNum (total money to be received)
//     overallNetProfit: number; // finalSuggestedSellingPrice - totalExpenditure (should equal totalItemsProfit)

//     generationDate: string;
// }




export interface ItemCalculationData {
    id: string;
    productCategory: string;
    costPerItemNum: number;
    quantityNum: number;
    itemTotalCost: number;
    itemProfitAmount: number;
    itemSuggestedSellingPrice: number;
    pricePerUnit: number;
}

export interface CalculationReportData {
    profitMarginNum: number;
    shippingCostNum: number;
    otherExpensesNum: number;
    items: ItemCalculationData[];
    totalItemsBaseCost: number;
    totalItemsProfit: number;
    totalItemsRevenueBeforeGlobalExpenses: number;
    totalExpenditure: number;
    finalSuggestedSellingPrice: number;
    overallNetProfit: number;
    generationDate: string;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessLogo?: string | null; // <--- ADD THIS
}

export type CalculationPdfGeneratorFunction = (data: CalculationReportData) => Promise<Blob>;