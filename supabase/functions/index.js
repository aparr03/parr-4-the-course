// Example Edge Function that includes CORS headers
// This is a basic template you can use when deploying your function to Supabase

// CORS headers to allow requests from your local development server
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // In production, change this to your specific domain
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
  
  // This handles the OPTIONS preflight request
  export const handleOptions = (request) => {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  };
  
  // Main function handler
  export const handler = async (event, context) => {
    // Handle OPTIONS request (preflight)
    if (event.method === 'OPTIONS') {
      return handleOptions(event);
    }
    
    try {
      // Parse the request body
      const body = await event.json();
      const { to, subject, message } = body;
      
      // Validate inputs
      if (!to || !subject || !message) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: to, subject, or message' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Here you would implement your email sending logic
      // For example, using a service like SendGrid, AWS SES, etc.
      console.log(`Sending email to ${to} with subject: ${subject}`);
      
      // For demonstration, we'll just return success
      // In a real implementation, you would actually send the email here
      
      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      console.error('Error sending email:', error);
      
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to send email' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  }; 