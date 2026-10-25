import { useEffect } from 'react';

export function useSEO(title: string, description?: string) {
  useEffect(() => {
    // Save previous title/description to revert on unmount (optional, but good practice)
    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');

    // Update title
    document.title = title ? `${title} | SMM Panel` : 'SMM Panel';

    // Update description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        metaDescription.setAttribute('content', description);
        document.head.appendChild(metaDescription);
      }
    }

    return () => {
      document.title = previousTitle || 'SMM Panel';
      if (description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          if (previousDescription) {
            metaDescription.setAttribute('content', previousDescription);
          } else {
            metaDescription.remove();
          }
        }
      }
    };
  }, [title, description]);
}
