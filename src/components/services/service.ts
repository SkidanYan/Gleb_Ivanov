export function clickService(): void {
  // Список кнопок
  const buttons = document.querySelector<HTMLElement>('.services__section-nav-list');
  const containers = document.querySelectorAll<HTMLElement>('.services__section-article-conteiner');
  if (!buttons) return;

  // Делегация клика
  buttons.addEventListener('click', (event: Event) => {
    // Цель клика
    const target = event.target as HTMLElement;
    const clickedButton = target.closest<HTMLButtonElement>('.services__section-nav-item');
    if (!clickedButton || !buttons.contains(clickedButton)) return;

    // Текущая активная
    const activeButton = buttons.querySelector<HTMLButtonElement>('.services__section-nav-item.is-active');
    if (activeButton && activeButton !== clickedButton) {
      activeButton.classList.remove('is-active');
    }

    // Новая активная
    clickedButton.classList.add('is-active');

    // Индекс выбранной кнопки
    const navButtons = Array.from(
      buttons.querySelectorAll<HTMLButtonElement>('.services__section-nav-item')
    );
    const clickedIndex = navButtons.indexOf(clickedButton);
    if (clickedIndex < 0) return;

    // Активный контент в article
    containers.forEach((container, index) => {
      container.classList.toggle('is-active', index === clickedIndex);
    });
  });
}

export function initServiceSliders(): void {
  const sliders = document.querySelectorAll<HTMLElement>('.services__section-slider');
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const slides = Array.from(
      slider.querySelectorAll<HTMLElement>('.services__section-slider-slide')
    );
    const dots = Array.from(
      slider.querySelectorAll<HTMLButtonElement>('.services__section-slider-dot')
    );
    const prevButton = slider.querySelector<HTMLButtonElement>('.services__section-slider-arrow--prev');
    const nextButton = slider.querySelector<HTMLButtonElement>('.services__section-slider-arrow--next');

    if (!slides.length || !prevButton || !nextButton) return;

    let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (currentIndex < 0) currentIndex = 0;

    const setActiveSlide = (nextIndex: number): void => {
      const total = slides.length;
      const normalizedIndex = ((nextIndex % total) + total) % total;
      currentIndex = normalizedIndex;

      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === normalizedIndex);
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === normalizedIndex);
      });
    };

    prevButton.addEventListener('click', () => {
      setActiveSlide(currentIndex - 1);
    });

    nextButton.addEventListener('click', () => {
      setActiveSlide(currentIndex + 1);
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        setActiveSlide(index);
      });
    });

    // Swipe for touch devices (mobile/tablet)
    let touchStartX = 0;
    let touchStartY = 0;

    slider.addEventListener(
      'touchstart',
      (event: TouchEvent) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { passive: true }
    );

    slider.addEventListener(
      'touchend',
      (event: TouchEvent) => {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // React only to clear horizontal swipes.
        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

        slider.dataset.swiped = 'true';
        window.setTimeout(() => {
          slider.removeAttribute('data-swiped');
        }, 250);

        if (deltaX < 0) {
          setActiveSlide(currentIndex + 1);
          return;
        }

        setActiveSlide(currentIndex - 1);
      },
      { passive: true }
    );

    setActiveSlide(currentIndex);
  });
}

export function initServiceLightbox(): void {
  const lightbox = document.querySelector<HTMLElement>('.services__lightbox');
  const lightboxImage = lightbox?.querySelector<HTMLImageElement>('.services__lightbox-image');
  const clickableImages = document.querySelectorAll<HTMLImageElement>('.services__section-slider-slide img');

  if (!lightbox || !lightboxImage || !clickableImages.length) return;

  const closeLightbox = (): void => {
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('services-lightbox-open');
    lightboxImage.src = '';
  };

  const openLightbox = (image: HTMLImageElement): void => {
    const src = image.getAttribute('src');
    if (!src) return;

    const alt = image.getAttribute('alt') ?? 'Изображение';

    lightboxImage.src = src;
    lightboxImage.alt = alt;

    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('services-lightbox-open');
  };

  clickableImages.forEach((image) => {
    image.addEventListener('click', () => {
      const parentSlider = image.closest<HTMLElement>('.services__section-slider');
      if (parentSlider?.dataset.swiped === 'true') return;
      openLightbox(image);
    });
  });

  const closeButton = lightbox.querySelector<HTMLElement>('[data-lightbox-close]');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      closeLightbox();
    });
  }

  lightbox.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const clickedOnImage = target.closest('.services__lightbox-image');
    const clickedOnClose = target.closest('[data-lightbox-close]');
    if (!clickedOnImage || clickedOnClose) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

export function revealServiceBlocks(): void {
  // Блоки для reveal
  const blocks = document.querySelectorAll<HTMLElement>(
    '.header__menu, .header__title, .header__subtitle, .header__buttons, .services__info, .services__header, .services__section'
  );
  if (!blocks.length) return;

  // Базовый класс
  blocks.forEach((block) => block.classList.add('service-reveal'));

  // Fallback старых браузеров
  if (!('IntersectionObserver' in window)) {
    blocks.forEach((block) => block.classList.add('is-visible'));
    return;
  }

  const ENTER_RATIO = 0.2;

  // Наблюдатель скролла
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const block = entry.target as HTMLElement;
        if (entry.isIntersecting && entry.intersectionRatio >= ENTER_RATIO) {
          block.classList.add('is-visible');
          return;
        }

        if (!entry.isIntersecting) {
          block.classList.remove('is-visible');
        }
      });
    },
    {
      threshold: [0, ENTER_RATIO],
      rootMargin: '0px 0px -8% 0px',
    }
  );

  blocks.forEach((block) => observer.observe(block));
}