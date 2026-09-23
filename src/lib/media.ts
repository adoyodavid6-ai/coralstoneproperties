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
