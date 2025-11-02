<h1>Solvro Cocktail API</h1>
<p align="center">
  Solvro cocktail api zostało stworzone jako zadanie rekrutacyjne do KN Solvro rekrutacja zimowa 2025. Podstawowa funkcjonalność(autoryzacja) została przeze mnie stworzona jakiś czas temu więc posłużyłem się swoim kodem. Rzeczy do poprawy:
</p>
<ul>
<li> Dto i pozbycię się błędów związanych z typami (ogólnie błedy z Linta, chociaż funkcjonalność działa to oczywiście powinny zostać naprawione)
<li> Dodanie walidatorów
<li> Dokończenie testów (jednostkowe). auth e2e test się nie udaję przez wysyłanie maili :/
</ul>
<p>
Generalnie jestem raczej świadomy co jest tutaj do poprawy ale przez problemy z rekrutacją i wynikający z tego krótki termin oddania zadania pozostaje ono w stanie w którym jest. Also ignorowane Open Handle w testach wynikają z używania serwisu do Maila który nie chciał się zmockować z jakiegoś powodu (też do naprawy).
</p>

<p>
Grafika przedstawiająca bazę danych
</p>
<p align="center">
  <img src="Baza_Danych.png" alt="Baza Danych" />
</p>
<p align="center">
Do zaseedowania bazy użyj "npm run seed". Ścieżka zdjęć nie będzie się zgadzała ale pozwala to na sprawdzenie filtrów i sortowania przy wysyłaniu zapytań. Jeśli chodzi o dokumentacje to wszystkie endpointy są podpisane używając swaggera na endpoincie /api
</p>

<p align="left">
  .env ustaw pod własną bazę danych. FRONTEND_URL używany jest do weryfikacji konta e-mailem tak samo jak wszystko podpisane MAIL. Przykładowe dane:
</p>
DATABASE_URL="postgresql://postgres:1234@localhost:5432/postgres"
EXPIRY_TIME_MS=3600000
JWTSECRET="C,>#@dHTp)?*lM$zOoj2[Q_f]zLKlr>S_UwbjSDD6+WPDS}?QLBd"
FRONTEND_URL=http://localhost:3000
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587

Dane logowania:
MAIL_USER=
MAIL_PASS=

</p>
