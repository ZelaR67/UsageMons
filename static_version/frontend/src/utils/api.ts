const BASE_URL = import.meta.env.BASE_URL || '/';

export const getApiUrl = (path: string, queryParams: Record<string, string | number | null> = {}) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  let relativePath = cleanPath;
  if (relativePath.startsWith('api/')) {
    relativePath = relativePath.slice(4);
  }

  if (relativePath === 'formats') {
    return `${BASE_URL}api/formats.json`;
  }
  
  const parts = relativePath.split('/');
  const rating = queryParams.rating;
  
  if (parts.length === 3 && parts[0] === 'format' && parts[2] === 'ratings') {
      return `${BASE_URL}api/format/${parts[1]}/ratings.json`;
  }

  if (parts.length === 2 && parts[0] === 'format') {
    return (rating !== null && rating !== undefined)
        ? `${BASE_URL}api/format/${parts[1]}/index-${rating}.json`
        : `${BASE_URL}api/format/${parts[1]}/index.json`;
  }
  
  if (parts.length === 4 && parts[0] === 'format' && parts[2] === 'pokemon') {
    return (rating !== null && rating !== undefined)
        ? `${BASE_URL}api/format/${parts[1]}/pokemon/${parts[3]}-${rating}.json`
        : `${BASE_URL}api/format/${parts[1]}/pokemon/${parts[3]}.json`;
  }

  return `${BASE_URL}api/${relativePath}.json`;
};
