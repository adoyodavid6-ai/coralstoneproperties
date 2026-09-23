/**
 * Master switch for real vs. placeholder media.
 *
 * While `false`, the site renders branded placeholders instead of the (stock)
 * listing photos and hero images, shows initials monograms instead of agent
 * avatars, and hides photo counts. The "video / 3D-tour / drone" badges are
 * removed outright (no real media ever existed behind them).
 *
 * Flip to `true` once real photography is uploaded — every image call site
 * (SmartImage, Avatar, the home hero) reads this flag, so no other edits are
 * needed to switch the real photos back on.
 */
export const SHOW_REAL_MEDIA = false;

/**
 * Master switch for the demo inventory (seed listings + fictional agents).
 *
 * While `false`, the public site carries NO demo listings — search, home,
 * showcase, sitemap and property pages are empty until real client
 * submissions are published. The seed data stays dormant in
 * `src/lib/data/` so a demo can be restored instantly for development.
 */
export const SHOW_DEMO_LISTINGS = false;
