import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiArrowUpRight } from 'react-icons/fi';
import Marquee from '../ui/Marquee';
import { ArrowLink, SectionHeading } from '../ui/primitives';
import { Stagger } from '../ui/Reveal';
import { staggerItem } from '../../lib/motion';
import { titleCase } from '../../lib/format';
import { hobbyRoute } from '../../lib/siteMap';
import ChessCardArt from '../chess/ChessCardArt';
import { generateSlug } from '../../services/dataService';

// Three posters that fan out on hover.
function PosterFan({ images }) {
  const spread = [
    { rest: { rotate: -6, x: -18 }, hover: { rotate: -14, x: -70, y: 6 } },
    { rest: { rotate: 0, x: 0 }, hover: { rotate: 0, x: 0, y: -10 } },
    { rest: { rotate: 6, x: 18 }, hover: { rotate: 14, x: 70, y: 6 } },
  ];
  return (
    <div className="relative mx-auto h-56 w-40">
      {images.slice(0, 3).map((src, i) => (
        <motion.img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          variants={{ rest: spread[i].rest, hover: spread[i].hover }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="absolute inset-0 h-full w-full rounded-xl border border-line object-cover shadow-xl shadow-black/30"
          style={{ zIndex: i === 1 ? 2 : 1 }}
        />
      ))}
    </div>
  );
}

export default function Beyond({ gallery, curations, hobbies }) {
  const photos = gallery.filter((g) => g.imageUrl).slice(0, 12);
  const tags = [...new Set(curations.map((c) => c.tag).filter(Boolean))];

  return (
    <section id="beyond" className="relative py-28 md:py-40">
      <div className="shell">
        <SectionHeading
          index="09"
          label="Beyond"
          lines={['Off the clock.']}
          aside="Chess, films worth rewatching, and photographs from along the way."
        />
      </div>

      {photos.length > 0 && (
        <Link to="/gallery" className="group mb-16 block" aria-label="Open gallery">
          <Marquee speed={60} reverse>
            {photos.map((p) => (
              <span key={p.id} className="mr-4 block h-56 overflow-hidden rounded-2xl border border-line bg-surface md:h-72">
                <img src={p.thumbUrl || p.imageUrl} alt="" loading="lazy" className="h-full w-auto object-cover grayscale-[35%] transition-[filter] duration-700 group-hover:grayscale-0" />
              </span>
            ))}
          </Marquee>
        </Link>
      )}

      <Stagger className="shell grid gap-4 md:grid-cols-3">
        {tags.map((tag) => (
          <motion.div key={tag} variants={staggerItem}>
            <motion.div initial="rest" whileHover="hover" animate="rest" className="h-full">
              <Link to={`/curations/${tag}`} className="group flex h-full flex-col justify-between gap-10 overflow-hidden rounded-3xl border border-line bg-surface p-8">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Curations</span>
                  <FiArrowUpRight className="text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-up" />
                </div>
                <PosterFan images={curations.filter((c) => c.tag === tag && c.imageUrl).map((c) => c.imageUrl)} />
                <h3 className="font-display text-4xl text-ink">
                  Curated <span className="italic">{titleCase(tag)}</span>
                </h3>
              </Link>
            </motion.div>
          </motion.div>
        ))}

        {hobbies
          .filter((h) => h?.title)
          .map((h) => (
            <motion.div key={h.id} variants={staggerItem}>
              <Link to={hobbyRoute(h, generateSlug)} className="group flex h-full flex-col justify-between gap-10 overflow-hidden rounded-3xl border border-line bg-surface p-8">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Hobby</span>
                  <FiArrowUpRight className="text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-up" />
                </div>
                {generateSlug(h.title) === 'chess' ? (
                  <ChessCardArt className="mx-auto w-40 transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                ) : (
                  <span className="mx-auto text-[7rem] leading-none transition-transform duration-700 ease-out-expo group-hover:-rotate-12 group-hover:scale-110" aria-hidden="true">
                    {h.emoji || '◎'}
                  </span>
                )}
                <div>
                  <h3 className="font-display text-4xl text-ink">{h.title}</h3>
                  {generateSlug(h.title) === 'chess' && <p className="mt-1 text-sm text-ink-3">Recent games, a journal, and a bot to play.</p>}
                </div>
              </Link>
            </motion.div>
          ))}

        <motion.div variants={staggerItem}>
          <Link to="/gallery" className="group relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-3xl border border-line p-8">
            {photos[0] && (
              <img
                src={photos[photos.length > 3 ? 3 : 0].thumbUrl || photos[photos.length > 3 ? 3 : 0].imageUrl}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
            <div className="relative flex items-center justify-between text-white">
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] opacity-80">Gallery</span>
              <FiArrowUpRight />
            </div>
            <div className="relative text-white">
              <h3 className="font-display text-4xl">
                Moments, <span className="italic">framed.</span>
              </h3>
              <p className="mt-1 font-mono text-xs opacity-70">{gallery.length} photographs</p>
            </div>
          </Link>
        </motion.div>
      </Stagger>

      <div className="shell mt-8 flex justify-end">
        <ArrowLink to="/hobbies">All hobbies</ArrowLink>
      </div>
    </section>
  );
}
