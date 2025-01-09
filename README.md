# AI Coding Chatroom

A real-time chat application built with Nuxt 3 and Supabase, designed for AI coding course students to collaborate and share knowledge.

## Features

- Real-time messaging
- Channel-based communication
- User authentication and profiles
- Modern UI with Tailwind CSS
- Responsive design

## Tech Stack

- **Frontend:** Nuxt 3
- **Styling:** Tailwind CSS
- **Backend:** Supabase
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL (via Supabase)
- **Real-time:** Supabase Realtime

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd chatroom
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:

   ```
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_KEY=your-supabase-anon-key
   ```

4. Set up your Supabase database tables:

   - Create the following tables:
     - users (managed by Supabase Auth)
     - channels
     - messages
   - Enable row level security (RLS)
   - Configure appropriate policies

5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

### Channels Table

```sql
create table channels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Messages Table

```sql
create table messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  user_id uuid references auth.users not null,
  channel_id uuid references channels not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Profiles Table

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

## Development

- Run development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm run start`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
