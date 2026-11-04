# Foodie Driver frontend

React and Vite frontend for the Foodie driver portal.

## Run locally

From this folder, install dependencies with `npm install`, then start the app with `npm run dev`. The frontend expects an authenticated driver API at the same origin. Browser location access requires the driver's permission and a secure origin or localhost.

## Server integration

Driver sign-in, registration, password reset, profile updates, vehicle review, availability, delivery offers, notifications, earnings, bank accounts, payouts, and complaints require server endpoints. The frontend only shows account or activity data returned by the server; unavailable services show an error or empty state. It does not create example drivers, orders, earnings, notifications, complaints, or bank accounts.

The map needs a configured map tile and routing provider to show a live map and routes. Browser geolocation alone only provides the device coordinates.

## Commands

- `npm run dev` — local development
- `npm run build` — production bundle
- `npm run lint` — ESLint
