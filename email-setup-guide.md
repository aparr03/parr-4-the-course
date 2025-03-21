# Email Sending Setup Guide for Supabase

This guide explains how to set up email notifications for banned users in your application.

## 1. Deploy the Edge Function

First, deploy the `send-email` Edge Function to your Supabase project:

```bash
# Make sure you're in the project root directory
cd /path/to/your/project

# Deploy the Edge Function
supabase functions deploy send-email --project-ref your-project-ref
```

Replace `your-project-ref` with your Supabase project reference ID.

## 2. Add Email Service Integration

The current Edge Function is set up to simulate email sending. To actually send emails, you need to integrate with an email service. Here are options:

### Option A: SendGrid

1. Create a SendGrid account and verify a sender email
2. Get your API key
3. Add it to your Supabase project secrets:

```bash
supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key --project-ref your-project-ref
```

4. Uncomment and update the SendGrid code in the Edge Function

### Option B: AWS SES

1. Set up AWS SES and verify a sender domain/email
2. Create AWS credentials with SES permissions
3. Add them to your Supabase project secrets:

```bash
supabase secrets set AWS_ACCESS_KEY_ID=your_access_key AWS_SECRET_ACCESS_KEY=your_secret_key --project-ref your-project-ref
```

4. Implement the AWS SES code in the Edge Function

## 3. Test the Email Functionality

After deploying, you can test the email functionality:

```bash
curl -X POST "https://your-project-ref.supabase.co/functions/v1/send-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"to":"your-email@example.com","subject":"Test Email","message":"This is a test email"}'
```

Replace:
- `your-project-ref` with your Supabase project reference
- `YOUR_ANON_KEY` with your Supabase anon key (from Project Settings)
- `your-email@example.com` with your email address

## 4. Debugging Email Issues

If emails are not being sent despite no console errors:

1. Check the Supabase Edge Functions logs in the dashboard
2. Verify your email service credentials are correct
3. Make sure the email addresses you're sending to are valid
4. Check if the emails are being marked as spam

## Additional Configuration

To change the email template or sender address, modify the Edge Function code directly and redeploy. 