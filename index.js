const express = require("express");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const app = express();
const PORT = 3000;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
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
app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
