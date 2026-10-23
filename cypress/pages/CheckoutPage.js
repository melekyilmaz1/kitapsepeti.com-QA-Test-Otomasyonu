class CheckoutPage {
    elements = {
      acceptCookiesButton: () => cy.contains('button, a', 'Tümünü Kabul Et'),
      cartCheckoutButton: () => cy.contains('button, a', /Satın Al/i).filter(':visible').first(),
      proceedToPaymentButton: () => cy.contains('button, a', /Ödeme Adımına Geç|Ödemeye Geç|Devam Et/i).filter(':visible').first(),
      pttCargoOption: () => cy.contains(/PTT Kargo/i),
      hepsijetCargoOption: () => cy.contains(/HEPSİJET|Hepsijet/i),
      iyzicoPaymentOption: () => cy.contains(/iyzico/i),
      creditCardPaymentOption: () => cy.contains(/Kartla Ödeme|Kredi Kartı/i),
  
      
      cardHolderNameInput: () => cy.get('input[placeholder*="Ad Soyad"], input[name*="holder"], input[name*="name"]').filter(':visible').first(),
      cardNumberInput: () => cy.get('input[placeholder*="Kart Numarası"], input[name*="cardnumber"], input[name*="number"]').filter(':visible').first(),
      cardExpiryInput: () => cy.get('input[placeholder*="Ay / Yıl"], input[name*="expiry"], input[name*="date"]').filter(':visible').first(),
      cardCvcInput: () => cy.get('input[placeholder*="CVC"], input[name*="cvc"], input[name*="cvv"]').filter(':visible').first(),
      
      
      contractCheckbox: () => cy.contains(/Ön Bilgilendirme Formu/i).closest('label, div'),
  
      
      paySubmitButton: () => cy.contains('button, a', /TL ÖDE|ÖDEME YAP|Siparişi Tamamla/i).filter(':visible').first(),
  
      orderSummaryBox: () => cy.contains(/Sipariş Özet/i).closest('div')
    };
  
    dismissCookiesIfPresent() {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Tümünü Kabul Et"), a:contains("Tümünü Kabul Et")').length > 0) {
          this.elements.acceptCookiesButton().click({ force: true });
        }
      });
    }
  
    goToCartPage() {
      cy.visit('https://www.kitapsepeti.com/sepet', { failOnStatusCode: false });
      this.dismissCookiesIfPresent();
    }
  
    clickCheckout() {
      this.elements.cartCheckoutButton().click({ force: true });
    }
  
    clickProceedToPayment() {
      this.elements.proceedToPaymentButton().click({ force: true });
    }
  
    // Ödeme ekranına kararlı ve garantili geçiş
    navigateToPaymentStep() {
      this.goToCartPage();
      this.clickCheckout();
  
      cy.url({ timeout: 15000 }).should('not.include', '/sepet');
  
      // Eğer adres formu açıksa veya "Adresi Güncelle" butonu varsa tıkla, yoksa ödemeye geç
      cy.get('body', { timeout: 15000 }).then(($body) => {
        if ($body.find('button:contains("ADRESİ GÜNCELLE"), a:contains("ADRESİ GÜNCELLE")').length > 0) {
          cy.contains('button, a', 'ADRESİ GÜNCELLE').first().click({ force: true });
          cy.wait(1000);
        }
        
        // "Ödeme Adımına Geç" butonuna tıkla
        if ($body.find('button:contains("Ödeme Adımına Geç"), a:contains("Ödeme Adımına Geç")').length > 0) {
          this.clickProceedToPayment();
        } else if ($body.find('.checkout-steps, .order-steps').length > 0) {
          cy.contains(/ÖDEME BİLGİLERİ/i).first().click({ force: true });
        }
      });
  
      // Ödeme ekranına varıldığını doğrula
      cy.url({ timeout: 15000 }).should('include', '/order');
      cy.contains(/KARGO SEÇENEKLERİ|ÖDEME SEÇENEKLERİ|ÖDEME BİLGİLERİ/i, { timeout: 15000 }).should('be.visible');
    }
  }
  
  export default new CheckoutPage();