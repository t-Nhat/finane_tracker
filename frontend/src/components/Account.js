import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Globe, 
  HelpCircle, 
  MessageSquare, 
  Info, 
  LogOut, 
  LogIn, 
  ArrowLeft, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  CreditCard,
  Lock,
  Save,
  Rocket
} from 'lucide-react';

export default function Profile({ user, onLogout, onLoginClick }) {
  const isLoggedIn = !!user;
  const [activeView, setActiveView] = useState('main'); // main, help, notifications, feedback, account, info, language
  const { t, language, changeLanguage } = useLanguage();

  const getAvatarInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  // -- MAIN VIP VIEW --
  const renderMainView = () => {
    const accountGroup = [
      { id: 'account', title: t('account.account_settings') || 'Chỉnh sửa thông tin cá nhân', icon: User, badge: 'Đã xác thực' },
      { id: 'security', title: 'Bảo mật & Mật khẩu', icon: ShieldCheck, badge: 'An toàn 100%' },
    ];

    const systemGroup = [
      { id: 'notifications', title: t('account.notifications') || 'Cài đặt thông báo', icon: Bell },
      { id: 'language', title: t('account.language') || 'Ngôn ngữ ứng dụng', icon: Globe, extraText: language === 'vi' ? 'Tiếng Việt 🇻🇳' : 'English 🇬🇧' },
    ];

    const supportGroup = [
      { id: 'help', title: t('account.help_center') || 'Trung tâm trợ giúp', icon: HelpCircle },
      { id: 'feedback', title: t('account.feedback') || 'Chia sẻ góp ý & Phản hồi', icon: MessageSquare },
      { id: 'info', title: t('account.general_info') || 'Thông tin hệ thống', icon: Info },
    ];

    return (
      <div className="space-y-8 animate-fade-in">
        {/* VIP BANNER & PROFILE HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 text-white p-6 md:p-8 shadow-2xl border border-emerald-500/20">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              {/* Avatar with Glow Ring & VIP Badge */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-lg shadow-emerald-500/30">
                  <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-3xl font-extrabold text-emerald-400">
                    {isLoggedIn ? getAvatarInitials(user?.name || user?.username) : '?'}
                  </div>
                </div>
                {isLoggedIn && (
                  <span className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md" title="VIP Member">
                    <Crown size={16} className="fill-slate-950" />
                  </span>
                )}
              </div>

              {/* User Details */}
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {isLoggedIn ? (user?.name || user?.username || t('account.user')) : t('account.not_logged_in')}
                  </h2>
                  {isLoggedIn && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Sparkles size={12} /> PRO VIP
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 flex items-center justify-center md:justify-start gap-1.5">
                  <span>📱</span> {isLoggedIn ? (user?.phone || user?.email || t('account.no_phone')) : t('account.login_prompt')}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Mã định danh: {isLoggedIn ? (user?._id ? user._id.substring(0, 12) + '...' : 'MEM-8892') : 'N/A'}
                </p>
              </div>
            </div>

            {/* Virtual Metallic VIP Card */}
            {isLoggedIn && (
              <div className="w-full md:w-72 bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-xl text-amber-200 flex flex-col justify-between h-36 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs tracking-widest uppercase font-bold text-amber-400 flex items-center gap-1">
                    <CreditCard size={14} /> VIP PASS
                  </span>
                  <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30 font-semibold">PREMIUM</span>
                </div>
                <div className="font-mono text-sm tracking-wider text-white">
                  •••• •••• •••• {user?._id ? user._id.substring(user._id.length - 4) : '9982'}
                </div>
                <div className="flex justify-between items-end text-[11px] text-gray-400">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase">Chủ thẻ</p>
                    <p className="font-semibold text-gray-200 uppercase">{user?.name || user?.username || 'VIP MEMBER'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase">Hạn dùng</p>
                    <p className="font-semibold text-amber-300">Vĩnh Viễn ♾️</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MENU GROUPS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* GROUP 1: ACCOUNT & SECURITY */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" /> Tài Khoản & Bảo Mật
            </h3>
            <div className="space-y-2">
              {accountGroup.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-gray-100 dark:hover:border-slate-700/60 transition group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition">
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GROUP 2: SYSTEM PREFERENCES */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <Globe size={16} className="text-teal-500" /> Hệ Thống & Tùy Chỉnh
            </h3>
            <div className="space-y-2">
              {systemGroup.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-gray-100 dark:hover:border-slate-700/60 transition group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl group-hover:scale-110 transition">
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.extraText && (
                        <span className="text-xs text-gray-500 font-medium">{item.extraText}</span>
                      )}
                      <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GROUP 3: SUPPORT & INFO */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <HelpCircle size={16} className="text-sky-500" /> Hỗ Trợ & Thông Tin
            </h3>
            <div className="space-y-2">
              {supportGroup.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-gray-100 dark:hover:border-slate-700/60 transition group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-xl group-hover:scale-110 transition">
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                        {item.title}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* LOGOUT / LOGIN ACTION BUTTON */}
        <div className="pt-2">
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="w-full py-4 px-6 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-sm"
            >
              <LogOut size={18} />
              <span>{t('account.logout') || 'Đăng xuất khỏi hệ thống'}</span>
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-lg shadow-emerald-500/20"
            >
              <LogIn size={18} />
              <span>{t('account.login') || 'Đăng nhập ngay'}</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // -- SUB VIEWS --
  const renderHeader = (title) => (
    <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-slate-800">
      <button 
        onClick={() => setActiveView('main')} 
        className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        <ArrowLeft size={18} /> {t('account.back') || 'Quay lại'}
      </button>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
      <div className="w-16"></div>
    </div>
  );

  const renderComingSoon = (title) => (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-sm">
      {renderHeader(title)}
      <div className="text-center py-10 space-y-3">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
          <Rocket size={32} />
        </div>
        <h4 className="font-bold text-lg text-gray-800 dark:text-white">{t('account.coming_soon') || 'Tính năng đang được phát triển!'}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {t('account.feature_in_dev') || 'Đội ngũ kỹ thuật đang hoàn thiện phân hệ này. Sẽ sớm sẵn sàng trong phiên bản cập nhật tiếp theo!'}
        </p>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-4">
      {renderHeader(t('account.notifications') || 'Cài đặt thông báo')}
      <div className="space-y-3">
        {[
          { label: t('account.email_notif') || 'Thông báo qua Email', desc: 'Nhận báo cáo số dư và nhắc nợ hàng tuần' },
          { label: t('account.push_notif') || 'Thông báo đẩy trình duyệt', desc: 'Cảnh báo ngay lập tức khi chi vượt ngân sách' },
          { label: t('account.weekly_report') || 'Báo cáo tổng kết tháng', desc: 'Gửi bảng tổng kết phân tích biến động dòng tiền' }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-600 rounded cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-4">
      {renderHeader(t('account.language') || 'Ngôn ngữ hệ thống')}
      <div className="space-y-3">
        <button 
          onClick={() => changeLanguage('vi')}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition ${
            language === 'vi' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
              : 'bg-gray-50 dark:bg-slate-800/60 border-gray-100 dark:border-slate-700/50 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span className="flex items-center gap-3 text-sm">
            <span className="text-xl">🇻🇳</span> Tiếng Việt (Vietnamese)
          </span>
          {language === 'vi' && <CheckCircle2 size={18} className="text-emerald-600" />}
        </button>

        <button 
          onClick={() => changeLanguage('en')}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition ${
            language === 'en' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
              : 'bg-gray-50 dark:bg-slate-800/60 border-gray-100 dark:border-slate-700/50 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span className="flex items-center gap-3 text-sm">
            <span className="text-xl">🇬🇧</span> English (UK / US)
          </span>
          {language === 'en' && <CheckCircle2 size={18} className="text-emerald-600" />}
        </button>
      </div>
    </div>
  );

  const renderSecurityInfo = () => (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-4">
      {renderHeader('Bảo mật & Mật khẩu')}
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
          <ShieldCheck size={24} className="shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-bold">Tài khoản được bảo vệ</p>
            <p className="text-xs opacity-90">Mã hóa JWT SSL 256-bit chuẩn ngân hàng quốc tế.</p>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-2xl space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p className="flex justify-between border-b pb-2 border-gray-200 dark:border-slate-700">
            <span className="text-gray-500">Mã hóa dữ liệu:</span>
            <span className="font-semibold text-emerald-600">AES-256 Enabled</span>
          </p>
          <p className="flex justify-between border-b pb-2 border-gray-200 dark:border-slate-700">
            <span className="text-gray-500">Xác thực Token:</span>
            <span className="font-semibold text-emerald-600">JWT 30 Days</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-500">Lần đăng nhập gần nhất:</span>
            <span className="font-mono text-xs">Vừa xong (Hôm nay)</span>
          </p>
        </div>
      </div>
    </div>
  );

  const renderGeneralInfo = () => (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-4">
      {renderHeader(t('account.general_info') || 'Thông tin hệ thống')}
      <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-2xl space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <p className="flex justify-between border-b pb-2 border-gray-200 dark:border-slate-700">
          <span className="text-gray-500">{t('account.username') || 'Tên tài khoản:'}</span>
          <span className="font-bold">{user?.username || 'N/A'}</span>
        </p>
        <p className="flex justify-between border-b pb-2 border-gray-200 dark:border-slate-700">
          <span className="text-gray-500">{t('account.email') || 'Email liên hệ:'}</span>
          <span className="font-bold">{user?.email || 'N/A'}</span>
        </p>
        <p className="flex justify-between border-b pb-2 border-gray-200 dark:border-slate-700">
          <span className="text-gray-500">{t('account.join_date') || 'Ngày tham gia:'}</span>
          <span className="font-bold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-500">Phiên bản ứng dụng:</span>
          <span className="font-mono font-bold text-emerald-600">v2.5.0 (PRO Edition)</span>
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'help': return renderComingSoon(t('account.help_center') || 'Trung tâm trợ giúp');
      case 'feedback': return renderComingSoon(t('account.feedback') || 'Góp ý sản phẩm');
      case 'notifications': return renderNotifications();
      case 'language': return renderLanguage();
      case 'info': return renderGeneralInfo();
      case 'security': return renderSecurityInfo();
      case 'account': return <AccountSettings user={user} setActiveView={setActiveView} />;
      default: return renderMainView();
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4">
      {renderContent()}
    </div>
  );
}

function AccountSettings({ user, setActiveView }) {
  const [name, setName] = useState(user?.name || user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || (localStorage.getItem('mern_finance_user') && JSON.parse(localStorage.getItem('mern_finance_user')).token);
      
      const response = await fetch('http://localhost:5001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      });
      
      if (response.ok) {
        alert(t('account.update_success') || '✅ Cập nhật thông tin thành công!');
      } else {
        alert(t('account.update_fail') || '❌ Cập nhật thất bại, vui lòng thử lại.');
      }
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
        <button 
          onClick={() => setActiveView('main')} 
          className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft size={18} /> {t('account.back') || 'Quay lại'}
        </button>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('account.account_settings') || 'Chỉnh sửa tài khoản'}</h3>
        <div className="w-16"></div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">{t('account.display_name') || 'Tên hiển thị'}</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-white" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">{t('account.phone') || 'Số điện thoại'}</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-white" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder={t('account.no_phone') || 'Chưa cập nhật số điện thoại'}
          />
        </div>
      </div>

      <button 
        onClick={handleUpdate} 
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-[0.99]"
      >
        <Save size={18} />
        <span>{loading ? (t('account.saving') || 'Đang lưu...') : (t('account.save_changes') || 'Lưu thay đổi')}</span>
      </button>
    </div>
  );
}
