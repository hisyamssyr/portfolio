# Photo slots

This portfolio has **30 optional photo slots**. Every slot has a designed
placeholder that shows its intended crop, pixel size, file path, and content
hint, so the site is complete without final photography.

All slot metadata lives in `content.ts` (`photoSlots`). Photo availability is
checked at server render/build time by `lib/photos.ts`. A missing file never
produces a broken image; the placeholder remains in its place.

## How to add a photo

1. Create the folder under `public/images/` if it does not exist.
2. Add a JPG at the exact path shown in the table below.
3. Keep the intended aspect ratio. Crop before adding it to the site.
4. Rebuild or restart the app so photo availability is checked again:

   ```bash
   npm run build
   npm run start
   ```

   During local development, restart `npm run dev` after adding or removing a
   file. A refresh may not be enough because availability is resolved on the
   server.

If you prefer WebP or AVIF, update both `file` and `src` for that slot in
`content.ts`. The current convention is JPG.

## Slot table

Paths are relative to `public/images/`.

| File | Aspect | Suggested pixels | Where it appears | What to add |
| --- | ---: | ---: | --- | --- |
| `profile/portrait-main.jpg` | 4:5 | 1600x2000 | Hero portrait capsule | Your best portrait, shoulders up |
| `profile/portrait-alt.jpg` | 4:5 | 1600x2000 | Hero portrait on hover or tap (optional) | Casual or candid alternate |
| `profile/about-candid.jpg` | 1:1 | 1200x1200 | About section tilted frame | Working or candid shot |
| `projects/qa-agent/cover.jpg` | 16:10 | 1920x1200 | Project 01 object and scene | Dashboard or UI |
| `projects/qa-agent/detail-1.jpg` | 16:10 | 1920x1200 | Project 01 scene gallery | A pipeline run |
| `projects/qa-agent/detail-2.jpg` | 16:10 | 1920x1200 | Project 01 scene gallery | A draft PR on GitHub |
| `projects/qa-agent/detail-3.jpg` | 16:10 | 1920x1200 | Project 01 scene gallery | Optional extra detail |
| `projects/bpmn-agent/cover.jpg` | 16:10 | 1920x1200 | Project 02 object and scene | The BPMN diagram |
| `projects/bpmn-agent/detail-1.jpg` | 16:10 | 1920x1200 | Project 02 scene gallery | Multi-agent output |
| `projects/bpmn-agent/detail-2.jpg` | 16:10 | 1920x1200 | Project 02 scene gallery | The experiment setup |
| `projects/bpmn-agent/detail-3.jpg` | 16:10 | 1920x1200 | Project 02 scene gallery | Optional extra detail |
| `projects/numeral-classification/cover.jpg` | 16:10 | 1920x1200 | Project 03 object and scene | Sample numeral grid |
| `projects/numeral-classification/detail-1.jpg` | 16:10 | 1920x1200 | Project 03 scene gallery | Training or evaluation plots |
| `projects/numeral-classification/detail-2.jpg` | 16:10 | 1920x1200 | Project 03 scene gallery | Grad-CAM examples |
| `projects/numeral-classification/detail-3.jpg` | 16:10 | 1920x1200 | Project 03 scene gallery | Optional extra detail |
| `experience/ta-database/cover.jpg` | 3:2 | 1800x1200 | Experience knot and panel | Teaching session |
| `experience/ta-database/1.jpg` | 3:2 | 1800x1200 | Experience role gallery | SQL case study material |
| `experience/ta-database/2.jpg` | 3:2 | 1800x1200 | Experience role gallery | Optional extra detail |
| `experience/robocon/cover.jpg` | 3:2 | 1800x1200 | Experience knot and panel | Robot or lab |
| `experience/robocon/1.jpg` | 3:2 | 1800x1200 | Experience role gallery | Team |
| `experience/robocon/2.jpg` | 3:2 | 1800x1200 | Experience role gallery | Optional extra detail |
| `orgs/hmtc-external-affairs/cover.jpg` | 3:2 | 1800x1200 | Organization island and panel | Company visit (Oracle or Telkom) |
| `orgs/hmtc-external-affairs/1.jpg` | 3:2 | 1800x1200 | Organization gallery | Program documentation |
| `orgs/hmtc-external-affairs/2.jpg` | 3:2 | 1800x1200 | Organization gallery | Optional extra detail |
| `orgs/schematics-data/cover.jpg` | 3:2 | 1800x1200 | Organization island and panel | Looker Studio dashboard screenshot |
| `orgs/schematics-data/1.jpg` | 3:2 | 1800x1200 | Organization gallery | Team |
| `orgs/schematics-data/2.jpg` | 3:2 | 1800x1200 | Organization gallery | Optional extra detail |
| `orgs/ramadan-kampus/cover.jpg` | 3:2 | 1800x1200 | Organization island and panel | Food distribution |
| `orgs/ramadan-kampus/1.jpg` | 3:2 | 1800x1200 | Organization gallery | Team |
| `orgs/ramadan-kampus/2.jpg` | 3:2 | 1800x1200 | Organization gallery | Optional extra detail |

## Photo guidance

- Use sRGB JPGs at roughly the suggested pixel dimensions. Larger files are
  resized by `next/image`, but they still slow down the upload and build.
- Keep the subject away from the extreme edges. The site uses `object-fit:
  cover`, so the crop can shift between breakpoints.
- The default treatment is graded (`site.imageTreatment = "graded"`). To use
  your photos untouched, set it to `"raw"` in `content.ts`.
- Alt text, captions, hints, and target paths are all editable in `content.ts`.
  Keep alt text meaningful; it is also used by the lightbox and placeholders.
- Slots marked `Optional extra detail` are intended as spare gallery images.
  Leaving them empty is fully supported.
- No test or stock images are included in this repository. All 30 slots start
  as placeholders until you add real files.
