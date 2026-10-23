class GuestCheckoutPage {
    elements = {
      acceptCookiesButton: () => cy.contains('button, a', 'Tümünü Kabul Et'),
  
      
      guestCheckoutButton: () => cy.contains('button, a, div', /Üye Olmadan Devam Et/i).filter(':visible').first(),
  
   
      fullNameInput: () => cy.get('input[name*="fullname"], input[placeholder*="Ad Soyad"], input[id*="fullname"], input[name*="name"]').filter(':visible').first(),
      emailInput: () => cy.get('input[type="email"], input[name*="email"], input[placeholder*="E-posta"]').filter(':visible').first(),
      phoneInput: () => cy.get('input[name*="phone"], input[name*="gsm"], input[placeholder*="Telefon"], input[name*="cep"]').filter(':visible').first(),
      cityDropdown: () => cy.get('select[name*="city"], select[name*="il"], [id*="city"]').filter(':visible').first(),
      townDropdown: () => cy.get('select[name*="town"], select[name*="ilce"], [id*="town"]').filter(':visible').first(),
      districtDropdown: () => cy.get('select[name*="district"], select[name*="mahalle"], [id*="district"]').filter(':visible').first(),
      addressTextarea: () => cy.get('textarea[name*="address"], textarea[id*="address"], textarea[placeholder*="Adres"]').filter(':visible').first(),
  
      
      continueButton: () => cy.contains('button, a, input[type="submit"]', /Devam Et|Adresi Kaydet|Kaydet/i).filter(':visible').first()
    };
  
    dismissCookiesIfPresent() {
      cy.get('body').then(($body) => {
        
        if ($body.find('button:contains("Tümünü Kabul Et"), a:contains("Tümünü Kabul Et")').length > 0) {
          this.elements.acceptCookiesButton().click({ force: true });
        }
      });
    }
  
    // AC1: Doğrudan popüler bir kitaba git, sepete ekle ve açılan modal/popup'tan "Satın Al" tıkla
    addFirstProductAndClickCheckout() {
      // Doğrudan ana sayfadaki çok satan Muhabbet kitabına git
      cy.visit('https://www.kitapsepeti.com/muhabbet', { failOnStatusCode: false });
      this.dismissCookiesIfPresent();
  
      // "Sepete Ekle" butonuna tıkla
      cy.contains('button, a', 'Sepete Ekle', { timeout: 15000 })
        .scrollIntoView()
        .click({ force: true });
  
      // Açılan sepet modalı/kartı içindeki "Satın Al" butonuna tıkla
      cy.contains('button, a', /Satın Al/i, { timeout: 15000 })
        .filter(':visible')
        .first()
        .click({ force: true });
    }
  
    clickGuestCheckout() {
      this.elements.guestCheckoutButton().click({ force: true });
    }
  
    fillAddressForm(details = {}) {
      if (details.fullName) this.elements.fullNameInput().clear({ force: true }).type(details.fullName, { force: true });
      if (details.email) this.elements.emailInput().clear({ force: true }).type(details.email, { force: true });
      if (details.phone) this.elements.phoneInput().clear({ force: true }).type(details.phone, { force: true });
  
      cy.get('body').then(($body) => {
        if ($body.find('select[name*="city"], select[name*="il"]').length > 0) {
          this.elements.cityDropdown().select(1, { force: true });
          cy.wait(500);
        }
        if ($body.find('select[name*="town"], select[name*="ilce"]').length > 0) {
          this.elements.townDropdown().select(1, { force: true });
          cy.wait(500);
        }
      });
  
      if (details.address) this.elements.addressTextarea().clear({ force: true }).type(details.address, { force: true });
    }
  }
  
  export default new GuestCheckoutPage();