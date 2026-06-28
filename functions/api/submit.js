export async function onRequestPost(context) {
  try {
    const data = await context.request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');

    if (!name || !email || !message) {
      return new Response('Missing required fields', { status: 400 });
    }

    const resendApiKey = context.env.RESEND_API_KEY;
    const toEmail = context.env.CONTACT_EMAIL;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Website Contact Form <update@updates.alvinlim.dev>',
        to: [toEmail],
        subject: `New Message from ${name}`,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong> ${message}</p>`,
      }),
    });

    if (response.ok) {
      return new Response(JSON.stringify({ success: true, message: 'Thank you! Your message has been sent.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Error sending email: ${errorText}` }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: `Server error: ${err.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
}