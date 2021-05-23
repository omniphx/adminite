# Adminite

![Screen Shot 2021-05-23 at 6 00 16 PM](https://user-images.githubusercontent.com/3722405/119278031-d54bec80-bbf0-11eb-99f3-cb824c282e77.png)

## Development

### Setting up a Connected App

1. Log into to your Salesforce org
2. Click on Setup in the upper right-hand menu (Classic)
3. Build > Create > App
4. Under Connected Apps, click "New"
5. Create an app with the following settings:
  * Connected App Name
  * API Name
  * Contact Email
  * Enable OAuth Settings under the API dropdown
  * Add the following scopes:
    * Access and manage your data (api)
    * Access your basic information (id, profile, email, phone)
    * Perform requests on your behalf at any time (refresh_token, offline_access)
    * Provide accesss to your data via the Web (web)
  * Set callback URL to:
    ```
    http://localhost:42834/callback
    http://localhost:29562/callback
    http://localhost:38853/callback
    http://localhost:40011/callback
    http://localhost:44774/callback
    http://localhost:47599/callback
    ```
* Require Secret for Web Server Flow - checked

### Run locally

1. `yarn install`
2. Create a `.env` file and your consumer key/secret:
  ```
  ELECTRON_WEBPACK_APP_SALESFORCE_CLIENT_ID=<your-consumer-id>
  ELECTRON_WEBPACK_APP_SALESFORCE_CLIENT_SECRET=<your-consumer-secret>
  ```
3. `yarn dev`
