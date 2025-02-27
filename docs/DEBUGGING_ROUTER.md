# Debugging React Router Issues

## Common React Router Errors and Solutions

### 1. "You cannot render a <Router> inside another <Router>"

**Error message:**
```
Uncaught Error: You cannot render a <Router> inside another <Router>. 
You should never have more than one in your app.
```

**Solution:**
- Ensure you have only one Router component in your application (usually `<BrowserRouter>` in main.tsx)
- Remove any additional Router components from your components
- Check for imported components that might be wrapping their content in a Router

**Example of correct setup:**

In `main.tsx`:
```tsx
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

In `App.tsx` (no BrowserRouter here, just Routes):
```tsx
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
```

### 2. "No routes matched location"

**Error message:**
```
No routes matched location "/some-path"
```

**Solution:**
- Make sure you've defined a route for the path you're trying to navigate to
- Check for typos in your route paths
- Add a catch-all 404 route at the end of your routes

**Example:**
```tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/recipes" element={<Recipes />} />
  {/* Catch-all route */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 3. Routes not rendering

**Issue:** The router is set up, but components don't render when navigating

**Solutions:**
- Make sure your route paths and navigation paths match exactly
- Check for missing leading slashes in route definitions
- Ensure components being rendered by routes are exported correctly
- Check for errors in your route components that might prevent rendering

### 4. Route parameters not working

**Issue:** You can't access route parameters with useParams()

**Solution:**
- Make sure you're properly defining the parameter in your route path with a colon
- Ensure you've imported useParams from react-router-dom
- Verify the parameter name matches between the route definition and useParams call

**Example:**
```tsx
// Route definition
<Route path="/recipes/:id" element={<RecipeDetail />} />

// In RecipeDetail.tsx
import { useParams } from 'react-router-dom';

function RecipeDetail() {
  const { id } = useParams();
  // Now use the id parameter
}
```

### 5. Nested routes not working

**Issue:** Nested routes don't render as expected

**Solution:**
- Make sure you've added an `<Outlet />` component in the parent route where child routes should render
- Check that nested routes are properly defined with the correct relative paths

**Example:**
```tsx
<Routes>
  <Route path="/recipes" element={<RecipesLayout />}>
    <Route index element={<RecipesList />} />
    <Route path=":id" element={<RecipeDetail />} />
  </Route>
</Routes>
```

In `RecipesLayout.tsx`:
```tsx
import { Outlet } from 'react-router-dom';

function RecipesLayout() {
  return (
    <div>
      <h1>Recipes</h1>
      <Outlet /> {/* Child routes render here */}
    </div>
  );
}
```
