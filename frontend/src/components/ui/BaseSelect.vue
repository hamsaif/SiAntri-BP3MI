<template>

  <label class="block space-y-2 w-full">

    <!-- LABEL -->
    <span class="text-sm font-medium text-slate-700">
      {{ label }}
    </span>

    <!-- SELECT -->
    <div
      ref="containerRef"
      class="relative"
    >

      <!-- TRIGGER -->
      <div
        role="button"
        class="bp3mi-select-button"
        tabindex="0"
        @click.stop="toggleDropdown"
      >

        <span>
          {{ selectedLabel || placeholder }}
        </span>

        <!-- ARROW -->
        <span
          class="bp3mi-select-arrow"
          :class="{ 'rotate-180': show }"
        >
          ▼
        </span>

      </div>

      <!-- DROPDOWN -->
      <transition name="dropdown">

        <div
          v-if="show"
          class="bp3mi-dropdown"
        >

          <div
            v-for="item in options"
            :key="item.value"
            class="bp3mi-dropdown-item"
            @mousedown.stop="selectItem(item)"
          >

            {{ item.label }}

          </div>

        </div>

      </transition>

    </div>

  </label>

</template>

<script setup>

import {
  ref,
  computed,
  onMounted,
  onUnmounted
} from 'vue'

/* PROPS */

const props = defineProps({

  label: String,

  modelValue: String,

  placeholder: String,

  options: {
    type: Array,
    default: () => []
  }

})

/*EMIT*/

const emit = defineEmits([
  'update:modelValue'
])

/*DROPDOWN */

const show = ref(false)

const containerRef = ref(null)

/*SELECTED LABEL */

const selectedLabel = computed(() => {

  const selected = props.options.find(
    item => item.value === props.modelValue
  )

  return selected?.label || ''

})

/*TOGGLE */

const toggleDropdown = () => {

  show.value = !show.value

}

/*SELECT ITEM */

const selectItem = (item) => {

  emit('update:modelValue', item.value)

  setTimeout(() => {

    show.value = false

  }, 0)

}

/*CLICK OUTSIDE */

const handleClickOutside = (event) => {

  if (
    containerRef.value &&
    !containerRef.value.contains(event.target)
  ) {
    show.value = false
  }

}

onMounted(() => {
  document.addEventListener(
    'click',
    handleClickOutside
  )
})

onUnmounted(() => {
  document.removeEventListener(
    'click',
    handleClickOutside
  )
})

</script>