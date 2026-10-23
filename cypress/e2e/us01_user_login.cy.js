import loginPage from '../pages/LoginPage';

describe('US01 - Kullanıcı Girişi Modülü Testleri', () => {

  beforeEach(() => {
    loginPage.visitHomePage();
    loginPage.dismissCookiesIfPresent();
  });

  it('TC01 - [AC1] Giriş Popupına Erişim ve Doğrulanması', () => {
    loginPage.openLoginModal();
    loginPage.verifyLoginModalVisible();
    loginPage.elements.passwordInput().should('be.visible');
  });

  it('TC02 - [AC2] Giriş Form Alanlarının Varlığı ve Doğrulanması', () => {
    loginPage.openLoginModal();
    loginPage.verifyLoginModalVisible();

    loginPage.elements.emailInput().should('be.visible');
    loginPage.elements.passwordInput().should('be.visible');
    loginPage.elements.rememberMeContainer().should('be.visible');
    loginPage.elements.forgotPasswordLink().should('be.visible');
    loginPage.elements.loginSubmitButton().should('be.visible');
    loginPage.elements.registerButton().should('be.visible');
  });

  it('TC03 - [AC3 & AC4] Geçerli Bilgilerle Başarılı Giriş ve Yönlendirme (Pozitif Test)', () => {
    cy.fixture('userData').then((user) => {
      loginPage.openLoginModal();
      loginPage.verifyLoginModalVisible();
      loginPage.login(user.validUser.email, user.validUser.password);
      loginPage.verifyLoginSuccess();
    });
  });

  it('TC04 - [AC5] Yanlış E-posta veya Yanlış Şifre ile Giriş (Negatif Test)', () => {
    loginPage.openLoginModal();
    loginPage.verifyLoginModalVisible();
    loginPage.login('gecersiz_test_kullanici_qa@gmail.com', 'YanlisSifre.123');
    loginPage.verifyLoginError();
  });

  it('TC05 - [AC6] Geçersiz E-posta Formatı ile Giriş (Negatif Test)', () => {
    loginPage.openLoginModal();
    loginPage.verifyLoginModalVisible();
    loginPage.login('gecersizformateposta', 'ValidPassword123!');
    loginPage.verifyInvalidEmailFormat();
  });

  it('TC06 - [AC7] Boş Alanlarla Giriş Denemesi (Negatif Test)', () => {
    loginPage.openLoginModal();
    loginPage.verifyLoginModalVisible();
    loginPage.elements.loginSubmitButton().click({ force: true });
    loginPage.verifyEmptyFieldsValidation();
  });

  it('TC07 - [AC8] Hatalı Giriş Denemesi Kısıtlaması (Rate Limiting - Negatif Test)', () => {
    loginPage.openLoginModal();
    loginPage.verifyLoginModalVisible();
    
    // Arka arkaya hatalı giriş denemeleri gönderilir
    loginPage.attemptMultipleFailedLogins(10);
    
    // Kısıtlama / istek limiti uyarısının ekranda belirdiği doğrulanır
    loginPage.verifyRateLimitBlocked();
  });

  it('TC08 - [AC9] Şifremi Unuttum Sayfasına Yönlendirme ve Sayfa Kontrolü (Pozitif Test)', () => {
    loginPage.openLoginModal();
    loginPage.verifyLoginModalVisible();
    
    // "Şifremi Unuttum" linkine tıkla
    loginPage.clickForgotPassword();
    
    // Yönlenilen sayfanın ve form elemanlarının varlığını doğrula
    loginPage.verifyForgotPasswordPage();
  });

});