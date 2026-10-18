/* eslint-disable @typescript-eslint/no-require-imports -- Updates localized public error messages. */
const fs = require('node:fs');
const path = require('node:path');
const copy = {
  en: 'An unexpected problem stopped this page from loading. Try again, or start from the home page.',
  de: 'Ein unerwartetes Problem hat das Laden dieser Seite verhindert. Versuchen Sie es erneut oder öffnen Sie die Startseite.',
  fr: 'Un problème inattendu a empêché le chargement de cette page. Réessayez ou revenez à l’accueil.',
  es: 'Un problema inesperado impidió cargar esta página. Inténtalo de nuevo o vuelve al inicio.',
  pt: 'Um problema inesperado impediu o carregamento desta página. Tente novamente ou volte à página inicial.',
  it: 'Un problema imprevisto ha impedito il caricamento della pagina. Riprova oppure torna alla pagina iniziale.',
  nl: 'Een onverwacht probleem heeft het laden van deze pagina gestopt. Probeer het opnieuw of ga naar de startpagina.',
  ru: 'Непредвиденная ошибка помешала загрузить страницу. Попробуйте снова или вернитесь на главную.',
  tr: 'Beklenmeyen bir sorun bu sayfanın yüklenmesini engelledi. Yeniden deneyin veya ana sayfaya dönün.',
  ja: '予期しない問題によりページを読み込めませんでした。もう一度試すか、ホームページに戻ってください。',
  zh: '发生意外问题，无法加载此页面。请重试，或返回首页。',
};
for (const [language, value] of Object.entries(copy)) {
  const filename = path.join(__dirname, '../src/lib/i18n/dictionaries', language + '.json');
  const dictionary = JSON.parse(fs.readFileSync(filename, 'utf8'));
  dictionary['error.body'] = value;
  fs.writeFileSync(filename, JSON.stringify(dictionary, null, 2) + '\n');
}
