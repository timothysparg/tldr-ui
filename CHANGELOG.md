# Changelog

## [1.1.0](https://github.com/timothysparg/tldr-ui/compare/v1.0.6...v1.1.0) (2026-01-07)


### Features

* **mise:** enable lockfile for reproducible tool versions ([043513e](https://github.com/timothysparg/tldr-ui/commit/043513e59ba7042884436bc450b7f3f901df99bb))
* **ui:** add favicon support to theme ([0c77566](https://github.com/timothysparg/tldr-ui/commit/0c77566f02caa30658b69d0bf520cde92887a5c7))


### Bug Fixes

* **css:** enable text wrapping in "On this page" section ([e40528b](https://github.com/timothysparg/tldr-ui/commit/e40528b3ba6baad6ec69516edb794ae21643c842))
* **css:** resolve stylelint violations ([b4a65a6](https://github.com/timothysparg/tldr-ui/commit/b4a65a652e9649936200dc107b18715ab57bc490))

## [1.0.6](https://github.com/timothysparg/tldr-ui/compare/v1.0.5...v1.0.6) (2026-01-06)


### Bug Fixes

* **helpers:** show featured articles ([7081efc](https://github.com/timothysparg/tldr-ui/commit/7081efcb2432573b1dafca7f2e3955f5fb82d38d))

## [1.0.5](https://github.com/timothysparg/tldr-ui/compare/v1.0.4...v1.0.5) (2026-01-06)


### Bug Fixes

* **bundle:** preserve binary files when creating UI bundle ([7e8ddf3](https://github.com/timothysparg/tldr-ui/commit/7e8ddf397219136531992895c05e70e85999a09c))

## [1.0.4](https://github.com/timothysparg/tldr-ui/compare/v1.0.3...v1.0.4) (2026-01-06)


### Bug Fixes

* **css:** allow sticky article toc ([c1d0177](https://github.com/timothysparg/tldr-ui/commit/c1d0177ee9343c0bc7436d109050b9b8f63b89a9))
* **helpers:** handle site.components as object in Antora 2.3+ ([baa77f4](https://github.com/timothysparg/tldr-ui/commit/baa77f4a31de04d977d4dccfa01bda150efc0e31))

## [1.0.3](https://github.com/timothysparg/tldr-ui/compare/v1.0.2...v1.0.3) (2026-01-04)


### Bug Fixes

* satisfy lint rules in build task ([0585ee9](https://github.com/timothysparg/tldr-ui/commit/0585ee9a42b52b44e151a1aa69f849968d78b68f))

## [1.0.2](https://github.com/timothysparg/tldr-ui/compare/v1.0.1...v1.0.2) (2026-01-04)


### Bug Fixes

* **build:** ensure postcss pipeline completes ([e0c22bd](https://github.com/timothysparg/tldr-ui/commit/e0c22bd6a9a5891d634be861c9e8692e5c74d6e4))

## [1.0.1](https://github.com/timothysparg/tldr-ui/compare/v1.0.0...v1.0.1) (2026-01-04)


### Bug Fixes

* **build:** prevent binary file corruption in build pipeline ([11a0dfd](https://github.com/timothysparg/tldr-ui/commit/11a0dfd7fbfa9f603b4d6f6b45b228da970b4735))
* **ui:** resolve auto mode for highlight.js theme switching ([e46877a](https://github.com/timothysparg/tldr-ui/commit/e46877a4017413c0c15b917eccb7e3137ac324ea))

## 1.0.0 (2026-01-03)


### Features

* add code highlighting, copy UI, and file chips for code blocks ([ca7f769](https://github.com/timothysparg/tldr-ui/commit/ca7f769bd07acb812be773c187eb5cf79c5f8930))
* add light/dark Highlight.js themes and toggle logic ([a632eda](https://github.com/timothysparg/tldr-ui/commit/a632eda68230afc85e33db552c3633dcfaa26247))
* **copy:** use devicon generator for language logos and map aliases ([d169e32](https://github.com/timothysparg/tldr-ui/commit/d169e32af8d935bb94be7137f2a08664925a38e0))
* **css:** add key sequence and button styles for compact UI elements ([ef8798d](https://github.com/timothysparg/tldr-ui/commit/ef8798dc690677fc3740438442968a0c441d2266))
* **css:** add styled admonition blocks with icons and variants ([ddd43fd](https://github.com/timothysparg/tldr-ui/commit/ddd43fd8cd327ba75828c766e9c020778e86cc4f))
* **css:** add styled sidebar and example blocks with themed borders and padding ([993cb54](https://github.com/timothysparg/tldr-ui/commit/993cb546f5f172482de08f69cbf79faded4e410f))
* **css:** center image blocks and style captions to match site theme ([324e3bf](https://github.com/timothysparg/tldr-ui/commit/324e3bf627b592efeaf64327690da3ebea0a5d41))
* **css:** extract common CSS variables ([036f940](https://github.com/timothysparg/tldr-ui/commit/036f94093efbe315afba9fec2f719514a44f6dc2))
* **layout:** add inline TOC and tidy reading-time script indentation ([aee7325](https://github.com/timothysparg/tldr-ui/commit/aee7325f3f9f883c404bf9556f47496273879ddd))
* **layout:** add script to mark article links with "link" class on load ([699cc41](https://github.com/timothysparg/tldr-ui/commit/699cc41186a3d33390799106dd6b548052efa32c))
* **layout:** move article TOC into responsive grid ([1f04061](https://github.com/timothysparg/tldr-ui/commit/1f04061812f8bc1c836506c217f5ea67a3be2c3b))
* **lint:** switch stylelint to dynamic import and use report ([bc68da6](https://github.com/timothysparg/tldr-ui/commit/bc68da6a577afd8d15b92c6e28bcb7deadef928d))
* persist and cycle light/dark/auto theme with matching icon ([a0ee868](https://github.com/timothysparg/tldr-ui/commit/a0ee868af9b4ac44347bb759870154b14c0624bf))
* **reading-time:** compute and inject article read time client-side onload ([a84c8e6](https://github.com/timothysparg/tldr-ui/commit/a84c8e68794d7daf534c335bc4387c8a3d4154bf))
* rename article partials to article-body for clarity and avoid ([d79132a](https://github.com/timothysparg/tldr-ui/commit/d79132a18274dfb9a988362aa121002628fa52f7))
* tighten CSS layout, add stylelint deps, update browserslist ([2604680](https://github.com/timothysparg/tldr-ui/commit/26046807eb25a2dc02d9314a7e9fb49f10a92885))
* **ui:** add checklist styles and include FA v4 shims to support icons ([14a046d](https://github.com/timothysparg/tldr-ui/commit/14a046dae5d53c217fbcf8957911a667e32288a9))
* update README for TLDR blog UI and local build instructions ([3229106](https://github.com/timothysparg/tldr-ui/commit/3229106983e4aa82b424b7edb8b7a29e3b916463))


### Bug Fixes

* restore gulp build and lint compatibility ([5b06b98](https://github.com/timothysparg/tldr-ui/commit/5b06b9839405b542142f04e66e4dad31b483894b))
* **ui:** rename image class to theme-image and add theme visibility CSS to ([ad3fab1](https://github.com/timothysparg/tldr-ui/commit/ad3fab1911eb0f21928c76fe3d919219200746bf))
