// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss"],

  app: {
    head: {
      title: process.env.NUXT_PUBLIC_APP_NAME || "StartOff Chat 🚀",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Interactive community for AI coding course students",
        },
      ],
    },
  },

  // Runtime config for client and server
  runtimeConfig: {
    // Private keys (server only)
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,

    // Public keys (exposed to client)
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || "StartOff Chat 🚀",
      appUrl: process.env.NUXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
  },

  // Supabase configuration
  supabase: {
    redirect: false,
    cookieOptions: {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: "lax",
      secure: true,
    },
    cookieName: "sb-auth",
    clientOptions: {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  },

  // Tailwind configuration
  tailwindcss: {
    config: {
      content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
      ],
      theme: {
        extend: {
          colors: {
            primary: "#007BFF",
            success: "#28A745",
            warning: "#FFC107",
            danger: "#DC3545",
            background: "#F8F9FA",
            text: "#343A40",
          },
        },
      },
    },
  },

  compatibilityDate: "2025-01-09",
});
