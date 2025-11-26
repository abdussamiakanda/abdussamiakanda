import './About.css';

function About({ profile }) {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="about-content">
          <div className="about-image-wrapper">
            <img 
              src="/sami.JPG" 
              alt={profile?.name || 'Abdus Sami Akanda'} 
              className="about-image"
            />
          </div>
          <div className="about-text">
            {profile?.greeting && <h1 className="greeting">{profile.greeting}</h1>}
            {!profile?.greeting && <h1 className="greeting">Hi, my name is</h1>}
            <h2 className="name">{profile?.name || 'Md Abdus Sami Akanda'}</h2>
            <p className="description">
              {profile?.description || 'I am a prospective graduate student of Physics at the University of Nebraska-Lincoln. My research focuses on the fascinating field of spintronics, exploring how the spin of electrons can be used to create innovative electronic devices.'}
            </p>
            <div className="about-buttons">
              {profile?.cvUrl && (
                <a href={profile.cvUrl} download className="btn btn-primary">
                  Download CV
                </a>
              )}
              {profile?.resumeUrl && (
                <a href={profile.resumeUrl} download className="btn btn-secondary">
                  Download Resume
                </a>
              )}
              {!profile?.cvUrl && !profile?.resumeUrl && (
                <>
                  <a href="#" className="btn btn-primary">
                    Download CV
                  </a>
                  <a href="#" className="btn btn-secondary">
                    Download Resume
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;

