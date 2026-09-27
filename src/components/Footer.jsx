import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import { FiArrowUp, FiArrowUpRight, FiCheck, FiCopy } from 'react-icons/fi';
import { getProfile } from '../services/dataService';
import { getSocialIcon } from '../lib/socialIcons';
import { CV_URL, PRIMARY_NAV } from '../lib/siteMap';
import Magnetic from './ui/Magnetic';
import { Reveal } from './ui/Reveal';

function Footer() {
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getProfile().then(setProfile).catch(console.error);
  }, []);

  const links = (profile?.socialLinks ?? []).filter((l) => l.platform && l.url);
  const emailLink = links.find((l) => l.url.startsWith('mailto:'));
  const email = emailLink?.url.replace('mailto:', '') ?? 'abdussamiakanda@gmail.com';
  const socials = links.filter((l) => l !== emailLink);
  const name = profile?.name ?? 'Md Abdus Sami Akanda';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const columns = [
    { title: 'Index', items: PRIMARY_NAV.filter((n) => !n.children).map((n) => ({ label: n.label, to: n.to })) },
    ...PRIMARY_NAV.filter((n) => n.children).map((n) => ({ title: n.label, items: n.children })),
  ];

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-bg-2 md:mt-32">
      {/* Call to action */}
      <div className="shell grid gap-10 py-16 md:grid-cols-12 md:items-end md:py-24">
        <Reveal className="md:col-span-7">
          <p className="eyebrow mb-5 flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-up" />
            </span>
            Open to collaborations &amp; conversations
          </p>
          <h2 className="font-display text-[clamp(2.6rem,6vw,5.25rem)] leading-[0.95] tracking-[-0.025em] text-ink">
            Let’s talk about <span className="italic text-ink-2">things that spin.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-3 md:col-span-5 md:items-end">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <Magnetic className="min-w-0 flex-1 md:flex-none">
              <a
                href={`mailto:${email}`}
                className="group relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-ink px-6 text-bg"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-up transition-transform duration-500 ease-out-expo group-hover:translate-y-0" />
                <span className="relative truncate text-[0.95rem] transition-colors group-hover:text-on-up">{email}</span>
                <FiArrowUpRight className="relative shrink-0 transition-colors group-hover:text-on-up" />
              </a>
            </Magnetic>
            <Tooltip title={copied ? 'Copied' : 'Copy address'} arrow>
              <button
                type="button"
                onClick={copy}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink"
                aria-label="Copy email address"
              >
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            </Tooltip>
          </div>
          <a href={CV_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 hover:text-ink">
            <span className="link-underline">Download CV</span>
            <FiArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </Reveal>
      </div>

      {/* Brand, socials and site map */}
      <div className="shell">
        <div className="grid gap-12 border-t border-line py-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex items-baseline font-display text-3xl leading-none text-ink" aria-label="Home">
              Sami&nbsp;<span className="italic text-ink-2">Akanda</span>
              <span className="text-up">.</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-2">
              Physicist (MS, University of Nebraska–Lincoln). Researcher and academic instructor in condensed matter physics.
            </p>
            <ul className="mt-6 flex flex-wrap gap-1.5">
              {socials.map((link) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <li key={link.platform}>
                    <Tooltip title={link.platform} arrow>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.platform}
                        className="grid h-9 w-9 place-items-center rounded-full border border-line text-[0.9rem] text-ink-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-up hover:text-up"
                      >
                        <Icon />
                      </a>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:col-start-7" aria-label="Footer">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className="link-underline text-sm text-ink-2 hover:text-ink">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-3">
          <span>
            © {new Date().getFullYear()} {name}
          </span>
          <span className="flex items-center gap-5">
            <span className="hidden sm:inline">
              Press <kbd className="rounded border border-line px-1">/</kbd> to search
            </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 text-ink-2 transition-colors hover:text-ink"
            >
              Back to top <FiArrowUp />
            </button>
          </span>
        </div>
      </div>

      {/* Wordmark: a contained strip that fades out, not a full-height band. */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-[clamp(4.5rem,11vw,10rem)] select-none overflow-hidden"
        style={{ maskImage: 'linear-gradient(to bottom, black 20%, transparent 95%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 95%)' }}
      >
        <p className="whitespace-nowrap text-center font-display text-[18vw] leading-[0.8] tracking-[-0.04em] text-ink opacity-[0.07]">Akanda</p>
      </div>

      <Snackbar open={copied} autoHideDuration={2200} onClose={() => setCopied(false)} message="Email address copied" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </footer>
  );
}

export default Footer;
