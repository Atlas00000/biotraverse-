# BioTraverse - Wildlife Migration Tracker

A modern, interactive web application for tracking and visualizing wildlife migration patterns in real-time. Built with Next.js, TypeScript, and Leaflet for an immersive mapping experience.

## 🌟 Features

- **Interactive 2D Migration Maps**: Real-time visualization of animal migration patterns
- **Multi-Species Tracking**: Support for birds, marine life, insects, and mammals
- **Auto-Centering**: Intelligent map positioning for single species selection
- **Performance Optimized**: Adaptive rendering based on species count
- **Timeline Controls**: Animated migration progression with seasonal markers
- **Multiple Map Types**: OpenStreetMap, Satellite, Terrain, Dark, and Light themes
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Animations**: Smooth path animations and marker movements

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Maps**: Leaflet.js with React-Leaflet
- **UI Components**: Custom component library with shadcn/ui
- **Package Manager**: pnpm
- **Deployment**: Vercel

## 🐾 Supported Species

- **Arctic Tern** (🐦) - Long-distance migratory bird
- **Gray Whale** (🐋) - Pacific marine migration
- **Monarch Butterfly** (🦋) - North American butterfly migration
- **Caribou** (🦌) - Arctic terrestrial migration
- **Sea Turtle** (🐢) - Atlantic marine migration
- **Wildebeest** (🦬) - African savanna migration

## 🎯 Key Features

### Auto-Centering
- Automatically centers the map on selected species
- Works with single species selection only
- Smooth animated transitions
- Visual feedback during centering

### Performance Optimization
- Adaptive rendering based on species count
- Path simplification for multiple species
- Reduced animation frequency for better performance
- Smart data point reduction

### Interactive Controls
- Play/Pause migration animation
- Timeline scrubbing with seasonal markers
- Zoom controls with species focus
- Multiple map type selection

## 🛠️ Installation

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/biotraverse.git
   cd biotraverse
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Option 2: Docker Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/biotraverse.git
   cd biotraverse
   ```

2. **Start with Docker**
   ```bash
   docker-compose --profile dev up --build
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

> **Note**: For detailed Docker instructions, see [DOCKER.md](DOCKER.md)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Deploy automatically** - Vercel will detect Next.js and configure everything
3. **Environment variables** - No additional configuration needed

### Docker Deployment

1. **Production with Docker**
   ```bash
   docker-compose --profile prod up --build -d
   ```

2. **Production with Nginx (SSL + Security)**
   ```bash
   # Generate SSL certificates (first time)
   ./scripts/generate-ssl.sh
   
   # Start with nginx reverse proxy
   docker-compose --profile nginx up --build -d
   ```

3. **Access the application**
   - Production: http://localhost:3000
   - Nginx: https://localhost

### Manual Deployment

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

## 📁 Project Structure

```
biotraverse/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── real-migration-map.tsx  # Main map component
│   ├── species-selector.tsx    # Species selection
│   └── ...               # Other components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── public/               # Static assets
```

## 🎨 Customization

### Adding New Species

1. **Update species data** in `components/species-selector.tsx`
2. **Add migration routes** in `utils/mock-data.ts`
3. **Update types** in `types/migration.ts`

### Styling

- **Tailwind CSS** for utility-first styling
- **Custom animations** in `app/globals.css`
- **Component themes** in `components/ui/`

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks

### Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Component-based architecture**

## 🌐 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 📱 Mobile Support

- **Responsive design** for all screen sizes
- **Touch-friendly** controls
- **Optimized performance** for mobile devices

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Leaflet.js** for the mapping functionality
- **shadcn/ui** for the component library
- **Next.js** for the React framework
- **Tailwind CSS** for the styling system

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**BioTraverse** - Exploring the world's wildlife migrations, one species at a time. 🌍 