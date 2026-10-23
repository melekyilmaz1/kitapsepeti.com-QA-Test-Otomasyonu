class ProductDetailPage {
    elements = {
      
      acceptCookiesButton: () => cy.contains('button, a', 'Tümünü Kabul Et'),
  
      
      firstProductLink: () => cy.get('.product-item, .product-box, .col-product, [class*="product-detail"]')
        .filter(':visible')
        .first()
        .find('a')
        .first(),
  
      
      productTitle: () => cy.get('h1, .product-title, .product-name').filter(':visible').first(),
      productAuthor: () => cy.get('a[href*="/yazar/"], .product-author, [class*="author"]').filter(':visible').first(),
      productPublisher: () => cy.get('a[href*="/yayinevi/"], .product-brand, [class*="publisher"], [class*="brand"]').filter(':visible').first(),
      productPrice: () => cy.get('.product-price, .current-price, [class*="price"]').filter(':visible').first(),
  
      
      productFeaturesArea: () => cy.get('#product-features, .product-features, .product-details, [class*="feature"], [class*="detail"], table').filter(':visible'),
  
     
      addToCartButton: () => cy.get('button, a')
        .filter(':contains("Sepete Ekle")')
        .filter(':visible')
        .first(),
  
     
      cartSuccessContainer: () => cy.get('.modal, .swal2-popup, .cart-popup, [class*="modal"], [class*="popup"], [class*="notify"]').filter(':visible'),
      goToCartButton: () => cy.contains('a, button', /Sepete Git|Sepetim/i),
      checkoutButton: () => cy.contains('a, button', /Satın Al|Siparişi Tamamla/i),
  
      headerCartBadge: () => cy.get('header, .header, nav')
        .find('[class*="cart-count"], [class*="badge"], [class*="basket-count"], .cart-badge')
        .filter(':visible')
        .first()
    };
  
    visitSearchList(keyword = 'Roman') {
      cy.visit(`https://www.kitapsepeti.com/arama?q=${encodeURIComponent(keyword)}`, { failOnStatusCode: false });
    }
  
    dismissCookiesIfPresent() {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Tümünü Kabul Et"), a:contains("Tümünü Kabul Et")').length > 0) {
          this.elements.acceptCookiesButton().click({ force: true });
        }
      });
    }
  
    goToFirstProductDetail() {
      this.elements.firstProductLink().click({ force: true });
    }
  
    clickAddToCart() {
      this.elements.addToCartButton().click({ force: true });
    }
  }
  
  export default new ProductDetailPage();