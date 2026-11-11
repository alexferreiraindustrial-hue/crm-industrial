#!/bin/sh
# CRM Industrial: gera os PNG do Chatwoot (favicons, Apple, Android, Windows, avatar do bot) a partir do nosso SVG.
# Mesmos nomes e tamanhos dos arquivos originais em /app/public e /app/public/packs.
set -eu
OUT="$1"
ICON=/src/logo_thumbnail.svg
BADGE=/src/icon-badge.svg
mkdir -p "$OUT/assets/images"

render() {
  rsvg-convert -w "$2" -h "$2" "$1" -o "$OUT/$3"
}

for size in 16 32 96 512; do render "$ICON" "$size" "favicon-${size}x${size}.png"; done
for size in 16 32 96; do render "$BADGE" "$size" "favicon-badge-${size}x${size}.png"; done
for size in 57 60 72 76 114 120 144 152 180; do render "$ICON" "$size" "apple-icon-${size}x${size}.png"; done
render "$ICON" 192 apple-icon.png
render "$ICON" 192 apple-icon-precomposed.png
render "$ICON" 180 apple-touch-icon.png
render "$ICON" 180 apple-touch-icon-precomposed.png
for size in 36 48 72 96 144 192; do render "$ICON" "$size" "android-icon-${size}x${size}.png"; done
for size in 70 144 150 310; do render "$ICON" "$size" "ms-icon-${size}x${size}.png"; done
render "$ICON" 256 assets/images/chatwoot_bot.png

echo "CRM Industrial: $(find "$OUT" -name '*.png' | wc -l) icones gerados."
