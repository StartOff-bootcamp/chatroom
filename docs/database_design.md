# Database Design

## Supabase Database Schema

### Core Tables

1. **Users**

   - **Columns:**
     - id (UUID, Primary Key, automatisch gegenereerd door Supabase)
     - email (String, Unique)
     - name (String)
     - avatar_url (String, optioneel)
     - role (Enum: "user", "admin")

2. **Channels**

   - **Columns:**
     - id (UUID, Primary Key)
     - name (String, Unique)
     - description (String)
     - created_at (Timestamp)

3. **Messages**
   - **Columns:**
     - id (UUID, Primary Key)
     - channel_id (Foreign Key naar Channels)
     - user_id (Foreign Key naar Users)
     - content (Text)
     - created_at (Timestamp)

## Realtime Setup

- **Realtime updates:** Gebruik Supabase's ingebouwde real-time listeners voor wijzigingen in de **Messages**- en **Channels**-tabellen.

## Optimization

- Indexeren van `channel_id` en `created_at` in de **Messages**-tabel.
- Caching via Nuxt voor statische gedeelten zoals kanalenoverzicht.

## Entity-Relationship Diagram (ERD)

### Core Entities and Relationships

- **Users:** Gebruikersgegevens en voorkeuren.
- **Channels:** Kanaalgegevens zoals naam en beschrijving.
- **Messages:** Berichten van gebruikers in kanalen.

### Relationships

- Een **user** kan berichten plaatsen in meerdere **channels**.
- Elk **channel** kan meerdere **messages** bevatten.
