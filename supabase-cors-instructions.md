# Fixing CORS Issues with Supabase Edge Functions

To fix the CORS error when calling your `send-email` Edge Function, follow these steps:

## Option 1: Update the Existing Edge Function

1. Log into your Supabase dashboard at https://app.supabase.com
2. Navigate to your project
3. Go to "Edge Functions" in the left sidebar
4. Find your `send-email` function and click on it
5. Click "Edit" or "View Code"
6. Update the function code to include CORS headers (see example in `supabase-email-function.js`)
7. Deploy the updated function

## Option 2: Deploy a New Edge Function with CORS Support

If you prefer to create a new function:

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Log in to Supabase CLI:
   ```bash
   supabase login
   ```

3. Create a new folder for your function:
   ```bash
   mkdir -p supabase/functions/send-email
   ```

4. Copy the code from `supabase-email-function.js` to `supabase/functions/send-email/index.js`

5. Deploy the function:
   ```bash
   supabase functions deploy send-email
   ```

## Option 3: Temporary Workaround

While fixing the Edge Function, you can use the current workaround in your code:

The `adminService.ts` file has been updated to bypass the email sending in development environments (localhost), which allows you to continue testing the banning functionality.

## Note about the Banned Tag Display

If you're still not seeing the "Banned" tag next to banned users in the admin dashboard:

1. Ensure your console is showing logs when checking for banned users
2. Check that the `userProfile.email` field is correctly populated
3. Verify that the banned emails list is being loaded correctly

You might want to add a console log to show all user emails and banned emails when the admin dashboard loads to help debug. 