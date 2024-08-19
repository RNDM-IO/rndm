import * as dotenv from "dotenv";
import { BsxInstance, ENV_NAME } from "@bsx-exchange/client";

dotenv.config();

const API_KEY = process.env.API_KEY || "";
const API_SECRET = process.env.API_SECRET || "";
const SECRET_KEY = process.env.SECRET_KEY || "";

const main = async () => {
  try {
    const bsxInstance = await BsxInstance.createWithApiKey(
      API_KEY,
      API_SECRET,
      SECRET_KEY,
      ENV_NAME.TESTNET
    );

    // Portfolio details
    const portfolioDetails = await bsxInstance.getPortfolioDetail();
    console.log("Portfolio Details", portfolioDetails.result);
    // Get all open orders
    const resOpenOrder = await bsxInstance.getAllOpenOrders();
    console.log("getAllOpenOrders", resOpenOrder.result, resOpenOrder.error);

    // Get order history
    const resOrderHistory = await bsxInstance.getOrderHistory("BTC-PERP");
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
