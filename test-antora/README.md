# Test Antora Blog Site

This is a test implementation of a blog site using Antora with the tldr-ui theme.

## How It Works

Blog posts are automatically discovered and displayed in the "Featured" section of the home page.

### Adding a New Blog Post

1. Create a new `.adoc` file in `docs/modules/ROOT/pages/posts/`
2. Add the required front matter attributes:
   ```asciidoc
   = Your Blog Post Title
   :page-layout: article
   :page-description: A brief description of your post
   :revdate: 2026-01-06
   ```

3. Write your content below the front matter
4. Run `npx antora antora-playbook.yml` to build the site
5. Your article will automatically appear on the home page

### Required Attributes

- `:page-layout: article` - Uses the article layout (and marks the page as a blog article)
- `:page-description:` - Short description shown in the Featured section
- `:revdate:` - Publication date (used for sorting, newest first)

### Example Blog Post

```asciidoc
= My Amazing Blog Post
:page-layout: article
:page-description: Learn how to build amazing things with Antora
:revdate: 2026-01-06

This is my blog post content...
```

## Building the Site

```bash
npx antora antora-playbook.yml
```

The generated site will be in `build/site/`.

## Viewing the Site

Open the home page at:
```bash
open build/site/test/1.0/index.html
```

Or serve it with a local web server:
```bash
npx http-server build/site -p 8080
# Then visit http://localhost:8080
```

## How Articles Are Discovered

The UI uses a supplemental Handlebars helper (`supplemental-ui/helpers/articles.js`) that:
1. Scans all `.adoc` files in `docs/modules/ROOT/pages/`
2. Checks for `page-layout: article` attribute
3. Extracts title, description, and date
4. Returns sorted list (newest first) for display

This approach works for both local Antora builds and can be extended for CI/CD deployments.
