// Edge Function for sending emails with proper CORS headers

// CORS headers to allow requests from all origins (you might want to restrict this in production)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Email sending function using an external service
// Replace this with your actual email sending implementation
async function sendEmail(to: string, subject: string, message: string) {
  console.log(`[EDGE FUNCTION] Sending email to ${to} with subject: ${subject}`);
  
  // This is where you would integrate with an email service like SendGrid, AWS SES, etc.
  // Example with SendGrid (you would need to import the SendGrid SDK and add your API key):
  /*
  const sendgrid = await import('@sendgrid/mail');
  sendgrid.setApiKey(Deno.env.get('SENDGRID_API_KEY') || '');
  
  try {
    await sendgrid.send({
      to,
      from: 'your-email@example.com', // Use a verified sender
      subject,
      text: message,
    });
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error };
  }
  */
  
  // For now, we'll simulate success
  return { success: true };
}

// This handles OPTIONS preflight request
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Main function handler
export default async (req: Request) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }
  
  try {
    // Parse request body
    const { to, subject, message } = await req.json();
    
    // Validate required fields
    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: to, subject, or message' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Attempt to send email
    const result = await sendEmail(to, subject, message);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error || 'Failed to send email' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Log and return error response
    console.error('Error in send-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}; 