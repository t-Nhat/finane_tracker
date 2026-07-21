"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

// --- COMPONENT NÚT ĐĂNG NHẬP MẠNG XÃ HỘI (OAUTH) ---
const SocialButton = ({ icon, label, onClick, bgClass = "bg-white dark:bg-zinc-900" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium text-sm text-zinc-700 dark:text-zinc-300 ${bgClass} hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all active:scale-[0.99] cursor-pointer`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default function AuthPage({ onLoginSuccess }) {
  // 'login' | 'register' | 'forgot'
  const [view, setView] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Xóa lỗi khi người dùng bắt đầu gõ lại
  };

  // 1. Xử lý Submit Form (Gọi API MERN Backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // GIẢ LẬP GỌI API BACKEND (Ông thay bằng axios.post('/api/auth/...') thật nhé)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (view === 'login') {
        if (!formData.email || !formData.password) {
          throw new Error("Vui lòng nhập đầy đủ Email và Mật khẩu.");
        }
        // Thành công -> Trả data user về cho App.js để mở Khóa trang Finance
        onLoginSuccess({ name: "Nhật Đoàn", email: formData.email, role: "owner" });
      } 
      else if (view === 'register') {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error("Vui lòng điền đầy đủ thông tin đăng ký.");
        }
        setSuccessMsg("Tạo tài khoản thành công! Vui lòng đăng nhập.");
        setView('login');
      } 
      else if (view === 'forgot') {
        if (!formData.email) throw new Error("Vui lòng nhập Email để nhận liên kết khôi phục.");
        setSuccessMsg(`Liên kết khôi phục mật khẩu đã được gửi đến ${formData.email}.`);
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Xử lý Đăng nhập Google & Facebook (Giả lập trigger OAuth)
  const handleOAuthLogin = (provider) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({ 
        name: `Người dùng ${provider}`, 
        email: `user@${provider.toLowerCase()}.com`,
        provider: provider 
      });
    }, 1200);
  };

  return (
    <div className="min-h-[100dvh] w-full flex bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-white font-sans">
      
      {/* CỘT TRÁI: ASYMMETRIC BRAND HERO (Chỉ hiện trên Desktop lg+) */}
      <div className="hidden lg:flex lg:w-5/12 bg-zinc-900 border-r border-zinc-800/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Blur */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 right-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-zinc-950 text-lg">
            $
          </div>
          <span className="font-bold tracking-tight text-lg text-white">MERN Finance</span>
        </div>

        {/* Center Editorial Copy */}
        <div className="z-10 my-auto max-w-sm">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dữ liệu mã hóa tuyệt đối</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white leading-[1.15] mb-4">
            Quản lý dòng tiền thông minh, tập trung.
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Mỗi tài khoản là một không gian tài chính độc lập. Kiểm soát ngân sách, theo dõi biến động thu chi và bảo mật tài sản của bạn trên nền tảng Cloud Atlas.
          </p>
        </div>

        {/* Bottom Social Proof */}
        <div className="z-10 pt-8 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <span>© 2026 Finance Tracker v2.0</span>
          <span>Bảo mật AES-256</span>
        </div>
      </div>

      {/* CỘT PHẢI: KHUNG AUTH FORM */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-zinc-950 text-base">
              $
            </div>
            <span className="font-bold text-base text-white">MERN Finance</span>
          </div>

          {/* Form Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {view === 'login' && 'Chào mừng trở lại'}
              {view === 'register' && 'Tạo tài khoản mới'}
              {view === 'forgot' && 'Khôi phục mật khẩu'}
            </h2>
            <p className="text-sm text-zinc-400 mt-1.5">
              {view === 'login' && 'Đăng nhập vào không gian quản lý chi tiêu của bạn.'}
              {view === 'register' && 'Bắt đầu theo dõi tài chính cá nhân chỉ trong 30 giây.'}
              {view === 'forgot' && 'Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.'}
            </p>
          </div>

          {/* Error & Success Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-sm text-rose-400"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-sm text-emerald-400"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. KHUNG OAUTH: GOOGLE & FACEBOOK (Chỉ hiện ở Login & Register) */}
          {view !== 'forgot' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nút Google */}
                <SocialButton
                  onClick={() => handleOAuthLogin('Google')}
                  icon={
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.3 8.9 5 12 5z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                      <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.5.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.8z"/>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.2L1.6 15.9C3.5 19.7 7.4 23 12 23z"/>
                    </svg>
                  }
                  label="Google"
                />

                {/* Nút Facebook */}
                <SocialButton
                  onClick={() => handleOAuthLogin('Facebook')}
                  icon={
                    <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  }
                  label="Facebook"
                />
              </div>

              <div className="relative flex items-center justify-center py-2">
                <div className="w-full border-t border-zinc-800" />
                <span className="absolute bg-zinc-950 px-3 text-xs text-zinc-500 uppercase tracking-widest font-mono">
                  Hoặc email
                </span>
              </div>
            </div>
          )}

          {/* 4. FORM CHÍNH (NAME / EMAIL / PASSWORD) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Trường Họ tên (Chỉ hiện khi Register) */}
            {view === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Họ và tên</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Trường Email (Hiện ở cả 3 views) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Email đăng nhập</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Trường Password (Hiện ở Login & Register) */}
            {view !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 block">Mật khẩu</label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Nút Submit chính */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-zinc-950 font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-[0.99] transition-all cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {view === 'login' && 'Đăng nhập vào hệ thống'}
                    {view === 'register' && 'Tạo tài khoản miễn phí'}
                    {view === 'forgot' && 'Gửi liên kết khôi phục'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 5. FOOTER CHUYỂN ĐỔI GIỮA CÁC VIEWS */}
          <div className="text-center text-xs text-zinc-400 pt-4 border-t border-zinc-900">
            {view === 'login' && (
              <p>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setView('register'); setError(''); setSuccessMsg(''); }}
                  className="text-white font-semibold hover:underline cursor-pointer ml-1"
                >
                  Đăng ký ngay
                </button>
              </p>
            )}
            {view === 'register' && (
              <p>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                  className="text-white font-semibold hover:underline cursor-pointer ml-1"
                >
                  Đăng nhập
                </button>
              </p>
            )}
            {view === 'forgot' && (
              <p>
                Nhớ lại mật khẩu?{' '}
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                  className="text-white font-semibold hover:underline cursor-pointer ml-1"
                >
                  Quay lại đăng nhập
                </button>
              </p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}