export const getApiUrl = (path: string, queryParams: Record<string, string | number | null> = {}) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  const queryString = Object.entries(queryParams)
    .filter(([, v]) => v !== null && v !== '')
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
    
  return `/${cleanPath}${queryString ? '?' + queryString : ''}`;
};
