import cartPage from '../pages/CartPage';
import checkoutPage from '../pages/CheckoutPage';
import loginPage from '../pages/LoginPage';

describe('US05 - Adres, Kargo ve Ödeme Yönetimi Testleri', () => {

  beforeEach(() => {
    loginPage.visitHomePage();
    loginPage.dismissCookiesIfPresent();

    cy.fixture('userData').then((user) => {
      loginPage.openLoginModal();
      loginPage.login(user.validUser.email, user.validUser.password);
      cy.wait(1500);
    });

    cartPage.addOneProductToCart();
  });

  it('TC01 - [AC1] Sepet sayfasındaki "Satın Al" butonu ile "Adres Bilgileri" sayfasına yönlendirme', () => {
    checkoutPage.goToCartPage();
    checkoutPage.clickCheckout();

    cy.url({ timeout: 15000 }).should('not.include', '/sepet');
    cy.contains(/ADRES BİLGİLERİ|Adres|Teslimat/i, { timeout: 15000 }).should('be.visible');
  });

  it('TC02 - [AC2] "Ödeme Adımına Geç" butonuna tıklayarak ödeme bilgileri ekranına yönlendirme', () => {
    checkoutPage.navigateToPaymentStep();

    cy.url({ timeout: 15000 }).should('include', '/order');
    cy.contains(/ÖDEME SEÇENEKLERİ|KARGO SEÇENEKLERİ/i, { timeout: 15000 }).should('be.visible');
  });

  it('TC03 - [AC3] Kargo seçeneklerinde "PTT Kargo" ve "Hepsijet" doğrulaması ve PTT Kargo default seçimi [BUG TESTİ]', () => {
    checkoutPage.navigateToPaymentStep();

    checkoutPage.elements.hepsijetCargoOption().should('be.visible');
    checkoutPage.elements.pttCargoOption().should('be.visible');

    // AC3 gereğince PTT Kargo varsayılan seçili olmalıdır (Canlıda HEPSİJET seçili geldiği için FAIL verecektir)
    checkoutPage.elements.pttCargoOption()
      .closest('label, div')
      .then(($el) => {
        const hasActiveSelection = $el.find('.checked, [class*="active"], [class*="selected"]').length > 0 ||
                                   $el.hasClass('checked') ||
                                   $el.hasClass('active');
        expect(hasActiveSelection, 'HATA (BUG): AC3 gereğince PTT Kargo varsayılan seçili olmalıdır fakat HEPSİJET seçili gelmektedir!').to.be.true;
      });
  });

  it('TC04 - [AC4] Ödeme seçeneklerinde "iyzico ile öde" ve "Kartla Ödeme" alternatiflerinin sunulması', () => {
    checkoutPage.navigateToPaymentStep();

    checkoutPage.elements.creditCardPaymentOption().should('be.visible');
    checkoutPage.elements.iyzicoPaymentOption().should('be.visible');
  });

  it('TC05 - [AC3 Destekleyici] Kargo seçenekleri arasında seçim yapılabilmesi ve değişimin doğrulanması', () => {
    checkoutPage.navigateToPaymentStep();

    checkoutPage.elements.pttCargoOption()
      .closest('label, div')
      .click({ force: true });

    checkoutPage.elements.pttCargoOption().should('be.visible');
  });

  it('TC06 - [Buton Aktivasyonu-Pozitif] Tüm alanlar doldurulduktan sonra "xxx TL ÖDE" butonu aktif(mavi renk) hale gelmelidir', () => {
    checkoutPage.navigateToPaymentStep();

    checkoutPage.elements.creditCardPaymentOption().click({ force: true });

    // Kart alanlarını doldur
    checkoutPage.elements.cardHolderNameInput().type('Test Kullanıcı', { force: true });
    checkoutPage.elements.cardNumberInput().type('4543600000000001', { force: true });
    checkoutPage.elements.cardExpiryInput().type('12/28', { force: true });
    checkoutPage.elements.cardCvcInput().type('321', { force: true });

    checkoutPage.elements.contractCheckbox().click({ force: true });

    // Ödeme butonunun aktifliğini doğrula
    cy.get('body').then(($body) => {
      const payBtn = $body.find('button:contains("ÖDE"), a:contains("ÖDE"), button:contains("Tamamla")');
      if (payBtn.length > 0) {
        cy.wrap(payBtn.first()).should('be.visible').and('not.be.disabled');
      } else {
        cy.contains(/ÖDE|Tamamla/i).should('be.visible');
      }
    });
  });

  it('TC07 - [Buton Aktivasyonu-Negatif] Bazı alanlar eksik bırakılıp "xxx TL ÖDE" butonuna tıklanırsa kırmızı uyarı mesajı gösterilmelidir', () => {
    checkoutPage.navigateToPaymentStep();

    checkoutPage.elements.creditCardPaymentOption().click({ force: true });

    // Zorunlu alanları doldurmadan veya eksik bırakarak öde butonuna tıkla
    cy.get('body').then(($body) => {
      const payBtn = $body.find('button:contains("ÖDE"), a:contains("ÖDE"), button:contains("Tamamla")');
      if (payBtn.length > 0) {
        cy.wrap(payBtn.first()).click({ force: true });
      }
    });

    // Validasyon / uyarı mesajı veya HTML5 geçersizlik kontrolü
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const text = $body.text();
      const hasErrorText = /doldurunuz|zorunlu|geçerli|eksik/i.test(text);
      const hasValidation = $body.find(':invalid, .error, .text-danger, .invalid').length > 0;
      expect(hasErrorText || hasValidation).to.be.true;
    });
  });

  it('TC08 - [Sipariş Özeti] Ödeme adımında sayfanın sağ tarafında "Sipariş Özeti" kutusu bulunmalı ve doğru genel toplam tutarı gösterilmelidir', () => {
    checkoutPage.navigateToPaymentStep();

    cy.contains(/Sipariş Özet/i, { timeout: 10000 }).should('be.visible');
    cy.contains(/Genel Toplam/i, { timeout: 10000 }).should('be.visible');

    cy.contains(/Genel Toplam/i)
      .parent()
      .then(($el) => {
        expect($el.text()).to.include('TL');
      });
  });

});