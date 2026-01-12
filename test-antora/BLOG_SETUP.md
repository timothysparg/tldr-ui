# Blog Article System for Antora

## Overview

This test site demonstrates how to automatically display blog articles in the "Featured" section of the home page when using Antora.

## How It Works

### Architecture

1. **Supplemental UI Helper** (`supplemental-ui/helpers/articles.js`)
   - Replaces the bundled `articles` helper
   - Scans the file system for `.adoc` files with `page-role: article`
   - Extracts metadata (title, description, date)
   - Returns sorted articles (newest first)

2. **Home Page Template** (from UI bundle)
   - Uses `{{#with (articles site)}}` to get blog posts
   - Renders each article with title, description, and link

### File Structure

```
test-antora/
├── antora-playbook.yml           # Antora configuration
├── docs/
│   └── modules/
│       └── ROOT/
│           ├── nav.adoc           # Navigation (optional for articles)
│           └── pages/
│               ├── index.adoc     # Home page (uses home layout)
│               └── posts/         # Blog posts directory
│                   ├── a-blog-the-fun-way.adoc
│                   └── test-second-post.adoc
└── supplemental-ui/
    └── helpers/
        └── articles.js            # Custom article discovery logic
```

## Adding Blog Posts

### Step 1: Create the Article File

Create a new `.adoc` file in `docs/modules/ROOT/pages/posts/`:

```bash
touch docs/modules/ROOT/pages/posts/my-new-post.adoc
```

### Step 2: Add Front Matter

```asciidoc
= Your Blog Post Title
:page-role: article
:page-description: A brief summary that appears in the Featured section
:revdate: 2026-01-07
:page-tags: tag1, tag2, tag3
:page-layout: article

Your blog post content starts here...
```

### Step 3: Build and View

```bash
# Build the site
npx antora antora-playbook.yml

# Open the home page
open build/site/test/1.0/index.html
```

The article will automatically appear in the Featured section.

## Required Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `page-role: article` | ✓ | Marks the page as a blog article |
| `page-description` | ✓ | Summary text (truncated to 100 chars) |
| `revdate` | ✓ | Publication date for sorting |
| `page-tags` | ✗ | Optional tags |
| `page-layout` | ✗ | Optional layout override |

## Features

✅ Automatic discovery of blog posts
✅ Sorted by date (newest first)
✅ Works with local Antora builds
✅ No extensions required
✅ Easy to add new posts
✅ Compatible with Antora 3.x

## Deployment

For production deployment:

1. Commit your blog post `.adoc` files
2. Run `npx antora antora-playbook.yml` in CI/CD
3. Deploy the `build/site/` directory

The supplemental helper runs during build time, so no runtime dependencies are needed.

## Preview Mode

The UI also includes a preview mode that works differently:
- Run `npx gulp preview` from the UI project root
- Preview mode scans `preview-src/` for articles
- Useful for UI development and testing

## Troubleshooting

**Articles not appearing?**
1. Check that `page-role: article` is set correctly
2. Verify the `.adoc` file is in `docs/modules/ROOT/pages/`
3. Ensure `page-description` and `revdate` are present
4. Rebuild the site

**Wrong order?**
- Articles are sorted by `revdate` (newest first)
- Check date format: `YYYY-MM-DD`
