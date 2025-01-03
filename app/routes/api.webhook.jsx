import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
    try {
        const { admin, session } = await authenticate.admin(request);

        // Get the webhook URL from metafields
        const response = await admin.graphql(`
      query {
        currentAppInstallation {
          metafield(key: "webhook_url", namespace: "flowhooks") {
            value
          }
        }
      }
    `);

        const data = await response.json();
        const webhookUrl = data.data.currentAppInstallation.metafield?.value;

        if (!webhookUrl) {
            throw new Error("Webhook URL not configured");
        }

        // Get the event data from the request
        const eventData = await request.json();

        // Forward the event data to the configured webhook
        const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        if (!webhookResponse.ok) {
            throw new Error(`Webhook request failed: ${webhookResponse.statusText}`);
        }

        return json({ success: true });
    } catch (error) {
        return json(
            { error: error.message },
            { status: 500 }
        );
    }
};
