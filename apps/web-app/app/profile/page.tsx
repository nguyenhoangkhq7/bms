"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/auth/context";
import { userService, UserProfile } from "@/src/api/userService";
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Phone, 
  Calendar, 
  Camera, 
  Save, 
  Loader2, 
  ArrowLeft,
  KeyRound,
  Home
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isSignedIn, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState({
    phoneNumber: "",
    streetAddress: "",
    ward: "",
    district: "",
    cityProvince: ""
  });

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.push("/auth/login");
    } else if (isSignedIn) {
      fetchProfile();
    }
  }, [isSignedIn, authLoading, router]);

  const fetchProfile = async () => {
    try {
      setIsPageLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      setFullName(data.fullName || "");
      setDateOfBirth(data.dateOfBirth || "");
      setAddress({
        phoneNumber: data.phoneNumber || "",
        streetAddress: data.streetAddress || "",
        ward: data.ward || "",
        district: data.district || "",
        cityProvince: data.cityProvince || ""
      });
    } catch (err) {
      toast.error("Không thể tải thông tin hồ sơ");
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleUpdateBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await userService.updateProfile({ fullName, dateOfBirth: dateOfBirth || null });
      toast.success("Cập nhật thông tin cơ bản thành công");
      fetchProfile();
    } catch (err) {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await userService.updateAddress(address);
      toast.success("Cập nhật địa chỉ thành công");
      fetchProfile();
    } catch (err) {
      toast.error("Cập nhật địa chỉ thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn (tối đa 10MB)");
      return;
    }

    try {
      setIsUploading(true);
      await userService.updateAvatar(file);
      toast.success("Cập nhật ảnh đại diện thành công");
      fetchProfile();
    } catch (err) {
      toast.error("Tải ảnh lên thất bại. Vui lòng kiểm tra lại cấu hình S3.");
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1F4788] animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center text-[#1F4788] hover:underline font-semibold gap-2">
            <ArrowLeft size={18} /> Quay lại trang chủ
          </Link>
          <h1 className="text-3xl font-black text-[#1F4788]">Tài khoản của tôi</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar / Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#FDFBF7] rounded-3xl shadow-xl p-8 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#1F4788]/20 shadow-inner bg-gray-100 flex items-center justify-center">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={64} className="text-gray-300" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 p-2 bg-[#1F4788] text-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:bg-gray-400"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              
              <h2 className="mt-4 text-xl font-bold text-gray-900">{profile?.fullName || "Người dùng"}</h2>
              <p className="text-gray-500 text-sm">{profile?.username}</p>
              
              <div className="w-full mt-8 space-y-3">
                <Link 
                  href="/profile/change-password"
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl text-[#1F4788] font-bold hover:bg-blue-100 transition-colors w-full"
                >
                  <KeyRound size={20} />
                  <span>Đổi mật khẩu</span>
                </Link>
                <div className="p-4 bg-gray-50 rounded-2xl text-gray-600 text-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail size={16} />
                    <span className="font-semibold">Email</span>
                  </div>
                  <p className="truncate">{profile?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info Form */}
            <div className="bg-[#FDFBF7] rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-[#1F4788] px-8 py-4 text-white flex items-center gap-3">
                <UserIcon size={20} />
                <h3 className="font-bold">Thông tin cơ bản</h3>
              </div>
              <form onSubmit={handleUpdateBasicInfo} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ tên của bạn"
                      className="w-full px-5 py-3 rounded-xl border-2 border-[#D4C4B0] focus:border-[#1F4788] bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full pl-12 pr-5 py-3 rounded-xl border-2 border-[#D4C4B0] focus:border-[#1F4788] bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-[#1F4788] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#2C5AA0] transition-all flex items-center gap-2 disabled:bg-gray-400"
                  >
                    {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>

            {/* Address Form */}
            <div className="bg-[#FDFBF7] rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-[#1F4788] px-8 py-4 text-white flex items-center gap-3">
                <Home size={20} />
                <h3 className="font-bold">Địa chỉ giao hàng</h3>
              </div>
              <form onSubmit={handleUpdateAddress} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        required
                        value={address.phoneNumber}
                        onChange={(e) => setAddress({...address, phoneNumber: e.target.value})}
                        placeholder="09xx xxx xxx"
                        className="w-full pl-12 pr-5 py-3 rounded-xl border-2 border-[#D4C4B0] focus:border-[#1F4788] bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ cụ thể (Số nhà, tên đường)</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={address.streetAddress}
                        onChange={(e) => setAddress({...address, streetAddress: e.target.value})}
                        placeholder="Số 12, đường Võ Văn Ngân"
                        className="w-full pl-12 pr-5 py-3 rounded-xl border-2 border-[#D4C4B0] focus:border-[#1F4788] bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phường/Xã</label>
                    <input
                      type="text"
                      required
                      value={address.ward}
                      onChange={(e) => setAddress({...address, ward: e.target.value})}
                      placeholder="Phường 4"
                      className="w-full px-5 py-3 rounded-xl border-2 border-[#D4C4B0] focus:border-[#1F4788] bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quận/Huyện</label>
                    <input
                      type="text"
                      required
                      value={address.district}
                      onChange={(e) => setAddress({...address, district: e.target.value})}
                      placeholder="Quận Gò Vấp"
                      className="w-full px-5 py-3 rounded-xl border-2 border-[#D4C4B0] focus:border-[#1F4788] bg-white transition-all outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tỉnh/Thành phố</label>
                    <input
                      type="text"
                      required
                      value={address.cityProvince}
                      onChange={(e) => setAddress({...address, cityProvince: e.target.value})}
                      placeholder="TP. Hồ Chí Minh"
                      className="w-full px-5 py-3 rounded-xl border-2 border-[#D4C4B0] focus:border-[#1F4788] bg-white transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-[#1F4788] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#2C5AA0] transition-all flex items-center gap-2 disabled:bg-gray-400"
                  >
                    {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Cập nhật địa chỉ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
