/** Blue bar shown on routes that are outside Layout (e.g. login, loading). */
export default function SiteHeader({ end }) {
  return (
    <header className="top-nav" role="banner">
      <span className="nav-brand">User Management</span>
      {end != null && end !== '' && <span className="top-nav-end">{end}</span>}
    </header>
  );
}
