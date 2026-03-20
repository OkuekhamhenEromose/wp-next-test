export default function ExchangeRate({ data, isLoading, error }) {
  return (
    <div className="widget">
      <h2 className="widget-title"><span className="widget-icon">💱</span>Exchange Rate</h2>
      {isLoading && (
        <div className="widget-body">
          <div className="skeleton-title" style={{ width: '55%' }} />
          <div className="skeleton-meta" style={{ width: '40%', marginTop: '8px' }} />
        </div>
      )}
      {error && !isLoading && (
        <div className="state-box state-box--error" role="alert">
          <span className="state-icon">⚠</span><p>{error}</p>
        </div>
      )}
      {data && !isLoading && (
        <div className="widget-body">
          <p className="widget-value">
            1 NGN <span className="widget-equals">=</span> {data.rate.toFixed(8)} <span className="widget-currency">USD</span>
          </p>
          <p className="widget-sub">1 USD = {data.inverse.toFixed(2)} NGN</p>
          <p className="widget-date">Rate date: {data.date}</p>
        </div>
      )}
    </div>
  );
}