import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import './DemoPage.css';

function DemoPage() {
  const { name } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!name) {
      setError('Demo name not provided');
      setLoading(false);
      return;
    }

    // Load the HTML file
    const loadDemo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the HTML file from public directory
        const response = await fetch(`/demo/${name}.html`);
        if (!response.ok) {
          throw new Error(`Demo "${name}" not found`);
        }
        
        const htmlContent = await response.text();
        
        // Create a blob URL for the HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        if (iframeRef.current) {
          iframeRef.current.src = url;
        }
        
        setLoading(false);
        
        // Cleanup blob URL on unmount
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error loading demo:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadDemo();
  }, [name]);

  if (error) {
    return (
      <div className="app">
        <Header />
        <main className="demo-page-main">
          <div className="demo-page-container">
            <div className="demo-error">
              <h1>Demo Not Found</h1>
              <p>{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <SEO 
        title={`Demo - ${name}`}
        description={`Interactive demo: ${name}`}
        url={`/demo/${name}`}
      />
      <Header />
      <main className="demo-page-main">
        <div className="demo-page-container">
          {loading && (
            <div className="demo-loading">
              <div className="loader"></div>
              <p>Loading demo...</p>
            </div>
          )}
          <div className="demo-wrapper">
            <iframe
              ref={iframeRef}
              title={`Demo: ${name}`}
              className="demo-iframe"
              style={{ display: loading ? 'none' : 'block' }}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default DemoPage;

