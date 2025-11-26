import './SubSection.css';

function SubSection({ title, children }) {
  // If children is null or renders nothing, don't show the subsection
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return null;
  }

  return (
    <div className="subsection">
      <h3 className="subsection-title">{title}</h3>
      <div className="subsection-content">
        {children}
      </div>
    </div>
  );
}

export default SubSection;

