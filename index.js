require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
} = require("plaid");

const app = express();
app.use(cors());
const PORT = 3000;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
const PLAID_PROD = (process.env.PLAID_PRODUCTS || Products.Transactions).split(
  ","
);
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "US").split(
  ","
);

let ACCESS_TOKEN = null;
let ITEM_ID = null;
let PUBLIC_TOKEN = null;

app.use(express.urlencoded({ extended: false }));
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
  console.log("Create Link token");
  const configToken = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: "user-id",
    },
    client_name: "Plaid Quickstart",
    products: PLAID_PROD,
    country_codes: PLAID_COUNTRY_CODES,
    language: "en",
  };
  console.log(configToken);
  try {
    const createTokenResponse = await client.linkTokenCreate(configToken);
    response.json(createTokenResponse.data);
  } catch (error) {
    console.log(`Error getting link token: ${error}`);
    next;
  }
});

app.post("/api/set_access_token", async (request, response, next) => {
  PUBLIC_TOKEN = request.body.public_token;
  try {
    const tokenExchange = await client.itemPublicTokenExchange({
      public_token: PUBLIC_TOKEN,
    });

    ACCESS_TOKEN = tokenExchange.data.access_token;
    ITEM_ID = tokenExchange.data.item_id;
    response.json(true);
  } catch (error) {
    console.log(`Error exchanging tokens: ${error}`);
    next;
  }
});

app.get("api/balance", async (request, response, next) => {
  try {
    const balanceResponse = await client.accountsBalanceGet({
      access_token: ACCESS_TOKEN,
    });
    response.json(balanceResponse.data);
  } catch (error) {
    console.log(`Error getting account balance: ${error}`);
    next;
  }
});

app.get("/api/accounts", async (request, response, next) => {
  try {
    const accountResponse = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    });
    response.json(accountResponse.data);
  } catch (error) {
    console.log(`Error getting the accounts: ${error}`);
    next;
  }
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
