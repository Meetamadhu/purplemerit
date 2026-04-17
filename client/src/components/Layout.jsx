import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppFooter from './AppFooter.jsx';
import AppHeader from './AppHeader.jsx';

export default function Layout() {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <AppHeader />
      <main id="main-content" ref={mainRef} tabIndex="-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
