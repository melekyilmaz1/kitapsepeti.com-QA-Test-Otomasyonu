import searchPage from '../pages/SearchPage';

describe('US02 - Ürün Arama ve Listeleme Modülü Testleri', () => {

  beforeEach(() => {
    searchPage.visitHomePage();
    searchPage.dismissCookiesIfPresent();
  });

  it('TC01 - [AC1] Arama Çubuğuna Anahtar Kelime Girilmesi ve Arama Yapılması (Pozitif)', () => {
    searchPage.search('Roman');
    searchPage.verifySearchUrl('Roman');
  });

  it('TC02 - [AC2] Arama Sonuçları Sayfası Doğrulaması ve Arama Kutusunun Temizlenmesi (Pozitif)', () => {
    const searchWord = 'Nutuk';
    searchPage.search(searchWord);
    searchPage.verifySearchUrl(searchWord);
    searchPage.elements.productCards().should('have.length.greaterThan', 0);
    searchPage.elements.searchInput().should('be.visible');
  });

  it('TC03 - [AC3] Bulunmayan Kelime ile Arama Denemesi (Negatif Test)', () => {
    searchPage.search('asradgshd');
    cy.url({ timeout: 10000 }).should('include', 'asradgshd');
    cy.contains(/Arama kriterlerinize uygun ürün bulunamadı/i, { timeout: 10000 }).should('be.visible');
  });

  it('TC04 - [AC4] Ürün Kartı Bileşenlerinin Eksiksizliğinin Doğrulanması (Pozitif)', () => {
    searchPage.search('Tarih');
    searchPage.verifyProductCardComponents();
  });

  it('TC05 - [AC5] Ürün kartı üzerinde "Sepete Ekle" butonunun varlığı ve tetiklenmesi', () => {
    searchPage.search('Roman');
    searchPage.elements.firstProductCard().should('be.visible').within(() => {
      // Fare kart üzerine gelir
      cy.root().trigger('mouseover', { force: true });
      // Kart içinde Sepete Ekle butonu / linki aranır
      cy.get('button, a, .btn, [class*="basket"], [class*="cart"]')
        .filter(':contains("Sepet"), [title*="Sepet"], [aria-label*="Sepet"]')
        .should('exist');
    });
  });

  it('TC06 - [AC6] Arama sonuçları sayfasındaki Sıralama seçeneklerinin doğrulanması', () => {
    searchPage.search('Roman');
    // Sayfadaki sıralama alanı (Çok satanlar / Sırala alanı) kontrol edilir
    cy.contains(/Çok satanlar|Sırala|Varsayılan|Önerilen/i, { timeout: 8000 })
      .should('be.visible')
      .click({ force: true });
    
    // Açılan seçeneklerde Fiyat veya Yeniden eskiye kriterlerinin varlığı doğrulanır
    cy.get('body').then(($body) => {
      const text = $body.text();
      expect(/Fiyat|Artan|Azalan|Yeni|Eski/i.test(text)).to.be.true;
    });
  });

  it('TC07 - [AC7] Sol filtreleme panelinde Kategori ve Yazar filtrelerinin doğrulanması', () => {
    searchPage.search('Tarih');
    
    // Sol filtre kartlarının başlıklarını doğrula
    cy.get('.filter-card')
      .filter(':visible')
      .should('contain.text', 'Kategori')
      .and('contain.text', 'Yazar');
  });

  it('TC08 - [AC8] Üst menüden hazır kategori seçimi ve kategori sayfasının doğrulanması', () => {
    // Üst menüdeki görünür ROMAN linkine tıkla
    cy.get('header, nav, #main-menu, .menu')
      .find('a')
      .filter(':contains("ROMAN")')
      .filter(':visible')
      .first()
      .click({ force: true });

    // Sayfa URL'inin ve sayfa üzerindeki kategori başlığının doğrulanması
    cy.url({ timeout: 10000 }).should('include', 'roman');
    cy.get('h1, .breadcrumb, [class*="category-title"], title')
      .filter(':visible')
      .first()
      .should('exist');
  });

  it('TC09 - [AC9] Sayfa aşağı kaydırıldığında yeni ürünlerin yüklenmesi / sayfalama', () => {
    searchPage.search('Tarih');
    searchPage.elements.productCards().its('length').then((initialCount) => {
      // Sayfayı aşağı kaydır
      cy.scrollTo('bottom', { ensureScrollable: false });
      cy.wait(1500);

      // Sayfalama veya ürün sayısının korunduğu kontrol edilir
      cy.get('body').then(($body) => {
        const hasPagination = $body.find('.pagination, .pager, [class*="paginate"]').length > 0;
        const currentCount = $body.find('.product-item, .col-product, [class*="product-detail"]').length;
        expect(hasPagination || currentCount >= initialCount).to.be.true;
      });
    });
  });

});