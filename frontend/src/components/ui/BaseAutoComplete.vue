<template>
    <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">
            {{ label }}
        </span>
    <div
        ref="containerRef"
        class="relative"
    >
        <input 
            class="bp3mi-input"  
            :placeholder="placeholder" 
            :required="required" 
            v-model="inputRef"
            @input="openDropdown"
            @focus="openDropdown"
        />
        <div 
            v-if ="show"
            class="bp3mi-dropdown">
            <div
                v-for="item in filtered"
                :key="item"
                class="cursor-pointer px-4 py-3 transition hover:bg-amber-50"
                @mousedown="selectItem(item)"
            >
                {{ item }}
            </div>
        </div>

    </div>
    </label>
</template>

<script setup>  
import { watch, computed,ref } from 'vue' 
import { setupDropdown } from '@/utils/dropdown';


const props = defineProps({
    label: String,
    placeholder: String,
    modelValue: String,
    items: {
        type: Array,
        default: () => []
    },
})

const emit = defineEmits([
  'update:modelValue'
])

const inputRef = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  (value) => {
    inputRef.value = value
  }
)

watch(
  inputRef,
  (value) => {
    emit('update:modelValue', value)
  }
)

const containerRef = ref(null)

const {

  show,
  filtered,
  selectItem,
  openDropdown

} = setupDropdown({

  inputRef,
  dataRef: computed(() => props.items),
  containerRef

})

</script>