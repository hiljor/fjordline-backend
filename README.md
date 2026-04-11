# fjordline-backend
Backend-app for jobbsøknad ved Fjord Line AS

## Språk
Gitt min nylige interesse i Next.js bruker jeg Node.js med Express.

## Arkitektur og Datamodell
De faste stoppestedene defineres som ['Bergen', 'Stavanger', 'Hirtshals', 'Kristiansand']. Jeg ønsker å ta legs i betraktning allerede fra starten for å unngå konflikt i modellen senere. Selv om det alltid kan bli konflikter og endringer, er det bedre å ha et så grundig grunnlag som mulig.

Jeg deler inn i Departure og Passenger:
- **Departure**
  - Har felt som ID, ruten til skipet, og kapasistet for passasjerer og kjøretøy. Her velger jeg å representere ruten som en rekke legs, hvor hver leg har et startsted, sluttsted, tid for avgang og ankomst, samt booket passjerantall og kjøretøy. Dette skaper en fleksibel modell som gjør det enkelt å filtrere når det kommer filterargumenter til apien. For eksempel kan det bes om å levere ruter fra stavanger før et visst tidspunkt eller dato, eller ankommer Hirtshals til en viss tid.
- **Booking**
  - Har felt som ID, navn, epost, antall passasjerer, og kjøretøy. For kjøretøy registreres skiltnummer slik at det er mulig å begrense totalvekten på kjøretøy om bord, og det er mulig å registrere flere kjøretøy.

