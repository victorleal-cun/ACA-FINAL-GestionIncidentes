import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext(null);

function getCleanPath() {
  if (typeof window === 'undefined') return '/';

  // 1. Verificar Hash primero (#/experiencia, #/lab/resultados)
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/')) {
    const cleanHash = hash.slice(1).split('?')[0].toLowerCase().trim().replace(/\/+$/, '') || '/';
    return cleanHash;
  }

  // 2. Verificar Query string (?route=/experiencia o ?page=lab/resultados)
  const searchParams = new URLSearchParams(window.location.search);
  const routeParam = searchParams.get('route') || searchParams.get('page');
  if (routeParam) {
    const cleanRoute = (routeParam.startsWith('/') ? routeParam : `/${routeParam}`)
      .toLowerCase()
      .trim()
      .replace(/\/+$/, '') || '/';
    return cleanRoute;
  }

  // 3. Pathname estándar (/experiencia, /lab/resultados)
  const p = (window.location.pathname || '/').toLowerCase().trim().replace(/\/+$/, '') || '/';
  return p;
}

export function Router({ children }) {
  const [currentPath, setCurrentPath] = useState(() => getCleanPath());

  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(getCleanPath());
    };

    window.addEventListener('popstate', updatePath);
    window.addEventListener('hashchange', updatePath);
    return () => {
      window.removeEventListener('popstate', updatePath);
      window.removeEventListener('hashchange', updatePath);
    };
  }, []);

  const navigate = (toPath) => {
    const target = (toPath || '/').toLowerCase().trim().replace(/\/+$/, '') || '/';
    if (target !== currentPath) {
      window.history.pushState({}, '', target);
      setCurrentPath(target);
      window.scrollTo(0, 0);
    }
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useNavigation must be used within a Router');
  }
  return context;
}

export function Route({ path, element }) {
  const { currentPath } = useNavigation();
  const normalizedRoutePath = (path || '/').toLowerCase().trim().replace(/\/+$/, '') || '/';
  if (currentPath === normalizedRoutePath) {
    return element;
  }
  return null;
}

export function Link({ href, children, className = '', onClick, ...props }) {
  const { navigate } = useNavigation();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
