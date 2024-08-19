import * as dotenv from "dotenv";
import { BsxInstance, ENV_NAME } from "@bsx-exchange/client";

dotenv.config();

const API_KEY = process.env.API_KEY || "";
const API_SECRET = process.env.API_SECRET || "";
const SIGNER_PK = process.env.SIGNER_PK || "";

const main = async () => {
  try {
    const bsxInstance = await BsxInstance.createWithApiKey(
      API_KEY,
      API_SECRET,
      SIGNER_PK,
      ENV_NAME.TESTNET
    );

    // Create order
    const resCreateOrder = await bsxInstance.createOrder({
      side: "BUY",
      type: "LIMIT",
      product_index: 2, // 1 for BTC-PERP, 2 for ETH_PERP ... (check Product Index section)
      price: "3600",
      size: "0.2",
      post_only: false,
      reduce_only: false,
    });
    console.log("createOrder", resCreateOrder.result, resCreateOrder.error);

    // Get all open orders
    const resOpenOrder = await bsxInstance.getAllOpenOrders();
    console.log("getAllOpenOrders", resOpenOrder.result, resOpenOrder.error);

    // Get order history
    const resOrderHistory = await bsxInstance.getOrderHistory("ETH-PERP");
    console.log(
      "getOrderHistory",
      resOrderHistory.result,
      resOrderHistory.error
    );
  } catch (error) {
    console.log("Error", error);
  }
};

main();
