import { connectMongo } from "../db.server";
import Shop from "../models/Shop";

// GET: fetch message
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json({ message: "" });
  }

  await connectMongo();

  const shopDoc = await Shop.findOne({ shopDomain: shop });

  return Response.json({
    message: shopDoc?.message || "",
  });
};

// POST: update message
export const action = async ({ request }) => {
  const formData = await request.formData();
  const shop = formData.get("shop");
  const message = formData.get("message");

  if (!shop || !message) {
    return Response.json({ success: false });
  }

  await connectMongo();

  await Shop.findOneAndUpdate(
    { shopDomain: shop },
    { message },
    { new: true }
  );

  return Response.json({ success: true });
};
