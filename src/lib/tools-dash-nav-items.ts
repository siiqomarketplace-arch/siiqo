
import {
    Users,
    Receipt,
    CreditCard,
    Package,
    Settings,
    ShoppingBag,
    Truck,
    LayoutDashboard,
    FileText,
    Briefcase
} from "lucide-react";
import React from "react";

interface NavItem {
    id: string;
    label: string;
    allow: string[];
    icon: React.ElementType;
}

export const navItems: NavItem[] = [
    { id: "overview", label: "Overview", allow: ["user", "admin"], icon: LayoutDashboard },
    { id: "users", label: "Users", allow: ["admin"], icon: Users },
    { id: "businesses", label: "Businesses", allow: ["admin"], icon: Briefcase },
    { id: "invoices", label: "Invoices", allow: ["user", "admin"], icon: FileText },
    { id: "receipts", label: "Receipts", allow: ["user", "admin"], icon: Receipt },
    { id: "credits", label: "Credits", allow: ["user", "admin"], icon: CreditCard },
    { id: "products", label: "Products", allow: ["user", "admin"], icon: Package },
    { id: "inventory", label: "Inventory", allow: ["user", "admin"], icon: ShoppingBag },
    { id: "orders", label: "Orders", allow: ["user", "admin"], icon: Truck },
    { id: "settings", label: "Settings", allow: ["user", "admin"], icon: Settings },
];