require("dotenv").config();
const Users = require("./Models/UserSchema.js");
const Goals = require("./Models/GoalSchema.js");
const User = Users.User;
const Goal = Goals.Goal;

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
} = require("plaid");

const app = express();
async function main() {
  await mongoose.connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
main()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(`Database Error: ${err}`));
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

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

app.get("/", (request, response) => {
  response.json("Hello World");
});

app.post("/api/create_link_token", async (request, response, next) => {
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
    response.json(ITEM_ID);
  } catch (error) {
    console.log(`Error exchanging tokens: ${error}`);
    next;
  }
});
app.get("/user/#userID", async (request, response) => {
  let { userID } = request.params;
  const user = await User.findById(userID, "First Last Email Goals").exec();
  return user.json();
});
app.post("/user/#user/goal/#goalID", async (request, response) => {});
app.put("/user/#user/goal/#goalID", async (request, response) => {});
app.delete("/user/#user/goal/#goalID", async (request, response) => {});

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

app.get("/api/transactions", async (request, response) => {
  let cursor = null;
  let added = [];
  let modified = [];
  let removed = [];
  let hasMore = true;

  while (hasMore) {
    const request = {
      access_token: ACCESS_TOKEN,
      cursor: cursor,
    };
    const response = await client.transactionsSync(request);
    const data = response.data;
    cursor = data.next_cursor;
    if (cursor === "") {
      await sleep(2000);
    }

    added = added.concat(data.added);
    modified = modified.concat(data.modified);
    removed = removed.concat(data.removed);
    hasMore = data.has_more;
  }
  const compareTxnsByDateAscending = (a, b) =>
    (a.date > b.date) - (a.date < b.date);
  // Return the 8 most recent transactions
  const recently_added = [...added].sort(compareTxnsByDateAscending).slice(-8);
  response.json({ latest_transactions: recently_added });
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
