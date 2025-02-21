<script setup>
import { ref } from "vue";

const client = useSupabaseClient();
const route = useRoute();
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);

const formData = ref({
  email: "",
});

async function handleGoogleLogin() {
  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const { error: err } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/confirm?redirect=${
          route.query.redirect || "/"
        }`,
      },
    });

    if (err) throw err;
  } catch (err) {
    error.value =
      err.message || "Er is een fout opgetreden bij het inloggen met Google";
  } finally {
    loading.value = false;
  }
}

async function handleMagicLink() {
  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const { error: err } = await client.auth.signInWithOtp({
      email: formData.value.email,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm?redirect=${
          route.query.redirect || "/"
        }`,
      },
    });

    if (err) throw err;

    successMessage.value = "Check je email voor de inloglink";
  } catch (err) {
    error.value =
      err.message ||
      "Er is een fout opgetreden bij het versturen van de magic link";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col items-start pt-8">
    <div class="w-full max-w-md mx-auto">
      <div class="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-8">
        <div class="mb-8 text-center">
          <h2 class="text-3xl font-bold text-gray-900">
            Welkom bij AI Coding Chatroom
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Log in om deel te nemen aan de community
          </p>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="bg-danger bg-opacity-10 text-danger px-4 py-2 rounded-lg text-center mb-4"
        >
          {{ error }}
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="bg-success bg-opacity-10 text-success px-4 py-2 rounded-lg text-center mb-4"
        >
          {{ successMessage }}
        </div>

        <div class="space-y-6">
          <!-- Google Login -->
          <button
            @click="handleGoogleLogin"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </span>
            Inloggen met Google
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Of</span>
            </div>
          </div>

          <!-- Magic Link Section -->
          <div class="space-y-4">
            <div>
              <label for="email" class="sr-only">Email</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="appearance-none rounded-lg relative block w-full px-4 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10"
                placeholder="Email adres"
              />
            </div>

            <button
              type="button"
              @click="handleMagicLink"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              <span
                v-if="loading"
                class="absolute left-0 inset-y-0 flex items-center pl-3"
              >
                <!-- Loading spinner -->
                <svg
                  class="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              {{
                loading ? "Bezig met versturen..." : "Inloggen met magic link"
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
