# Masterplan App - Visualizador de Lotes

Aplicación web en Next.js 14 + TypeScript para visualizar e interactuar con un masterplan en SVG. Implementa selección de lotes y estilos responsivos, con una arquitectura modular y buenas prácticas.

## 🚀 Características

- **Interacciones de lotes**: Delegación de eventos sobre el documento SVG embebido (click)
- **Selección**: Estado de selección sincronizado y clase `.selected` aplicada dinámicamente
- **Estilos inyectados**: CSS insertado dentro del propio documento SVG para hover/selected
- **Diseño responsive**: Estilos responsivos para diferentes tamaños de pantalla
- **TypeScript**: Tipado estricto y modularización clara
- **Tailwind CSS**: Utilidades para layout y UI

## 🛠️ Tecnologías Utilizadas

- **Next.js 14**: Framework de React para aplicaciones web
- **TypeScript**: Lenguaje tipado para JavaScript
- **Tailwind CSS**: Framework de CSS utilitario
> Nota: La versión actual no usa `SVGR` ni `react-zoom-pan-pinch`. El SVG se carga con `<object>` para mantener la independencia del documento SVG y poder inyectar estilos internamente.

## 📦 Instalación

1. **Clona el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd masterplan-app
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Ejecuta el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abre tu navegador**:
   Navega a [http://localhost:3000](http://localhost:3000)

## 🎯 Funcionalidades

### Interacciones con Lotes

- **Hover**: Al pasar el mouse sobre un lote, se muestra un tooltip con el número del lote
- **Click**: Al hacer click en un lote, se selecciona y se resalta con un color azul más fuerte
- **Cursor**: Los elementos con `data-lot` cambian el cursor a pointer

### Navegación

- **Zoom**: Usa la rueda del mouse para acercar y alejar
- **Pan**: Arrastra para mover el plano
- **Límites**: Zoom mínimo 0.5x, máximo 3x

### Estados Visuales

- **Normal**: Color gris claro
- **Hover**: Azul con transparencia
- **Seleccionado**: Azul más fuerte

## 📁 Estructura del Proyecto

```
masterplan-app/
├── app/
│   ├── components/
│   │   └── InteractiveSVG.tsx  # Componente principal para visualizar e interactuar
│   ├── hooks/
│   │   └── useEmbeddedSVGInteractions.ts # Hook para manejar interacciones dentro del SVG embebido
│   ├── globals.css            # Estilos globales y Tailwind
│   ├── layout.tsx             # Layout principal de la aplicación
│   └── page.tsx               # Página principal
├── public/
│   └── masterplan.svg         # Archivo SVG del masterplan
├── next.config.js             # Configuración base de Next.js
├── tailwind.config.ts         # Configuración de Tailwind CSS
├── package.json               # Dependencias del proyecto
└── README.md                  # Este archivo
```

## 🔧 Configuración

No se requiere configuración especial para SVG. Se utiliza el tag estándar `<object type="image/svg+xml" .../>`.

### Tailwind CSS

Los colores personalizados están definidos en `tailwind.config.ts`:

```typescript
colors: {
  'lot-hover': 'rgba(59, 130, 246, 0.3)',    // Azul con transparencia
  'lot-selected': 'rgba(37, 99, 235, 0.8)',  // Azul más fuerte
}
```

## 📝 Uso del Componente InteractiveSVG

```typescript
import InteractiveSVG from './components/InteractiveSVG';

export default function Page() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <InteractiveSVG />
    </main>
  );
}
```

## 🎨 Personalización

### Agregar Nuevos Lotes

Para que un lote sea interactivo, asegúrate de que el elemento en `public/masterplan.svg` tenga un `id` incluido en `SVG_CONFIG.interactivePaths` (ver `app/config/svgConfig.ts`). Ejemplo:

```svg
<path id="A12" d="..." />
```

### Cambiar Colores

Los colores por defecto se inyectan dentro del documento SVG. Puedes ajustar el CSS en el hook `useEmbeddedSVGInteractions` cambiando las reglas de `.lote` y `.lote.selected`.

## 🚀 Scripts Disponibles

- `npm run dev`: Ejecuta el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Ejecuta la aplicación en modo producción
- `npm run lint`: Ejecuta el linter de ESLint

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para sugerir mejoras.

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda, por favor abre un issue en el repositorio.
