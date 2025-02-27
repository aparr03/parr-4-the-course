# React Router Setup

This application uses React Router for navigation. Here's how the routing is structured:

## Router Setup

The main router is set up in `main.tsx`:

```tsx
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);
```

## Route Definitions

Routes are defined in `App.tsx` using the `Routes` and `Route` components:

```tsx
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          {/* Add other routes here */}
        </Routes>
      </div>
    </>
  );
}
```

## Common Router Error

If you see this error:

```
Uncaught Error: You cannot render a <Router> inside another <Router>. You should never have more than one in your app.
```

It means you have multiple Router components in your application. The most common causes are:

1. Including `<BrowserRouter>` in both `main.tsx` and `App.tsx`
2. Using a component that already contains a Router (like `<BrowserRouter>`) inside another Router

To fix this:
- Only include one Router at the top level of your application
- Use `<Routes>` and `<Route>` for defining your routes, not multiple `<BrowserRouter>` components
- Make sure imported components don't bring their own Router instances

## Navigation

For navigation between routes, use the `Link` or `NavLink` components:

```tsx
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/recipes">Recipes</Link>
    </nav>
  );
}
```

For programmatic navigation (e.g., after form submission), use the `useNavigate` hook:

```tsx
import { useNavigate } from 'react-router-dom';

function CreateRecipeForm() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    // Save recipe...
    navigate(`/recipes/${newRecipeId}`);
  };
}
```
