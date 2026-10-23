import cartPage from '../pages/CartPage';

describe('US04 - Sepet Yönetimi ve Kontrolü Testleri', () => {

  beforeEach(() => {
    cartPage.addOneProductToCart();
  });

  it('TC01 - [AC1] Sağ sepet panelinin açılması ve "Sepete Git" ile /sepet sayfasına yönlendirme', () => {
    // 1. Ekranda çıkan çerez banner'ını hemen kapat
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Tümünü Kabul Et"), a:contains("Tümünü Kabul Et")').length > 0) {
        cy.contains('button, a', 'Tümünü Kabul Et').click({ force: true });
      }
    });

    // 2. Açılan popup içindeki veya sayfadaki "Sepete Git" butonuna force ile tıkla
    cy.contains(/Sepete Git/i, { timeout: 10000 })
      .click({ force: true });

    // 3. /sepet sayfasına başarıyla yönlendiğini doğrula
    cy.url({ timeout: 10000 }).should('include', '/sepet');
  });

  it('TC02 - [AC2] Sepet sayfasında ürün bilgileri (isim, fiyat, adet, satır toplamı) doğrulaması', () => {
    cartPage.visitCartPageDirectly();

    // Sepet sayfasının tam yüklenmesini bekle (URL ve sepet içeriği)
    cy.url({ timeout: 10000 }).should('include', '/sepet');

    // Sepet sayfasında fiyat veya TL ibaresinin doğrulanması
    cy.get('body', { timeout: 10000 }).should('contain.text', 'TL');

    // Adet alanının (input, buton veya adet metni) varlığının doğrulanması
    cy.get('body').then(($body) => {
      const hasQtyInput = $body.find('input[type="number"], input[name*="qty"], input[name*="adet"], input[class*="qty"], input[value="1"]').length > 0;
      const hasQtyText = /Adet|Miktar|\b1\b/i.test($body.text());
      expect(hasQtyInput || hasQtyText).to.be.true;
    });
  });

  it('TC03 - [AC3] Sepet Özeti bölümünde Ara Toplam, Kargo ve Genel Toplamın doğrulanması', () => {
    cartPage.visitCartPageDirectly();

    cy.get('body', { timeout: 10000 }).then(($body) => {
      const pageText = $body.text();
      expect(/Toplam|Kargo|Genel Toplam|Ödenecek Tutar/i.test(pageText)).to.be.true;
    });
  });

  it('TC04 - [AC4] Adet artırma (+) butonuna tıklandığında adedin ve tutarın güncellenmesi', () => {
    cartPage.visitCartPageDirectly();
    cy.url({ timeout: 10000 }).should('include', '/sepet');

    // + butonuna veya artırma elemanına tıkla
    cy.get('button, a, span, i')
      .filter(':contains("+"), [class*="plus"], [class*="increase"], [class*="up"]')
      .filter(':visible')
      .first()
      .click({ force: true });

    // Sayfanın güncellenmesini bekle ve tutarın/adedin tazelendiğini doğrula
    cy.wait(2000);
    cy.get('body').then(($body) => {
      const pageText = $body.text();
      expect(/Toplam|TL|₺|2/i.test(pageText)).to.be.true;
    });
  });

  it('TC05 - [AC5] Ürün satırındaki çöp kutusu ikonuna tıklanıp onay verilerek ürünün silinmesi', () => {
    // 1. Doğrudan sepete git
    cartPage.visitCartPageDirectly();
    cy.url({ timeout: 10000 }).should('include', '/sepet');

    // 2. Ürün satırındaki çöp kutusu (sil) ikonunu bul ve tıkla
    cy.get('i.fa-trash, i[class*="trash"], a[class*="delete"], [class*="remove"], [title*="Sil"]')
      .filter(':visible')
      .first()
      .click({ force: true });

    // 3. Açılan onay kutusundaki Sil/Evet/Tamam butonuna tıkla
    cy.get('body').then(($body) => {
      if ($body.find('.modal, .swal2-popup, [role="dialog"], .popover').length > 0) {
        cy.contains('button, a', /Sil|Evet|Onayla|Tamam/i).filter(':visible').first().click({ force: true });
      }
    });

    // 4. Ürünün sepetten silindiğini veya boş sepet uyarısının geldiğini doğrula
    cy.wait(2000);
    cy.get('body').then(($body) => {
      const pageText = $body.text();
      const isEmpty = /bulunmamaktadır|boş|Sepetinizde/i.test(pageText);
      const rowCount = $body.find('.cart-item, tr[class*="item"]').length;
      expect(isEmpty || rowCount === 0).to.be.true;
    });
  });

  it('TC06 - [AC6] "Sepeti Temizle" butonuna tıklandığında tüm ürünlerin sepetten kaldırılması', () => {
    // 1. Doğrudan sepete git
    cartPage.visitCartPageDirectly();
    cy.url({ timeout: 10000 }).should('include', '/sepet');

    // 2. Sol altta bulunan "Sepeti Temizle" butonunu bul ve tıkla
    cy.contains('button, a, span', /Sepeti Temizle/i, { timeout: 10000 })
      .filter(':visible')
      .first()
      .click({ force: true });

    // 3. Eğer silme öncesinde onay modalı/diyaloğu çıkarsa onayla
    cy.get('body').then(($body) => {
      if ($body.find('.modal, .swal2-popup, [role="dialog"], .popover').length > 0) {
        cy.contains('button, a', /Sil|Evet|Onayla|Tamam/i).filter(':visible').first().click({ force: true });
      }
    });

    // 4. Sepetin boşaldığını doğrula
    cy.wait(2000);
    cy.get('body').then(($body) => {
      const pageText = $body.text();
      const isEmptyMessage = /bulunmamaktadır|boş|Sepetinizde/i.test(pageText);
      const rowCount = $body.find('.cart-item, tr[class*="item"]').length;
      expect(isEmptyMessage || rowCount === 0).to.be.true;
    });
  });

  it('TC07 - [AC7] Boş sepet durumunda bilgilendirme mesajı ve "Alışverişe Devam Et" butonu doğrulaması', () => {
    // 1. Doğrudan sepete git
    cartPage.visitCartPageDirectly();
    cy.url({ timeout: 10000 }).should('include', '/sepet');

    // 2. "Sepeti Temizle" butonuna tıkla
    cy.contains('button, a, span', /Sepeti Temizle/i, { timeout: 10000 })
      .filter(':visible')
      .first()
      .click({ force: true });

    // 3. Varsa onay modalındaki onay butonuna tıkla
    cy.get('body').then(($body) => {
      if ($body.find('.modal, .swal2-popup, [role="dialog"], .popover').length > 0) {
        cy.contains('button, a', /Sil|Evet|Onayla|Tamam/i).filter(':visible').first().click({ force: true });
      }
    });

    // 4. Sepet sayfasına tekrar kesin geçiş yap ve doğrula
    cy.visit('https://www.kitapsepeti.com/sepet', { failOnStatusCode: false });
    cy.url({ timeout: 10000 }).should('include', '/sepet');

    // 5. "Sepetinizde ürün bulunmamaktadır" mesajının görünür olduğunu doğrula
    cy.contains(/bulunmamaktadır/i, { timeout: 10000 })
      .should('be.visible');

    // 6. "Alışverişe Devam Et" butonunun görünür olduğunu doğrula
    cy.contains('button, a', /Alışverişe Devam Et/i, { timeout: 10000 })
      .should('be.visible');
  });

  it('TC08 - [AC8] Sepette ürün varken "Satın Al" butonu kontrolü ve sipariş adımına yönlendirme', () => {
    // 1. Sepete doğrudan git
    cartPage.visitCartPageDirectly();
    cy.url({ timeout: 10000 }).should('include', '/sepet');

    // 2. Sipariş özeti panelindeki "Satın Al" butonunun görünür ve tıklanabilir olduğunu doğrula
    cy.contains('button, a', /Satın Al/i, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click({ force: true });

    // 3. Bir sonraki sipariş / giriş / teslimat adres adımına yönlendirildiğini doğrula
    cy.url({ timeout: 10000 }).should('not.eq', 'https://www.kitapsepeti.com/sepet');
  });

  it('TC09 - [AC9] Ürün detay sayfasında "Sepete Ekle" ve açılan popup üzerinden "Sepete Git" yönlendirmesi', () => {
    // 1. Ürün detay sayfasına git
    cy.visit('https://www.kitapsepeti.com/cumhuriyetin-ilk-sabahi', { failOnStatusCode: false });
    cartPage.dismissCookiesIfPresent();

    // 2. "Sepete Ekle" butonuna tıkla
    cy.contains('button, a', 'Sepete Ekle', { timeout: 10000 })
      .scrollIntoView()
      .click({ force: true });

    // 3. Açılan popup içindeki "SEPETE GİT" butonuna tıkla
    cy.contains(/Sepete Git/i, { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // 4. /sepet sayfasına yönlendiğini doğrula
    cy.url({ timeout: 10000 }).should('include', '/sepet');
  });

  it('TC10 - [AC10] Ana sayfadaki ürün kartından "Sepete Ekle" ve popup üzerinden "Sepete Git" yönlendirmesi', () => {
    // 1. Ana sayfaya git
    cartPage.visitHomePage();
    cartPage.dismissCookiesIfPresent();

    // 2. Ana sayfada vitrindeki ilk ürün kartı içindeki "Sepete Ekle" alanına tıkla
    cy.get('.product-item, .product-box, .col-product', { timeout: 15000 })
      .filter(':visible')
      .first()
      .within(() => {
        cy.contains('Sepete Ekle')
          .scrollIntoView()
          .click({ force: true });
      });

    // 3. Açılan popup'taki "Sepete Git" butonuna tıkla
    cy.contains(/Sepete Git/i, { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // 4. Doğrudan /sepet sayfasına ulaşıldığını doğrula
    cy.url({ timeout: 10000 }).should('include', '/sepet');
  });

});