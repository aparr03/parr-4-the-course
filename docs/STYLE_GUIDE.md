# Style Guide for Recipe App

## Color Usage Guidelines

### Text Colors

To ensure proper readability, always use appropriate text colors depending on the background:

| Background | Recommended Text Color | Tailwind Class |
|------------|------------------------|---------------|
| White      | Dark gray              | `text-gray-900` |
| Light gray | Dark gray              | `text-gray-800` |
| Dark gray  | White                  | `text-white` |
| Colored    | White or Dark          | `text-white` or `text-gray-900` (ensure contrast) |

### Background Colors

The application uses a consistent set of background colors:

- Main page background: `bg-gray-50`
- Card/component backgrounds: `bg-white`
- Accent backgrounds: `bg-blue-50`, `bg-green-50`, etc.

### Common Issues to Avoid

1. **White text on white/light backgrounds**: Never use `text-white` or very light text colors on white or light backgrounds.

2. **Light gray text on white**: Avoid `text-gray-100` through `text-gray-300` on white backgrounds - these lack sufficient contrast.

3. **Default text**: Don't rely on browser default colors. Always explicitly set your text colors.

## Using the Theme System

We've created a theme system in `src/styles/theme.ts` to make consistent styling easier:

```tsx
import { colors, componentStyles } from '../styles/theme';

function MyComponent() {
  return (
    <div className={colors.background.primary}>
      <h1 className={colors.text.primary}>Title</h1>
      <p className={colors.text.secondary}>Content here</p>
      <button className={`${colors.button.primary.bg} ${colors.button.primary.text}`}>
        Click me
      </button>
    </div>
  );
}
```

For common components, use the pre-defined component styles:

```tsx
<div className={componentStyles.card}>
  <h2 className={componentStyles.pageHeading}>Title</h2>
  <input className={componentStyles.formInput} />
</div>
```

## Debugging Style Issues

If you suspect contrast issues, you can use the debug utility:

```tsx
import { toggleContrastDebugMode } from '../utils/debugStyles';

// In a development utility component or console
toggleContrastDebugMode();
```

This will highlight elements with potential contrast problems.

## Accessibility Requirements

- All text should have a contrast ratio of at least 4.5:1 against its background
- Interactive elements should have a visible focus state
- Never use color alone to convey information
- Text should be at least 16px for body content, 14px for secondary text

## Common Components

Use our pre-built UI components that already have proper styling:

- `Button` - For various button styles
- `Card` - For content containers
- `Input` - For form inputs with proper styling
- `Badge` - For small status indicators
- `Alert` - For notification messages
