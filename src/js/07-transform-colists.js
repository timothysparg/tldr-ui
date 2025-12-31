;(function () {
  'use strict'

  var isBeerArticle = document.body.classList.contains('article')

  if (!isBeerArticle) return

  // Find all colist elements (callout lists)
  var colists = document.querySelectorAll('.doc .colist')

  colists.forEach(function (colist) {
    var table = colist.querySelector('table')
    if (!table) return

    // Create BeerCSS list structure
    var list = document.createElement('ul')
    list.className = 'list'

    // Get all rows from the table
    var rows = table.querySelectorAll('tr')

    rows.forEach(function (row) {
      var cells = row.querySelectorAll('td')
      if (cells.length !== 2) return

      var numberCell = cells[0]
      var contentCell = cells[1]

      // Extract the callout number
      var conum = numberCell.querySelector('.conum')
      var calloutNumber = conum ? conum.getAttribute('data-value') : '1'

      // Create list item
      var listItem = document.createElement('li')

      // Create circular button for the number
      var button = document.createElement('button')
      button.className = 'circle primary'
      button.textContent = calloutNumber
      button.setAttribute('type', 'button')

      // Create content wrapper
      var contentWrapper = document.createElement('div')
      contentWrapper.className = 'max'

      // Check if there's a title/heading in the content
      var contentHTML = contentCell.innerHTML.trim()

      // If content starts with a paragraph, check if it looks like a title
      // For now, just wrap all content in a div
      var contentDiv = document.createElement('div')
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

    // Add divider before the colist if it follows a code block
    var prevSibling = colist.previousElementSibling
    var isCodeBlock = prevSibling && (prevSibling.classList.contains('listingblock') ||
      prevSibling.classList.contains('literalblock'))
    if (isCodeBlock) {
      var divider = document.createElement('div')
      divider.className = 'divider margin'
      colist.parentNode.insertBefore(divider, colist)
    }
  })

  // Also wrap code blocks in proper article structure if needed
  var codeBlocks = document.querySelectorAll('.doc .listingblock, .doc .literalblock')

  codeBlocks.forEach(function (block) {
    // Check if this block has callouts following it
    var nextSibling = block.nextElementSibling
    var hasCallouts = false

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
