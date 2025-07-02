import { ref, onMounted, onUnmounted } from 'vue'

export function usePerformanceOptimization() {
  const isLowPowerMode = ref(false)
  const connectionType = ref<'slow' | 'fast' | 'unknown'>('unknown')
  const isVisible = ref(true)

  // Detect low power mode and connection speed
  const detectDeviceCapabilities = () => {
    // Check battery API if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        isLowPowerMode.value = battery.level < 0.2 || battery.charging === false
        
        battery.addEventListener('levelchange', () => {
          isLowPowerMode.value = battery.level < 0.2
        })
      }).catch(() => {
        // Battery API not supported
      })
    }

    // Check connection type
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const slowConnections = ['slow-2g', '2g', '3g']
      connectionType.value = slowConnections.includes(connection.effectiveType) ? 'slow' : 'fast'
      
      connection.addEventListener('change', () => {
        connectionType.value = slowConnections.includes(connection.effectiveType) ? 'slow' : 'fast'
      })
    }
  }

  // Page visibility API to pause operations when tab is hidden
  const handleVisibilityChange = () => {
    isVisible.value = !document.hidden
  }

  onMounted(() => {
    detectDeviceCapabilities()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    isLowPowerMode,
    connectionType,
    isVisible
  }
}