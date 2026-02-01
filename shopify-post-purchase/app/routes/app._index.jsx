import { useEffect, useState } from "react";
import { Form, useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

/* ---------------- Loader ---------------- */
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);

  // Ensure shop exists in MongoDB
  await fetch(`${url.origin}/api/ensure-shop?shop=${shop}`);

  // Fetch saved post-purchase message
  const res = await fetch(`${url.origin}/api/message?shop=${shop}`);
  const data = await res.json();

  return {
    shop,
    message: data.message || "",
  };
};

/* ---------------- Action ---------------- */
export const action = async ({ request }) => {
  const formData = await request.formData();

  const url = new URL(request.url);
  await fetch(`${url.origin}/api/message`, {
    method: "POST",
    body: formData,
  });

  return { success: true };
};

/* ---------------- UI ---------------- */
export default function Index() {
  const { shop, message } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const [value, setValue] = useState(message);

  const isSaving =
    fetcher.state === "submitting" || fetcher.state === "loading";

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Message saved successfully");
    }
  }, [fetcher.data, shopify]);

  return (
    <s-page heading="Post-Purchase Message">
      <s-section>
        <s-paragraph>
          Customize the message customers see after completing a purchase.
        </s-paragraph>

        <fetcher.Form method="post">
          <input type="hidden" name="shop" value={shop} />

          <s-stack direction="block" gap="base">
            <s-text-field
              label="Post-purchase message"
              multiline
              rows={4}
              name="message"
              value={value}
              onInput={(e) => setValue(e.target.value)}
            />

            <s-button
              type="submit"
              variant="primary"
              {...(isSaving ? { loading: true } : {})}
            >
              Save message
            </s-button>
          </s-stack>
        </fetcher.Form>
      </s-section>

      <s-section slot="aside" heading="Shop info">
        <s-paragraph>
          <s-text>Shop domain:</s-text>
          <br />
          <strong>{shop}</strong>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

/* ---------------- Headers ---------------- */
export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
