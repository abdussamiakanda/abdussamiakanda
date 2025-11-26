import './Skills.css';

function Skills({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div id="skills" className="content-block">
      <p className="skills-note">
        These values are not scientifically grounded and are merely based on my personal estimation 
        of how confident I am in each area to face specific challenges.
      </p>
      <div className="skills-grid">
          {data.map((skill) => (
            <div key={skill.id} className="skill-item">
              <div className="skill-header">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-percentage">{skill.percentage}%</span>
              </div>
              <div className="skill-bar">
                <div 
                  className="skill-progress" 
                  style={{ width: `${skill.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Skills;

