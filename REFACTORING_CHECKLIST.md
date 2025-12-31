# Refactoring Checklist: Remove .doc and .page Classes

## Progress Tracker

### Step 1: Update CSS ✅ COMPLETE
- [x] Replace `.doc` → `article` in src/css/site.css (31 selectors)
- [x] Replace `body.home .page article` → `body.home article`
- [x] Replace `body.home.dark .page article` → `body.home.dark article`

### Step 2: Update HTML Templates ✅ COMPLETE
- [x] src/partials/article.hbs - Remove `class="doc"` and `class="page"`
- [x] src/partials/article-404.hbs - Remove `class="doc"` and `class="page"`
- [x] src/layouts/article.hbs - Remove `doc` from article classes
- [x] src/layouts/home.hbs - Remove `class="page"` from divs (2 locations)

### Step 3: Update JavaScript ✅ COMPLETE
- [x] src/js/01-nav.js - Update `'article.doc'` → `'article'`
- [x] src/js/02-on-this-page.js - Update selectors (2 locations)
- [x] src/js/03-fragment-jumper.js - Update `'article.doc'` → `'article'`
- [x] src/js/06-copy-to-clipboard.js - Update `.doc` selectors
- [x] src/js/07-transform-colists.js - Update `.doc` selectors (2 locations)

### Step 4: Verification ✅ AUTOMATED CHECKS COMPLETE
- [x] Run `npx gulp lint` - verify no errors ✅ PASSED (only 4 pre-existing performance warnings)
- [x] Verify zero `.doc` class references ✅ CONFIRMED (0 references found)
- [x] Verify zero `.page` class references ✅ CONFIRMED (only `.page-versions` remains, which is unrelated)
- [ ] Visual check: article page styling (REQUIRES MANUAL TESTING)
- [ ] Visual check: home page layout (REQUIRES MANUAL TESTING)
- [ ] Visual check: 404 page (REQUIRES MANUAL TESTING)
- [ ] Test: "On this page" TOC functionality (REQUIRES MANUAL TESTING)
- [ ] Test: Fragment jumpers (#anchor links) (REQUIRES MANUAL TESTING)
- [ ] Test: Navigation breadcrumb highlighting (REQUIRES MANUAL TESTING)
- [ ] Test: Code block copy-to-clipboard (REQUIRES MANUAL TESTING)
- [ ] Test: Callout list transformation (REQUIRES MANUAL TESTING)
- [ ] Test: Admonitions display (REQUIRES MANUAL TESTING)
- [ ] Test: Light theme (REQUIRES MANUAL TESTING)
- [ ] Test: Dark theme (REQUIRES MANUAL TESTING)
- [ ] Test: Responsive layouts (REQUIRES MANUAL TESTING)

### Step 5: Cleanup
- [x] Verify zero `.doc` class references (except in this checklist)
- [x] Verify zero `.page` class references (except `.page-versions`)
- [ ] Remove this checklist file (after user approval)

## Summary

✅ **ALL AUTOMATED REFACTORING COMPLETE**

### Files Modified (9 total):
1. ✅ src/css/site.css - 31 selectors updated
2. ✅ src/partials/article.hbs
3. ✅ src/partials/article-404.hbs
4. ✅ src/layouts/article.hbs
5. ✅ src/layouts/home.hbs
6. ✅ src/js/01-nav.js
7. ✅ src/js/02-on-this-page.js
8. ✅ src/js/03-fragment-jumper.js
9. ✅ src/js/06-copy-to-clipboard.js
10. ✅ src/js/07-transform-colists.js

### Results:
- ✅ Linter passes (0 errors, 4 pre-existing warnings)
- ✅ Zero `.doc` class references remain
- ✅ Zero `.page` class references remain (except unrelated `.page-versions`)
- ⚠️ Manual testing required to verify functionality

## Notes
- Started: 2025-12-31
- Automated refactoring completed: 2025-12-31
- Issues encountered: None
- Manual testing: Required before deployment
