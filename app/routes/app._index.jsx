import { useState, useEffect } from "react";
import { useLoaderData, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  FormLayout,
  TextField,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  
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
  return { webhookUrl: data.data.currentAppInstallation.metafield?.value || '' };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const webhookUrl = formData.get("webhookUrl");

  await admin.graphql(`
    mutation CreateMetafield($input: MetafieldInput!) {
      metafieldsSet(metafields: [{
        namespace: "flowhooks"
        key: "webhook_url"
        type: "single_line_text_field"
        value: $input.value
      }]) {
        metafields {
          id
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        input: {
          value: webhookUrl
        }
      },
    }
  );

  return { webhookUrl };
};

export default function Index() {
  const { webhookUrl: initialWebhookUrl } = useLoaderData();
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setWebhookUrl(initialWebhookUrl);
  }, [initialWebhookUrl]);

  return (
    <Page title="Flowhooks Settings">
      <Layout>
        <Layout.Section>
          {saved && (
            <Banner
              title="Webhook URL saved"
              status="success"
              onDismiss={() => setSaved(false)}
            />
          )}
          <Card>
            <Form method="post" onSubmit={() => setSaved(true)}>
              <FormLayout>
                <TextField
                  label="Webhook URL"
                  type="url"
                  value={webhookUrl}
                  onChange={setWebhookUrl}
                  name="webhookUrl"
                  helpText="Enter the URL where you want to receive webhook data"
                  autoComplete="off"
                />
                <Button submit primary>Save webhook URL</Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
