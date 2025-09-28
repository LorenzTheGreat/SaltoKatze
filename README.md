# SaltoKatze

> Ein einfaches, mobiles Browser-Spiel: eine laufende Katze, Hindernisse und Punkte für Distanz. Halte Sprint gedrückt oder du verlierst.

## Was ist enthalten

- `index.html` - Spiel-Oberfläche und mobile Buttons
- `style.css` - einfache Styles und responsive Layout
- `game.js` - Game-Loop, Physik, Hindernisse, Punkte, Speicherung des Highscores

## Lokaler Start

Am einfachsten lokal testen mit einem kleinen Webserver. Unter Windows (PowerShell):

```powershell
# mit Python 3
python -m http.server 8000
# oder, wenn python3 alias vorhanden:
python3 -m http.server 8000
```

Dann im Browser öffnen: http://localhost:8000/

Alternativ kannst du die Dateien direkt im Browser öffnen, aber manche Browser blockieren lokal geladene Dateien (z.B. bei CORS) — ein lokaler Server ist zuverlässiger.

## Steuerung

- Auf Desktop: Leertaste oder Pfeil oben = Springen. Shift halten = Sprint.
- Auf Mobil: "Sprint halten"-Taste gedrückt halten, "Sprung" zum Springen.
- Tippe den Bildschirm an, um nach Game Over neu zu starten.

## Erweiterungen (Vorschläge)

- Animationen / Sprite-Sheet für die Katze
- Soundeffekte und Musik
- Verschiedene Hindernistypen, Power-Ups
- Touch-Gesten: wischen zum Springen, Doppeltipp für höheren Sprung

*** Viel Spaß beim Spielen! ***