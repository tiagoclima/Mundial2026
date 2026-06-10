# Mundial2026

**Mundial2026** is a lightweight static website that displays fixtures and results for the 2026 World Cup. The project uses **GitHub Actions** to periodically fetch data from an external API and store it as JSON files consumed by the frontend. This keeps the site fast, static, and always updated without exposing private API keys.

## Data Source
Data is retrieved from the official API at:  
https://www.wc2026api.com

## Requirements
To access the API, you must configure an API key using **GitHub Actions Secrets**.  
The scheduled workflow uses this secret to fetch updated fixtures and results and write them into the `/data` directory.

## Frontend
The frontend is a static site (HTML/React) that reads the generated JSON files instead of calling the API directly. This avoids rate limits and keeps the API key private.
