import { ref, computed } from 'vue'

export function useNetworkOptimization() {
  const requestQueue = ref<Array<() => Promise<any>>>([])
  const isProcessingQueue = ref(false)
  const maxConcurrentRequests = ref(2) // Limit concurrent requests on mobile

  // Debounced request processing
  const processRequestQueue = async () => {
    if (isProcessingQueue.value || requestQueue.value.length === 0) return
    
    isProcessingQueue.value = true
    
    while (requestQueue.value.length > 0) {
      const batch = requestQueue.value.splice(0, maxConcurrentRequests.value)
      
      try {
        await Promise.all(batch.map(request => request()))
      } catch (error) {
        console.error('Batch request failed:', error)
      }
      
      // Small delay between batches to prevent overwhelming the network
      if (requestQueue.value.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    isProcessingQueue.value = false
  }

  // Add request to queue
  const queueRequest = (request: () => Promise<any>) => {
    requestQueue.value.push(request)
    processRequestQueue()
  }

  // Optimize image/waveform loading
  const createOptimizedImageUrl = (url: string, width?: number, quality = 80) => {
    if (!url) return url
    
    // Add query parameters for optimization if the service supports it
    const params = new URLSearchParams()
    if (width) params.append('w', width.toString())
    params.append('q', quality.toString())
    params.append('f', 'webp') // Prefer WebP format
    
    return `${url}?${params.toString()}`
  }

  return {
    queueRequest,
    createOptimizedImageUrl,
    isProcessingQueue: computed(() => isProcessingQueue.value)
  }
}