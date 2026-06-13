import {
  catalogImagePresentationStyle,
  resolveCatalogImagePresentation,
} from '../catalogImagePresentation.js';

describe('resolveCatalogImagePresentation', () => {
  it('uses tenant card aspect ratio and clamps focal nudge to ±5%', () => {
    const presentation = resolveCatalogImagePresentation({
      variant: 'card',
      catalogMedia: {
        cardAspectRatio: '16:9',
        objectFit: 'cover',
      },
      focalPointX: 0,
      focalPointY: 1,
    });

    expect(presentation.aspectRatio).toBe('16 / 9');
    expect(presentation.objectFit).toBe('cover');
    expect(presentation.objectPosition).toBe('45% 55%');
  });

  it('uses thumbnail defaults when variant is thumbnail', () => {
    const style = catalogImagePresentationStyle({
      variant: 'thumbnail',
      catalogMedia: { thumbnailAspectRatio: '1:1', objectFit: 'contain' },
    });

    expect(style.aspectRatio).toBe('1 / 1');
    expect(style.objectFit).toBe('contain');
    expect(style.objectPosition).toBe('50% 50%');
  });
});
