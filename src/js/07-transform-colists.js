;(function () {
  'use strict'

  const isBeerArticle = document.body.classList.contains('article')

  if (!isBeerArticle) return

  // Find all colist elements (callout lists)
  const colists = document.querySelectorAll('article .colist')

  colists.forEach(function (colist) {
    const table = colist.querySelector('table')
    if (!table) return

    // Create BeerCSS list structure
    const list = document.createElement('ul')
    list.className = 'list'

    // Get all rows from the table
    const rows = table.querySelectorAll('tr')

    rows.forEach(function (row) {
      const cells = row.querySelectorAll('td')
      if (cells.length !== 2) return

      const numberCell = cells[0]
      const contentCell = cells[1]

      // Extract the callout number
      const conum = numberCell.querySelector('.conum')
      const calloutNumber = conum ? conum.getAttribute('data-value') : '1'

      // Create list item
      const listItem = document.createElement('li')

      // Create circular button for the number
      const button = document.createElement('button')
      button.className = 'circle primary'
      button.textContent = calloutNumber
      button.setAttribute('type', 'button')

      // Create content wrapper
      const contentWrapper = document.createElement('div')
      contentWrapper.className = 'max'

      // Check if there's a title/heading in the content
      const contentHTML = contentCell.innerHTML.trim()

      // If content starts with a paragraph, check if it looks like a title
      // For now, just wrap all content in a div
      const contentDiv = document.createElement('div')
      contentDiv.className = 'small-text'
      contentDiv.innerHTML = contentHTML

      contentWrapper.appendChild(contentDiv)

      // Assemble the list item
      listItem.appendChild(button)
      listItem.appendChild(contentWrapper)

      list.appendChild(listItem)
    })

    // Replace the table with the list
    table.parentNode.replaceChild(list, table)
  })

  // Also wrap code blocks in proper article structure if needed
  const codeBlocks = document.querySelectorAll('article .listingblock, article .literalblock')

  codeBlocks.forEach(function (block) {
    // Check if this block has callouts following it
    let nextSibling = block.nextElementSibling
    let hasCallouts = false

    // Skip dividers to find colist
    while (nextSibling && nextSibling.classList.contains('divider')) {
      nextSibling = nextSibling.nextElementSibling
    }

    if (nextSibling && nextSibling.classList.contains('colist')) {
      hasCallouts = true
    }

    // Add a class to code blocks that have callouts
    if (hasCallouts) {
      block.classList.add('has-callouts')
    }
  })
})()
