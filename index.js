const express = require("express");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const app = express();
const PORT = 3000;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
const PLAID_PROD = process.env.PLAID_PRODUCTS;
const PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES;
app.use(express.json());

const config = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});
const client = new PlaidApi(config);
app.get("/", (request, response) => {
  response.json("Hello World");
});

app.post("/api/create_link_token", async (request, response, next) => {
  const configToken = {
    user: {
      client_user_id: "client_id",
    },
    client_name: "Bank App",
    products: PLAID_PROD,
    language: "en",
    country_codes: "PLAID_COUNTRY_CODES",
  };
  try {
    const createTokenResponse = await client.linkTokenCreate(configToken);
    response.json(createTokenResponse.data);
  } catch (error) {
    console.log(`Error getting link token: ${error}`);
    next;
  }
});
app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
