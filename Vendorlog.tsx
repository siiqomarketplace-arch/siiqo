// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Link from "next/link";
// import axios from "axios";
// import Button from "@/components/Button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Eye, EyeOff, ArrowLeft, Store, Loader2 } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
// import { loginSchema, LoginFormValues } from "@/lib/Validation/LoginSchema";

// interface VendorLoginResponse {
//   access_token: string;
//   message: string;
//   user: {
//     email: string;
//     role: "vendor";
//   };
// }

// const VendorLogin = () => {
//   const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//       rememberMe: false,
//     },
//   });

//   // Validation
//   const validateRole = (role: string): boolean => {
//     if (role !== "vendor") {
//       toast({
//         variant: "destructive",
//         title: "Invalid Account Type",
//         description:
//           "This account is not a vendor account. Please use the appropriate login portal.",
//       });
//       return false;
//     }
//     return true;
//   };

//   // Store authentication data
//   const storeAuthData = (
//     data: VendorLoginResponse,
//     rememberMe: boolean,
//     email: string
//   ) => {
//     if (typeof window === "undefined") return;

//     sessionStorage.setItem("RSEmail", email);
//     sessionStorage.setItem("RSToken", data.access_token);
//     sessionStorage.setItem("RSUserRole", data.user.role);
//     sessionStorage.setItem("RSUser", JSON.stringify(data.user));

//     if (rememberMe) {
//       localStorage.setItem("rememberedEmail", email);
//     }
//   };

//   // Extract error message
//   const getErrorMessage = (error: any): { title: string; message: string } => {
//     let errorTitle = "Login Failed";
//     let errorMessage = "Invalid email or password. Please try again.";

//     if (error.response) {
//       const status = error.response.status;
//       const data = error.response.data;

//       // Extract message from response
//       if (data?.message) {
//         errorMessage = data.message;
//       } else if (data?.error) {
//         errorMessage = data.error;
//       }

//       // Customize based on status code
//       switch (status) {
//         case 400:
//           errorTitle = "Invalid Request";
//           break;
//         case 401:
//           errorTitle = "Authentication Failed";
//           errorMessage =
//             "Invalid email or password. Please check your credentials.";
//           break;
//         case 403:
//           errorTitle = "Access Denied";
//           errorMessage = "Your account may be suspended or not verified.";
//           break;
//         case 404:
//           errorTitle = "Account Not Found";
//           errorMessage = "No vendor account found with this email address.";
//           break;
//         case 429:
//           errorTitle = "Too Many Attempts";
//           errorMessage = "Too many login attempts. Please try again later.";
//           break;
//         case 500:
//           errorTitle = "Server Error";
//           errorMessage =
//             "Our servers are experiencing issues. Please try again later.";
//           break;
//       }
//     } else if (error.request) {
//       errorTitle = "Connection Error";
//       errorMessage =
//         "Unable to connect. Please check your internet connection.";
//     }

//     return { title: errorTitle, message: errorMessage };
//   };

//   // Handle form submission
//   const onSubmit = async (formData: LoginFormValues) => {
//     try {
//       const response = await axios.post<VendorLoginResponse>(
//         "https://server.bizengo.com/api/auth/login",
//         {
//           email: formData.email.trim(),
//           password: formData.password,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const data = response.data;
//       console.log("Vendor Role: ", data.user.role);

//       // Verify vendor role
//       if (!validateRole(data.user.role)) return;

//       // Store authentication data
//       storeAuthData(data, formData.rememberMe || false, formData.email);

//       // Success notification
//       toast({
//         title: "Login Successful!",
//         description: "Welcome back! Redirecting to your dashboard...",
//       });

//       // Redirect to vendor dashboard
//       setTimeout(() => {
//         router.push("/vendor/dashboard");
//       }, 1500);
//     } catch (error: any) {
//       console.error("Login error:", error);
//       const { title, message } = getErrorMessage(error);

//       toast({
//         variant: "destructive",
//         title,
//         description: message,
//       });
//     }
//   };

//   const isButtonDisabled = isSubmitting;

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-blue-50 via-white to-green-50">
//       <div className="w-full max-w-md">
//         {/* Back button */}
//         <div className="mb-8">
//           <Link
//             href="/"
//             className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Home
//           </Link>
//         </div>

//         {/* Card */}
//         <Card className="relative border border-gray-200 bg-white/80 backdrop-blur-sm">
//           <CardHeader className="pb-2 mb-5 text-center">
//             <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
//               <Store className="w-6 h-6 text-white" />
//             </div>
//             <CardTitle className="text-2xl font-bold">Vendor Login</CardTitle>
//             <CardDescription>Sign in to your vendor account</CardDescription>
//           </CardHeader>

//           <CardContent className="space-y-6">
//             <div className="text-sm text-center text-gray-600">
//               Don&apos;t have a vendor account?{" "}
//               <Link
//                 href="/auth/signup"
//                 className="font-medium text-blue-600 hover:underline hover:text-blue-700"
//               >
//                 Sign up here
//               </Link>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               {/* Email Field */}
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email Address *</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="vendor@example.com"
//                   disabled={isSubmitting}
//                   className="h-11"
//                   {...register("email")}
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-red-500">{errors.email.message}</p>
//                 )}
//               </div>

//               {/* Password Field */}
//               <div className="space-y-2">
//                 <Label htmlFor="password">Password *</Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     disabled={isSubmitting}
//                     className="pr-10 h-11"
//                     {...register("password")}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     disabled={isSubmitting}
//                     className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700 disabled:opacity-50"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="w-4 h-4" />
//                     ) : (
//                       <Eye className="w-4 h-4" />
//                     )}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <p className="text-sm text-red-500">
//                     {errors.password.message}
//                   </p>
//                 )}
//               </div>

//               {/* Remember Me & Forgot Password */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   <input
//                     id="remember"
//                     type="checkbox"
//                     disabled={isSubmitting}
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
//                     {...register("rememberMe")}
//                   />
//                   <Label htmlFor="remember" className="text-sm text-gray-600">
//                     Remember me
//                   </Label>
//                 </div>
//                 <Link
//                   href="/auth/forgot-password"
//                   className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>

//               <div className="pb-2"></div>

//               {/* Submit Button */}
//               <Button
//                 type="submit"
//                 variant="navy"
//                 className="w-full text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isButtonDisabled}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Signing in...
//                   </>
//                 ) : (
//                   "Sign In"
//                 )}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default VendorLogin;
