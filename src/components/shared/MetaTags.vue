<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

// Props for meta information
interface Props {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Trekk - Discover Amazing Trails',
  description: 'Find and explore hiking trails around the world with Trekk - your ultimate hiking companion app.',
  image: '/public/site-preview.png',
  url: '',
});

const route = useRoute();

// Compute the full URL
const fullUrl = computed(() => {
  const baseUrl = window.location.origin;
  return props.url || `${baseUrl}${route.fullPath}`;
});

// Update document title
watch(() => props.title, (newTitle) => {
  document.title = newTitle;
}, { immediate: true });

// Dynamically set meta tags
const updateMetaTags = () => {
  // Set meta description
  let descTag = document.querySelector('meta[name="description"]');
  if (!descTag) {
    descTag = document.createElement('meta');
    descTag.setAttribute('name', 'description');
    document.head.appendChild(descTag);
  }
  descTag.setAttribute('content', props.description);

  // Open Graph tags
  const ogTags = [
    { property: 'og:title', content: props.title },
    { property: 'og:description', content: props.description },
    { property: 'og:url', content: fullUrl.value },
    { property: 'og:image', content: props.image?.startsWith('http') ? props.image : `${window.location.origin}${props.image}` },
    { property: 'og:type', content: 'website' }
  ];

  // Twitter Card tags
  const twitterTags = [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: props.title },
    { name: 'twitter:description', content: props.description },
    { name: 'twitter:image', content: props.image?.startsWith('http') ? props.image : `${window.location.origin}${props.image}` }
  ];

  // Add all tags to document
  [...ogTags, ...twitterTags].forEach(tag => {
    let metaTag = document.querySelector(`meta[${Object.keys(tag)[0]}="${Object.values(tag)[0]}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(Object.keys(tag)[0], Object.values(tag)[0] as string);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', Object.values(tag)[1] as string);
  });
};

// Update meta tags on component mount and when props change
watch([() => props.title, () => props.description, () => props.image, fullUrl], updateMetaTags, { immediate: true });
</script>

<template>
  <!-- This component doesn't render anything visible -->
</template>
