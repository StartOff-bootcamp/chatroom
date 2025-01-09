<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog
      as="div"
      @close="$emit('update:modelValue', false)"
      class="relative z-10"
    >
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                {{ channel ? "Kanaal bewerken" : "Nieuw kanaal" }}
              </DialogTitle>

              <!-- Error Message -->
              <div
                v-if="error"
                class="mt-2 bg-danger/10 text-danger px-4 py-2 rounded-lg"
              >
                {{ error }}
              </div>

              <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
                <div>
                  <label
                    for="name"
                    class="block text-sm font-medium text-gray-700"
                    >Naam</label
                  >
                  <input
                    type="text"
                    id="name"
                    v-model="formData.name"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    for="description"
                    class="block text-sm font-medium text-gray-700"
                    >Beschrijving</label
                  >
                  <textarea
                    id="description"
                    v-model="formData.description"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="$emit('update:modelValue', false)"
                    class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  >
                    {{
                      loading ? "Bezig..." : channel ? "Opslaan" : "Aanmaken"
                    }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  channel: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "save"]);

const loading = ref(false);
const error = ref(null);

const formData = ref({
  name: "",
  description: "",
});

// Initialize form data when channel prop changes
watch(
  () => props.channel,
  (newChannel) => {
    if (newChannel) {
      formData.value = {
        name: newChannel.name,
        description: newChannel.description || "",
      };
    } else {
      formData.value = {
        name: "",
        description: "",
      };
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  loading.value = true;
  error.value = null;

  try {
    const endpoint = props.channel
      ? `/api/channels/${props.channel.id}`
      : "/api/channels";

    const method = props.channel ? "PUT" : "POST";

    const response = await $fetch(endpoint, {
      method,
      body: formData.value,
    });

    emit("save", response);
    emit("update:modelValue", false);
  } catch (err) {
    error.value = err.message || "Er is een fout opgetreden";
  } finally {
    loading.value = false;
  }
}
</script>
