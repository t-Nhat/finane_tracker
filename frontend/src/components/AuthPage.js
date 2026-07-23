import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, DollarSign, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

// 🌟 ĐỊNH NGHĨA CỔNG BACKEND Ở ĐÂY (DỄ DÀNG ĐỔI PORT)
const API_URL = 'http://localhost:5001';

const AuthPage = ({ onLoginSuccess }) => {
  const [view, setView] = useState('login'); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMsg('');
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Lỗi xử lý từ máy chủ');
        }
        
        onLoginSuccess(data);
      } catch (err) {
        setError(err.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
        localStorage.removeItem('mern_finance_user'); 
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Xác thực với Google thất bại.');
      localStorage.removeItem('mern_finance_user');
    }
  });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = view === 'login' ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Sai thông tin đăng nhập');

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Vui lòng nhập email');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');

    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(`Đã gửi khôi phục đến: ${formData.email}`);
    }, 1500);
  };

  return (
    <div className="w-full min-h-[100dvh] bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/50 backdrop-blur-xl">
        
        {/* BANNER BÊN TRÁI */}
        <div className="relative p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Finance Tracker</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dữ liệu mã hóa tuyệt đối</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight mb-4">
              Quản lý chi tiêu thông minh, tập trung.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Mỗi tài khoản là một không gian tài chính độc lập. Kiểm soát ngân sách, theo dõi biến động thu chi và bảo mật tài sản của bạn trên nền tảng Cloud Atlas.
            </p>
          </div>
          <div className="mt-12 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>© 2026 Finance Tracker v2.0</span>
            <span>Bảo mật AES-256</span>
          </div>
        </div>

        {/* FORM BÊN PHẢI */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-slate-950/60">
          <div className="max-w-sm w-full mx-auto">
            {view === 'forgot' ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <button 
                    onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-4"
                  >
                    <ArrowLeft className="w-3 h-3" /> Quay lại
                  </button>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Khôi phục mật khẩu</h2>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Nhập email bạn đã sử dụng để đăng ký. Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
                  </p>
                </div>
                {error && <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{error}</div>}
                {successMsg && <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs leading-relaxed">{successMsg}</div>}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Email đăng nhập</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"/>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer">
                    <span>{loading ? 'Đang xử lý...' : 'Gửi liên kết khôi phục'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {view === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    {view === 'login' ? 'Đăng nhập vào không gian quản lý chi tiêu của bạn.' : 'Bắt đầu theo dõi tài chính cá nhân chỉ trong 30 giây.'}
                  </p>
                </div>
                {error && <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{error}</div>}
                <div className="mb-6">
                  <button 
                    onClick={() => loginWithGoogle()}
                    type="button" 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all border border-slate-200 shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Tiếp tục với Google
                  </button>
                </div>
                <div className="flex items-center mb-6">
                  <div className="flex-1 border-t border-slate-800"></div>
                  <span className="px-3 text-[10px] uppercase tracking-wider text-slate-500 font-medium">Hoặc Email</span>
                  <div className="flex-1 border-t border-slate-800"></div>
                </div>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {view === 'register' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Họ và tên</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"/>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Email đăng nhập</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"/>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-medium text-slate-300">Mật khẩu</label>
                      {view === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                        >
                          Quên mật khẩu?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"/>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer">
                    <span>{loading ? 'Đang xử lý...' : view === 'login' ? 'Đăng nhập vào hệ thống' : 'Tạo tài khoản miễn phí'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                <div className="mt-8 text-center">
                  <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }} className="text-xs text-slate-400 hover:text-white transition-colors">
                    {view === 'login' ? (
                      <span>Chưa có tài khoản? <strong className="text-emerald-400 font-semibold underline underline-offset-2">Đăng ký ngay</strong></span>
                    ) : (
                      <span>Đã có tài khoản? <strong className="text-emerald-400 font-semibold underline underline-offset-2">Đăng nhập</strong></span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;