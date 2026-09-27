// Single source of truth for navigation, the command palette and the footer.
export const PRIMARY_NAV = [
  { label: 'Research', to: '/research' },
  { label: 'Publications', to: '/publications' },
  { label: 'Talks', to: '/speeches' },
  {
    label: 'Writing',
    children: [
      { label: 'Notes', to: '/notes', hint: 'Physics & maths explainers' },
      { label: 'Posts', to: '/posts', hint: 'Essays and longer pieces' },
      { label: 'Scribbling', to: '/scribbling', hint: 'Poems and short stories' },
    ],
  },
  {
    label: 'More',
    children: [
      { label: 'Projects', to: '/projects', hint: 'Simulations & software' },
      { label: 'Courses', to: '/courses', hint: 'Lectures I have taught' },
      { label: 'Gallery', to: '/gallery', hint: 'Moments, framed' },
      { label: 'Hobbies', to: '/hobbies', hint: 'Chess and other diversions' },
      { label: 'Chess', to: '/hobbies/chess', hint: 'Games, journal, bot' },
    ],
  },
];

export const flatNav = () =>
  PRIMARY_NAV.flatMap((item) => (item.children ? item.children : [item])).concat([{ label: 'Home', to: '/' }]);

export const isActivePath = (pathname, to) => {
  if (!to || to.includes('#')) return false;
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
};

// Chess has a dedicated sub-site; other hobbies use their stored route.
export const hobbyRoute = (hobby, slugify) => {
  const slug = slugify(hobby.title);
  return slug === 'chess' ? '/hobbies/chess' : hobby.route || `/hobbies/${slug}`;
};

export const CV_URL = '/CV_Md_Abdus_Sami_Akanda.pdf';
