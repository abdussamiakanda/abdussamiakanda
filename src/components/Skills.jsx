import { useMemo } from 'react';
import './Skills.css';

function Skills({ data }) {
  if (!data || data.length === 0) return null;

  // Sort skills by percentage - highest first
  const sortedSkills = useMemo(() => {
    return [...data]
      .map(skill => ({ ...skill, percentage: parseFloat(skill.percentage) || 0 }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [data]);

  // Get size class based on percentage
  const getSizeClass = (percentage) => {
    if (percentage >= 80) return 'size-large';
    if (percentage >= 60) return 'size-medium';
    if (percentage >= 40) return 'size-small';
    return 'size-xs';
  };

  return (
    <div id="skills" className="content-block">
      <div className="skills-grid">
        {sortedSkills.map((skill, index) => (
          <div
            key={skill.id}
            className={`skill-item ${getSizeClass(skill.percentage)}`}
            style={{ animationDelay: `${index * 0.05}s` }}
            title={`${skill.name} - ${skill.percentage}%`}
          >
            <div className="skill-logo-wrapper">
              {skill.logo || skill.icon ? (
                <img
                  src={skill.logo || skill.icon}
                  alt={skill.name}
                  className="skill-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'block';
                    }
                  }}
                />
              ) : null}
              {(!skill.logo && !skill.icon) && (
                <span className="skill-name-fallback">{skill.name}</span>
              )}
            </div>
            <div className="skill-percentage-bar">
              <div
                className="skill-percentage-fill"
                style={{ width: `${skill.percentage}%` }}
              ></div>
            </div>
            <div className="skill-label">{skill.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skills;

