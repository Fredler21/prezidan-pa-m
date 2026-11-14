# Si m te prezidan v4: the game with levels

Phone designs from Stitch for the rebuild of the game, made on 2026-11-13. The behaviour is specified by the prototype in [docs/si-m-te-prezidan-prototype.html](../../si-m-te-prezidan-prototype.html); these screens set the look. Screen ids are in [manifest.json](manifest.json).

| File | Screen |
|---|---|
| s18-home.png | Game home: title, map of Haiti, « Prete sèman », best score and badges, the 5 levels, sign in invite, disclaimer |
| s19-level-map.png | Level map: 5 levels on the map with a dotted path, stars, pulsing current level, locks, stat tiles, year card |
| s20-year-intro.png | Year intro: story scene, adviser line, delayed consequence, start of year stats with taxes |
| s21-decision.png | Decision: stat tiles, scene, adviser question with « Mande konsèy », swipeable dossiers, « DESIDE » stamp, « Siyen dekrè a » |
| s22-result.png | Result: « Jounal Pèp la » headline, map reacting, stat bars with +/− numbers, the adviser's reason |
| s23-year-report.png | Year report: stars, new badge, map, stats, next year |
| s24-final.png | Final report: score, profile, before and after, stars per year, candidates on the same priorities, share, replay, vote |
| s25-badges.png | Badges sheet: 11 badges, streak, best score |

## Rules that came with the design

- Flat colors only: no gradients, glow, glass or emoji. Bricolage Grotesque, ultramarine pill buttons, 1px hairlines.
- The game follows the site theme: white by day, black at night. Only the map and the story scenes are navy.
- Progress (stars, badges, streak, best score) is saved for signed in players only.
- The candidate block on the final report stays: same format for everyone, never a recommendation.
- No real candidate or party in the scenarios. The disclaimer stays visible.

## Not to copy from these renders

- Stitch's outline of Haiti is approximate: the build uses the prototype's map (mapSVG and its coordinates).
- Uppercase labels (« KÒMANSMAN ANE A », « PWOFIL OU », the newspaper masthead): the site uses sentence case.
- Text Stitch added on its own: « Estati: Vilnerab », « Chwazi », « 1 nivo pa ane », « 36% ».
