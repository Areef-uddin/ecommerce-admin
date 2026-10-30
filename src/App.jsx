import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Banners from './pages/Banners';
import Customers from './pages/Customers';
import Login from './pages/Login';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('stylehub_admin_token');
    const storedUser = localStorage.getItem('stylehub_admin_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
    setCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('stylehub_admin_token');
    localStorage.removeItem('stylehub_admin_refresh');
    localStorage.removeItem('stylehub_admin_user');
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading StyleHub Admin...
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return { title: 'Ecommerce Overview', subtitle: 'Live business performance and sales analytics' };
      case 'products': return { title: 'Product Inventory', subtitle: 'Manage apparel, shoes, accessories, and pricing' };
      case 'categories': return { title: 'Categories & Subcategories', subtitle: 'Taxonomy and sub-collections' };
      case 'orders': return { title: 'Orders & Tracking', subtitle: 'Process orders and dispatch logistics' };
      case 'banners': return { title: 'Banners & Offers', subtitle: 'Promotional hero banners for customer app' };
      case 'customers': return { title: 'Customer Management', subtitle: 'Registered customer profiles and activity' };
      default: return { title: 'Admin Console', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={title} subtitle={subtitle} />
        <div style={{ flex: 1 }}>
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'products' && <Products />}
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'banners' && <Banners />}
          {activeTab === 'customers' && <Customers />}
        </div>
      </main>
    </div>
  );
}
