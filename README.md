# fjordline-backend
Backend-app for jobbsøknad ved Fjord Line AS.

## Antagelser
Jeg antar ruten ['Bergen', 'Stavanger', 'Hirtshals', 'Kristiansand'] også går baklengs, og ikke i sirkel for å service reiser fra Kristiansand til Bergen for eksempel.

## Utvikling og valg

### Språk
Gitt min nylige interesse i Next.js bruker jeg Node.js med Express og TypeScript.

- **Arkitektur og Datamodell:**
  - **Legs** De faste stoppestedene defineres som ['Bergen', 'Stavanger', 'Hirtshals', 'Kristiansand']. Jeg ønsker å ta legs i betraktning allerede fra starten for å unngå konflikt i modellen senere, samt støtte for kjøretøy. Selv om det alltid kan bli konflikter og endringer i en modell, er det viktig å ha et grundig og fleksibelt grunnlag.

  - Jeg deler inn i Departure og Booking:
    - **Departure:** Har felt som ID, ruten til skipet, og kapasistet for passasjerer og kjøretøy. Her velger jeg å representere ruten som en rekke legs, hvor hver leg har et startsted, sluttsted, tid for avgang og ankomst, samt booket passjerantall og kjøretøyvekt. I alt skaper dette en fleksibel modell som gjør det enkelt å filtrere når det kommer filterargumenter til apien. For eksempel kan det bes om å levere ruter fra stavanger før et visst tidspunkt eller dato, eller ankommer Hirtshals til en viss tid.
    - **Booking:** Har felt som ID, Contact, antall passasjerer, kjøretøy, totalvekt på kjøretøy. For kjøretøy registreres skiltnummer for hvert kjøretøy slik at det om ønskelig er mulig å hente data om kjøretøyet eller bekrefte at kjøretøyet eksisterer og er riktig type. Det er også mulig å registrere flere kjøretøy. Jeg avgrenser antall passasjerer til 20 for å ha en grense.
  
- **ZOD:** Jeg velger å bruke zod for data validation, og gjør den så presis som mulig, med blant annet skikkelig epostsjekk med .email() og telefonnummer sjekk med .e164(). Den er streng, men likevel så fleksibel som jeg mener den bør være for kravene. Jeg ønsker også at mest av validation logic skjer i zod for minst mulig implementasjonsfeil på min side.

- **Prosjektstruktur:** Lager egne mapper for routes, services (utility), data og types for oversiktlig prosjekt.

- **Revurdering av modell:** Etter å ha skapt en datamodell hvor en booking bare har en kontakt og antall passasjerer booket, så jeg en mulig feiltolkning jeg hadde gjort. Siden booking manifest ber om en liste med passasjerer, antar jeg det da ønskes navn. På denne måten kan det bedre spores hvem som er om bord, som er gunstig av sikkerhetsårsaker. Derfor lagrer jeg i det minste navn for hver passasjer, med mulighet for mer.

- **Departures manifest:** Jeg velger å returnere manifestet med liste av passasjerer, kontaktinfo til bookingperson, samt hvor de skal av og på. Jeg legger også inn mulighet for å filtrere på hvor passasjerene går av og på, som samsvarer med "leg" logikk.

- **Unit testing:** Jest har lenge vert standard, men Vitest+Supertest er mer fremtidsrettet, spesielt for et TypeScript prosjekt. Jeg lager en testfil for departures.ts for å teste APIen, og egne unit tester for hver service fil. Jeg tester alle endpointene.

- **Logging:** Jeg spurte Gemini hva den anbefalte for prosjektet og foreslo Winston eller pino. Jeg søkte litt rundt og fant at pino virker best for denne applikasjonen, gitt at den er lettere og har higher performance. Vi har ikke stor og kompleks nok logikk til å ha behov for Winston.

## Ideer
- Legg til shipId i DepartureResponse, alternativt skipnavn så det kan hentes informasjon om fasiliteter om bord fra en datamodell for skip
- Legge til .trim() i string typer for å forhindre enkle feil
- Legg til sjekk innen Departure om leg[0].to matcher leg[1].from osv.
- Sette opp egen bookingliste for hver departure så det er raskere å søke etter manifestet.
- Ta hensyn til tidssoner
- La /departures bare returnere overfarter med tilgjengelig plass (dette var ikke helt klart for meg som krav eller ikke)