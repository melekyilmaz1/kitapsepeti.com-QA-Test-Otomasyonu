class SearchPage {
    elements = {
      acceptCookiesButton: () => cy.contains('button, a', 'Tümünü Kabul Et'),
      
     
      
      searchInput: () => cy.get('#live-search, input[placeholder*="ürün"]').filter(':visible').first(),
      
      
      productCards: () => cy.get('.product-item, .product-box, .col-product, [class*="product-detail"], div[class*="product-card"]').filter(':visible'),
      firstProductCard: () => cy.get('.product-item, .product-box, .col-product, [class*="product-detail"], div[class*="product-card"]').filter(':visible').first(),
  
      
      sortContainer: () => cy.get('.sort, .sorting, [class*="sort"], select').filter(':visible').first(),
  
     
      filterSidebar: () => cy.get('.filter, .filters, .col-sidebar, [class*="filter"]').filter(':visible').first()
    };
  
    visitHomePage() {
      cy.visit('https://www.kitapsepeti.com/', { failOnStatusCode: false });
    }
  
    dismissCookiesIfPresent() {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Tümünü Kabul Et"), a:contains("Tümünü Kabul Et")').length > 0) {
          this.elements.acceptCookiesButton().click({ force: true });
        }
      });
    }
  
    search(keyword) {
      this.elements.searchInput()
        .should('be.visible')
        .focus()
        .clear({ force: true })
        .type(`${keyword}{enter}`, { delay: 100 });
    }
  
    verifySearchUrl(keyword) {
      cy.url({ timeout: 10000 }).should('match', new RegExp(`(arama|q=|search|${encodeURIComponent(keyword)})`, 'i'));
    }
  
    verifyProductCardComponents() {
      this.elements.productCards().should('have.length.greaterThan', 0);
      this.elements.firstProductCard().within(() => {
        cy.get('img').should('exist');
        cy.get('a, [class*="title"], [class*="name"]').should('exist');
        cy.get('[class*="price"]').should('exist');
      });
    }
  }
  
  export default new SearchPage();