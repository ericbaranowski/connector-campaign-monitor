Intellibook / Campaign Monitor connector
------

This app is used to act as a proxy between Intellibook and Campaign Monitor
to maintain Subscriber Lists in CM based on attendee registrations in Intellibook.

### Instructions

To run this project you need to install npm dependencies (`npm install`),
set environment variables (see below) and run `npm start`.

##### Environment variables

 * **IP** - address to listen incoming requests onto (default `0.0.0.0`);
 * **CMC_PORT** - port to listen incoming requests onto (default `80`);
 * **CMC_SUBSCRIBER_TIMEZONE** - subscriber timezone;
 * **CMC_AI_KEY** - AppInsights key (e.g. `28d94fac-f18a-1267-8995-7736029ed590`);
 * **CMC_SECURITY_USERNAME** - username for Basic Auth (e.g. `user`);
 * **CMC_SECURITY_PASSWORD** - password for Basic Auth (e.g. `password`);
 * **CMC_IB_BASE_URL** - base address of Intellibook API (e.g. `https://travel.intellibook.co`);
 * **CMC_IB_API_USER** - username for Intellibook API (e.g. `travel`);
 * **CMC_IB_API_KEY** - API key for Intellibook API (e.g. `a1f2c5a6-259e-2165-89f0-21351adcb2ac`);
 * **CMC_CM_CLIENT_ID** - ClientId for CampaignMonitor API (e.g. `ab2f2ee3bb9g56546agee4e12ebcadd2`);
 * **CMC_CM_API_KEY** - API key for CampaignMonitor API (e.g. `fb9g5654agee4e12ebcdd2e3bb9g56f546gee4e12ebcadd2`);

### Usage

Currently available only 1 API endpoint. You need to make a `POST` request to
`http(s)://<ip-address-or-domain-name>/api/subscribe-new-clients` with the data similar to following.

```json
{
  "BookingId": 16423,
  "Travellers": [
    {
      "TravellerId": 45386,
      "BookingId": 16423,
      "Title": "Miss",
      "FirstName": "Dawn",
      "LastName": "Parade",
      "Email": "dawn-parade@grr.la",
      "DateOfBirth": "1980-02-28T00:00:00",
      "Status": 0,
      "Gender": null,
      "Notes": null,
      "CreatedUtc": "2017-05-23T07:21:11.233",
      "ModifiedUtc": null,
      "Charges": 0.0000,
      "CurrentCharges": 0.0000,
      "PaymentTotal": 0.0000,
      "Credits": 0.0000
    },
    {
      "TravellerId": 45387,
      "BookingId": 16423,
      "Title": "Mr",
      "FirstName": "Bob",
      "LastName": "Dylan",
      "Email": "bob-dylan@grr.la",
      "DateOfBirth": "1980-02-28T00:00:00",
      "Status": 0,
      "Gender": null,
      "Notes": null,
      "CreatedUtc": "2017-05-23T07:21:11.233",
      "ModifiedUtc": null,
      "Charges": 0.0000,
      "CurrentCharges": 0.0000,
      "PaymentTotal": 0.0000,
      "Credits": 0.0000
    }
  ]
}
```
