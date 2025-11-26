import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import About from '../components/About';
import SectionWrapper from '../components/SectionWrapper';
import SubSection from '../components/SubSection';
import Research from '../components/Research';
import Teaching from '../components/Teaching';
import Education from '../components/Education';
import Skills from '../components/Skills';
import Activities from '../components/Activities';
import Awards from '../components/Awards';
import PersonalProjects from '../components/PersonalProjects';
import Programming from '../components/Programming';
import WebDevelopment from '../components/WebDevelopment';
import Scribbling from '../components/Scribbling';
import Curations from '../components/Curations';
import Gallery from '../components/Gallery';
import Posts from '../components/Posts';
import Hobbies from '../components/Hobbies';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getProfile, getResearch, getTeaching, getEducation, getSkills, getActivities, getAwards, getPersonalProjects, getTeachingMetadata, getResearchMetadata } from '../services/dataService';

function Home() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [research, setResearch] = useState([]);
  const [researchMetadata, setResearchMetadata] = useState(null);
  const [teaching, setTeaching] = useState([]);
  const [teachingMetadata, setTeachingMetadata] = useState(null);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [activities, setActivities] = useState([]);
  const [awards, setAwards] = useState([]);
  const [personalProjects, setPersonalProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle hash navigation when coming from other pages
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.substring(1); // Remove the '#'
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 300); // Wait a bit for content to load
    }
  }, [location.hash, loading]);

  useEffect(() => {
    const loadData = async () => {
      // Set a maximum loading time of 5 seconds
      const maxLoadTime = setTimeout(() => {
        setLoading(false);
      }, 5000);

      try {
        const [profileData, researchData, researchMetadataData, teachingData, teachingMetadataData, educationData, skillsData, activitiesData, awardsData, projectsData] = await Promise.allSettled([
          getProfile(),
          getResearch(),
          getResearchMetadata(),
          getTeaching(),
          getTeachingMetadata(),
          getEducation(),
          getSkills(),
          getActivities(),
          getAwards(),
          getPersonalProjects()
        ]);
        
        setProfile(profileData.status === 'fulfilled' ? profileData.value : null);
        setResearch(researchData.status === 'fulfilled' ? researchData.value : []);
        setResearchMetadata(researchMetadataData.status === 'fulfilled' ? researchMetadataData.value : null);
        setTeaching(teachingData.status === 'fulfilled' ? teachingData.value : []);
        setTeachingMetadata(teachingMetadataData.status === 'fulfilled' ? teachingMetadataData.value : null);
        setEducation(educationData.status === 'fulfilled' ? educationData.value : []);
        setSkills(skillsData.status === 'fulfilled' ? skillsData.value : []);
        setActivities(activitiesData.status === 'fulfilled' ? activitiesData.value : []);
        setAwards(awardsData.status === 'fulfilled' ? awardsData.value : []);
        setPersonalProjects(projectsData.status === 'fulfilled' ? projectsData.value : []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        clearTimeout(maxLoadTime);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

      return (
        <div className="app">
          <SEO 
            title={profile?.name ? `Home - ${profile.name}` : 'Home'}
            description={profile?.description || 'Personal portfolio showcasing academic achievements, research, teaching, and creative projects.'}
            url="/"
          />
          <Header />
          <main>
            <About profile={profile} />
            
            <SectionWrapper 
          id="developer" 
          title="Developer" 
          subtitle="Technical skills and development expertise"
          className="developer"
        >
          
          {personalProjects && personalProjects.length > 0 && (
            <SubSection title="Projects">
              <PersonalProjects data={personalProjects} limit={3} />
            </SubSection>
          )}
          
          <SubSection title="Programming">
            <Programming />
          </SubSection>
          
          <SubSection title="Web Development">
            <WebDevelopment />
          </SubSection>
          
          {skills && skills.length > 0 && (
            <SubSection title="Skillset">
              <Skills data={skills} />
            </SubSection>
          )}
        </SectionWrapper>

        <SectionWrapper 
          id="academic" 
          title="Academic" 
          subtitle="Research, teaching, and academic achievements"
          className="academic"
        >
          {(research && research.length > 0) || (researchMetadata && researchMetadata.profileLinks && researchMetadata.profileLinks.length > 0) ? (
            <SubSection title="Research">
              <Research data={research} metadata={researchMetadata} />
            </SubSection>
          ) : null}
          
          {(teaching && teaching.length > 0) || (teachingMetadata && (teachingMetadata.description || (teachingMetadata.generalSubjects && teachingMetadata.generalSubjects.length > 0))) ? (
            <SubSection title="Teaching Experience">
              <Teaching data={teaching} metadata={teachingMetadata} />
            </SubSection>
          ) : null}
          
          {education && education.length > 0 && (
            <SubSection title="Education">
              <Education data={education} />
            </SubSection>
          )}
          
          {activities && activities.length > 0 && (
            <SubSection title="Co-curricular Activities">
              <Activities data={activities} />
            </SubSection>
          )}
          
          {awards && awards.length > 0 && (
            <SubSection title="Awards">
              <Awards data={awards} />
            </SubSection>
          )}
        </SectionWrapper>

        <SectionWrapper 
          id="personal" 
          title="Personal" 
          subtitle="Projects, interests, and creative pursuits"
          className="personal"
        >
          <Scribbling />
          
          <Curations />
          
          <SubSection title="Hobbies">
            <Hobbies />
          </SubSection>
          
          <SubSection title="Gallery">
            <Gallery />
          </SubSection>
          
          <SubSection title="Posts">
            <Posts />
          </SubSection>
        </SectionWrapper>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
