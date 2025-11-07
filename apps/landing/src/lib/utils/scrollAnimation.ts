export function scrollAnimation(node: HTMLElement, options: { delay?: number; threshold?: number } = {}) {
  const { delay = 0, threshold = 0.1 } = options;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('fade-in-visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}

