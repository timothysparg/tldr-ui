'use strict'

function getAsciidocOptions(config = {}, cwd = process.cwd()) {
  const payload = config.data || {}
  const nested = config.asciidoc || payload.asciidoc || {}
  const directIconUrls =
    nested.directIconUrls ||
    nested.direct_icon_urls ||
    payload.directIconUrls ||
    payload.direct_icon_urls ||
    config.directIconUrls ||
    config.direct_icon_urls
  const strictIcons =
    typeof nested.strictIcons === 'boolean'
      ? nested.strictIcons
      : (nested.strict_icons ??
        (typeof payload.strictIcons === 'boolean'
          ? payload.strictIcons
          : (payload.strict_icons ??
            (typeof config.strictIcons === 'boolean' ? config.strictIcons : config.strict_icons))))
  const iconDiscoveryRoots =
    nested.iconDiscoveryRoots ||
    nested.icon_discovery_roots ||
    payload.iconDiscoveryRoots ||
    payload.icon_discovery_roots ||
    config.iconDiscoveryRoots ||
    config.icon_discovery_roots
  const projectRoot =
    nested.projectRoot ||
    nested.project_root ||
    payload.projectRoot ||
    payload.project_root ||
    config.projectRoot ||
    config.project_root ||
    cwd
  return {
    ...nested,
    directIconUrls,
    strictIcons,
    iconDiscoveryRoots,
    projectRoot,
  }
}

module.exports = {
  getAsciidocOptions,
}
