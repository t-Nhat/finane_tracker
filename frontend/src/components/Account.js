import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Profile({ user, onLogout, onLoginClick }) {
  const isLoggedIn = !!user;
  const [activeView, setActiveView] = useState('main'); // main, help, notifications, feedback, account, info, language
  const { t, language, changeLanguage } = useLanguage();

  // -- MAIN VIEW --
  const renderMainView = () => {
    const menuItems = [
      { id: 'help', title: t('account.help_center'), icon: "❓" },
      { id: 'notifications', title: t('account.notifications'), icon: "🔔" },
      { id: 'feedback', title: t('account.feedback'), icon: "💬" },
      { id: 'account', title: t('account.account_settings'), icon: "⚙️" },
      { id: 'info', title: t('account.general_info'), icon: "ℹ️" },
      { id: 'language', title: t('account.language'), icon: "🌐" },
    ];

    const getAvatarInitials = (name) => {
      if (!name) return "U";
      const parts = name.trim().split(" ");
      return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    return (
      <>
        <div style={styles.header}>
          {isLoggedIn ? (
            <>
              <div style={styles.avatar}>
                {getAvatarInitials(user?.name || user?.username)}
              </div>
              <h2 style={styles.name}>{user?.name || user?.username || t('account.user')}</h2>
              <p style={styles.infoText}>📱 {user?.phone || user?.email || t('account.no_phone')}</p>
              <p style={styles.infoText}>💳 STK: {user?.accountNumber || user?._id || "N/A"}</p>
            </>
          ) : (
            <>
              <div style={{ ...styles.avatar, backgroundColor: '#9CA3AF' }}>?</div>
              <h2 style={styles.name}>{t('account.not_logged_in')}</h2>
              <p style={styles.infoText}>{t('account.login_prompt')}</p>
            </>
          )}
        </div>

        <div style={styles.menuList}>
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              style={styles.menuItem}
              onClick={() => setActiveView(item.id)}
            >
              <div style={styles.leftContent}>
                <span style={styles.icon}>{item.icon}</span>
                <span style={styles.itemTitle}>{item.title}</span>
              </div>
              <span style={styles.arrow}>&gt;</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px' }}>
          {isLoggedIn ? (
            <button style={styles.logoutBtn} onClick={onLogout}>
              🚪 {t('account.logout')}
            </button>
          ) : (
            <button style={styles.loginBtn} onClick={onLoginClick}>
              🔑 {t('account.login')}
            </button>
          )}
        </div>
      </>
    );
  };

  // -- SUB VIEWS --
  const renderComingSoon = (title) => (
    <div style={styles.subView}>
      <button style={styles.backBtn} onClick={() => setActiveView('main')}>← {t('account.back')}</button>
      <h3 style={styles.subTitle}>{title}</h3>
      <div style={styles.comingSoonBox}>
        <span style={{ fontSize: '40px' }}>🚀</span>
        <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#6B7280' }}>{t('account.coming_soon')}</p>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '5px' }}>{t('account.feature_in_dev')}</p>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div style={styles.subView}>
      <button style={styles.backBtn} onClick={() => setActiveView('main')}>← {t('account.back')}</button>
      <h3 style={styles.subTitle}>{t('account.notifications')}</h3>
      <div style={styles.settingsList}>
        <div style={styles.settingItem}>
          <span>{t('account.email_notif')}</span>
          <input type="checkbox" defaultChecked style={styles.toggle} />
        </div>
        <div style={styles.settingItem}>
          <span>{t('account.push_notif')}</span>
          <input type="checkbox" defaultChecked style={styles.toggle} />
        </div>
        <div style={styles.settingItem}>
          <span>{t('account.weekly_report')}</span>
          <input type="checkbox" defaultChecked style={styles.toggle} />
        </div>
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div style={styles.subView}>
      <button style={styles.backBtn} onClick={() => setActiveView('main')}>← {t('account.back')}</button>
      <h3 style={styles.subTitle}>{t('account.language')}</h3>
      <div style={styles.settingsList}>
        <div style={styles.radioItem} onClick={() => changeLanguage('vi')}>
          <input type="radio" name="lang" id="vi" checked={language === 'vi'} readOnly />
          <label htmlFor="vi" style={{ marginLeft: '10px', cursor: 'pointer' }}>🇻🇳 {t('account.lang_vi')}</label>
        </div>
        <div style={styles.radioItem} onClick={() => changeLanguage('en')}>
          <input type="radio" name="lang" id="en" checked={language === 'en'} readOnly />
          <label htmlFor="en" style={{ marginLeft: '10px', cursor: 'pointer' }}>🇬🇧 {t('account.lang_en')}</label>
        </div>
      </div>
    </div>
  );

  const renderGeneralInfo = () => (
    <div style={styles.subView}>
      <button style={styles.backBtn} onClick={() => setActiveView('main')}>← {t('account.back')}</button>
      <h3 style={styles.subTitle}>{t('account.general_info')}</h3>
      <div style={styles.infoBox}>
        <p><strong>{t('account.username')}</strong> {user?.username || 'N/A'}</p>
        <p><strong>{t('account.email')}</strong> {user?.email || 'N/A'}</p>
        <p><strong>{t('account.join_date')}</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : t('account.unknown')}</p>
        <p><strong>{t('account.status')}</strong> {t('account.active')}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'help': return renderComingSoon(t('account.help_center'));
      case 'feedback': return renderComingSoon(t('account.feedback'));
      case 'notifications': return renderNotifications();
      case 'language': return renderLanguage();
      case 'info': return renderGeneralInfo();
      case 'account': return <AccountSettings user={user} setActiveView={setActiveView} />;
      default: return renderMainView();
    }
  };

  return (
    <div style={styles.container}>
      {renderContent()}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '420px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    paddingBottom: '20px',
    borderBottom: '1px solid #F3F4F6'
  },
  avatar: {
    width: '75px',
    height: '75px',
    borderRadius: '50%',
    backgroundColor: '#059669',
    color: '#FFFFFF',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 auto 12px auto'
  },
  name: {
    margin: '0 0 6px 0',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827'
  },
  infoText: {
    margin: '3px 0',
    fontSize: '13px',
    color: '#6B7280'
  },
  menuList: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px solid #E5E7EB'
  },
  leftContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  icon: {
    fontSize: '18px'
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  arrow: {
    color: '#9CA3AF',
    fontWeight: 'bold'
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: '1px solid #FCA5A5',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    transition: '0.2s'
  },
  loginBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#059669',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    transition: '0.2s'
  },
  subView: {
    animation: 'fadeIn 0.3s'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#3B82F6',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0 0 16px 0'
  },
  subTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    borderBottom: '1px solid #F3F4F6',
    paddingBottom: '10px'
  },
  comingSoonBox: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    border: '1px dashed #D1D5DB'
  },
  settingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  toggle: {
    cursor: 'pointer',
    width: '18px',
    height: '18px'
  },
  radioItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  infoBox: {
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.8'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  saveBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#059669',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px'
  }
};

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
        alert(t('account.update_success'));
      } else {
        alert(t('account.update_fail'));
      }
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.subView}>
      <button style={styles.backBtn} onClick={() => setActiveView('main')}>← {t('account.back')}</button>
      <h3 style={styles.subTitle}>{t('account.account_settings')}</h3>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>{t('account.display_name')}</label>
        <input 
          type="text" 
          style={styles.input} 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>{t('account.phone')}</label>
        <input 
          type="text" 
          style={styles.input} 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          placeholder={t('account.no_phone')}
        />
      </div>

      <button style={styles.saveBtn} onClick={handleUpdate} disabled={loading}>
        {loading ? `⏳ ${t('account.saving')}` : `💾 ${t('account.save_changes')}`}
      </button>
    </div>
  );
}
