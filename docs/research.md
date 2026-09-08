# GlorpOS 2 — decisión de base

Revisión del 7 de septiembre de 2026. Fechas de actividad consultadas por GitHub API (`pushed_at`): indican actividad del repositorio, no calidad, releases ni soporte garantizado.

| Proyecto | Licencia del repo | Último push observado | Qué aporta | Decisión |
| --- | --- | --- | --- | --- |
| [daedalOS](https://github.com/DustinBrett/daedalOS) | MIT | 2026-09-05 | Escritorio React/Next.js, archivos en IndexedDB, aplicaciones, emuladores, terminal | Mejor candidato para un fork completo; demasiado alcance para esta primera experiencia. Revisar aparte licencias de apps/assets si se incorporan. |
| [Puter](https://github.com/HeyPuter/puter) | AGPL-3.0 por defecto | 2026-09-07 | Plataforma completa con escritorio, servicios y ecosistema | Considerarlo si el producto requiere una plataforma multiusuario. No incorporado; su alcance y licencia merecen una decisión independiente. |
| [OS.js](https://github.com/os-js/OS.js) | BSD-2-Clause, verificada en LICENSE | 2022-12-12 | Framework de escritorio, APIs para apps, ventanas y abstracciones de archivos | La base principal tiene menor actividad reciente. Esto no evalúa todos los paquetes de su organización. |
| [WinBox](https://github.com/nextapps-de/winbox) | Apache-2.0 | 2024-08-15 | Gestor de ventanas: mover, redimensionar, maximizar y minimizar, sin dependencias | Elegido para el primer corte. API pequeña, reemplazable y sin imponer otra plataforma. Menor actividad reciente: validar interacciones y mantener versión fijada. |

## Decisión

Construir la identidad de GlorpOS 2 con TypeScript y Vite, y reutilizar WinBox 0.2.82. No se copió código de daedalOS, Puter u OS.js. El adaptador de ventanas queda en main.ts; los programas no dependen de WinBox.

La alternativa recomendada si cambia el alcance hacia un escritorio con filesystem, múltiples documentos y muchas apps es un spike acotado sobre daedalOS. No tiene sentido portar sus emuladores y herramientas ahora.

## Origen

`frxnnk/glorpos` main, e60c0190c60c38e6e864a526f905c861830a64bb, 2024-11-27: escritorio original y origen del personaje. `frxnnk/glorp` master, 2ada639bdea27c4984810c59a4e6e8c8a81e2874, 2024-12-22: gráfico separado; el último commit agregó solamente una imagen y el JS es de agosto de 2024.

## Alcance local de este corte

Escritorio, launcher con teclado, siete apps (incluye bienvenida y ajustes), notas locales, exportación PNG, audio local y minijuego. No incluye chat IA, cuentas, sincronización cloud, cotizaciones, wallet, galería persistente ni snap de ventanas. No requiere claves ni servicios provisionados. Las fuentes se solicitan a Google Fonts, con fallback local.

## Próximos pasos de producto

1. Iterar la dirección visual con el usuario sobre la demo real.
2. Añadir acomodo de ventanas y restauración de sesión, galería de creaciones y manejo de varios documentos.
3. Definir si IA es una herramienta real del producto y su caso de uso antes de elegir modelo, costes e integración.
4. Validar navegadores adicionales, accesibilidad con lector de pantalla y flujos de errores antes de publicar.
