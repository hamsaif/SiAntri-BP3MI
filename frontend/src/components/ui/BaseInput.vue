<template>
    <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">
            {{ label }}
        </span>
    <input 
        class="bp3mi-input" 
        :type="type" 
        :placeholder="placeholder"
        :maxlength="maxlength"
        :required="required" 
        :value="modelValue"
        @input="emit('update:modelValue', $event.target?.value)"
    />
    </label>
</template>

<script setup>

const props = defineProps({
    label: String,
    placeholder: String,
    maxlength: [String, Number],
    type: {
        type: String,
        default: 'text'
    },
    required: Boolean,
    modelValue: String
})
const emit = defineEmits([
  'update:modelValue'
])

</script>