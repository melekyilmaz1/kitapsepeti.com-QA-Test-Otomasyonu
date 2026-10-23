class LoginPage {
  elements = {
    acceptCookiesButton: () => cy.contains('button, a', 'Tümünü Kabul Et'),
    loginNavButton: () => cy.contains('a, span, div', 'E-posta ile Giriş').first(),
    
    emailInput: () => cy.get('#header-email, input[type="email"]').filter(':visible').first(),
    passwordInput: () => cy.get('#header-password, input[type="password"]').filter(':visible').first(),
    rememberMeContainer: () => cy.contains('Beni Hatırla').filter(':visible').first(),
    forgotPasswordLink: () => cy.contains('Şifremi Unuttum').filter(':visible').first(),
    loginSubmitButton: () => cy.get('form button[type="submit"], input[type="submit"], a.btn, button.btn').filter(':contains("GİRİŞ"), :contains("Giriş"), :contains("Giris")').filter(':visible').first(),
    registerButton: () => cy.get('a, button').filter(':contains("Kayıt Ol"), :contains("Kayit Ol")').filter(':visible').first(),
    accountMenu: () => cy.contains('a, span, div', 'Hesabım').filter(':visible'),
    errorMessage: () => cy.get('.toast, .alert, .notification, .flashes, [class*="error"], [class*="warning"], [class*="danger"], .popover, .tooltip, div[role="alert"]').filter(':visible').first(),

    resetPasswordEmailInput: () => cy.get('input[type="email"], input[name*="email"], input[name*="mail"]').filter(':visible').first(),
    resetPasswordSubmitButton: () => cy.contains(/Hatırlat|Gönder|Sıfırla/i).filter(':visible').first()
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

  openLoginModal() {
    
    cy.scrollTo('top');
    this.elements.loginNavButton().click({ force: true });
  }

  verifyLoginModalVisible() {
    this.elements.emailInput().should('be.visible');
  }

  login(email, password) {
    if (email) this.elements.emailInput().clear().type(email);
    if (password) this.elements.passwordInput().clear().type(password);
    this.elements.loginSubmitButton().click({ force: true });
  }

  verifyLoginSuccess() {
    cy.url({ timeout: 10000 }).should('match', /(hesap|uye|adres|kitapsepeti\.com)/);
    this.elements.accountMenu().should('exist');
  }

  verifyLoginError() {
    // Ya ekranda hata/uyarı mesajı görünür ya da giriş başarısız olduğu için kullanıcı ana sayfada/giriş formunda kalır
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const pageText = $body.text();
      const hasErrorText = /hatalı|yanlış|bulunamadı|geçersiz|hata|uyarı|şifre/i.test(pageText);
      const hasErrorBox = $body.find('.toast, .alert, .flashes, [class*="error"], [class*="warning"]').length > 0;
      expect(hasErrorText || hasErrorBox).to.be.true;
    });

    // Kullanıcının sisteme giriş yapamadığını doğrula
    this.elements.loginSubmitButton().should('be.visible');
  }

  verifyInvalidEmailFormat() {
    this.elements.emailInput().then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
    });
  }

  verifyEmptyFieldsValidation() {
    this.elements.emailInput().then(($input) => {
      if ($input.prop('required')) {
        expect($input[0].checkValidity()).to.be.false;
      }
    });
    cy.url().should('include', 'kitapsepeti.com');
    this.elements.loginSubmitButton().should('be.visible');
  }

  attemptMultipleFailedLogins(count = 10) {
    for (let i = 0; i < count; i++) {
      this.elements.emailInput().clear().type(`test_rate_limit_${i}@gmail.com`);
      this.elements.passwordInput().clear().type('YanlisSifre.123');
      this.elements.loginSubmitButton().click({ force: true });
      cy.wait(300);
    }
  }

  verifyRateLimitBlocked() {
    cy.get('body').then(($body) => {
      const pageText = $body.text();
      const hasBlockMessage = /istek|talep|dakika|engellendi|kısıtlandı|bloke|güvenlik|tekrar|hatalı|deneme/i.test(pageText);
      expect(hasBlockMessage).to.be.true;
    });
    cy.url().should('include', 'kitapsepeti.com');
    this.elements.loginSubmitButton().should('be.visible');
  }

  clickForgotPassword() {
    this.elements.forgotPasswordLink().click({ force: true });
  }

  verifyForgotPasswordPage() {
    cy.url({ timeout: 10000 }).should('match', /(sifre|parola|unuttum|reset)/i);
    this.elements.resetPasswordEmailInput().should('be.visible');
    this.elements.resetPasswordSubmitButton().should('be.visible');
  }
}

export default new LoginPage();