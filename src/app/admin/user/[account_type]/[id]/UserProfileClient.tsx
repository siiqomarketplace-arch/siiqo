// app/admin/user/[account_type]/[id]/UserProfileClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Bell,
  LogOut,
  Loader2,
  User,
  Building2,
  UserCheck,
  Copy,
  Edit,
  Trash2,
  Ban,
  MessageSquare,
  Activity,
  Package,
  DollarSign,
  Star,
  AlertTriangle,
  CheckCircle,
  Eye,
  MoreVertical,
  Calendar,
} from "lucide-react";

// Types
interface UserDetails {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  account_type: string;
  referral_code: string;
  referred_by: string | null;
  business_name?: string;
  business_type?: string;
  kyc_status?: string;
  created_at: string;
  last_login?: string;
  total_orders?: number;
  total_spent?: number;
  total_products?: number;
  total_sales?: number;
  status: string;
}

interface UserProfileClientProps {
  params: {
    account_type: string;
    id: string;
  };
}

const UserProfileClient: React.FC<UserProfileClientProps> = ({ params }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "activity" | "settings"
  >("overview");
  const [alerts, setAlerts] = useState<string[]>([]);

  // Get admin token
  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken");
    }
    return null;
  };

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAdminToken();
    if (!token) {
      router.push("/auth");
      throw new Error("No admin token found");
    }

    const response = await fetch(`https://server.bizengo.com/api${endpoint}`, {
      ...options,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json();
  };

  // Load user data
  const loadUserData = async () => {
    try {
      const data = await apiCall(
        `/admin/users/${params.account_type}/${params.id}`
      );
      setUser(data);
    } catch (error) {
      console.error("Failed to load user data:", error);
      setAlerts((prev) => [...prev, "Failed to load user data"]);
      // Mock data for testing
      setUser({
        id: Number(params.id),
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        role: params.account_type as string,
        account_type: params.account_type as string,
        referral_code: "JD123456",
        referred_by: null,
        business_name:
          params.account_type === "vendor" ? "John's Store" : undefined,
        business_type: params.account_type === "vendor" ? "retail" : undefined,
        kyc_status: params.account_type === "vendor" ? "verified" : undefined,
        created_at: "2024-01-15T10:30:00Z",
        last_login: "2024-09-01T14:20:00Z",
        total_orders: 25,
        total_spent: 1250.0,
        total_products: params.account_type === "vendor" ? 15 : undefined,
        total_sales: params.account_type === "vendor" ? 5000.0 : undefined,
        status: "active",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.account_type && params.id) {
      loadUserData();
    }
  }, [params.account_type, params.id]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("isAdminLoggedIn");
    }
    router.push("/auth");
  };

  const goBack = () => {
    router.push("/admin?tab=users");
  };

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setAlerts((prev) => [...prev, "Referral code copied to clipboard"]);
    }
  };

  const dismissAlert = (index: number) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading user profile...</p>
          <div className="mt-2 h-1 w-32 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested user could not be found.
          </p>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={goBack}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  User Profile
                </h1>
                <p className="text-xs text-gray-500">
                  Admin Dashboard Users {user.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-xl transition-all duration-200">
                <Bell className="h-5 w-5" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="mb-2 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-green-700 text-sm font-medium">
                  {alert}
                </span>
              </div>
              <button
                onClick={() => dismissAlert(index)}
                className="text-green-500 hover:text-green-700 hover:bg-green-100 p-2 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* User Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-3xl">
                  {user.name
                    .split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                <p className="text-white/80 text-lg mb-3">{user.email}</p>
                <div className="flex items-center gap-4">
                  <span className="inline-flex px-4 py-2 text-sm font-bold rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                    {user.role}
                  </span>
                  <span
                    className={`inline-flex px-4 py-2 text-sm font-bold rounded-xl ${
                      user.status === "active"
                        ? "bg-green-500/20 text-green-100 border border-green-400/30"
                        : "bg-red-500/20 text-red-100 border border-red-400/30"
                    }`}
                  >
                    {user.status}
                  </span>
                  {user.kyc_status && (
                    <span
                      className={`inline-flex px-4 py-2 text-sm font-bold rounded-xl ${
                        user.kyc_status === "verified"
                          ? "bg-emerald-500/20 text-emerald-100 border border-emerald-400/30"
                          : "bg-yellow-500/20 text-yellow-100 border border-yellow-400/30"
                      }`}
                    >
                      KYC: {user.kyc_status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {user.role === "vendor" ? (
                <>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {user.total_products || 0}
                    </p>
                    <p className="text-sm text-gray-600">Products</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      ${(user.total_sales || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Sales</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">85</p>
                    <p className="text-sm text-gray-600">Orders</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {user.total_orders || 0}
                    </p>
                    <p className="text-sm text-gray-600">Orders</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      ${(user.total_spent || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">4.5</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor(
                        (new Date().getTime() -
                          new Date(user.created_at).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Days Active</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Edit className="h-4 w-4" />
                Edit User
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <MessageSquare className="h-4 w-4" />
                Send Message
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Ban className="h-4 w-4" />
                Suspend
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
          <nav className="flex space-x-2">
            {[
              { key: "overview", label: "Overview", icon: User },
              { key: "activity", label: "Activity", icon: Activity },
              { key: "settings", label: "Settings", icon: MoreVertical },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === key
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/70"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                Personal Information
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Full Name
                  </label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {user.name}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {user.email}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {user.phone}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account Type
                  </label>
                  <p className="text-lg font-bold text-gray-900 mt-1 capitalize">
                    {user.account_type}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Information (for vendors) or Account Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                {user.role === "vendor" ? (
                  <>
                    <Building2 className="h-6 w-6 text-green-600" />
                    Business Information
                  </>
                ) : (
                  <>
                    <UserCheck className="h-6 w-6 text-purple-600" />
                    Account Details
                  </>
                )}
              </h3>

              <div className="space-y-4">
                {user.role === "vendor" && user.business_name && (
                  <>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Business Name
                      </label>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {user.business_name}
                      </p>
                    </div>

                    {user.business_type && (
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Business Type
                        </label>
                        <p className="text-lg font-bold text-gray-900 mt-1 capitalize">
                          {user.business_type}
                        </p>
                      </div>
                    )}

                    {user.kyc_status && (
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          KYC Status
                        </label>
                        <div className="mt-2">
                          <span
                            className={`inline-flex px-4 py-2 text-sm font-bold rounded-xl shadow-sm ${
                              user.kyc_status === "verified"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                                : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                            }`}
                          >
                            {user.kyc_status}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Referral Code
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <code className="px-4 py-3 bg-gray-900 text-green-400 rounded-xl text-sm font-mono flex-1 shadow-inner">
                      {user.referral_code}
                    </code>
                    <button
                      onClick={copyReferralCode}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shadow-sm"
                    >
                      <Copy className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Member Since
                  </label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {user.referred_by && (
                  <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Referred By
                    </label>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {user.referred_by}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "activity" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-orange-600" />
              Recent Activity
            </h3>

            <div className="space-y-4">
              {/* Mock activity items */}
              {[
                {
                  action: "Product listed",
                  time: "2 hours ago",
                  icon: Package,
                  color: "green",
                },
                {
                  action: "Order received",
                  time: "1 day ago",
                  icon: DollarSign,
                  color: "blue",
                },
                {
                  action: "Profile updated",
                  time: "3 days ago",
                  icon: Edit,
                  color: "purple",
                },
                {
                  action: "Account created",
                  time: new Date(user.created_at).toLocaleDateString(),
                  icon: UserCheck,
                  color: "gray",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div
                    className={`h-12 w-12 bg-gradient-to-r ${
                      activity.color === "green"
                        ? "from-green-500 to-emerald-500"
                        : activity.color === "blue"
                        ? "from-blue-500 to-cyan-500"
                        : activity.color === "purple"
                        ? "from-purple-500 to-pink-500"
                        : "from-gray-500 to-slate-500"
                    } rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <activity.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MoreVertical className="h-6 w-6 text-gray-600" />
              Account Settings
            </h3>

            <div className="space-y-6">
              {/* Account Status */}
              <div className="p-6 border border-gray-200 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-4">Account Status</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current status</p>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-bold rounded-full mt-1 ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors">
                    Toggle Status
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 border-2 border-red-200 rounded-xl bg-gradient-to-r from-red-50 to-pink-50">
                <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </h4>
                <p className="text-sm text-red-700 mb-4">
                  These actions are permanent and cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                    Delete Account
                  </button>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfileClient;
