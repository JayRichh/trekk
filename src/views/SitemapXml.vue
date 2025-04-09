<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrailData } from '../composables/useTrailData';
import type { Trail } from '../types/trail';

const sitemap = ref<string>('');
const { fetchTrails } = useTrailData();
const isLoaded = ref(false);

// Set the content type to XML
function setXmlContentType() {
  const meta = document.createElement('meta');
  meta.setAttribute('http-equiv', 'Content-Type');
  meta.setAttribute('content', 'application/xml; charset=utf-8');
  document.head.appendChild(meta);
}

function generateSitemapXml(trails: Trail[]): string {
  const baseUrl = 'https://trekk.example.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Start XML content
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static pages
  const staticPages = [
    { url: '/', priority: 1.0 },
    { url: '/trails', priority: 0.8 },
    { url: '/map', priority: 0.8 },
  ];
  
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Add dynamic trail pages
  trails.forEach(trail => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/trails/${trail.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
}

onMounted(async () => {
  // Set content type for XML
  setXmlContentType();
  
  try {
    const trails = await fetchTrails();
    sitemap.value = generateSitemapXml(trails);
    isLoaded.value = true;
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    sitemap.value = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
    isLoaded.value = true;
  }
});
</script>

<template>
  <pre v-if="isLoaded">{{ sitemap }}</pre>
</template>
