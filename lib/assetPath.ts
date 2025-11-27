export const getAssetPath = (path: string) => {
    const basePath = process.env.NODE_ENV === 'production' ? '/Journify-v1' : '';
    return `${basePath}${path}`;
};
