import { ref, reactive } from 'vue';

export function useMapboxFetcher() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const mapExamples = reactive<any[]>([]);

  // Fetch Mapbox examples for a given category
  const getMapboxExamples = async (category: string = 'terrain') => {
    loading.value = true;
    error.value = null;
    
    try {
      // In a real implementation, this would make an API call to fetch examples
      // For now, we'll just return mock data
      mapExamples.splice(0, mapExamples.length, ...[
        {
          id: 'terrain-3d',
          name: '3D Terrain',
          description: 'Add 3D terrain to a map',
          category: 'terrain',
        },
        {
          id: 'hillshade',
          name: 'Hillshade Layer',
          description: 'Add hillshading to a map',
          category: 'terrain',
        },
        {
          id: 'adjust-terrain',
          name: 'Adjust Terrain Exaggeration',
          description: 'Modify the terrain exaggeration level',
          category: 'terrain',
        }
      ]);
      
      return mapExamples;
    } catch (err) {
      console.error('Error fetching Mapbox examples:', err);
      error.value = 'Failed to fetch Mapbox examples';
      return [];
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    mapExamples,
    getMapboxExamples
  };
}
