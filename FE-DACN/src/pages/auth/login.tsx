import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

const API_BASE = "http://localhost:8888"; // ✅ đổi 1 chỗ là xong

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { setIsLoggedIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const emailValue = watch("email");
  const normalizedEmail = useMemo(
    () => (emailValue || "").trim().toLowerCase(),
    [emailValue]
  );

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        email: data.email.trim().toLowerCase(),
      };

      const res = await axios.post(`${API_BASE}/api/auth/login`, payload);

      const token = res.data?.token;

      if (!token) {
        toast.error("Đăng nhập thất bại: Không nhận được token từ server.");
        return;
      }

      // ✅ lưu token
      localStorage.setItem("token", token);

      // ✅ cập nhật auth context
      setIsLoggedIn(true);

      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error: any) {
      // ✅ lấy message thật từ backend
      const status = error?.response?.status;
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại";

      // ✅ case chưa xác thực -> chuyển sang checkmail
      if (status === 403) {
        const email = data.email.trim().toLowerCase();
        localStorage.setItem("emailForVerify", email);

        toast.info(
          msg || "Tài khoản chưa xác thực. Vui lòng kiểm tra email để nhập OTP."
        );

        navigate("/checkmail");
        return;
      }

      toast.error(msg);
    } finally {
      setIsSubmitting(false);
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
        <div className="text-center mb-4">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-1">
            Đăng nhập Thế Giới Di Động
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Nhập thông tin tài khoản của bạn để đăng nhập
          </p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="relative group">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-0.5"
            >
              Email*
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                placeholder={
                  errors.email ? errors.email.message : "example@thegioididong.com"
                }
                {...register("email", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                    message: "Email không hợp lệ",
                  },
                })}
                className={`w-full pl-12 pr-10 py-3 bg-gray-50 border ${
                  errors.email
                    ? "border-red-500 placeholder-red-500"
                    : "border-gray-200"
                } text-gray-800 rounded-xl ${
                  errors.email ? "placeholder-red-500" : "placeholder-gray-400"
                } focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all shadow-sm`}
              />
              {errors.email && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
                
            {/* ✅ Quick action: nếu user biết là chưa verify */}
            {normalizedEmail && (
              <div className="text-right pt-1">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("emailForVerify", normalizedEmail);
                    navigate("/checkmail");
                  }}
                  className="text-xs text-blue-600 hover:underline hover:text-blue-700"
                >
                </button>
              </div>
            )}  
          </div>

          {/* Password */}
          <div className="relative group">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-0.5"
            >
              Mật khẩu*
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder={errors.password ? errors.password.message : "••••••••"}
                {...register("password", {
                  required: "Vui lòng nhập mật khẩu",
                })}
                className={`w-full pl-12 pr-14 py-3 bg-gray-50 border ${
                  errors.password
                    ? "border-red-500 placeholder-red-500"
                    : "border-gray-200"
                } text-gray-800 rounded-xl ${
                  errors.password ? "placeholder-red-500" : "placeholder-gray-400"
                } focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all shadow-sm`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100"
                aria-label="Toggle password"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>

              {errors.password && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>

            {/* Quên mật khẩu */}
            <div className="text-right pt-1">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:underline hover:text-blue-700"
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-2 px-6 rounded-2xl font-bold shadow-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>

        {/* Link đăng ký */}
        <div className="text-center pt-3">
          <p className="text-gray-700 text-sm">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </form>
  );
};

export default Login;
