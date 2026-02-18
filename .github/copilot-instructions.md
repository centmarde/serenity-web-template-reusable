# 💕 AI Coding Agent Instructions for Serenity Web Template

## 🏗️ System Architecture Overview

This is a **configuration-driven React application** designed for maximum reusability. The entire system operates on a **single source of truth**: `public/settings.json`.

### Core Philosophy: Zero Code Changes for Customization

- **Configuration-First**: All personalization happens through `settings.json`
- **Type-Safe**: Zustand store provides validated access to all settings
- **Component-Driven**: Reusable components consume settings through the store
- **shadcn/ui First**: Always prioritize shadcn/ui components for consistent design
- **Mobile-Responsive**: All components use responsive design patterns

---

## 🎯 Key System Patterns

### 1. shadcn/ui Component Priority

```typescript
// ✅ ALWAYS use shadcn/ui components first
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ✅ Combine with settings for theming
const CustomButton = () => {
  const themeColor = getThemeColor();
  return (
    <Button 
      variant="outline"
      style={{ borderColor: themeColor, color: themeColor }}
    >
      {getCallsign()}
    </Button>
  );
};

// ❌ Avoid custom divs when shadcn/ui components exist
<div className="border rounded-lg p-4">  // Wrong
<Card>                                   // Correct
```

### 2. Settings-Driven Architecture

```typescript
// ALWAYS use the settings store for data access
const { getThemeColor, getCallsign, getCouplename } = useSettingsStore();

// NEVER hardcode values - always read from settings
const themeColor = getThemeColor(); // ✅ Correct
const themeColor = "#F2A6A6";       // ❌ Wrong
```

### 3. Error-Safe Settings Loading

```typescript
// ALWAYS handle loading states and errors
useEffect(() => {
  const initializeSettings = async () => {
    try {
      await loadSettings();
      setThemeColor(getThemeColor());
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Provide fallback values
      setThemeColor('#F2A6A6');
    }
  };
  initializeSettings();
}, []);
```

### 3. Mobile-First Responsive Design

```typescript
// ALWAYS use clamp() and viewport units for responsiveness
style={{
  fontSize: 'clamp(1rem, 4vw, 1.8rem)',    // Responsive text
  width: 'min(500px, 90vw)',               // Responsive width
  padding: 'min(30px, 5vw)',               // Responsive padding
  marginBottom: 'min(40px, 8vw)'           // Responsive spacing
}}
```

---

## 📁 File Structure & Responsibilities

### Configuration Layer
- `public/settings.json` - **Single source of truth** for all app data
- `src/stores/settings.ts` - Zustand store with type-safe access methods

### Component Layer
- `src/pages/LoadingView.tsx` - 5-second animated loading with rotating traits
- `src/pages/LandingView.tsx` - Personalized dashboard with relationship stats
- `src/App.tsx` - Main application with loading state management

### Support Files
- `src/stores/theme.ts` - Advanced theming system (optional)
- `src/lib/utils.ts` - Utility functions for styling

---

## 🔧 Development Guidelines

### When Adding New Features

1. **Check Settings First**: Does the data exist in `settings.json`?
2. **Update Interface**: Add new properties to the `Settings` interface
3. **Add Getter Method**: Create type-safe access method in the store
4. **Handle Loading**: Always provide loading states and fallbacks
5. **Test Responsiveness**: Ensure mobile compatibility

### Settings.json Schema

```typescript
interface Settings {
  themeColor: string;           // Primary color for theming
  callsign: string;            // User's nickname/identifier  
  couplename: string;          // Partner's name
  appName: string;             // Application title
  coupleOfficialDate: string;  // Relationship start date (YYYY-MM-DD)
  startingGreetings: string;   // Pet name/greeting
  traits: string[];           // Array of romantic traits/memories
}
```

### Store Access Patterns

```typescript
// ✅ Correct: Use getter methods
const traits = getTraits();
const randomTrait = getRandomTrait();
const themeColor = getThemeColor();

// ✅ Correct: Handle async loading
const themeColor = await waitForThemeColor();

// ❌ Wrong: Direct property access
const themeColor = settings?.themeColor;
```

### Responsive Design Rules

```typescript
// ✅ Mobile-first approach
style={{
  // Use clamp(min, preferred, max) for scalable values
  fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
  
  // Use min() for maximum constraints
  width: 'min(400px, 85vw)',
  
  // Use viewport units for dynamic spacing
  padding: 'min(20px, 4vw)',
  
  // Ensure minimum touch targets (44px minimum)
  minHeight: 'max(44px, 8vw)'
}}
```

---

## 🎨 Styling Conventions

### shadcn/ui Component Usage (Priority #1)

```typescript
// ✅ Always use shadcn/ui components for UI elements
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ✅ Combine shadcn/ui with dynamic theming
const ThemedCard = ({ children }: { children: React.ReactNode }) => {
  const themeColor = getThemeColor();
  return (
    <Card style={{ borderColor: themeColor }}>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

// ✅ Use variants and className for styling
<Button variant="outline" className="hover:bg-opacity-20">
  {getCallsign()}
</Button>

// ❌ Avoid custom divs when shadcn/ui equivalents exist
<div className="border rounded p-4">           // Wrong - use Card
<button className="px-4 py-2 rounded border">  // Wrong - use Button
<span className="bg-blue-100 px-2 py-1">      // Wrong - use Badge
```

### Theme Color Usage

```typescript
// ✅ Dynamic theming with transparency
backgroundColor: `${themeColor}20`,  // 20% opacity
border: `3px solid ${themeColor}`,   // Solid border
background: `linear-gradient(135deg, ${themeColor}20, ${themeColor}40, #ffffff)`,
```

### Component Layout Patterns

```typescript
// ✅ shadcn/ui + Settings pattern
const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => {
  const themeColor = getThemeColor();
  return (
    <Card className="w-full max-w-2xl mx-auto" style={{
      borderColor: themeColor,
      maxWidth: 'min(600px, 90vw)',      // Responsive max width
      margin: '0 auto',                  // Center alignment
      padding: 'min(30px, 5vw)',         // Responsive padding
    }}>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

// ❌ Avoid when shadcn/ui Card exists
<div style={{
  maxWidth: 'min(600px, 90vw)',      // Responsive max width
  margin: '0 auto',                  // Center alignment
  padding: 'min(30px, 5vw)',         // Responsive padding
  backgroundColor: 'white',          // Background
  borderRadius: 'min(15px, 3vw)',    // Responsive radius
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  border: `3px solid ${themeColor}`  // Dynamic border
}}>
```

---

## ⚡ Performance Best Practices

### Settings Loading
- Settings are loaded once and cached
- Use `waitFor*` methods for async access
- Always provide loading states
- Handle errors gracefully with fallbacks

### Component Optimization
- Components should be pure when possible
- Use `useCallback` for expensive functions
- Minimize re-renders through proper dependency arrays

### Mobile Performance
- Images should be optimized and responsive
- Animations should use hardware acceleration
- Touch targets should be minimum 44px

---

## 🚨 Common Pitfalls & Solutions

### ❌ Problem: Using Custom Elements Instead of shadcn/ui
```typescript
// Wrong
<div className="border rounded-lg p-4">
  <h3 className="font-bold">Title</h3>
  <p>Content</p>
</div>
```
```typescript
// Correct
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### ❌ Problem: Hardcoded Values
```typescript
// Wrong
const appName = "Love Space";
```
```typescript
// Correct
const appName = getAppName();
```

### ❌ Problem: Settings Access Before Loading
```typescript
// Wrong - may fail if settings not loaded
const themeColor = getThemeColor();
```
```typescript  
// Correct - wait for loading
const themeColor = await waitForThemeColor();
```

### ❌ Problem: Non-Responsive Design
```typescript
// Wrong
style={{ fontSize: '24px', padding: '30px' }}
```
```typescript
// Correct
style={{ 
  fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', 
  padding: 'min(30px, 5vw)' 
}}
```

### ❌ Problem: Missing Error Handling
```typescript
// Wrong
await loadSettings();
const data = getCallsign();
```
```typescript
// Correct
try {
  await loadSettings();
  const data = getCallsign();
} catch (error) {
  console.error('Failed to load settings:', error);
  // Provide fallback
}
```

---

## 🔄 Testing & Validation

### Manual Testing Checklist
- [ ] Settings load correctly from `settings.json`
- [ ] All components display personalized data
- [ ] Loading animation works for 5 seconds
- [ ] Responsive design works on mobile (320px+)
- [ ] Error states display properly
- [ ] Theme colors apply consistently

### Settings Validation
```typescript
// Validate settings before use
if (!fetchedSettings.themeColor) {
  throw new Error('Theme color not found in settings.json');
}

if (!fetchedSettings.traits || fetchedSettings.traits.length === 0) {
  throw new Error('Traits array not found or empty');
}
```

---

## 🎯 Extension Guidelines

### Adding New Settings Properties

1. **Update `settings.json`** with new property
2. **Update `Settings` interface** in `stores/settings.ts`
3. **Add getter method** to the store
4. **Add validation** in `loadSettings()`
5. **Use in components** through the store methods

### Creating New Components

```typescript
// Template for settings-aware components
import { useSettingsStore } from '../stores/settings';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NewComponent: React.FC = () => {
  const { getThemeColor, getAppName, loadSettings } = useSettingsStore();
  const [data, setData] = useState<ComponentData | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadSettings();
        setData({
          themeColor: getThemeColor(),
          appName: getAppName()
        });
      } catch (error) {
        console.error('Failed to initialize component:', error);
        // Fallback values
      }
    };
    initialize();
  }, []);

  // ✅ Use shadcn/ui components with theming
  return (
    <Card style={{ borderColor: data?.themeColor }}>
      <CardHeader>
        <CardTitle>{data?.appName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" style={{ borderColor: data?.themeColor }}>
          Action Button
        </Button>
        <Badge variant="secondary" className="ml-2">
          Status
        </Badge>
      </CardContent>
    </Card>
  );
};
```

---

## 📱 Mobile-First Development

### Breakpoint Strategy
- **320px+**: Base mobile design
- **768px+**: Tablet optimizations  
- **1024px+**: Desktop enhancements

### Touch Interaction Guidelines
- Minimum 44px touch targets
- Appropriate spacing between interactive elements
- Consider thumb navigation patterns
- Provide visual feedback for interactions

---

## 🎨 Design System

### Color Usage
- **Primary**: `themeColor` from settings
- **Backgrounds**: `${themeColor}10` to `${themeColor}40` for transparency
- **Text**: `#333` for dark, `#666` for medium, `#999` for light
- **Borders**: `${themeColor}` for themed borders

### Typography Scale
```typescript
// Responsive typography using clamp()
const textStyles = {
  h1: 'clamp(1.75rem, 5vw, 2.5rem)',
  h2: 'clamp(1.5rem, 4vw, 2rem)', 
  h3: 'clamp(1.25rem, 3.5vw, 1.5rem)',
  body: 'clamp(0.875rem, 2.5vw, 1rem)',
  small: 'clamp(0.75rem, 2vw, 0.875rem)'
};
```

---

## 🚀 Deployment Considerations

### Build Process
- All settings are bundled as static assets
- No environment variables needed
- Single configuration file deployment

### Customization Process
1. User edits `public/settings.json`
2. Replaces `public/assets/loading-gif.gif` (optional)
3. Runs `npm run build`
4. Deploys static files

### Version Control
- Keep example `settings.json` in repo
- Document customization process
- Provide settings template/schema

---

**🎯 Remember**: This template's power comes from its **configuration-driven reusability**. Always prioritize the settings system, responsive design, and error handling to maintain the seamless user experience that makes this template special.
