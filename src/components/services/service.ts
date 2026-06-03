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

    setActiveSlide(currentIndex);
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