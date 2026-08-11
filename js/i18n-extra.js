// Extra UI strings for the redesigned homepage sections.
// Merged into the base I18N_DICT (loaded right after i18n.js, before DOMContentLoaded apply()).
(function () {
  if (!window.I18N_DICT) return;
  const EXTRA = {
    en: {
      "nav.winery": "Winery",
      "nav.awards": "Awards",
      "nav.blog": "Blog",

      "hero.discover": "Discover our story",
      "hero.s1.text": "Akhmeteli Winery — authentic Georgian wine, born of native grape varieties and rooted in Akhmeta's eight-thousand-year tradition.",
      "hero.s2.text": "Fermented in clay qvevri buried in the earth, the way Kakheti has made wine since the dawn of winemaking itself.",
      "hero.s3.text": "Skin-contact amber wines of striking depth — apricot, dried fruit and quince, structured by gentle tannins.",
      "coll.all": "All",

      "hero2.eyebrow": "Authentic Georgian Wine",
      "hero2.title": "Akhmeteli Winery",
      "hero2.sub": "Authentic Georgian Wine from Kakheti",
      "hero2.text": "Crafted from Georgian grape varieties, rooted in Akhmeta and Kakheti's winemaking tradition.",
      "hero2.cta1": "Explore Wines",
      "hero2.cta2": "Shop Now",

      "story.eyebrow": "The Collection · 12 Labels",
      "story.title": "The Wine Story",
      "story.hint": "Scroll to explore",
      "story.grape": "Grape",
      "story.region": "Region",
      "story.serve": "Serving",
      "story.shop": "Add to cart",

      "chacha.eyebrow": "Stronger Spirit",
      "chacha.title": "Chacha",
      "chacha.text": "Traditional Georgian grape distillate — clean, warming, and bold.",

      "awards.eyebrow": "Trust & Recognition",
      "awards.title": "International Recognition",
      "awards.text": "Our wines have been recognised at international competitions and exhibitions.",

      "testi.eyebrow": "In Their Words",
      "testi.title": "What customers say about Akhmeteli",
      "testi.1.text": "“Every bottle tells the story of Kakheti. The Saperavi is rich, deep and unforgettable — the closest I’ve come to drinking history.”",
      "testi.1.name": "Nino Tatishvili",
      "testi.1.role": "Wine Collector",
      "testi.2.text": "“We’ve poured Akhmeteli wines at our restaurant for two years. Guests always ask about the amber Rkatsiteli — qvevri winemaking at its finest.”",
      "testi.2.name": "Luca Romano",
      "testi.2.role": "Sommelier",
      "testi.3.text": "“Visiting the winery in Akhmeta was the highlight of our trip. Warm people, honest wine, and a tradition you can taste in every glass.”",
      "testi.3.name": "Sarah Müller",
      "testi.3.role": "Visitor",

      "faq.eyebrow": "Good to Know",
      "faq.title": "Frequently Asked Questions",
      "faq.q1": "Where are Akhmeteli wines made?",
      "faq.a1": "In the Akhmeta district of Kakheti, eastern Georgia — in the heart of the Alazani Valley, where our grapes are grown and the wine matures in traditional qvevri.",
      "faq.q2": "What is qvevri wine?",
      "faq.a2": "Qvevri are large clay vessels buried in the earth, used in Georgia for over 8,000 years. Wine ferments and ages in them naturally, giving our amber wines their depth and character — a UNESCO-listed heritage.",
      "faq.q3": "Do you ship and deliver?",
      "faq.a3": "Yes. We deliver across Georgia and arrange international shipping on request. Contact us for wholesale and export enquiries.",
      "faq.q4": "Can I visit the winery for a tasting?",
      "faq.a4": "Absolutely. We welcome guests for tastings and cellar tours by appointment. Call or message us to book your visit to Akhmeta.",
      "faq.q5": "Are your wines natural?",
      "faq.a5": "Our wines are made the traditional way — native Georgian grapes, spontaneous fermentation in qvevri, and minimal intervention, so the true character of the vineyard speaks.",

      "blog.eyebrow": "Journal",
      "blog.title": "Stories from Akhmeteli Winery",
      "blog.text": "Georgian wine culture, qvevri tradition, food pairings and life in Kakheti.",
      "blog.read": "Read more",
      "blog.post1": "What is Qvevri wine?",
      "blog.post1.x": "8,000 years of winemaking sealed in clay beneath the earth.",
      "blog.post2": "Saperavi, explained",
      "blog.post2.x": "Georgia's flagship red grape — deep, ruby and age-worthy.",
      "blog.post3": "Wine tourism in Kakheti",
      "blog.post3.x": "Cellars, supra tables and vineyards across the Alazani Valley.",

      "visit.eyebrow": "Find Us",
      "visit.title": "Visit Akhmeteli",
      "visit.call": "Call Now",
      "visit.directions": "Get Directions",
      "visit.whatsapp": "WhatsApp",
      "visit.book": "Book Wine Tasting",

      "footer.main": "Main",
      "footer.legal": "Legal",
      "footer.social": "Social",
      "footer.wines": "Wines",
      "footer.chacha": "Chacha",
      "footer.blog": "Blog",
      "footer.terms": "Terms & Conditions",
      "footer.privacy": "Privacy Policy",
      "footer.delivery": "Delivery Policy",
      "footer.return": "Return Policy",
      "footer.payment": "Payment Policy",

      "meta.title.shop": "Shop — Akhmeteli Winery",
      "meta.title.product": "Product — Akhmeteli Winery",
      "meta.title.gallery": "Gallery — Akhmeteli Winery",
      "meta.title.contact": "Contact — Akhmeteli Winery",
      "page.eyebrow": "AKHMETA · KAKHETI",
      "foot.region": "Akhmeta · Kakheti · Georgia",

      "shop.filter.reset": "Reset filter",
      "shop.sort.label": "Sort by:",
      "shop.sort.newest": "Newest",
      "shop.f.abv": "Alcohol %",
      "shop.f.vintage": "Vintage Year",
      "shop.f.tech": "Technology",
      "shop.f.grape": "Grape",
      "shop.f.origin": "Origin",
      "shop.buy": "Buy",

      "unit.ml": "ml",
      "unit.abv": "ABV",
      "brand.producer": "Akhmeteli Winery",
      "product.notfound": "Not found."
    },
    ka: {
      "nav.winery": "მარანი",
      "nav.awards": "ჯილდოები",
      "nav.blog": "ბლოგი",

      "hero.discover": "გაიგე ჩვენი ისტორია",
      "hero.s1.text": "ახმეტელის მარანი — ნამდვილი ქართული ღვინო, ადგილობრივი ჯიშებიდან, ახმეტის რვაათასწლოვანი ტრადიციით.",
      "hero.s2.text": "დადუღებული მიწაში ჩაფლულ ქვევრში — ისე, როგორც კახეთი ღვინოს მეღვინეობის გარიჟრაჟიდან აყენებს.",
      "hero.s3.text": "ქარვისფერი ღვინოები განსაკუთრებული სიღრმით — გარგარი, ჩირი და კომში, ნაზი ტანინებით.",
      "coll.all": "ყველა",

      "hero2.eyebrow": "ნამდვილი ქართული ღვინო",
      "hero2.title": "ახმეტელი მარანი",
      "hero2.sub": "ნამდვილი ქართული ღვინო კახეთიდან",
      "hero2.text": "დაყენებული ქართული ჯიშის ყურძნისგან, ახმეტისა და კახეთის მეღვინეობის ტრადიციით.",
      "hero2.cta1": "აღმოაჩინე ღვინოები",
      "hero2.cta2": "შეიძინე",

      "story.eyebrow": "კოლექცია · 12 ეტიკეტი",
      "story.title": "ღვინის ისტორია",
      "story.hint": "გადააფურცლე",
      "story.grape": "ჯიში",
      "story.region": "რეგიონი",
      "story.serve": "სერვირება",
      "story.shop": "კალათაში",

      "chacha.eyebrow": "ძლიერი ხასიათი",
      "chacha.title": "ჭაჭა",
      "chacha.text": "ტრადიციული ქართული ყურძნის დისტილატი — სუფთა, გამათბობელი, ძლიერი.",

      "awards.eyebrow": "ნდობა და აღიარება",
      "awards.title": "საერთაშორისო აღიარება",
      "awards.text": "ჩვენი ღვინოები აღიარებულია საერთაშორისო კონკურსებსა და გამოფენებზე.",

      "testi.eyebrow": "მათი სიტყვებით",
      "testi.title": "რას ამბობენ ახმეტელზე",
      "testi.1.text": "„ყოველი ბოთლი კახეთის ისტორიას ჰყვება. საფერავი მდიდარი, ღრმა და დაუვიწყარია — თითქოს ისტორიას სვამ.“",
      "testi.1.name": "ნინო ტატიშვილი",
      "testi.1.role": "ღვინის კოლექციონერი",
      "testi.2.text": "„ორი წელია ჩვენს რესტორანში ახმეტელის ღვინოს ვასხამთ. სტუმრები ყოველთვის ქარვისფერ რქაწითელზე გვეკითხებიან — ქვევრის მეღვინეობა საუკეთესო სახით.“",
      "testi.2.name": "ლუკა რომანო",
      "testi.2.role": "სომელიე",
      "testi.3.text": "„ახმეტაში მარნის მონახულება ჩვენი მოგზაურობის მთავარი მოვლენა იყო. თბილი ხალხი, გულწრფელი ღვინო და ტრადიცია, რომელიც ყველა ჭიქაში იგრძნობა.“",
      "testi.3.name": "სარა მიულერი",
      "testi.3.role": "სტუმარი",

      "faq.eyebrow": "სასარგებლო ინფორმაცია",
      "faq.title": "ხშირად დასმული კითხვები",
      "faq.q1": "სად მზადდება ახმეტელის ღვინო?",
      "faq.a1": "კახეთში, ახმეტის მუნიციპალიტეტში — ალაზნის ველის გულში, სადაც ვაშენებთ ვენახს და ღვინო ტრადიციულ ქვევრში მწიფდება.",
      "faq.q2": "რა არის ქვევრის ღვინო?",
      "faq.a2": "ქვევრი დიდი თიხის ჭურჭელია, მიწაში ჩაფლული, რომელსაც საქართველოში 8000 წელზე მეტია იყენებენ. ღვინო მასში ბუნებრივად დუღს და მწიფდება — აქედანაა ქარვისფერი ღვინის სიღრმე და ხასიათი. UNESCO-ს მემკვიდრეობა.",
      "faq.q3": "ახორციელებთ მიწოდებას?",
      "faq.a3": "დიახ. ვაწვდით მთელ საქართველოში და მოთხოვნისამებრ ვაწყობთ საერთაშორისო გაგზავნას. დაგვიკავშირდით საბითუმო და საექსპორტო შეკითხვებისთვის.",
      "faq.q4": "შესაძლებელია მარნის მონახულება დეგუსტაციით?",
      "faq.a4": "რა თქმა უნდა. სტუმრებს ვიღებთ დეგუსტაციასა და მარნის ტურზე წინასწარი შეთანხმებით. დაგვირეკეთ ან მოგვწერეთ ვიზიტის დასაჯავშნად.",
      "faq.q5": "ნატურალურია თქვენი ღვინო?",
      "faq.a5": "ჩვენი ღვინო ტრადიციულად მზადდება — ქართული ჯიშები, სპონტანური დადუღება ქვევრში და მინიმალური ჩარევა, რომ ვენახის ნამდვილი ხასიათი ალაპარაკდეს.",

      "blog.eyebrow": "ჟურნალი",
      "blog.title": "ისტორიები ახმეტელის მარნიდან",
      "blog.text": "ქართული ღვინის კულტურა, ქვევრის ტრადიცია, კერძებთან შერჩევა და კახეთის ცხოვრება.",
      "blog.read": "ვრცლად",
      "blog.post1": "რა არის ქვევრის ღვინო?",
      "blog.post1.x": "8000 წლის მეღვინეობა, მიწაში ჩაფლულ თიხაში დაბეჭდილი.",
      "blog.post2": "საფერავი — ახსნილი",
      "blog.post2.x": "საქართველოს მთავარი წითელი ჯიში — ღრმა, ლალისფერი, დასავარგებელი.",
      "blog.post3": "ღვინის ტურიზმი კახეთში",
      "blog.post3.x": "მარნები, სუფრა და ვენახები ალაზნის ველზე.",

      "visit.eyebrow": "გვიპოვე",
      "visit.title": "ეწვიე ახმეტელს",
      "visit.call": "დარეკვა",
      "visit.directions": "მარშრუტი",
      "visit.whatsapp": "WhatsApp",
      "visit.book": "დააჯავშნე დეგუსტაცია",

      "footer.main": "მთავარი",
      "footer.legal": "სამართლებრივი",
      "footer.social": "სოციალური",
      "footer.wines": "ღვინოები",
      "footer.chacha": "ჭაჭა",
      "footer.blog": "ბლოგი",
      "footer.terms": "წესები და პირობები",
      "footer.privacy": "კონფიდენციალურობა",
      "footer.delivery": "მიწოდების პოლიტიკა",
      "footer.return": "დაბრუნების პოლიტიკა",
      "footer.payment": "გადახდის პოლიტიკა",

      "meta.title.shop": "მაღაზია — ახმეტელის მარანი",
      "meta.title.product": "პროდუქტი — ახმეტელის მარანი",
      "meta.title.gallery": "გალერეა — ახმეტელის მარანი",
      "meta.title.contact": "კონტაქტი — ახმეტელის მარანი",
      "page.eyebrow": "ახმეტა · კახეთი",
      "foot.region": "ახმეტა · კახეთი · საქართველო",

      "shop.filter.reset": "ფილტრის გასუფთავება",
      "shop.sort.label": "დახარისხება:",
      "shop.sort.newest": "უახლესი",
      "shop.f.abv": "ალკოჰოლი %",
      "shop.f.vintage": "მოსავლის წელი",
      "shop.f.tech": "ტექნოლოგია",
      "shop.f.grape": "ჯიში",
      "shop.f.origin": "წარმოშობა",
      "shop.buy": "ყიდვა",

      "unit.ml": "მლ",
      "unit.abv": "ალკ.",
      "brand.producer": "ახმეტელის მარანი",
      "product.notfound": "ვერ მოიძებნა."
    },
    ru: {
      "nav.winery": "Винодельня",
      "nav.awards": "Награды",
      "nav.blog": "Блог",

      "hero.discover": "Узнать нашу историю",
      "hero.s1.text": "Винодельня Ахметели — настоящее грузинское вино из местных сортов, в традициях восьмитысячелетней Ахметы.",
      "hero.s2.text": "Сброжено в глиняных квеври, закопанных в землю — так, как Кахетия делает вино с самого зарождения виноделия.",
      "hero.s3.text": "Янтарные вина мацерации поразительной глубины — абрикос, сухофрукты и айва, с мягкими танинами.",
      "coll.all": "Все",

      "hero2.eyebrow": "Настоящее грузинское вино",
      "hero2.title": "Винодельня Ахметели",
      "hero2.sub": "Настоящее грузинское вино из Кахетии",
      "hero2.text": "Создано из грузинских сортов винограда, в традициях виноделия Ахметы и Кахетии.",
      "hero2.cta1": "Открыть вина",
      "hero2.cta2": "В магазин",

      "story.eyebrow": "Коллекция · 12 этикеток",
      "story.title": "История вина",
      "story.hint": "Листайте",
      "story.grape": "Сорт",
      "story.region": "Регион",
      "story.serve": "Подача",
      "story.shop": "В корзину",

      "chacha.eyebrow": "Крепкий характер",
      "chacha.title": "Чача",
      "chacha.text": "Традиционный грузинский виноградный дистиллят — чистый, согревающий, дерзкий.",

      "awards.eyebrow": "Доверие и признание",
      "awards.title": "Международное признание",
      "awards.text": "Наши вина отмечены на международных конкурсах и выставках.",

      "testi.eyebrow": "Их словами",
      "testi.title": "Что говорят о винодельне Ахметели",
      "testi.1.text": "«Каждая бутылка рассказывает историю Кахетии. Саперави — насыщенное, глубокое и незабываемое, будто пьёшь саму историю.»",
      "testi.1.name": "Нино Татишвили",
      "testi.1.role": "Винный коллекционер",
      "testi.2.text": "«Уже два года мы подаём вина Ахметели в нашем ресторане. Гости всегда спрашивают про янтарное Ркацители — квеври-виноделие в лучшем виде.»",
      "testi.2.name": "Лука Романо",
      "testi.2.role": "Сомелье",
      "testi.3.text": "«Визит на винодельню в Ахмете стал главным событием поездки. Тёплые люди, честное вино и традиция, которую чувствуешь в каждом бокале.»",
      "testi.3.name": "Сара Мюллер",
      "testi.3.role": "Гостья",

      "faq.eyebrow": "Полезно знать",
      "faq.title": "Часто задаваемые вопросы",
      "faq.q1": "Где производят вина Ахметели?",
      "faq.a1": "В Ахметском районе Кахетии, на востоке Грузии — в сердце Алазанской долины, где растёт наш виноград, а вино вызревает в традиционных квеври.",
      "faq.q2": "Что такое вино квеври?",
      "faq.a2": "Квеври — большие глиняные сосуды, закопанные в землю; в Грузии их используют более 8000 лет. Вино бродит и созревает в них естественно, придавая янтарным винам глубину и характер. Наследие ЮНЕСКО.",
      "faq.q3": "Доставляете ли вы вино?",
      "faq.a3": "Да. Мы доставляем по всей Грузии и по запросу организуем международную отправку. Свяжитесь с нами по вопросам опта и экспорта.",
      "faq.q4": "Можно ли посетить винодельню с дегустацией?",
      "faq.a4": "Конечно. Мы принимаем гостей на дегустации и экскурсии по марани по предварительной записи. Позвоните или напишите, чтобы забронировать визит в Ахмету.",
      "faq.q5": "Натуральные ли ваши вина?",
      "faq.a5": "Наши вина делаются традиционно — грузинские сорта, спонтанное брожение в квеври и минимальное вмешательство, чтобы говорил подлинный характер виноградника.",

      "blog.eyebrow": "Журнал",
      "blog.title": "Истории винодельни Ахметели",
      "blog.text": "Грузинская винная культура, традиция квеври, сочетания с едой и жизнь Кахетии.",
      "blog.read": "Читать",
      "blog.post1": "Что такое вино квеври?",
      "blog.post1.x": "8000 лет виноделия, запечатанные в глине под землёй.",
      "blog.post2": "Саперави: главное",
      "blog.post2.x": "Флагманский красный сорт Грузии — глубокий, рубиновый, выдержанный.",
      "blog.post3": "Винный туризм в Кахетии",
      "blog.post3.x": "Марани, застолья-супра и виноградники Алазанской долины.",

      "visit.eyebrow": "Найти нас",
      "visit.title": "Посетите Ахметели",
      "visit.call": "Позвонить",
      "visit.directions": "Маршрут",
      "visit.whatsapp": "WhatsApp",
      "visit.book": "Записаться на дегустацию",

      "footer.main": "Главное",
      "footer.legal": "Правовое",
      "footer.social": "Соцсети",
      "footer.wines": "Вина",
      "footer.chacha": "Чача",
      "footer.blog": "Блог",
      "footer.terms": "Условия и положения",
      "footer.privacy": "Политика конфиденциальности",
      "footer.delivery": "Политика доставки",
      "footer.return": "Политика возврата",
      "footer.payment": "Политика оплаты",

      "meta.title.shop": "Магазин — Винодельня Ахметели",
      "meta.title.product": "Товар — Винодельня Ахметели",
      "meta.title.gallery": "Галерея — Винодельня Ахметели",
      "meta.title.contact": "Контакты — Винодельня Ахметели",
      "page.eyebrow": "АХМЕТА · КАХЕТИЯ",
      "foot.region": "Ахмета · Кахетия · Грузия",

      "shop.filter.reset": "Сбросить фильтр",
      "shop.sort.label": "Сортировка:",
      "shop.sort.newest": "Новинки",
      "shop.f.abv": "Алкоголь %",
      "shop.f.vintage": "Год урожая",
      "shop.f.tech": "Технология",
      "shop.f.grape": "Сорт",
      "shop.f.origin": "Происхождение",
      "shop.buy": "Купить",

      "unit.ml": "мл",
      "unit.abv": "об.",
      "brand.producer": "Винодельня Ахметели",
      "product.notfound": "Не найдено."
    }
  };
  ["en", "ka", "ru"].forEach(l => Object.assign(window.I18N_DICT[l], EXTRA[l]));

  // ---------------------------------------------------------------------
  //  Catalogue terms. products.js stores grape / serve / award titles as
  //  single English strings (the admin panel writes that shape), so they
  //  can't use tField(). These maps translate the known values instead.
  // ---------------------------------------------------------------------
  const GRAPE = {
    "Saperavi":        { en: "Saperavi",        ka: "საფერავი",       ru: "Саперави" },
    "Rkatsiteli":      { en: "Rkatsiteli",      ka: "რქაწითელი",      ru: "Ркацители" },
    "Kakhuri Mtsvane": { en: "Kakhuri Mtsvane", ka: "კახური მწვანე",  ru: "Кахури Мцване" },
    "Kisi":            { en: "Kisi",            ka: "ქისი",           ru: "Киси" },
    "Multi-grape":     { en: "Multi-grape",     ka: "სხვადასხვა ჯიში", ru: "Несколько сортов" },
    "Grapefruit":      { en: "Grapefruit",      ka: "გრეიპფრუტი",     ru: "Грейпфрут" },
    "Mango":           { en: "Mango",           ka: "მანგო",          ru: "Манго" }
  };
  const SERVE = {
    "Chilled":         { en: "Chilled",         ka: "გაცივებული",             ru: "Охлаждённой" },
    "Chilled or neat": { en: "Chilled or neat", ka: "გაცივებული ან სუფთა",    ru: "Охлаждённой или чистой" }
  };
  const TIER = {
    Gold:   { en: "Gold",   ka: "ოქრო",     ru: "Золото" },
    Silver: { en: "Silver", ka: "ვერცხლი",  ru: "Серебро" },
    Bronze: { en: "Bronze", ka: "ბრინჯაო",  ru: "Бронза" }
  };

  const tf = f => (window.I18N ? window.I18N.tField(f) : (f && f.en) || "");

  // "Rkatsiteli / Kakhuri Mtsvane" and "Multi-grape · Mango" keep their separators.
  window.I18N.grape = function (str) {
    if (!str) return "";
    return String(str).split(/\s*([/·])\s*/).map(part =>
      part === "/" ? " / " : part === "·" ? " · " : (GRAPE[part] ? tf(GRAPE[part]) : part)
    ).join("");
  };
  // Temperature ranges ("12-14°C") pass through untouched.
  window.I18N.serve = function (str) {
    return SERVE[str] ? tf(SERVE[str]) : (str || "");
  };
  // "Qvevri Wine Silver 2024" — competition name and year stay, the tier is translated.
  window.I18N.awardTitle = function (str) {
    if (!str) return "";
    return String(str).replace(/\b(Gold|Silver|Bronze)\b/g, m => tf(TIER[m]));
  };
})();
