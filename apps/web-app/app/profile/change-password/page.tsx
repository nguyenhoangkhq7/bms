"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/auth/context";
import { KeyRound, Mail, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { 
    user, 
    isSignedIn, 
    sendChangePasswordOtp, 
    confirmChangePassword, 
    isLoading, 
    error, 
    clearError 
  } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Info/Send OTP, 2: Confirm OTP
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push("/auth/login");
    }
  }, [isSignedIn, isLoading, router]);

  const handleSendOtp = async () => {
    try {
      clearError();
      await sendChangePasswordOtp();
      setStep(2);
      toast.success("Mã OTP đã được gửi đến email của bạn");
    } catch (err) {
      // Error handled by context
    }
  };

  const handleConfirmChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    if (!otpCode.trim()) errors.otpCode = "Mã OTP là bắt buộc";
    if (newPassword.length < 8) errors.newPassword = "Mật khẩu phải từ 8 ký tự";
    if (newPassword !== confirmPassword) errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      clearError();
      await confirmChangePassword({
        email: user?.email || "",
        otpCode: otpCode.trim(),
        newPassword,
        confirmPassword
      });
      toast.success("Đổi mật khẩu thành công!");
      router.push("/");
    } catch (err) {
      // Error handled by context
    }
  };

  if (!isSignedIn) return null;

  return (
    <div className="min-h-[calc(100-80px)] bg-[#F5F0E8] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-[#1F4788] hover:underline font-semibold gap-2">
            <ArrowLeft size={18} /> Quay lại trang chủ
          </Link>
        </div>

        <div className="bg-[#FDFBF7] rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-[#1F4788] p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 rounded-2xl">
                <KeyRound size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
                <p className="text-blue-100">Bảo mật tài khoản của bạn bằng mã OTP</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm font-medium flex items-center gap-3">
                <ShieldCheck className="shrink-0" /> {error}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-[#1F4788] mb-2 flex items-center gap-2">
                    <Mail size={18} /> Xác thực qua Email
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Chúng tôi sẽ gửi một mã OTP gồm 6 chữ số đến email:
                    <strong className="block text-[#1a1a1a] mt-1 text-lg">{user?.email}</strong>
                  </p>
                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="w-full bg-[#1F4788] hover:bg-[#2C5AA0] disabled:bg-[#8b9dc3] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                  >
                    {isLoading ? "Đang gửi..." : "Gửi mã OTP ngay"}
                  </button>
                </div>
                
                <div className="text-center text-sm text-gray-500">
                  <p>Tại sao cần OTP? Để đảm bảo rằng chính bạn là người thực hiện thay đổi này.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">Mã OTP (6 chữ số)</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="000000"
                      className={`w-full px-5 py-4 rounded-xl border-2 transition-all text-center text-2xl tracking-[0.5em] font-black ${
                        fieldErrors.otpCode ? "border-red-400 bg-red-50" : "border-[#D4C4B0] focus:border-[#1F4788] bg-white"
                      } focus:outline-none`}
                    />
                  </div>
                  {fieldErrors.otpCode && <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.otpCode}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2">Mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all ${
                          fieldErrors.newPassword ? "border-red-400 bg-red-50" : "border-[#D4C4B0] focus:border-[#1F4788] bg-white"
                        } focus:outline-none`}
                      />
                    </div>
                    {fieldErrors.newPassword && <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.newPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all ${
                          fieldErrors.confirmPassword ? "border-red-400 bg-red-50" : "border-[#D4C4B0] focus:border-[#1F4788] bg-white"
                        } focus:outline-none`}
                      />
                    </div>
                    {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1F4788] hover:bg-[#2C5AA0] disabled:bg-[#8b9dc3] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                  >
                    {isLoading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-gray-500 font-semibold hover:text-[#1F4788] py-2 transition-colors"
                  >
                    Gửi lại mã OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
