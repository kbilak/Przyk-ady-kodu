Przesyłam część kodu aplikacji internetowej Lista Obecności.

Wykorzystane technologie:

- MySQL
- Vue
- Node.js (express.js)
- nodemailer (wysyłanie maili do pracowników i przełożonych)

Działanie aplikacji:

- kontrola czasu pracowników - pobieranie godzin wejścia/wyjścia z bazy danych (przykładanie karty magnetycznej do czytnika = rekord w bazie danych)
- pracownik ma możliwość zalogowania się i sprawdzenia własnego czasu pracy + może zawnioskować o urlop - każdy przełożony i pracownik może mieć dostęp do różnych opcji w aplikacji w zależności od 'rangi' w bazie danych
- przełożony kontroluje swoich pracowników (można przypisać pracowników do przełożonego)
- wyszczególnienie na miesiące i lata
- podsumowanie miesięczne i godzinowe - aplikacja pokazuje, czy pracownik wyrobił swoją godzinową normę miesięczną
- osobne konto dla Kadr, które zarządzają pracownikami i ich dostępem

Załączone pliki:

- app2.js - część kodu, która jest użyta do konfiguracji serwera i kilka ścieżek użytych do pracy API - wysyłanie żądań do bazy danych i pobieranie danych
- GlowneOgolne.vue - przykład zakładki, w której pracownik może przejrzeć swoje podsumowanie miesięczne
- Kadry.vue - panel zarządzania dla Kadr - dodawanie nieobecności, edycja danych pracowników, dodawanie wpisów do bazy dancyh
- config.js - serwis dla pobierania danych z API
