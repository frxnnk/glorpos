# Verificación local — 2026-09-07

Vite en 127.0.0.1:5173; Chromium mediante Playwright CLI, sesión aislada glorp2.

- `npm run build`: TypeScript y build de producción correctos.
- Dependencias auditadas por npm: sin vulnerabilidades reportadas en la instalación.
- Ventanas: abrir, arrastrar, maximizar/restaurar, minimizar/recuperar desde dock y cerrar comprobados. Las comprobaciones de tamaño esperan a que termine la transición de WinBox.
- Notas: texto escrito y recuperado tras recargar la página.
- Maker: editar mensaje, exportar y descargar PNG; imagen 800 × 800 inspeccionada visualmente en output/playwright/glorp-export.png.
- Launcher: Ctrl K, filtrar Terminal y abrir con Enter.
- Terminal: `open settings` abre Ajustes.
- Temas: Tinta sobrevive a una recarga; se restauró Musgo.
- Arcade: iniciar partida y llegar al estado final tras 30 segundos; no se validó exhaustivamente la distribución de colisiones.
- Music: archivo WAV sintético local de 1 segundo cargado, duración reconocida y reproducción aceptada por el navegador. Cierre del reproductor comprobado. No prueba de escucha de hardware.
- Móvil: 390 × 844, ventana dentro de los límites del viewport, dock accesible y captura inspeccionada. También probado pasar desde escritorio a tamaño móvil.
- Escritorio: captura 1440 × 900 inspeccionada.
- Consola al finalizar: 0 errores y 0 advertencias.

Capturas: output/playwright/desktop.png y output/playwright/mobile.png. Logs originales en .playwright-cli, ignorados en Git.

Límites: no Safari/Firefox, dispositivo físico ni auditoría integral de accesibilidad. No publicación ni servicios de IA conectados. El objetivo de este corte es una base local revisable; la calidad de producción exige ampliar estas verificaciones después de cerrar el alcance.
