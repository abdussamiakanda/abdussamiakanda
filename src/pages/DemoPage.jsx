import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Page from '../components/Page';
import { Button, Loader } from '../components/ui/primitives';

function DemoPage() {
  const { name } = useParams();
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let url;
    let alive = true;
    setSrc(null);
    setError(null);
    fetch(`/demo/${name}.html`)
      .then((res) => {
        if (!res.ok) throw new Error(`Demo “${name}” not found`);
        return res.text();
      })
      .then((html) => {
        // Serve through a blob URL so the SPA fallback can't swap in index.html.
        url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
        if (alive) setSrc(url);
      })
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [name]);

  return (
    <Page seo={{ title: `Demo — ${name}`, description: `Interactive demo: ${name}` }}>
      <section className="shell pb-10 pt-32">
        <div className="mb-6 flex items-center justify-between">
          <p className="eyebrow">Demo · {name}</p>
          <Button to="/projects" variant="quiet" icon="right">
            Projects
          </Button>
        </div>
        <div className="overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-up" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-down" />
            <span className="ml-3 font-mono text-xs text-ink-3">/demo/{name}</span>
          </div>
          {error ? (
            <div className="grid h-[60vh] place-items-center p-8 text-center">
              <div>
                <p className="font-display text-4xl text-ink">Demo not found</p>
                <p className="mt-2 text-ink-2">{error}</p>
              </div>
            </div>
          ) : src ? (
            <iframe src={src} title={`Demo: ${name}`} className="block h-[75vh] w-full bg-white" sandbox="allow-scripts allow-same-origin" />
          ) : (
            <Loader label="Loading demo" />
          )}
        </div>
      </section>
    </Page>
  );
}

export default DemoPage;
