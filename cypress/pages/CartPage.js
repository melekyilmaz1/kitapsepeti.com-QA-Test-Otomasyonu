class CartPage {
    elements = {
     
      acceptCookiesButton: () => cy.contains('button, a', 'Tümünü Kabul Et'),
  
      
      headerCartButton: () => cy.contains(/Sepetim|Sepet/i).parents('a, button, div').first(),
  
      
      cartDrawer: () => cy.get('#cart-drawer, .cart-drawer, .offcanvas-end, [class*="mini-cart"], [class*="drawer"]').filter(':visible').first(),
      drawerGoToCartButton: () => cy.contains('a, button', /Sepete Git|Sepete Dön/i),
      drawerTotalPrice: () => cy.get('[class*="total"], [class*="price"]').filter(':visible'),
  
      
      cartTableRows: () => cy.get('.cart-item, .cart-product, tr[class*="item"], [class*="cart-list"] > div').filter(':visible'),
      firstRowTitle: () => cy.get('.cart-item, .cart-product, tr[class*="item"]').filter(':visible').first().find('a, [class*="title"], [class*="name"]').first(),
      firstRowUnitPrice: () => cy.get('.cart-item, .cart-product, tr[class*="item"]').filter(':visible').first().find('[class*="price"]').first(),
      firstRowQuantityInput: () => cy.get('.cart-item, .cart-product, tr[class*="item"]').filter(':visible').first().find('input[type="number"], input[name*="qty"], input[name*="adet"], input[class*="qty"]'),
      firstRowPlusButton: () => cy.get('.cart-item, .cart-product, tr[class*="item"]').filter(':visible').first().find('button, a, span').filter(':contains("+"), [class*="plus"], [class*="increase"]').first(),
  
      
      cartSummaryPanel: () => cy.get('.cart-summary, .order-summary, [class*="summary"], [class*="total-card"]').filter(':visible').first(),
      grandTotalPrice: () => cy.get('.cart-summary, .order-summary, [class*="summary"]').find('[class*="grand-total"], [class*="total-price"], strong:contains("TL"), strong:contains("₺")').last()
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
  
    // Testler için ön koşul: Liste sayfasındaki ilk ürün kartından doğrudan sepete ekle
    addOneProductToCart() {
      cy.visit('https://www.kitapsepeti.com/arama?q=Roman', { failOnStatusCode: false });
      this.dismissCookiesIfPresent();
  
      // İlk ürün kartının içindeki "Sepete Ekle" metnine (span, button veya a) tıkla
      cy.get('.product-item, .product-box, .col-product', { timeout: 15000 })
        .filter(':visible')
        .first()
        .within(() => {
          cy.contains('Sepete Ekle')
            .scrollIntoView()
            .click({ force: true });
        });
  
      // Sepet durumunun veya modalının güncellenmesini bekle
      cy.wait(2000);
    }
  
    openCartDrawer() {
      this.elements.headerCartButton().click({ force: true });
    }
  
    visitCartPageDirectly() {
      cy.visit('https://www.kitapsepeti.com/sepet', { failOnStatusCode: false });
      this.dismissCookiesIfPresent();
    }
  }
  
  export default new CartPage();