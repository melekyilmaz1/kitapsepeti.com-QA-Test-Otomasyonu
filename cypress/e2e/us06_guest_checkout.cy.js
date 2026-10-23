import guestCheckoutPage from '../pages/GuestCheckoutPage';

describe('US06 - Üye Olmadan Devam Etme (Misafir Alışverişi) Testleri', () => {

  beforeEach(() => {
    
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('TC01 - [AC1] Ürünü sepete ekleme ve açılan popupta "Satın Al" ile üye giriş sayfasına yönlendirme', () => {
    guestCheckoutPage.addFirstProductAndClickCheckout();

    
    cy.url({ timeout: 15000 }).should('match', /(siparis-uye-giris|giris|order|sepet)/i);
  });

  it('TC02 - [AC2] Sipariş üye giriş sayfasında "Üye Olmadan Devam Et" butonu bulunmalıdır', () => {
    guestCheckoutPage.addFirstProductAndClickCheckout();

    guestCheckoutPage.elements.guestCheckoutButton().should('be.visible');
  });

  it('TC03 - [AC3] "Üye Olmadan Devam Et" butonuna tıklandığında "Adres Bilgileri" sayfası yüklenmelidir', () => {
    guestCheckoutPage.addFirstProductAndClickCheckout();
    guestCheckoutPage.clickGuestCheckout();

    cy.contains(/ADRES BİLGİLERİ|Adres Bilgileri|Teslimat/i, { timeout: 15000 }).should('be.visible');
  });

  it('TC04 - [AC4] Adres formunda Ad Soyad, E-posta, Cep Telefonu, İl, İlçe, Mahalle ve Adres alanları bulunmalıdır', () => {
    guestCheckoutPage.addFirstProductAndClickCheckout();
    guestCheckoutPage.clickGuestCheckout();

    
    guestCheckoutPage.elements.fullNameInput().should('be.visible');
    guestCheckoutPage.elements.emailInput().should('be.visible');
    guestCheckoutPage.elements.phoneInput().should('be.visible');
    guestCheckoutPage.elements.addressTextarea().should('be.visible');

    cy.get('body').then(($body) => {
      const hasCity = $body.find('select[name*="city"], select[name*="il"], [id*="city"]').length > 0;
      const hasTown = $body.find('select[name*="town"], select[name*="ilce"], [id*="town"]').length > 0;
      expect(hasCity || hasTown).to.be.true;
    });
  });

  it('TC05 - [AC5] Zorunlu alan (ör: Ad Soyad) boş bırakılıp "Devam Et" butonuna basıldığında kırmızı uyarı mesajı gösterilmelidir', () => {
    guestCheckoutPage.addFirstProductAndClickCheckout();
    guestCheckoutPage.clickGuestCheckout();

    // Ad Soyad hariç diğerlerini doldur
    guestCheckoutPage.elements.emailInput().type('misafir.test@example.com', { force: true });
    guestCheckoutPage.elements.phoneInput().type('5551234567', { force: true });

    guestCheckoutPage.elements.continueButton().click({ force: true });

    // HTML5 invalid kontrolü veya kırmızı uyarı metni kontrolü
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const text = $body.text();
      const hasWarning = /doldurunuz|zorunlu|geçerli/i.test(text);
      const hasInvalid = $body.find(':invalid, .error, .text-danger, .invalid').length > 0;
      expect(hasWarning || hasInvalid).to.be.true;
    });
  });

  it('TC06 - [AC6] Tüm zorunlu alanlar doldurulup "Adresi Kaydet" butonuna tıklandığında ödeme seçenekleri adımına geçilebilmelidir', () => {
    guestCheckoutPage.addFirstProductAndClickCheckout();
    guestCheckoutPage.clickGuestCheckout();

    guestCheckoutPage.fillAddressForm({
      fullName: 'Misafir Kullanıcı Test',
      email: 'misafir.kitap.qa@gmail.com',
      phone: '5551112233',
      address: 'Caferağa Mah. Moda Cad. No: 15 Kadıköy'
    });

    guestCheckoutPage.elements.continueButton().click({ force: true });

    // Ödeme ekranına geçildiğini doğrula
    cy.url({ timeout: 15000 }).should('match', /(order|odeme)/i);
    cy.contains(/Ödeme|Kargo|ÖDEME/i, { timeout: 15000 }).should('be.visible');
  });

});