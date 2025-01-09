<template>
  <div
    :class="[
      'flex items-center justify-center rounded-full overflow-hidden',
      sizeClasses[size || 'md'],
    ]"
  >
    <img
      v-if="avatarUrl && showImage"
      :src="avatarUrl"
      :alt="name || email || 'User avatar'"
      class="h-full w-full object-cover"
      @error="handleImageError"
      referrerpolicy="no-referrer"
      crossorigin="anonymous"
    />
    <div
      v-else
      class="h-full w-full flex items-center justify-center text-white font-bold"
      :class="[textSizeClasses[size || 'md'], getBackgroundColor]"
    >
      {{ firstLetter }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    avatarUrl?: string | null;
    name?: string | null;
    email?: string | null;
    size?: "sm" | "md" | "lg" | "xl";
  }>(),
  {
    size: "md",
  }
);

const showImage = ref(true);

const sizeClasses = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-14",
} as const;

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
} as const;

const firstLetter = computed(() => {
  if (!showImage.value || !props.avatarUrl) {
    return (props.name || props.email || "U")[0].toUpperCase();
  }
  return "";
});

// Generate a consistent background color based on the user's name or email
const getBackgroundColor = computed(() => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  const str = props.name || props.email || "user";
  const index =
    str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;

  return colors[index];
});

function handleImageError() {
  showImage.value = false;
  console.warn("Avatar image failed to load:", props.avatarUrl);
}
</script>
