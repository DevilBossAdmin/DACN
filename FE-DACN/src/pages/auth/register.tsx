import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Smartphone, Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import { FormData } from "../../types/User";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await axios.post("http://localhost:8888/api/auth/register", data);

      toast.success("Đăng ký thành công, vui lòng kiểm tra email xác thực");
      localStorage.setItem("emailForVerify", data.email);
      nav("/checkmail");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng ký thất bại";

      toast.error(msg);
      console.error("REGISTER ERROR:", error?.response?.data || error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-teal-100 flex items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-teal-300/30 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-sky-300/30 rounded-full blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 bg-white rounded-3xl shadow-soft-xl p-6 w-full max-w-lg border border-white/50">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-1">
            Chào mừng bạn đến Thế Giới Di Động!
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Đăng ký để khám phá thế giới công nghệ
          </p>
        </div>

        <div className="space-y-3">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Tên đăng nhập*
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                {...register("username", { required: "Vui lòng nhập tên đăng nhập" })}
                className="w-full pl-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-400"
                placeholder="Tên đăng nhập"
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email*
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                {...register("email", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                    message: "Email không hợp lệ",
                  },
                })}
                className="w-full pl-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-400"
                placeholder="example@thegioididong.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Full name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Họ và tên*
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                {...register("full_name", { required: "Vui lòng nhập họ tên" })}
                className="w-full pl-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-400"
                placeholder="Nguyễn Văn A"
              />
            </div>
            {errors.full_name && (
              <p className="text-red-500 text-sm">{errors.full_name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Số điện thoại*
            </label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                {...register("phone", {
                  required: "Vui lòng nhập số điện thoại",
                  pattern: {
                    value: /^0\d{9}$/,
                    message: "Số điện thoại phải bắt đầu bằng 0 và đủ 10 số",
                  },
                })}
                className="w-full pl-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-400"
                placeholder="09xxxxxxxx"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Mật khẩu*
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Vui lòng nhập mật khẩu",
                  minLength: { value: 6, message: "Ít nhất 6 ký tự" },
                })}
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-5">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-2xl font-bold hover:opacity-90"
          >
            Đăng ký tài khoản
          </button>

          <p className="text-center text-sm mt-3">
            Bạn đã có tài khoản?{" "}
            <button
              type="button"
              onClick={() => nav("/login")}
              className="text-blue-600 font-semibold"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </form>
  );
};

export default Register;
