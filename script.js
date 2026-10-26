const body = document.body;
const intro = document.querySelector('.intro');
const introVideo = document.querySelector('.intro__video');
const heroVideo = document.querySelector('[data-hero-video]');
const heroVideoSource = heroVideo?.querySelector('source[data-src]');
const enterLink = document.querySelector('[data-enter]');
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-nav');
const navigationLinks = [...document.querySelectorAll('.main-nav a')];
const allScrollLinks = [...navigationLinks, document.querySelector('.brand'), document.querySelector('.hero__link')];
const dialog = document.querySelector('.poster-dialog');
const dialogContent = document.querySelector('.poster-dialog__content');
const closeDialogButton = document.querySelector('.poster-dialog__close');
const projectDialog = document.querySelector('.project-dialog');
const projectDialogContent = document.querySelector('.project-dialog__content');
const closeProjectDialogButton = document.querySelector('.project-dialog__close');
const editorialVideo = document.querySelector('.editorial__video');
const editorialFilm = document.querySelector('.editorial__film');
const editorialVideoSource = editorialVideo?.querySelector('source[data-src]');
const editorialVideoButton = document.querySelector('[data-editorial-video]');
const editorialVideoLabel = document.querySelector('[data-editorial-video-label]');
const siteSoundtrack = document.querySelector('#site-soundtrack');
const siteSoundButton = document.querySelector('[data-site-sound]');
const siteSoundLabel = document.querySelector('[data-site-sound-label]');

function loadDeferredVideo(video, source) {
  if (!video || !source || source.hasAttribute('src')) return;
  source.src = source.dataset.src;
  video.load();
}

function playDeferredVideo(video, source) {
  loadDeferredVideo(video, source);
  video?.play().catch(() => {});
}

if (editorialVideo && editorialFilm) {
  const editorialLoadingTimer = window.setTimeout(() => {
    if (editorialVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      editorialFilm.classList.add('is-video-loading');
    }
  }, 550);

  function revealEditorialVideo() {
    if (editorialVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      window.clearTimeout(editorialLoadingTimer);
      editorialFilm.classList.remove('is-video-loading');
    }
  }

  editorialVideo.addEventListener('loadeddata', revealEditorialVideo, { once: true });
  editorialVideo.addEventListener('canplay', revealEditorialVideo, { once: true });
  revealEditorialVideo();

  if ('IntersectionObserver' in window) {
    const editorialVideoObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      playDeferredVideo(editorialVideo, editorialVideoSource);
      editorialVideoObserver.disconnect();
    }, { rootMargin: '500px 0px' });
    editorialVideoObserver.observe(editorialFilm);
  } else {
    playDeferredVideo(editorialVideo, editorialVideoSource);
  }
}

function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}

if (intro && introVideo) {
  const loadingScreenTimer = window.setTimeout(() => {
    if (introVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      intro.classList.add('is-video-loading');
    }
  }, 550);

  function revealIntroVideo() {
    if (introVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      window.clearTimeout(loadingScreenTimer);
      intro.classList.remove('is-video-loading');
      intro.classList.add('is-video-ready');
    }
  }

  introVideo.addEventListener('loadeddata', revealIntroVideo, { once: true });
  introVideo.addEventListener('canplay', revealIntroVideo, { once: true });
  revealIntroVideo();
}

function updateSiteSoundState(isPlaying) {
  if (!siteSoundButton || !siteSoundLabel) return;
  siteSoundButton.setAttribute('aria-pressed', String(isPlaying));
  siteSoundLabel.textContent = isPlaying ? 'Sound off' : 'Sound on';
}

async function startSiteSound() {
  if (!siteSoundtrack) return;

  try {
    await siteSoundtrack.play();
    updateSiteSoundState(true);
  } catch {
    if (siteSoundLabel) siteSoundLabel.textContent = 'Sound unavailable';
  }
}

if (siteSoundtrack && siteSoundButton) {
  siteSoundButton.addEventListener('click', () => {
    if (siteSoundtrack.paused) {
      startSiteSound();
    } else {
      siteSoundtrack.pause();
      updateSiteSoundState(false);
    }
  });

  siteSoundtrack.addEventListener('pause', () => updateSiteSoundState(false));
}

menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  navigation.classList.toggle('is-open', !expanded);
  menuButton.setAttribute('aria-expanded', String(!expanded));
});

function scrollToTarget(target) {
  const headerOffset = header.offsetHeight;
  const start = window.scrollY;
  const destination = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
  const duration = Math.min(1200, Math.max(560, Math.abs(destination - start) * .42));
  const startTime = performance.now();

  function ease(progress) {
    return progress < .5 ? 16 * progress ** 5 : 1 - ((-2 * progress + 2) ** 5) / 2;
  }

  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    window.scrollTo(0, start + (destination - start) * ease(progress));
    if (progress < 1) window.requestAnimationFrame(update);
  }

  window.requestAnimationFrame(update);
}

allScrollLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    closeMenu();
    history.pushState(null, '', link.getAttribute('href'));
    scrollToTarget(target);
  });
});

enterLink.addEventListener('click', (event) => {
  event.preventDefault();
  playDeferredVideo(heroVideo, heroVideoSource);
  body.classList.remove('has-intro');
  intro.classList.add('is-leaving');
  window.setTimeout(() => intro.remove(), 720);
  window.setTimeout(() => scrollToTarget(document.querySelector('#home')), 80);
});

const sections = [...document.querySelectorAll('[data-section]')];
const activeSectionObserver = new IntersectionObserver((entries) => {
  const current = entries.find((entry) => entry.isIntersecting);
  if (!current) return;
  navigationLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${current.target.id}`);
  });
}, { rootMargin: '-34% 0px -56% 0px', threshold: 0 });
sections.forEach((section) => activeSectionObserver.observe(section));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

if (editorialVideo && editorialVideoButton && editorialVideoLabel) {
  function updateEditorialVideoState() {
    const isPaused = editorialVideo.paused;
    editorialVideo.setAttribute('aria-label', isPaused ? 'Click to play Red as Love' : 'Click to pause Red as Love');
    editorialVideoLabel.textContent = isPaused ? 'Click video to play' : 'Click video to pause';
  }

  editorialVideoButton.addEventListener('click', () => {
    if (editorialVideo.paused) {
      loadDeferredVideo(editorialVideo, editorialVideoSource);
      editorialVideo.play();
    } else {
      editorialVideo.pause();
    }
  });

  editorialVideo.addEventListener('play', updateEditorialVideoState);
  editorialVideo.addEventListener('pause', updateEditorialVideoState);
  editorialVideo.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    editorialVideoButton.click();
  });
  updateEditorialVideoState();
}

const pictogramProjects = {
  44: {
    meta: '44 Front Row / Conceptual graphic package',
    title: '44 Front Row',
    description: 'A conceptual graphic package for 44 Front Row, built as a compact identity with enough tension to move between a collective, a crowd and a printed moment.',
    images: [
      'assets/pictograms/44/44sito1.webp',
      'assets/pictograms/44/44sito2.webp',
      'assets/pictograms/44/44sito3.webp',
    ],
  },
  pr: {
    meta: 'Private Rave / Event communication',
    title: 'Private Rave',
    description: 'Official communication graphics for an event by a music collective in Aarau, Switzerland. A direct system designed to carry the energy of the night from announcement to afterimage.',
    images: [
      'assets/pictograms/pr/pr_sito1.webp',
      'assets/pictograms/pr/pr_sito2.webp',
      'assets/pictograms/pr/pr_sito3.webp',
      'assets/pictograms/pr/pr_sito4.webp',
      'assets/pictograms/pr/pr_sito5.webp',
    ],
  },
  kt: {
    meta: 'Krueger Tapes / Fictional vinyl artwork',
    title: 'Krueger Tapes',
    description: 'Artwork for a fictional vinyl release: an imagined record given its own sleeve, object language and visual atmosphere.',
    images: [
      'assets/pictograms/kt/kt_1.webp',
      'assets/pictograms/kt/kt_2.webp',
    ],
  },
  tmk: {
    meta: 'True Monsters Klub / Poster archive',
    title: 'True Monsters Klub',
    description: '',
    images: [
      'assets/pictograms/tmk/tmk.webp',
      'assets/pictograms/tmk/tmk2.webp',
    ],
    footer: 'Also featured in the poster archive below.',
  },
};

function openPictogramProject(projectKey) {
  const project = pictogramProjects[projectKey];
  if (!project || !projectDialog || !projectDialogContent) return;

  projectDialogContent.replaceChildren();

  const intro = document.createElement('div');
  intro.className = 'project-dialog__intro';
  const titleGroup = document.createElement('div');
  const meta = document.createElement('p');
  const title = document.createElement('h2');
  meta.className = 'project-dialog__meta';
  meta.textContent = project.meta;
  title.textContent = project.title;
  titleGroup.append(meta, title);
  intro.append(titleGroup);

  if (project.description) {
    const description = document.createElement('p');
    description.className = 'project-dialog__description';
    description.textContent = project.description;
    intro.append(description);
  }

  const gallery = document.createElement('div');
  gallery.className = 'project-dialog__gallery';
  project.images.forEach((source, index) => {
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    image.src = source;
    image.alt = `${project.title} application ${index + 1}`;
    image.loading = index > 1 ? 'lazy' : 'eager';
    figure.append(image);
    gallery.append(figure);
  });

  projectDialogContent.append(intro, gallery);

  if (project.footer) {
    const footer = document.createElement('p');
    footer.className = 'project-dialog__footer';
    footer.textContent = project.footer;
    projectDialogContent.append(footer);
  }

  projectDialog.showModal();
}

document.querySelectorAll('[data-pictogram-project]').forEach((card) => {
  card.addEventListener('click', () => {
    openPictogramProject(card.dataset.pictogramProject);
  });
});

document.querySelectorAll('[data-poster]').forEach((poster) => {
  poster.addEventListener('click', () => {
    dialogContent.innerHTML = '';
    const image = document.createElement('img');
    image.src = poster.dataset.poster;
    image.alt = poster.dataset.title;
    dialogContent.append(image);
    dialog.showModal();
  });
});

closeDialogButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

closeProjectDialogButton.addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', (event) => {
  if (event.target === projectDialog) projectDialog.close();
});
