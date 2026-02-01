import { connectMongo } from "../db.server";
import Shop from "../models/Shop";

export const action = async ({ request }) => {
  const payload = await request.json();

  const shop = payload?.shop_domain;

  if (!shop) {
    return new Response("No shop domain", { status: 200 });
  }

  await connectMongo();
  await Shop.deleteOne({ shopDomain: shop });

  console.log(`🗑️ App uninstalled for shop: ${shop}`);

  return new Response("OK", { status: 200 });
};
