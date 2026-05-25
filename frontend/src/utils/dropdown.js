import { ref, computed, onMounted, onUnmounted } from 'vue'

export function setupDropdown({ inputRef, dataRef, containerRef }) {
  const show = ref(false)

  const filtered = computed(() => {
    return dataRef.value.filter(item =>
      item.toLowerCase().includes((inputRef.value || '').toLowerCase())
    )
  })

  const selectItem = (item) => {
    inputRef.value = item
    show.value = false
  }

  const openDropdown = () => {
    show.value = true
  }

  // HANDLE CLICK OUTSIDE (tanpa lifecycle)
  const handleClickOutside = (event) => {
    if (!containerRef.value) return
    if (!containerRef.value.contains(event.target)) {
      show.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    show,
    filtered,
    selectItem,
    openDropdown
  }
}