import type { RouteRecordRaw } from 'vue-router';
import fs from 'fs';
import path from 'path';

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface SitemapConfig {
  baseUrl: string;
  routes: RouteRecordRaw[];
  outputPath: string;
  excludePaths?: string[];
  dynamicRoutes?: Record<string, string[]>;
}

export const generateSitemap = ({
  baseUrl,
  routes,
  outputPath,
  excludePaths = [],
  dynamicRoutes = {},
}: SitemapConfig): void => {
  const baseUrlNormalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const entries: SitemapEntry[] = [];
  
  // Process static routes
  routes.forEach(route => {
    const path = typeof route.path === 'string' ? route.path : '';
    
    // Skip excluded paths and auth routes
    if (
      excludePaths.includes(path) || 
      route.meta?.requiresAuth || 
      route.meta?.requiresGuest ||
      path.includes(':') // Skip dynamic route templates
    ) {
      return;
    }
    
    // Add the static route
    entries.push({
      url: `${baseUrlNormalized}${path.startsWith('/') ? path.substring(1) : path}`,
      changefreq: 'weekly',
      priority: path === '/' ? 1.0 : 0.8,
      lastmod: new Date().toISOString().split('T')[0],
    });
  });
  
  // Process dynamic routes
  Object.entries(dynamicRoutes).forEach(([routePath, paths]) => {
    paths.forEach(dynamicPath => {
      const fullPath = routePath.replace(/:[^/]+/, dynamicPath);
      entries.push({
        url: `${baseUrlNormalized}${fullPath.startsWith('/') ? fullPath.substring(1) : fullPath}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString().split('T')[0],
      });
    });
  });
  
  // Generate XML
  const xml = generateSitemapXml(entries);
  
  // Write to file
  fs.writeFileSync(outputPath, xml);
  
  console.log(`Sitemap generated at ${outputPath}`);
};

function generateSitemapXml(entries: SitemapEntry[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  entries.forEach(entry => {
    xml += '  <url>\n';
    xml += `    <loc>${entry.url}</loc>\n`;
    
    if (entry.lastmod) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    
    if (entry.changefreq) {
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    
    if (entry.priority !== undefined) {
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    }
    
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
}

// Function to use in Vite plugin
export const generateSitemapPlugin = (config: Omit<SitemapConfig, 'outputPath'>) => {
  return {
    name: 'vite:generate-sitemap',
    closeBundle() {
      const outputPath = path.resolve('./dist/sitemap.xml');
      generateSitemap({
        ...config,
        outputPath,
      });
    }
  };
};
