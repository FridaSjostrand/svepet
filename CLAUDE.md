# Arbetsregler för Svepet

Det här är en vinklubbssida för 8 personer i Saltsjöbaden. Byggs i VS Code
med Claude Code, kopplad till Supabase (databas + inloggning) och Netlify
(hosting). Privat hobbyprojekt — allt ska hålla sig inom gratisnivåerna.

## Så vill jag jobba

- **Bygg stegvis, inte allt på en gång.** En liten fungerande del i taget.
  Börja med det enklaste som fungerar, bekräfta, gå sedan vidare. Aldrig
  fem saker samtidigt.
- **Förklara vad du gör och varför.** Innan kod skrivs, förklara kort på
  vanlig svenska vad som ska göras och varför. Jag är inte utvecklare —
  undvik onödig jargong, eller förklara den när den används.
- **Säkerhet från början.** En sluten grupp — bara vi 8 medlemmar ska
  komma åt datan. Row Level Security (RLS) i Supabase ska vara på plats
  från start, inte lappas på i efterhand. Sanera all text användare
  skriver in innan den visas eller sparas.
- **Testa innan vi går vidare.** Kör och bekräfta att något fungerar innan
  nästa sak läggs till.
- **Sammanfatta kort efter varje steg.** Några meningar om vad som
  ändrades, så det går att följa med.
- **Fråga hellre än att gissa.** Är något oklart — fråga i stället för att
  anta. Jag vill vara med och bestämma.
- **Håll det enkelt och gratis.** Bara gratisnivåer (Supabase, Netlify).
  Föreslå inga betaltjänster. Välj det enklare sättet framför det
  avancerade.
- **Spara ofta.** Påminn om att committa till GitHub efter varje
  fungerande steg, så inget går förlorat och man alltid kan gå tillbaka.

## Om projektet

- **Klubbnamn:** Svepet
- **Medlemmar:** 8 personer, sluten grupp, inloggning krävs
- **Kärnfunktioner:** kvällar med tema/datum, lägga till vin (namn,
  producent, årgång, kategori, druva, land/region, lagring, pris,
  alkohol%, volym, bild, Systembolagets-länk, egen beskrivning),
  automatisk provningsordning per kväll, betyg (1–5, halvsteg) + kommentar,
  privat smakprofil per person (stapeldiagram: druvor, länder, lagring,
  stil — baserat på egna betyg, inte gruppens).
- **Ingen automatisk hämtning från Systembolaget** — kräver ett API-avtal
  vi inte har. Länk + manuell beskrivning istället.
- **Utseende:** pastellfärger, rosé & guld som huvudkänsla, rundade mjuka
  kort, mjuka skuggor, lite glammig känsla. Möjlighet att byta till
  lavendel/persika eller mint/rosa.
- **Stack:** Supabase (databas + auth), Netlify (hosting), byggs i VS Code
  med Claude Code.
