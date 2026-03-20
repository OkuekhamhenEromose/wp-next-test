export default function EddSettings({ data, isLoading, error }) {
  const currency = data?.currency ?? null;
  const sign = data?.currency_sign ?? "";

  return (
    <div className="widget">
      <h2 className="widget-title">
        <span className="widget-icon">🛒</span>EDD Store Settings
      </h2>
      {isLoading && (
        <div className="widget-body">
          <div className="skeleton-title" style={{ width: "60%" }} />
        </div>
      )}
      {error && !isLoading && (
        <div className="state-box state-box--error" role="alert">
          <span className="state-icon">⚠</span>
          <p>{error}</p>
        </div>
      )}
      {data && !isLoading && (
        <div className="widget-body">
          {currency ? (
            <p className="widget-value">
              Store Currency:{" "}
              <span className="widget-currency">{currency}</span>
              {sign && <span className="widget-sub"> ({sign})</span>}
            </p>
          ) : (
            <p className="widget-sub">
              Currency setting not found in EDD response.
            </p>
          )}
          <details className="widget-raw">
            <summary>View raw EDD settings</summary>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
