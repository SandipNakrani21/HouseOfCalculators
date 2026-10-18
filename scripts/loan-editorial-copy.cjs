/* eslint-disable @typescript-eslint/no-require-imports -- Localized model explanations. */
const fs=require('node:fs'),path=require('node:path');
const keys=['comparison.loan.title','comparison.loan.intro','comparison.loan.base','comparison.loan.scope','comparison.loan.apr','calc.mortgage.costs','calc.loan.rateAssumption'];
const copy={
 en:[
  'Compare the cost of changing one assumption',
  'These illustrations start with the worked-example inputs above. Each other row changes only the named input; all remaining inputs stay at the example values. They do not update when you edit the calculator.',
  'Worked-example inputs',
  'The comparison holds the interest rate fixed throughout each scenario. A shorter term can increase the monthly payment while reducing total interest. A larger down payment reduces borrowing at the same purchase price; it also requires more cash upfront.',
  'The entered rate is a nominal annual interest rate divided by 12, not an APR that includes fees. Compare lender documents, charges and repayment conditions separately. The CFPB reference below explains this distinction for US mortgages; it does not verify local lending rules.',
  'The loan amount is the property price minus the percentage down payment. The result covers principal and interest only. Property taxes, insurance, mortgage insurance, closing costs and maintenance can increase the monthly housing budget. Total payable here excludes the down payment and those additional costs.',
  'Starting rates are illustrative assumptions, not current market rates or offers. This model assumes equal end-of-month repayments, monthly interest and no rate changes. Enter the terms of the actual loan; payment holidays, daily interest and income-contingent repayments require a different model.',
 ],
 de:[
  'Die Kosten einer einzelnen Änderung vergleichen',
  'Diese Beispiele verwenden die Eingaben des Rechenbeispiels oben. Jede weitere Zeile ändert nur die genannte Eingabe; alle anderen Werte bleiben gleich. Änderungen am Rechner aktualisieren diese Beispiele nicht.',
  'Eingaben des Rechenbeispiels',
  'Der Zinssatz bleibt in jedem Szenario konstant. Eine kürzere Laufzeit kann die Monatsrate erhöhen und die Gesamtzinsen senken. Eine höhere Anzahlung verringert bei gleichem Kaufpreis den Kredit, erfordert aber mehr Geld zu Beginn.',
  'Der eingegebene nominale Jahreszins wird durch 12 geteilt; er ist kein effektiver Jahreszins einschließlich Gebühren. Vergleichen Sie Kreditunterlagen, Kosten und Bedingungen gesondert. Die CFPB-Quelle erläutert US-Hypotheken, nicht lokale Kreditregeln.',
  'Der Kreditbetrag ist der Kaufpreis abzüglich der prozentualen Anzahlung. Berechnet werden nur Tilgung und Zinsen. Grundsteuer, Versicherungen, Abschlusskosten und Instandhaltung können das Wohnbudget erhöhen. Die Gesamtsumme hier enthält weder Anzahlung noch diese Zusatzkosten.',
  'Startzinssätze sind Beispielannahmen, keine aktuellen Marktzinssätze oder Angebote. Das Modell verwendet gleiche Zahlungen am Monatsende, monatliche Zinsen und konstante Zinssätze. Verwenden Sie die echten Kreditbedingungen; Zahlungspausen, Tageszinsen und einkommensabhängige Rückzahlungen brauchen ein anderes Modell.',
 ],
 fr:[
  'Comparer le coût d’une seule modification',
  'Ces illustrations utilisent les données de l’exemple ci-dessus. Chaque autre ligne ne modifie que le paramètre indiqué. Les autres valeurs restent identiques. Modifier le calculateur ne met pas ces exemples à jour.',
  'Données de l’exemple',
  'Le taux reste constant dans chaque scénario. Une durée plus courte peut augmenter la mensualité et réduire les intérêts totaux. Un apport supérieur réduit l’emprunt au même prix d’achat, mais exige davantage de liquidités au départ.',
  'Le taux saisi est un taux nominal annuel divisé par 12, pas un TAEG incluant les frais. Comparez séparément documents, frais et conditions du prêteur. La référence CFPB explique les prêts immobiliers américains, sans vérifier les règles locales.',
  'Le capital emprunté correspond au prix diminué de l’apport en pourcentage. Le résultat couvre seulement capital et intérêts. Impôts fonciers, assurances, frais de dossier et entretien augmentent le budget logement. Le total affiché exclut l’apport et ces frais.',
  'Les taux initiaux sont illustratifs, pas des taux de marché actuels ou des offres. Le modèle suppose des paiements égaux en fin de mois, des intérêts mensuels et un taux constant. Utilisez les conditions réelles; reports, intérêts journaliers et remboursements selon le revenu exigent un autre modèle.',
 ],
 es:[
  'Compara el coste de cambiar una sola suposición',
  'Estas ilustraciones usan los datos del ejemplo anterior. Cada fila adicional cambia solo la entrada indicada; las demás permanecen iguales. No se actualizan al editar la calculadora.',
  'Datos del ejemplo',
  'El tipo se mantiene fijo en cada escenario. Un plazo menor puede aumentar la cuota mensual y reducir los intereses totales. Una entrada mayor reduce el préstamo al mismo precio de compra, pero exige más dinero al inicio.',
  'El tipo introducido es nominal anual dividido entre 12, no una TAE que incluya comisiones. Compara aparte documentos, gastos y condiciones del prestamista. La referencia CFPB explica hipotecas estadounidenses; no verifica normas locales.',
  'El préstamo es el precio menos la entrada porcentual. El resultado cubre solo capital e intereses. Impuestos, seguros, gastos de formalización y mantenimiento pueden elevar el presupuesto. El total mostrado excluye la entrada y esos costes.',
  'Los tipos iniciales son supuestos ilustrativos, no tipos actuales ni ofertas. El modelo supone cuotas iguales al final de cada mes, interés mensual y tipo fijo. Introduce las condiciones reales; carencias, interés diario y pagos según ingresos necesitan otro modelo.',
 ],
 pt:[
  'Compare o custo de alterar uma hipótese',
  'Estas ilustrações usam os dados do exemplo acima. Cada outra linha altera apenas a entrada indicada; as restantes mantêm-se. Não são atualizadas ao editar a calculadora.',
  'Dados do exemplo',
  'A taxa permanece fixa em cada cenário. Um prazo menor pode aumentar a prestação e reduzir os juros totais. Uma entrada maior reduz o empréstimo ao mesmo preço, mas exige mais dinheiro inicialmente.',
  'A taxa introduzida é nominal anual dividida por 12, não uma taxa efetiva com encargos. Compare documentos, custos e condições do credor separadamente. A referência CFPB explica hipotecas dos EUA; não verifica regras locais.',
  'O empréstimo é o preço menos a entrada percentual. O resultado inclui apenas capital e juros. Impostos, seguros, despesas de contratação e manutenção podem aumentar o orçamento habitacional. O total exclui a entrada e estes custos.',
  'As taxas iniciais são hipóteses ilustrativas, não taxas atuais nem ofertas. O modelo assume prestações iguais no fim do mês, juros mensais e taxa constante. Use condições reais; carências, juros diários e pagamentos conforme rendimento precisam de outro modelo.',
 ],
 it:[
  'Confronta il costo modificando una sola ipotesi',
  'Queste illustrazioni usano i dati dell’esempio precedente. Ogni altra riga modifica solo il dato indicato; gli altri restano uguali. Non si aggiornano modificando il calcolatore.',
  'Dati dell’esempio',
  'Il tasso resta fisso in ogni scenario. Una durata minore può aumentare la rata e ridurre gli interessi totali. Un anticipo maggiore riduce il prestito a parità di prezzo, ma richiede più denaro iniziale.',
  'Il tasso inserito è nominale annuo diviso per 12, non un TAEG comprensivo di spese. Confronta separatamente documenti, costi e condizioni del finanziatore. La fonte CFPB spiega i mutui statunitensi, senza verificare le norme locali.',
  'Il prestito è il prezzo meno l’anticipo percentuale. Il risultato comprende solo capitale e interessi. Imposte, assicurazioni, spese iniziali e manutenzione possono aumentare il budget abitativo. Il totale esclude anticipo e costi aggiuntivi.',
  'I tassi iniziali sono ipotesi illustrative, non tassi attuali o offerte. Il modello assume rate uguali a fine mese, interessi mensili e tasso costante. Usa i termini reali; sospensioni, interessi giornalieri e rimborsi legati al reddito richiedono un altro modello.',
 ],
 nl:[
  'Vergelijk de kosten van één gewijzigde aanname',
  'Deze voorbeelden gebruiken de invoer van het rekenvoorbeeld hierboven. Elke andere rij wijzigt alleen het genoemde veld; de rest blijft gelijk. Ze veranderen niet mee wanneer u de calculator bewerkt.',
  'Invoer van het rekenvoorbeeld',
  'De rente blijft per scenario constant. Een kortere looptijd kan de maandlast verhogen en de totale rente verlagen. Een hogere aanbetaling verlaagt de lening bij dezelfde koopprijs, maar vereist meer geld vooraf.',
  'De ingevoerde nominale jaarrente wordt gedeeld door 12 en is geen jaarlijks kostenpercentage inclusief kosten. Vergelijk documenten, kosten en voorwaarden apart. De CFPB-bron legt Amerikaanse hypotheken uit, niet de plaatselijke kredietregels.',
  'De lening is de koopprijs min de procentuele aanbetaling. Het resultaat omvat alleen aflossing en rente. Belastingen, verzekeringen, afsluitkosten en onderhoud kunnen het woonbudget verhogen. Het totaal omvat de aanbetaling en deze extra kosten niet.',
  'Beginrentes zijn rekenaannames, geen actuele marktrentes of aanbiedingen. Het model gebruikt gelijke betalingen aan het maandeinde, maandrente en een vaste rente. Gebruik echte voorwaarden; betaalpauzes, dagrente en inkomensaflossing vereisen een ander model.',
 ],
 ru:[
  'Сравните стоимость при изменении одного условия',
  'Здесь используются данные примера выше. Каждая следующая строка меняет только указанный параметр. Остальные значения прежние. Изменения в калькуляторе не обновляют эти примеры.',
  'Данные исходного примера',
  'В каждом сценарии ставка постоянна. Более короткий срок может увеличить ежемесячный платеж и снизить общие проценты. Больший первоначальный взнос уменьшает заем при той же цене, но требует больше денег сразу.',
  'Введенная номинальная годовая ставка делится на 12; это не полная стоимость кредита с комиссиями. Сравнивайте документы, расходы и условия отдельно. Источник CFPB относится к ипотеке США и не подтверждает местные правила.',
  'Сумма займа равна цене за вычетом процентного первоначального взноса. Результат включает только долг и проценты. Налоги, страхование, оформление и содержание жилья увеличивают бюджет. Итог не включает первоначальный взнос и эти расходы.',
  'Начальные ставки — иллюстративные допущения, не текущие ставки или предложения. Модель предполагает равные платежи в конце месяца, ежемесячные проценты и постоянную ставку. Отсрочки, ежедневные проценты и платежи по доходу требуют другой модели.',
 ],
 tr:[
  'Tek bir varsayımı değiştirmenin maliyetini karşılaştırın',
  'Bu örnekler yukarıdaki hesaplama örneğinin girdilerini kullanır. Her diğer satır yalnızca belirtilen girdiyi değiştirir; diğerleri aynı kalır. Hesaplayıcıyı düzenlediğinizde bu örnekler güncellenmez.',
  'Örneğin başlangıç girdileri',
  'Faiz her senaryoda sabittir. Kısa vade aylık ödemeyi artırıp toplam faizi azaltabilir. Daha yüksek peşinat aynı satın alma fiyatında borcu azaltır ancak başlangıçta daha fazla nakit gerektirir.',
  'Girilen oran, 12’ye bölünen nominal yıllık faizdir; ücretleri içeren yıllık maliyet oranı değildir. Kredi belgelerini, masrafları ve şartları ayrıca karşılaştırın. CFPB kaynağı ABD konut kredilerini açıklar, yerel kuralları doğrulamaz.',
  'Kredi tutarı, fiyat eksi yüzde peşinattır. Sonuç yalnızca anapara ve faizi kapsar. Vergiler, sigorta, kapanış masrafları ve bakım konut bütçesini artırabilir. Toplam, peşinatı ve bu ek maliyetleri içermez.',
  'Başlangıç oranları örnek varsayımlardır; güncel piyasa oranı veya teklif değildir. Model ay sonunda eşit ödemeler, aylık faiz ve sabit oran varsayar. Ödeme tatilleri, günlük faiz ve gelire bağlı geri ödeme başka model gerektirir.',
 ],
 ja:[
  '条件を一つ変えた場合の費用を比較',
  '上の計算例の入力を使用します。他の各行は表示された入力だけを変更し、残りは同じです。計算ツールの入力を編集しても、この例は更新されません。',
  '計算例の元の入力',
  '各例では金利を一定とします。期間を短くすると月額返済が増え、総利息が減る場合があります。購入価格が同じなら頭金を増やすと借入額が減りますが、初期資金が多く必要です。',
  '入力金利は名目年利を12で割る方式で、手数料込みの実質年率ではありません。貸し手の書類、費用、返済条件は別途比較してください。CFPB資料は米国の住宅ローンの説明であり、地域の融資規則を検証するものではありません。',
  '借入額は物件価格から頭金の割合分を引いた額です。結果は元本と利息のみです。固定資産税、保険、契約費用、維持費は住宅予算を増やします。表示する総額には頭金とこれらの追加費用を含みません。',
  '初期金利は例示の仮定で、現在の市場金利や融資の提示ではありません。毎月末の均等返済、月利、固定金利を仮定します。実際の条件を入力してください。返済猶予、日割利息、所得連動返済には別のモデルが必要です。',
 ],
 zh:[
  '比较改变单个假设后的成本',
  '这些示例使用上方算例的输入。其他每行只改变标明的输入，其余保持不变。修改计算器时，这些示例不会随之更新。',
  '原算例输入',
  '每个情景内的利率保持不变。缩短期限可能增加月供并减少总利息。在购价相同的情况下，增加首付可减少借款，但需要更多前期资金。',
  '输入利率按名义年利率除以12计算，并非包含费用的综合年利率。请另外比较贷款文件、费用及还款条件。下方CFPB资料解释美国房贷的区别，不验证当地贷款规则。',
  '借款额等于房价减去按比例计算的首付。结果只包含本金和利息。房产税、保险、成交费用及维护费用会增加住房预算。这里的总还款不包括首付及这些额外费用。',
  '初始利率仅为示例假设，并非当前市场利率或报价。模型假定月末等额还款、按月计息且利率固定。请输入真实贷款条件；延期还款、按日计息和收入挂钩还款需要其他模型。',
 ],
};
for(const [language,values] of Object.entries(copy)){
 if(values.length!==keys.length)throw Error(language);
 const file=path.join(__dirname,'../src/lib/i18n/dictionaries',language+'.json');
 const dict=JSON.parse(fs.readFileSync(file,'utf8'));
 keys.forEach((key,i)=>dict[key]=values[i]);
 const countryCopy={
  en:'Currency, units and number formatting for {count} countries. Published country-rule models are listed below.',
  de:'Währungen, Einheiten und Zahlenformate für {count} Länder. Veröffentlichte länderspezifische Modelle stehen unten.',
  fr:'Devises, unités et formats numériques pour {count} pays. Les modèles nationaux publiés figurent ci-dessous.',
  es:'Monedas, unidades y formatos numéricos para {count} países. Los modelos nacionales publicados aparecen abajo.',
  pt:'Moedas, unidades e formatos numéricos para {count} países. Os modelos nacionais publicados estão abaixo.',
  it:'Valute, unità e formati numerici per {count} paesi. I modelli nazionali pubblicati sono elencati sotto.',
  nl:'Valuta, eenheden en getalnotatie voor {count} landen. Gepubliceerde landmodellen staan hieronder.',
  ru:'Валюты, единицы и форматы чисел для {count} стран. Опубликованные страновые модели перечислены ниже.',
  tr:'{count} ülke için para birimi, birim ve sayı biçimleri. Yayımlanan ülke modelleri aşağıdadır.',
  ja:'{count}か国の通貨・単位・数値形式に対応。公開済みの国別モデルは以下に掲載しています。',
  zh:'支持{count}个国家的货币、单位和数字格式。已发布的国家规则模型列在下方。',
 };
 dict['home.world.subtitle']=countryCopy[language];
 fs.writeFileSync(file,JSON.stringify(dict,null,2)+'\n');
}
