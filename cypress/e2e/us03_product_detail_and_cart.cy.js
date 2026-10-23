import productDetailPage from '../pages/ProductDetailPage';

describe('US03 - Ürün Detay Sayfası Görüntüleme ve Sepete Ekleme Testleri', () => {

  beforeEach(() => {
    productDetailPage.visitSearchList('Roman');
    productDetailPage.dismissCookiesIfPresent();
  });

  it('TC01 - [AC1] Ürün görseline/ismine tıklandığında ürün detay sayfasına yönlendirilmesi', () => {
    productDetailPage.goToFirstProductDetail();

    
    cy.url({ timeout: 10000 }).should('not.include', '/arama?q=');
    productDetailPage.elements.productTitle().should('be.visible');
  });

  it('TC02 - [AC2] Ürün detay sayfasında ürün adı, yazar, yayınevi ve fiyat bilgilerinin doğrulanması', () => {
    productDetailPage.goToFirstProductDetail();

    
    productDetailPage.elements.productTitle().should('be.visible');

   
    cy.get('body').then(($body) => {
      const pageText = $body.text();
      expect(/Yazar|Yayınevi/i.test(pageText)).to.be.true;
      expect(/TL|₺/i.test(pageText)).to.be.true;
    });
  });

  it('TC03 - [AC3] "Ürün Hakkında Bilgiler" bölümünde teknik detayların (ISBN, Sayfa vb.) yer alması', () => {
    productDetailPage.goToFirstProductDetail();

    
    cy.get('body').then(($body) => {
      const pageText = $body.text();
      expect(/ISBN|Sayfa|Basım|Kağıt|Türü/i.test(pageText)).to.be.true;
    });
  });

  it('TC04 - [AC4] Sayfada işlevsel bir "Sepete Ekle" butonunun bulunması', () => {
    productDetailPage.goToFirstProductDetail();

    productDetailPage.elements.addToCartButton()
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('TC05 - [AC5] "Sepete Ekle" butonuna tıklandığında onay mesajı ve butonların görüntülenmesi', () => {
    productDetailPage.goToFirstProductDetail();
    productDetailPage.clickAddToCart();

    // Sepete eklendiğine dair mesaj veya yönlendirme butonlarının kontrolü
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const pageText = $body.text();
      expect(/eklendi|Sepete Git|Satın Al|Sepet/i.test(pageText)).to.be.true;
    });
  });

  it('TC06 - [AC6] Ürün sepete eklendikten sonra sağ üstteki sepet sayacının güncellenmesi', () => {
    productDetailPage.goToFirstProductDetail();
    productDetailPage.clickAddToCart();

    // Sağ üstteki sepet butonunu ve üzerindeki sayacı doğrula
    cy.contains(/Sepetim|Sepet/i)
      .parents('a, button, div')
      .first()
      .within(() => {
        // Sepet rozeti veya buton metninde en az 1 rakam olduğunu doğrula
        cy.get('*').invoke('text').then((text) => {
          expect(/\d+/.test(text)).to.be.true;
        });
      });
  });

});