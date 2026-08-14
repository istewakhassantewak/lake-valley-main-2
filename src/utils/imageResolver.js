/**
 * Utility to resolve live images from ImageContext matching project titles,
 * hero slides, masterplan, or section targets.
 */

export function resolveProjectImage(project, images = []) {
  if (!project) return '';
  // 1. Direct explicit image configured on project
  if (project.image && typeof project.image === 'string' && project.image.trim() !== '') {
    return project.image;
  }

  if (!Array.isArray(images) || images.length === 0) return '';

  const normalizedTitle = (project.title || '').toLowerCase().trim();
  const normalizedSlug = (project.slug || project.id || '').toLowerCase().trim();

  // 2. Try to match by targetSection === 'project' AND matching title or slug
  const matchedImage = images.find((img) => {
    if (!img || !img.src) return false;
    const imgTitle = (img.title || '').toLowerCase().trim();
    const imgAlt = (img.alt || '').toLowerCase().trim();

    return (
      (img.targetSection === 'project' || img.targetSection === 'all') &&
      (imgTitle.includes(normalizedTitle) ||
        normalizedTitle.includes(imgTitle) ||
        imgAlt.includes(normalizedTitle) ||
        (normalizedSlug && imgTitle.includes(normalizedSlug)))
    );
  });

  if (matchedImage?.src) return matchedImage.src;

  // 3. Try matching any image by title
  const titleMatched = images.find((img) => {
    if (!img || !img.src) return false;
    const imgTitle = (img.title || '').toLowerCase().trim();
    return imgTitle && (imgTitle.includes(normalizedTitle) || normalizedTitle.includes(imgTitle));
  });

  if (titleMatched?.src) return titleMatched.src;

  return '';
}

export function resolveProjectHeroImage(project, images = []) {
  if (!project) return '';
  // 1. Direct explicit heroImage configured on project
  if (project.heroImage && typeof project.heroImage === 'string' && project.heroImage.trim() !== '') {
    return project.heroImage;
  }
  // 2. Direct project.image fallback
  if (project.image && typeof project.image === 'string' && project.image.trim() !== '') {
    return project.image;
  }

  if (!Array.isArray(images) || images.length === 0) return '';

  const normalizedTitle = (project.title || '').toLowerCase().trim();

  const matched = images.find((img) => {
    if (!img || !img.src) return false;
    const imgTitle = (img.title || '').toLowerCase().trim();
    return (
      (img.targetSection === 'project_hero' || img.targetSection === 'hero') &&
      (imgTitle.includes(normalizedTitle) || normalizedTitle.includes(imgTitle))
    );
  });

  if (matched?.src) return matched.src;

  return resolveProjectImage(project, images) || '';
}

export function resolveHeroSlideImage(slide, index = 0, images = []) {
  if (!slide) return '';
  // 1. Direct explicit image configured on slide (ALWAYS HIGHEST PRIORITY)
  if (slide.image && typeof slide.image === 'string' && slide.image.trim() !== '') {
    return slide.image.trim();
  }

  if (!Array.isArray(images) || images.length === 0) return '';

  const normalizedTitle = (slide.title || '').toLowerCase().trim();

  // 2. Match hero image by explicit title or specific slide label
  const matchedHero = images.find((img) => {
    if (!img || !img.src) return false;
    const imgTitle = (img.title || '').toLowerCase().trim();
    return (
      img.targetSection === 'hero' &&
      ((normalizedTitle && (imgTitle.includes(normalizedTitle) || normalizedTitle.includes(imgTitle))) ||
        imgTitle.includes(`slide ${index + 1}`) ||
        imgTitle.includes(`hero ${index + 1}`))
    );
  });

  if (matchedHero?.src) return matchedHero.src;

  return '';
}

export function resolveMasterPlanImage(images = [], fallback = '') {
  if (!Array.isArray(images) || images.length === 0) return fallback;

  const matched = images.find((img) => {
    if (!img || !img.src) return false;
    const imgTitle = (img.title || '').toLowerCase().trim();
    return img.targetSection === 'masterplan' || imgTitle.includes('master plan') || imgTitle.includes('masterplan');
  });

  return matched?.src || fallback;
}
