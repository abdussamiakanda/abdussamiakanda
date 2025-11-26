import './SectionWrapper.css';

function SectionWrapper({ id, title, subtitle, children, className = '' }) {
  return (
    <section id={id} className={`section-wrapper ${className}`}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-main-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        <div className="section-content">
          {children}
        </div>
      </div>
    </section>
  );
}

export default SectionWrapper;

