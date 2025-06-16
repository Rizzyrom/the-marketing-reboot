# The Marketing Reboot

A modern marketing platform built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🎨 Lightning Bolt theme system
- 👥 User roles: Contributors and Readers
- 📱 Mobile-first responsive design
- 🔒 Secure authentication with Supabase
- ✨ Beautiful UI with glass-card effects
- 🌙 Dark mode support
- 🎯 Particle system background
- 📝 Rich text editor for contributors
- 🔍 Advanced search functionality
- 📊 Analytics dashboard

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth & Database)
- Lucide React (Icons)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── auth/        # Authentication components
│   ├── brand/       # Brand components (Logo, etc.)
│   ├── layout/      # Layout components
│   └── ui/          # UI components
├── contexts/        # React contexts
├── lib/            # Utility functions
└── types/          # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT