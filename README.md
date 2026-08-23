# Thomas Montage & Klussen

Astro-website op basis van het Figma-ontwerp voor Thomas Montage & Klussen.

## Lokaal starten

```sh
npm install
npm run dev
```

## Productie

Kopieer `.env.example` naar `.env` en vul de definitieve domeinnaam in. Bouw daarna met `npm run build`.

Voor publicatie moeten het telefoonnummer, e-mailadres, WhatsAppnummer, Facebookadres en de tijdelijke reviews nog door echte gegevens worden vervangen.

## Netlify Forms

Het contactformulier wordt automatisch door Netlify Forms verwerkt. Stel na de eerste deploy het ontvangstadres in via **Netlify → Forms → Form notifications → Email notification**. Kies daar het formulier `contact` en vul het gewenste e-mailadres in.
