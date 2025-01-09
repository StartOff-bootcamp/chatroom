# 🚀 StartOff Community Chat

A real-time community chat platform built with Nuxt 3, Supabase, and Tailwind CSS. Features include channel-based messaging, real-time notifications, message search, and user presence tracking.

## ✨ Features

- 💬 Real-time messaging in channels
- 🔔 Live notifications for unread messages
- 🔍 Full-text search across messages
- 👥 Online user presence tracking
- 🎨 Beautiful UI with Tailwind CSS
- 🔐 Google OAuth authentication
- 👑 Admin role management
- 📱 Responsive design
- 🌐 Channel management
- 🔄 Real-time updates using Supabase

## 🛠️ Tech Stack

- **Frontend**: [Nuxt 3](https://nuxt.com)
- **Backend**: [Supabase](https://supabase.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: [Headless UI](https://headlessui.dev)
- **Icons**: [Heroicons](https://heroicons.com)

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or later
- A Supabase account
- Google OAuth credentials (for authentication)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/startoff-community.git
   cd startoff-community
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:

   ```env
   SUPABASE_URL=your-project-url
   SUPABASE_KEY=your-anon-key
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-google-client-id
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-google-client-secret
   NUXT_PUBLIC_APP_NAME="🚀 StartOff community"
   NUXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

### Database Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations`
3. Enable Google OAuth in your Supabase project settings

### Database Schema

#### Channels Table

```sql
create table channels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### Messages Table

```sql
create table messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  user_id uuid references auth.users not null,
  channel_id uuid references channels not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### Profiles Table

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  status text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

#### Channel Visits Table

```sql
create table channel_visits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  channel_id uuid references channels not null,
  last_visited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, channel_id)
);
```

Each table has Row Level Security (RLS) enabled with appropriate policies to ensure data security.

## 📦 Project Structure

- `/components` - Reusable Vue components
- `/composables` - Shared composable functions
- `/layouts` - Page layouts
- `/pages` - Application pages and routes
- `/server` - API endpoints
- `/supabase` - Database migrations and types
- `/public` - Static assets

## 🔑 Key Features Explained

### Real-time Messaging

Messages are delivered instantly using Supabase's real-time subscriptions. Each channel maintains its own message thread and updates live as new messages arrive.

### Notifications

The system tracks unread messages per channel and provides real-time notifications through a notification bell. Users can quickly see which channels have new messages.

### Search Functionality

Full-text search across all messages allows users to find specific conversations or topics quickly.

### User Presence

Online users are tracked in real-time, showing their status and current activity in the platform.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Nuxt.js team](https://nuxt.com) for the amazing framework
- [Supabase team](https://supabase.com) for the powerful backend platform
- [Tailwind CSS team](https://tailwindcss.com) for the utility-first CSS framework
- All contributors who help improve this project

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.
