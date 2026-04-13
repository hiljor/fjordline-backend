# fjordline-backend
Backend-app for jobbsøknad ved Fjord Line AS.

## Språk
Gitt min nylige interesse i Next.js bruker jeg Node.js med Express og TypeScript.

## Antagelser
Jeg antar ruten ['Bergen', 'Stavanger', 'Hirtshals', 'Kristiansand'] også går baklengs, og ikke i sirkel for å service reiser fra Kristiansand til Bergen for eksempel.

## Arkitektur og Datamodell
De faste stoppestedene defineres som ['Bergen', 'Stavanger', 'Hirtshals', 'Kristiansand']. Jeg ønsker å ta legs i betraktning allerede fra starten for å unngå konflikt i modellen senere, samt støtte for kjøretøy. Selv om det alltid kan bli konflikter og endringer i en modell, er det bedre å ha et så grundig grunnlag som mulig.

Jeg sikret en streng validering for å sikre mot konflikter i format og annet.

Jeg deler inn i Departure og Booking:
- **Departure**
  - Har felt som ID, ruten til skipet, og kapasistet for passasjerer og kjøretøy. Her velger jeg å representere ruten som en rekke legs, hvor hver leg har et startsted, sluttsted, tid for avgang og ankomst, samt booket passjerantall og kjøretøyvekt. I alt skaper dette en fleksibel modell som gjør det enkelt å filtrere når det kommer filterargumenter til apien. For eksempel kan det bes om å levere ruter fra stavanger før et visst tidspunkt eller dato, eller ankommer Hirtshals til en viss tid.
- **Booking**
  - Har felt som ID, Contact, antall passasjerer, kjøretøy, totalvekt på kjøretøy. For kjøretøy registreres skiltnummer for hvert kjøretøy slik at det om ønskelig er mulig å hente data om kjøretøyet eller bekrefte at kjøretøyet eksisterer og er riktig type. Det er også mulig å registrere flere kjøretøy. Jeg avgrenser antall passasjerer til 20 for å ha en grense.
  


## Ideer

- Legg til shipId i DepartureResponse, alternativt skipnavn så det kan hentes informasjon om fasiliteter om bord
- Legge til .trim() i string typer for å forhindre enkle feil
- Legg til sjekk innen Departure om leg[0].to matcher leg[1].from osv.