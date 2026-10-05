import React from 'react';
import { Link as WouterLink, useLocation, useParams as useWouterParams } from 'wouter';

export function Link({ href, children, className, onClick, ...props }) {
  const [, setLocation] = useLocation();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      e.preventDefault();
      setLocation(href);
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

export default Link;

export function usePathname() {
  const [location] = useLocation();
  return location || '/';
}

export function useRouter() {
  const [, setLocation] = useLocation();
  return {
    push: (url) => setLocation(url),
    replace: (url) => setLocation(url, { replace: true }),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  };
}

export function useParams() {
  return useWouterParams() || {};
}
