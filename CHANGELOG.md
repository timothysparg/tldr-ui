# Changelog

## [2.0.0](https://github.com/timothysparg/tldr-ui/compare/v1.4.1...v2.0.0) (2026-04-18)


### Features

* add HTML verification with HTMLHint to the verify task ([3650171](https://github.com/timothysparg/tldr-ui/commit/3650171c9cd2cb6ab122bc15643954b43b6427c5))
* add pkl icon using official pkl-lang.org favicon ([173993c](https://github.com/timothysparg/tldr-ui/commit/173993c5b376ae4cbb5eae84140459ede886e3be))
* add PKL syntax highlighting via @apple/highlightjs-pkl ([62e7128](https://github.com/timothysparg/tldr-ui/commit/62e7128503bdae7465022bae95206ec277f90a0a))
* add theme-aware media support via .theme-media role ([ca80d33](https://github.com/timothysparg/tldr-ui/commit/ca80d339416735034a3f40cfb3ce9ec5616426ee))
* **article:** add footer tagline with Rock Salt font ([50d37e2](https://github.com/timothysparg/tldr-ui/commit/50d37e2bcd0d7925b1d377ff977e529ea465cbef))
* **build:** self-host all fonts and icons via npm packages ([55ff52e](https://github.com/timothysparg/tldr-ui/commit/55ff52e05dd28d85d5d1240ff63660c78af5598f))
* **callouts:** move colists and code callouts to build time ([cd340a2](https://github.com/timothysparg/tldr-ui/commit/cd340a2c6813ab6f9525b345c2568bb5bf99b4dd))
* **clipboard:** move copy payload generation to build time ([9284f25](https://github.com/timothysparg/tldr-ui/commit/9284f25de5a202418c5e86d423d430c53bbf7857))
* **copy:** replace manual copy button with sl-copy-button web component ([4e58e3a](https://github.com/timothysparg/tldr-ui/commit/4e58e3a928e5d0cecb00045ab9d4b9722c15c399))
* **extensions:** add bundled antora and asciidoc extensions ([c3aee8b](https://github.com/timothysparg/tldr-ui/commit/c3aee8b61edb6e4fc5674f7630b38e281a1671fb))
* **extensions:** refine extension registration and fix preview build ([fe85a8e](https://github.com/timothysparg/tldr-ui/commit/fe85a8e7a129983b6f7361a79e8b62913ec82d49))
* **icons:** discover required devicons at build time ([ade5ce9](https://github.com/timothysparg/tldr-ui/commit/ade5ce9fedd57ca112dca924ecbafd7392afb914))
* implement native tldr admonition block extension ([b2e130b](https://github.com/timothysparg/tldr-ui/commit/b2e130bb0d788feae32580d95cd9e9561673f06d))
* modernize admonitions with elevated cards and custom avatars ([c1aafa6](https://github.com/timothysparg/tldr-ui/commit/c1aafa6ac4921eb4eade8df9f078269d630a942f))
* **preview:** add video support with correct sizing and autoplay ([0e82552](https://github.com/timothysparg/tldr-ui/commit/0e8255255efb13ab419d4f9ed15c77ed123be35d))
* **shiki:** migrate code blocks to build-time Shiki rendering ([bc2e2e0](https://github.com/timothysparg/tldr-ui/commit/bc2e2e0be2dd30a1d5c766d9401f923d16dc6900))
* support direct icon URLs for languages not in Devicon ([69c30d3](https://github.com/timothysparg/tldr-ui/commit/69c30d34723739dd1e42fd205ac9420f925ba3b9))
* **toc:** dynamic TOC depth driven by :toclevels: attribute ([d63e4c8](https://github.com/timothysparg/tldr-ui/commit/d63e4c8a91df8ad2dc9c4eccac8b652e182d511c))
* **toc:** implement global HAST pipeline for TOC extraction and transformation ([a796851](https://github.com/timothysparg/tldr-ui/commit/a79685179f4b7bce86145353c6d86ef21aa77500))
* **ui:** add retro CRT bezel to videos and suppress copy button tooltips ([bc399de](https://github.com/timothysparg/tldr-ui/commit/bc399de7295114f6a154d914368305f0c2002705))
* **ui:** modernize TOC with indentation guides and dynamic scrollspy ([621084b](https://github.com/timothysparg/tldr-ui/commit/621084bacfd2abca5ec4356e2de2bbff719716c3))
* **verify:** add attr-whitespace HTMLHint rule ([36a0d48](https://github.com/timothysparg/tldr-ui/commit/36a0d48dafa831c2ced3d51e69be2cc7a8cb569e))
* **verify:** add five additional HTMLHint rules ([7298426](https://github.com/timothysparg/tldr-ui/commit/729842644aa856862a28f4a7020abb64ea3f2da7))
* **verify:** add four more HTMLHint rules ([eebb9d7](https://github.com/timothysparg/tldr-ui/commit/eebb9d738e3c8920722d4e52a56756016bf72fc1))


### Bug Fixes

* adjust admonition icon alignment ([f062f90](https://github.com/timothysparg/tldr-ui/commit/f062f907a4e1d411f26befb2f58c472da198d029))
* **build:** remove unused vendor js and css paths ([5aa1332](https://github.com/timothysparg/tldr-ui/commit/5aa1332995c76d224657fa60d3b07761ad3701f5))
* **callouts:** align code and colist markers ([1e57078](https://github.com/timothysparg/tldr-ui/commit/1e57078169053d05b9247d0537967b78bd7d60a5))
* colorize missing icon warnings ([7d520a9](https://github.com/timothysparg/tldr-ui/commit/7d520a90a5a40c7edf58417f21b1df38c6ae1f43))
* compute extensionFile relative to bundle dir to fix --sync-devicons in antora bundle ([d24a63a](https://github.com/timothysparg/tldr-ui/commit/d24a63a175f885917de577630bc9aad61f89cfaf)), closes [#50](https://github.com/timothysparg/tldr-ui/issues/50)
* **css:** optimize admonition animations ([81b0795](https://github.com/timothysparg/tldr-ui/commit/81b079501e986679d1d3f24b44a0e98a83787dc7))
* enlarge footnote link hit area ([bcd2b53](https://github.com/timothysparg/tldr-ui/commit/bcd2b53cbed4e4fab1506be2d865e35dbff80b96))
* **extensions:** defer @asciidoctor/core load to avoid Opal global conflict ([039ecbf](https://github.com/timothysparg/tldr-ui/commit/039ecbf542c4707b740997e1e8b2d5ef74ab06d9))
* make code callouts non-interactive ([bc963fb](https://github.com/timothysparg/tldr-ui/commit/bc963fbfb613a939805e92aacbd3e7dda990b2ea))
* merge flat and nested asciidoc config ([8b1989e](https://github.com/timothysparg/tldr-ui/commit/8b1989e1e342c6e5dbbb39a8a395cd17118c02c5))
* preserve paragraphs in tldr admonitions ([22b1da9](https://github.com/timothysparg/tldr-ui/commit/22b1da903986bf1098ea724dcb8df68e1e262f02))
* read antora extension config from data payload ([c54a9ad](https://github.com/timothysparg/tldr-ui/commit/c54a9ad236cf3c318e7d18b9d4a8d65ca37b2696))
* read antora extension config from vars ([b9d9ce4](https://github.com/timothysparg/tldr-ui/commit/b9d9ce415221a16f3e7ae1150b831241a7ef4b46))
* refine code block header ([e0f27a6](https://github.com/timothysparg/tldr-ui/commit/e0f27a619c89daa02f8ecf29182c1cc04aec2668))
* refine toc scroll indicators ([ade1f71](https://github.com/timothysparg/tldr-ui/commit/ade1f719cf775fc8eda1fd8b4e67fcb3ac89b83a))
* replace ConverterFactory with treeprocessor to hook Shiki and TLDR admonition into Antora ([be61e7b](https://github.com/timothysparg/tldr-ui/commit/be61e7bb38841b71b91dde462b1371295a01cd0e))
* replace shoelace copy button ([b5110cb](https://github.com/timothysparg/tldr-ui/commit/b5110cbdbea030d80e03de41a21d0b67f30bd6e7))
* smooth admonition bar animations ([59478d1](https://github.com/timothysparg/tldr-ui/commit/59478d1ad3d550f2bb50eeb16ac1645b0c41af65))
* stabilize devicon sync and icon fallback ([eb7204c](https://github.com/timothysparg/tldr-ui/commit/eb7204c9ac1386cffe3ec4bc95b179a0e805ce4e))
* **ui:** stabilize copy button icon states ([85712cc](https://github.com/timothysparg/tldr-ui/commit/85712cce03d26e966c99ed191528ca16d2bd6925))
* **ui:** synchronize theme switcher icon and rotation logic ([5ecf23b](https://github.com/timothysparg/tldr-ui/commit/5ecf23b1bdc17ade3bccca2d637b4614ea5534f4))
* uniquify SVG ids per devicon instance to avoid duplicate id attributes ([4f48712](https://github.com/timothysparg/tldr-ui/commit/4f487126117d80d83443641ffdeaf800f9f78ce0))
* use native fetch for direct icon urls ([c805e72](https://github.com/timothysparg/tldr-ui/commit/c805e720e4a6733c5c45ba20efb4da34954ccdb2))


### Performance Improvements

* **build:** make asciidoc-tldr-ui external in the antora bundle ([516e6d0](https://github.com/timothysparg/tldr-ui/commit/516e6d03095f5863949ad2d972007b4e303af5e1))


### Miscellaneous Chores

* release 2.0.0 ([89476ee](https://github.com/timothysparg/tldr-ui/commit/89476ee6714a273fccdfc32bfed9be2dbf0a5d5b))

## [1.4.1](https://github.com/timothysparg/tldr-ui/compare/v1.4.0...v1.4.1) (2026-01-21)


### Bug Fixes

* support content images for article cards ([#43](https://github.com/timothysparg/tldr-ui/issues/43)) ([63d2355](https://github.com/timothysparg/tldr-ui/commit/63d2355c1724f688d8779656f9c55563b55a13a6))

## [1.4.0](https://github.com/timothysparg/tldr-ui/compare/v1.3.1...v1.4.0) (2026-01-21)


### Features

* support article card images ([1abcb6a](https://github.com/timothysparg/tldr-ui/commit/1abcb6acc2765afac81ea4701fb83a2abd3f3d15)), closes [#27](https://github.com/timothysparg/tldr-ui/issues/27)


### Bug Fixes

* avoid me() inside onloadAdd ([#40](https://github.com/timothysparg/tldr-ui/issues/40)) ([ba22cff](https://github.com/timothysparg/tldr-ui/commit/ba22cff216c64dbb67dd055905854fc43de536fb))
* dedupe homepage title (closes [#28](https://github.com/timothysparg/tldr-ui/issues/28)) ([76cfd15](https://github.com/timothysparg/tldr-ui/commit/76cfd15600e69f3cad6da58b7219af9b99b8c0ab))
* register ini language for highlight.js ([#39](https://github.com/timothysparg/tldr-ui/issues/39)) ([5974f10](https://github.com/timothysparg/tldr-ui/commit/5974f103a0268c5ba7917abdc961385d03346130))
* remove callout divider (closes [#33](https://github.com/timothysparg/tldr-ui/issues/33)) ([8bdfcd0](https://github.com/timothysparg/tldr-ui/commit/8bdfcd0b36ed2dd9312a960e90be241c4b090e8a))
* replace highlightBlock with highlightElement ([#37](https://github.com/timothysparg/tldr-ui/issues/37)) ([5198751](https://github.com/timothysparg/tldr-ui/commit/51987511e8e18791fcd03a06890b2d3c1c18f2e7))
* restore toc scroll spy (closes [#29](https://github.com/timothysparg/tldr-ui/issues/29)) ([525a9f4](https://github.com/timothysparg/tldr-ui/commit/525a9f456e5b3c276469baa6d02b386802ba65bc))
* tighten colist spacing (closes [#34](https://github.com/timothysparg/tldr-ui/issues/34)) ([5b46764](https://github.com/timothysparg/tldr-ui/commit/5b4676458a9f23c1099daa6b52e43e192ce98769))

## [1.3.1](https://github.com/timothysparg/tldr-ui/compare/v1.3.0...v1.3.1) (2026-01-20)


### Bug Fixes

* increase article heading spacing ([43cb88a](https://github.com/timothysparg/tldr-ui/commit/43cb88a23ea2623b48bc81f1357e17813d7ec1ca)), closes [#20](https://github.com/timothysparg/tldr-ui/issues/20)
* prevent theme flash on load ([75d40ae](https://github.com/timothysparg/tldr-ui/commit/75d40ae4e1a3ffbc2b45aed9d4ec3c0cc054095a)), closes [#23](https://github.com/timothysparg/tldr-ui/issues/23)
* update featured placeholders ([29cf09d](https://github.com/timothysparg/tldr-ui/commit/29cf09db9cc2f659e5a3fafeba85054ce395dbf1)), closes [#25](https://github.com/timothysparg/tldr-ui/issues/25)
* update preview + articles to use page-layout ([a4c3640](https://github.com/timothysparg/tldr-ui/commit/a4c3640818e81382b43b0e0277a0ae1d16174f20)), closes [#24](https://github.com/timothysparg/tldr-ui/issues/24)

## [1.3.0](https://github.com/timothysparg/tldr-ui/compare/v1.2.0...v1.3.0) (2026-01-07)


### Features

* keep article width when toc missing ([#17](https://github.com/timothysparg/tldr-ui/issues/17)) ([463afd5](https://github.com/timothysparg/tldr-ui/commit/463afd5425d33d3ec94d595ce058589a0c056d8c))
* style article metadata ([#21](https://github.com/timothysparg/tldr-ui/issues/21)) ([3b86e2a](https://github.com/timothysparg/tldr-ui/commit/3b86e2ac7598ec6046699d46b56b879c6f9d82da))


### Bug Fixes

* correct home link target ([#15](https://github.com/timothysparg/tldr-ui/issues/15)) ([65d5a83](https://github.com/timothysparg/tldr-ui/commit/65d5a839052adaf95a1b8729dc86054c200376aa))
* display article revdate ([#19](https://github.com/timothysparg/tldr-ui/issues/19)) ([b0d9caf](https://github.com/timothysparg/tldr-ui/commit/b0d9caf4398566cdbc3d5790eb33f4d5f5d5d909))
* prevent toc overflow and add markers ([#16](https://github.com/timothysparg/tldr-ui/issues/16)) ([8bf5268](https://github.com/timothysparg/tldr-ui/commit/8bf526807a7768d1d5ad082448929dcf93ad5971))


### Reverts

* display article revdate ([#19](https://github.com/timothysparg/tldr-ui/issues/19)) ([98b9387](https://github.com/timothysparg/tldr-ui/commit/98b9387e879a6a3534872842cceaef8e4c06a886))

## [1.2.0](https://github.com/timothysparg/tldr-ui/compare/v1.1.0...v1.2.0) (2026-01-07)


### Features

* **extensions:** add posts extension and surface articles ([f3ca978](https://github.com/timothysparg/tldr-ui/commit/f3ca9787a9cb59659f0e56752e4c06e8259e9511))

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
