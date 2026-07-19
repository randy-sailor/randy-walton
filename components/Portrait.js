import fs from 'node:fs';
import path from 'node:path';

// Renders /public/images/portrait.jpg when present; otherwise a quiet
// placeholder panel in the site's palette. Drop a portrait file in
// public/images/portrait.jpg to fill the slot.
export default function Portrait() {
  const file = path.join(process.cwd(), 'public', 'images', 'portrait.jpg');
  const hasPortrait = fs.existsSync(file);
  return (
    <div className="portrait-slot">
      {hasPortrait ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/images/portrait.jpg" alt="Randy Walton" width={380} height={460} />
      ) : (
        <div className="portrait-placeholder">
          <span>Randy Walton</span>
        </div>
      )}
    </div>
  );
}
