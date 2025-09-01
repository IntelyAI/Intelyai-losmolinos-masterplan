# PowerShell script para modificar el archivo SVG
$inputFile = "public/masterplan.svg"
$outputFile = "public/masterplan_hover.svg"

# Leer el contenido del archivo
$content = Get-Content $inputFile -Raw

# Agregar el bloque de estilos CSS después del tag <svg>
$styleBlock = @"
<style>
/* Polígonos transparentes por defecto */
polygon, path, rect, circle, ellipse, polyline {
  fill: none;
  cursor: pointer;
  transition: fill 0.2s ease;
}

/* Color cuando paso el mouse */
polygon:hover,
path:hover,
rect:hover,
circle:hover,
ellipse:hover,
polyline:hover {
  fill: rgba(59,130,246,0.5); /* Azul con transparencia */
}
</style>
"@

# Insertar el bloque de estilos después de la etiqueta <svg>
$content = $content -replace '(<svg[^>]*>)', "`$1`n$styleBlock"

# Cambiar todos los elementos path, polygon, rect, circle, ellipse y polyline para que tengan fill="none"
$content = $content -replace 'fill="#[^"]*"', 'fill="none"'
$content = $content -replace 'fill="[^"]*"(?!none)', 'fill="none"'

# Guardar el contenido modificado
$content | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "Archivo SVG modificado guardado como: $outputFile"

