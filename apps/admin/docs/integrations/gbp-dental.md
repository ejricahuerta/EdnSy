# Lead discovery (GBP)

Pull dental leads from **Toronto and the GTA** using Google Business Profile (Places API). Only businesses with **fewer than 50 reviews** are added, so you can focus on prospects that need more visibility.

## How it works

- Click **Pull up to 5 dental leads** to search the Greater Toronto Area for dental businesses.
- Results are filtered: fewer than 50 reviews (website optional).
- Up to 5 random matches are added to your [Prospects](/dashboard/prospects) list with industry **Dental** and status **New**.
- A maximum of **25** leads can be added per day (UTC). The counter resets at midnight UTC.

## Requirements

- **Google Places API** must be configured in your server `.env`: set `GOOGLE_PLACES_API_KEY` or `GOOGLE_MAPS_API_KEY`.
- Enable [Places API (New)](https://developers.google.com/maps/documentation/places/web-service/overview) in Google Cloud and create an API key. Ensure the key has **Places API (New)** enabled, not only the legacy Places API.

If no places are found, check that the API key is valid, billing is enabled if required, and the **Places API (New)** is enabled for your project. The search uses the Toronto/GTA bounding box and `regionCode: CA`.

## After pulling

New prospects appear in Dashboard → Prospects. Use **Pull insights** (and optionally create a demo) for each lead as needed.
