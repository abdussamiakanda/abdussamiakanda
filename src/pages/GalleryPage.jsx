import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Dialog from '@mui/material/Dialog';
import { FiChevronLeft, FiChevronRight, FiX, FiMaximize2 } from 'react-icons/fi';
import Page, { PageHeader } from '../components/Page';
import { EmptyState } from '../components/ui/primitives';
import { EASE } from '../lib/motion';
import useAsync from '../lib/useAsync';
import { getGallery } from '../services/dataService';

function Lightbox({ items, index, onClose, onStep }) {
  const [dir, setDir] = useState(0);
  const open = index !== null;
  const item = open ? items[index] : null;

  const step = useCallback(
    (d) => {
      setDir(d);
      onStep(d);
    },
    [onStep],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slotProps={{ paper: { sx: { background: 'transparent', border: 0, boxShadow: 'none' } } }}
    >
      <div className="relative flex h-full w-full items-center justify-center p-4 md:p-16" onClick={onClose}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          {item && (
            <motion.img
              key={item.id}
              src={item.imageUrl}
              alt={item.title || ''}
              custom={dir}
              initial={{ opacity: 0, x: dir * 80, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: dir * -80, scale: 0.96 }}
              transition={{ duration: 0.5, ease: EASE }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) step(1);
                else if (info.offset.x > 80) step(-1);
              }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full cursor-grab select-none rounded-2xl object-contain shadow-2xl active:cursor-grabbing"
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
          <span className="rounded-full bg-black/50 px-3 py-1.5 font-mono text-xs text-white backdrop-blur">
            {String((index ?? 0) + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-black/50 text-white backdrop-blur" aria-label="Close">
            <FiX />
          </button>
        </div>
        {[-1, 1].map((d) => (
          <button
            key={d}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(d);
            }}
            className={`absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-white hover:text-black md:grid ${d < 0 ? 'left-6' : 'right-6'}`}
            aria-label={d < 0 ? 'Previous image' : 'Next image'}
          >
            {d < 0 ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        ))}
        {item?.title && (
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur">{item.title}</p>
        )}
      </div>
    </Dialog>
  );
}

function GalleryPage() {
  const { data: items, loading } = useAsync(getGallery, [], []);
  const [index, setIndex] = useState(null);
  const images = items.filter((i) => i.imageUrl);

  const onStep = useCallback((d) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  return (
    <Page loading={loading} seo={{ title: 'Gallery', description: 'Moments, framed.', url: '/gallery' }}>
      <PageHeader eyebrow="Gallery · Photographs" title="Moments," italic="framed." count={images.length} countLabel="frames" />
      <section className="shell">
        {images.length === 0 ? (
          <EmptyState>No photographs yet.</EmptyState>
        ) : (
          <div className="columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4">
            {images.map((item, i) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.9, ease: EASE, delay: (i % 4) * 0.06 }}
                className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface md:mb-4"
                aria-label={item.title || `Open photo ${i + 1}`}
              >
                {/* Small thumbnail in the grid; width/height reserve the space
                    so the masonry doesn't jump as photos load. */}
                <img
                  src={item.thumbUrl || item.imageUrl}
                  width={item.width}
                  height={item.height}
                  alt={item.title || ''}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-white/90 text-black opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <FiMaximize2 />
                </span>
                {item.title && (
                  <span className="absolute bottom-3 left-3 translate-y-2 text-left text-sm text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {item.title}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </section>
      <Lightbox items={images} index={index} onClose={() => setIndex(null)} onStep={onStep} />
    </Page>
  );
}

export default GalleryPage;
