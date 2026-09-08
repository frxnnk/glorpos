# Space fleet verification

September 7, 2026. Five SVG spacecraft share three original NFT portrait URLs from the retained catalog: Glorp #1, #2 and #5. One decorative layer is reused between startup and the desktop. No image-generation API or new npm dependency is required.

Chromium browser checks:

- Actual NFT portraits visually confirmed in startup and desktop screenshots at 1440 x 900; computed transforms changed over 800 ms.
- Compact layouts show three ships at 390 x 844, 320 x 568 and 844 x 390, with no horizontal document overflow. Portrait and landscape screenshots inspected.
- The fleet has no pointer events or keyboard targets and is hidden from the accessibility tree. Entry and all five official links remain available.
- Both Settings > Reduce motion and the emulated operating-system preference produce animation-name: none. Static ship positions remain visible.
- A simulated visibilitychange with document.hidden pauses flight animations; restoring visibility resumes them.
- Aborting the NFT artwork host in Playwright recovers all five pilots to the bundled mascot. Entry still works.
- After removing the failure simulation, a fresh entry opens About Glorp, leaves exactly one fleet and produces no collected page errors.

Evidence: output/playwright/v24-fleet-boot.png, v24-fleet-desktop.png, v24-fleet-390.png, v24-fleet-844.png, v24-fleet-320.png. Screenshots and browser artifacts are local and excluded from Git. Physical mobile devices and Safari/Firefox have not been tested.
