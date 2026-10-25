// Keep the shared directory link in every generated language and result page.
const snippet = "<!-- NaNa app directory link -->\n<style>\n#nana-more-apps{position:fixed;right:max(10px,env(safe-area-inset-right));bottom:max(6px,env(safe-area-inset-bottom));z-index:20;margin:0;padding:0;background:none;border:0;line-height:1}\n#nana-more-apps a{display:inline-block;padding:2px 3px;font:400 11px/1.4 Arial,sans-serif;letter-spacing:normal;text-transform:none;color:#888;text-decoration:none;background:none;border:0;box-shadow:none}\n#nana-more-apps a:hover,#nana-more-apps a:focus-visible{color:#777;text-decoration:underline}\n#nana-more-apps a:focus-visible{outline:1px solid currentColor;outline-offset:2px}\n@media print{#nana-more-apps{display:none}}\n</style>\n<div id=\"nana-more-apps\"><a href=\"https://nanalab.kr/apps/\">More Apps</a></div>\n<!-- /NaNa app directory link -->";
export function addMoreApps(source) {
  if (source.includes('id="nana-more-apps"')) return source;
  return source.replace(/<\/body\s*>/i, () => snippet + '\n</body>');
}
