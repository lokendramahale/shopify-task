import { connectMongo } from "../db.server";
import Shop from "../models/Shop";

export const loader = async ({ request }) => {
  console.log("➡️ ensure-shop API called");

  const url = new URL(request.url);
  const shopDomain = url.searchParams.get("shop");

  console.log("🧾 Shop from query:", shopDomain);

  if (!shopDomain) {
    console.log("❌ No shop provided, aborting");
    return null;
  }

  await connectMongo();

  const existingShop = await Shop.findOne({ shopDomain });
  console.log("🔍 Existing shop:", existingShop);

  if (!existingShop) {
    const created = await Shop.create({
      shopDomain,
      installedAt: new Date(),
      message: "Thank you for your order!",
    });

    console.log("✅ Shop ensured in DB:", created.shopDomain);
  } else {
    console.log("ℹ️ Shop already exists");
  }

  return null;
};
