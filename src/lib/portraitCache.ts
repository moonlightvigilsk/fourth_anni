const cache = new Map<string, HTMLImageElement>();

export const preloadPortrait = (guideId: string, src: string): Promise<void> => {
  if (cache.has(guideId)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      cache.set(guideId, image);
      resolve();
    };
    image.onerror = reject;
    image.src = src;
  });
};

export const isPortraitCached = (guideId: string): boolean => cache.has(guideId);
