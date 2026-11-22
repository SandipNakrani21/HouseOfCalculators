/** Focused additions to ten historically visible pages; no generated SEO filler. */
export type PageLearning = {
  title: string;
  answer: string;
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  notes: readonly string[];
  links: readonly { href: string; label: string }[];
  sources?: readonly { href: string; label: string }[];
  reviewed?: string;
};

const nist = {
  href: "https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9",
  label: "NIST SP 811 — Conversion factors",
};

const pages: Record<string, PageLearning> = {
  "/en-us/calculators/finance/loan": {
    title: "How can I check a monthly loan payment?",
    answer: "Start with a zero-interest check: borrowing $12,000 for 24 monthly payments at 0% gives $500 per month. At a fixed nominal annual rate of 6%, the monthly rate is 0.5% and the payment is about $531.85. The first month's interest is $60; the rest of that payment reduces the balance.",
    caption: "$12,000 loan over 24 months, with no fees or extra payments",
    columns: ["Check", "0% annual rate", "6% annual rate"],
    rows: [
      ["Monthly payment", "$500.00", "About $531.85"],
      ["First month's interest", "$0.00", "$60.00"],
      ["First month's principal", "$500.00", "About $471.85"],
      ["Balance after the first payment", "$11,500.00", "About $11,528.15"],
    ],
    notes: [
      "These are separate illustrations, not the calculator's starting inputs. Enter 12000 as the amount, 2 years as the term and 0% or 6% as the annual interest rate to reproduce them.",
      "The formula keeps precision between payments. Multiplying the displayed payment rounded to cents by 24 can differ slightly from the total calculated before rounding. A lender may round each installment or adjust the final payment differently.",
    ],
    links: [{ href: "/en-us/guides/practical/how-to-read-an-amortisation-schedule", label: "Read the principal, interest and balance columns" }],
    sources: [{ href: "https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/", label: "CFPB — Interest rate and APR" }],
  },
  "/en-us/charts/math/multiplication-table": {
    title: "How do I find a missing factor in the times table?",
    answer: "Multiplication and division use the same relationship. If row 7 and column 8 meet at 56, then 7 × 8 = 56 and 56 ÷ 7 = 8. To find the missing factor in 7 × ? = 56, follow row 7 to 56 and read the column heading.",
    caption: "Three questions answered by the same table cell",
    columns: ["Question", "Result", "How to read the grid"],
    rows: [
      ["7 × 8", "56", "Row 7, column 8"],
      ["56 ÷ 7", "8", "Find 56 in row 7, then read its column"],
      ["7 × ? = 56", "8", "The missing factor is the column heading"],
    ],
    notes: [
      "The grid covers factors 1 through 12, so a missing row does not mean an operation is impossible. For example, 0 × 8 = 0, although this table has no zero row. Division by zero is undefined.",
      "Use a row and column together: a product such as 24 appears more than once because different factor pairs can produce it. Clearing the filter restores the whole table.",
    ],
    links: [{ href: "/en-us/tools/number-math/factor-finder", label: "Find all factors of a number" }],
  },
  "/en-us/converters/weight": {
    title: "Which ton and ounce does this converter use?",
    answer: "A metric ton, also called a tonne, is 1,000 kilograms. The US ton in this converter is the short ton: 2,000 pounds, or exactly 907.18474 kilograms. Ounce means an avoirdupois unit of mass, not a fluid ounce. Choose the named unit before comparing a measurement with a weight limit.",
    caption: "Similar unit names with different meanings",
    columns: ["Selected unit", "Equivalent", "Meaning"],
    rows: [
      ["1 metric ton (tonne)", "1,000 kg", "Metric mass"],
      ["1 US ton", "907.18474 kg", "US short ton; not a British long ton"],
      ["16 ounces", "1 pound", "Mass ounces; not fluid ounces"],
    ],
    notes: [
      "Converting a fluid volume to mass also requires the material's density. A volume measured in fluid ounces cannot be entered as mass ounces simply because the names are similar.",
      "Use the unrounded result for another calculation and round only for display. This avoids compounding rounding differences when converting back to the original unit.",
    ],
    links: [{ href: "/en-us/converters/volume", label: "Convert fluid-volume units" }],
    sources: [nist],
  },
  "/en-us/converters": {
    title: "How do I choose the right unit converter?",
    answer: "Choose the measured quantity first: length, area and volume need different factors even when their unit names look alike. A foot measures length, a square foot measures area, and a cubic foot measures volume. Temperature is different again: Fahrenheit-to-Celsius conversion needs an offset as well as a scale factor.",
    caption: "Match the quantity to its converter",
    columns: ["Quantity", "Example", "Calculation"],
    rows: [
      ["Length", "1 ft = 0.3048 m", "Use the length factor"],
      ["Area", "1 ft² = 0.09290304 m²", "Square the length factor"],
      ["Volume", "1 ft³ = 0.028316846592 m³", "Cube the length factor"],
      ["Temperature", "32 °F = 0 °C", "Subtract 32, then multiply by 5/9"],
    ],
    notes: [
      "Check the unit symbol on the original measurement. Applying a length factor directly to an area or volume gives the wrong result.",
      "The directory covers unit conversions. Converting between different quantities, such as liters and kilograms, needs additional information such as density.",
    ],
    links: [
      { href: "/en-us/converters/area", label: "Area converter" },
      { href: "/en-us/converters/volume", label: "Volume converter" },
      { href: "/en-us/converters/temperature", label: "Temperature converter" },
    ],
    sources: [nist],
  },
  "/en-us/converters/area/square-feet-to-square-meters": {
    title: "How many square meters are in a 12 ft by 10 ft room?",
    answer: "A rectangular room measuring 12 feet by 10 feet has an area of 120 square feet. Multiply 120 by the exact square-foot factor, 0.09290304, to get 11.1483648 square meters. Rounded to four decimal places, the area is 11.1484 m². This example assumes the dimensions describe a rectangle.",
    caption: "Two ways to calculate the same rectangular area",
    columns: ["Method", "Working", "Area"],
    rows: [
      ["Convert the area", "120 ft² × 0.09290304", "11.1483648 m²"],
      ["Convert both sides first", "3.6576 m × 3.048 m", "11.1483648 m²"],
      ["Round the final result", "11.1483648 to four decimal places", "11.1484 m²"],
    ],
    notes: [
      "Enter 120 into this square-feet-to-square-meters converter. Do not enter the two side lengths as though they were already an area.",
      "The factor for a foot is 0.3048, but the factor for a square foot is 0.3048 × 0.3048. For a room with recesses or irregular boundaries, calculate suitable sections before converting the total area.",
    ],
    links: [{ href: "/en-us/converters/length/feet-to-meters", label: "Convert feet to meters for each side" }],
    sources: [nist],
  },
  "/it-it/countries/it/income-tax": {
    title: "Come si passa dal lordo annuo al netto stimato?",
    answer: "Nell'esempio del modello 2026, un reddito lordo di 60.000 € produce un netto annuo stimato di 37.835,50 €. Il calcolo sottrae 5.551,76 € di contributi e 16.612,74 € di imposte complessive. Queste ultime comprendono 1.000 € di addizionali regionali e comunali inserite come importo già accertato.",
    caption: "Riconciliazione dell'esempio: dipendente ordinario FPLD per l'intero anno",
    columns: ["Voce", "Importo annuo"],
    rows: [
      ["Reddito lordo", "60.000,00 €"],
      ["IVS di base: 60.000 × 9,19%", "5.514,00 €"],
      ["IVS aggiuntiva: (60.000 − 56.224) × 1%", "37,76 €"],
      ["Imponibile dopo i contributi modellati", "54.448,24 €"],
      ["IRPEF nazionale nell'esempio", "15.612,74 €"],
      ["Addizionali inserite separatamente", "1.000,00 €"],
      ["Netto: lordo − contributi − imposte complessive", "37.835,50 €"],
    ],
    notes: [
      "L'esempio usa la prima assicurazione pensionistica dopo il 1995, zero altri contributi obbligatori e nessuna detrazione da lavoro al livello di imponibile mostrato. Le aliquote nazionali del modello sono 23%, 33% e 43% per i rispettivi scaglioni; non si applica il 43% a tutto il reddito.",
      "Le addizionali sono già comprese nelle imposte complessive: non sottrarle una seconda volta. Il netto annuo diviso per 12 è una media, non la previsione di una singola busta paga. Restano valide tutte le esclusioni riportate nelle ipotesi del modello.",
    ],
    links: [{ href: "/it-it/countries/it/salary", label: "Confronta gli importi annuali e mensili nello strumento stipendio" }],
    sources: [
      { href: "https://temi.camera.it/leg19/temi/19_tl18_irpef", label: "Camera dei deputati — Scaglioni IRPEF" },
      { href: "https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.02.lavoratori-dipendenti-limite-minimo-di-retribuzione-giornaliera-2026.html", label: "INPS — Limiti contributivi 2026" },
    ],
  },
  "/es-es/converters/weight": {
    title: "¿Por qué una conversión de ida y vuelta puede variar al redondear?",
    answer: "Al convertir 2,5 kg a libras se obtiene aproximadamente 5,5115565546 lb. Si redondeas primero a 5,5116 lb y vuelves a kilogramos, el resultado es aproximadamente 2,5000197065 kg. La pequeña diferencia procede del redondeo intermedio; no significa que haya cambiado la relación entre kilogramo y libra.",
    caption: "Ejemplo de redondeo intermedio",
    columns: ["Paso", "Valor"],
    rows: [
      ["Medida inicial", "2,5 kg"],
      ["Conversión antes de redondear, aproximadamente", "5,5115565546 lb"],
      ["Libras redondeadas a cuatro decimales", "5,5116 lb"],
      ["Conversión de ese valor redondeado a kg", "2,5000197065 kg, aproximadamente"],
    ],
    notes: [
      "Para hacer otra operación, conserva la mayor precisión disponible y redondea el resultado final. La tabla muestra valores ilustrativos; el número de decimales visibles depende del formato del conversor.",
      "Aquí la onza es una unidad de masa. Una onza líquida mide volumen y necesita el conversor de volumen; para relacionarla con masa también hace falta la densidad del material.",
    ],
    links: [{ href: "/es-es/converters/weight/pounds-to-kilograms", label: "Comprueba la conversión de libras a kilogramos" }],
    sources: [nist],
  },
  "/it-it/tools/number-math/words-to-number": {
    title: "Quali parole inglesi posso trasformare in cifre?",
    answer: "Lo strumento legge numeri espressi in inglese, anche se questa pagina è in italiano. Per esempio, «one thousand two hundred thirty-four» dà 1.234 e «negative forty-two point five» dà −42,5. Usa la scala corta inglese: «one billion» indica un miliardo, non mille miliardi. Non interpreta «mille» o altre parole italiane.",
    caption: "Esempi da inserire esattamente come scritti",
    columns: ["Testo inglese", "Valore numerico"],
    rows: [
      ["one thousand two hundred thirty-four", "1.234"],
      ["negative forty-two point five", "−42,5"],
      ["one million", "1.000.000"],
      ["one billion", "1.000.000.000"],
    ],
    notes: [
      "La virgola e i punti nella colonna dei risultati seguono il formato italiano. Nel testo da leggere, invece, la parte decimale si introduce con la parola inglese «point».",
      "Il parser accetta al massimo due cifre decimali e numeri entro il limite indicato nelle ipotesi. Un messaggio di errore segnala un'espressione non riconosciuta: non equivale al risultato zero.",
    ],
    links: [{ href: "/it-it/tools/number-math/number-to-words", label: "Esegui l'operazione inversa: da cifre a parole inglesi" }],
  },
  "/it-it/converters/length": {
    title: "Come converto piedi e pollici senza confonderli con piedi decimali?",
    answer: "Cinque piedi e otto pollici non sono 5,8 piedi. Converti prima tutto in una sola unità: 5 × 12 + 8 = 68 pollici, equivalenti a 1,7272 metri. Nel convertitore scegli Pollice come unità di partenza e Metro come destinazione, poi inserisci 68. Il campo numerico non interpreta espressioni composte.",
    caption: "Tre misure da non confondere",
    columns: ["Misura", "Come inserirla", "Risultato in metri"],
    rows: [
      ["5 piedi e 6 pollici", "66 pollici, oppure 5,5 piedi", "1,6764 m"],
      ["5 piedi e 8 pollici", "68 pollici", "1,7272 m"],
      ["5,8 piedi decimali", "5,8 piedi", "1,76784 m"],
    ],
    notes: [
      "Un piede contiene 12 pollici, non 10. La parte decimale di 5,8 piedi è quindi 0,8 × 12 = 9,6 pollici.",
      "Queste conversioni usano il piede internazionale di 0,3048 m e il pollice di 0,0254 m. I risultati visualizzati possono essere arrotondati; conserva più cifre prima di effettuare altri calcoli.",
    ],
    links: [{ href: "/it-it/converters/length/feet-to-meters", label: "Converti direttamente piedi decimali in metri" }],
    sources: [nist],
  },
  "/ru-ru/guides/how-to-calculate/how-to-calculate-percentage": {
    title: "Можно ли усреднять проценты двух групп?",
    answer: "Среднее двух процентов не всегда равно проценту от общего числа наблюдений. Если в первой группе событие произошло в 10 случаях из 20, а во второй — в 20 из 100, общий результат равен 30 из 120, то есть 25%. Простое среднее 50% и 20% даст 35% и здесь будет неверным.",
    caption: "Непересекающиеся группы, одно событие и один период",
    columns: ["Группа", "Событий", "Всего наблюдений", "Доля"],
    rows: [
      ["А", "10", "20", "50%"],
      ["Б", "20", "100", "20%"],
      ["Вместе", "30", "120", "25%"],
    ],
    notes: [
      "Для общей доли сложите числители и знаменатели отдельно: (10 + 20) ÷ (20 + 100) × 100 = 25%. Это взвешенное объединение, а не среднее двух готовых процентов.",
      "Объединяйте только сопоставимые показатели. Если группы пересекаются, относятся к разным событиям или имеют разные определения знаменателя, сначала уточните данные. При нулевом общем знаменателе доля не определена.",
    ],
    links: [{ href: "/ru-ru/tools/number-math/percentage", label: "Рассчитать долю от общего количества" }],
    reviewed: "2026-11-21",
  },
};

export function pageLearning(path?: string): PageLearning | undefined {
  return path ? pages[path] : undefined;
}

export const PAGE_LEARNING_PATHS = Object.keys(pages);
