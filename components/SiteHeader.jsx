export default function SiteHeader({ settings }) {
  if (!settings) return null;

  return (
    <header className="site-header">
      <h1 className="site-title">{settings.title}</h1>
      {settings.description && (
        <p className="site-description">{settings.description}</p>
      )}
    </header>
  );
}