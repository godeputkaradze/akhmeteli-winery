// Akhmeteli Winery — legal documents (terms, privacy, delivery, refund, payment).
//
// Each legal page is a thin shell carrying <main class="legal" data-doc="...">;
// this file holds the text for all three languages and renders the requested
// document into it, re-rendering on `langchange`.
//
// Placeholders in {braces} are filled from js/company.js, so the commercial
// terms can never drift between the documents, the cart and the footer.

(function () {
  const C = () => window.COMPANY || {};
  const f = (v) => (window.COMPANY ? window.COMPANY.field(v) : "");

  function tokens() {
    const c = C(), d = c.delivery || {}, r = c.refund || {};
    return {
      legalName: f(c.legalName),
      legalForm: f(c.legalForm),
      tradeName: f(c.tradeName),
      idCode: c.idCode,
      regDate: c.registrationDate,
      registrar: f(c.registrar),
      director: f(c.director),
      legalAddress: f(c.legalAddress),
      visitAddress: f(c.visitAddress),
      phone: c.phone,
      email: c.email,
      hours: f(c.hours),
      hoursShort: f(c.hoursShort),
      minAge: c.minAge,
      fee: d.fee + " " + d.currency,
      freeOver: d.freeOver + " " + d.currency,
      tbilisiDays: d.tbilisiDays,
      regionDays: d.regionDays,
      courier: f(d.courier),
      refundDays: r.requestDays,
      refundProcess: r.processDays
    };
  }

  function fill(s) {
    const t = tokens();
    return s.replace(/\{(\w+)\}/g, (m, k) => (k in t ? t[k] : m));
  }

  // ---------------------------------------------------------------------------
  //  Documents
  // ---------------------------------------------------------------------------
  const DOCS = {
    terms: {
      ka: {
        title: "წესები და პირობები",
        intro: "წინამდებარე წესები და პირობები არეგულირებს {legalName}-ის (შემდგომში „კომპანია“) ვებგვერდით სარგებლობას და მასზე განთავსებული პროდუქციის შეძენას. ვებგვერდით სარგებლობით თქვენ ეთანხმებით აღნიშნულ პირობებს.",
        sections: [
          { h: "1. ინფორმაცია კომპანიის შესახებ", p: [
            "საფირმო სახელწოდება: {legalName}",
            "სამართლებრივი ფორმა: {legalForm}",
            "საიდენტიფიკაციო ნომერი: {idCode}",
            "რეგისტრაციის თარიღი: {regDate}",
            "მარეგისტრირებელი ორგანო: {registrar}",
            "იურიდიული მისამართი: {legalAddress}",
            "დირექტორი: {director}",
            "სავაჭრო სახელწოდება: {tradeName}",
            "ტელეფონი: {phone} · ელ-ფოსტა: {email}",
            "სამუშაო საათები: {hours}"
          ]},
          { h: "2. ასაკობრივი შეზღუდვა", p: [
            "ვებგვერდზე განთავსებულია ალკოჰოლური პროდუქცია. შეკვეთის განთავსება შეუძლია მხოლოდ {minAge} წელს მიღწეულ პირს. შეკვეთის ჩაბარებისას კურიერს უფლება აქვს მოითხოვოს პირადობის დამადასტურებელი დოკუმენტი და უარი თქვას ჩაბარებაზე, თუ მიმღები არასრულწლოვანია."
          ]},
          { h: "3. რეგისტრაცია და ანგარიში", p: [
            "შეკვეთის განსათავსებლად რეგისტრაცია სავალდებულო არ არის — საკმარისია მიწოდებისა და კონტაქტისთვის საჭირო მონაცემების მითითება.",
            "მომხმარებელი პასუხისმგებელია მის მიერ მითითებული მონაცემების სისწორეზე. არასწორი მისამართის ან ტელეფონის გამო წარმოშობილი შეფერხება არ წარმოადგენს კომპანიის პასუხისმგებლობას.",
            "თუ ანგარიშს ქმნით, ვალდებული ხართ დაიცვათ ავტორიზაციის მონაცემების კონფიდენციალურობა."
          ]},
          { h: "4. პროდუქცია და ფასები", p: [
            "ყველა ფასი მითითებულია ქართულ ლარში (₾) და მოიცავს დღგ-ს.",
            "პროდუქციის ფოტოები საილუსტრაციოა; ეტიკეტისა და ბოთლის დიზაინი შესაძლოა უმნიშვნელოდ განსხვავდებოდეს მიმდინარე მოსავლის მიხედვით.",
            "კომპანია იტოვებს უფლებას ნებისმიერ დროს შეცვალოს ფასი ან პროდუქციის ხელმისაწვდომობა. შეკვეთის დადასტურების შემდეგ ფასი აღარ იცვლება."
          ]},
          { h: "5. შეკვეთა და მისი დადასტურება", p: [
            "შეკვეთა ითვლება მიღებულად მას შემდეგ, რაც მომხმარებელი მიიღებს დადასტურებას ელ-ფოსტაზე ან ტელეფონით.",
            "კომპანია უფლებამოსილია უარი თქვას შეკვეთის შესრულებაზე, თუ პროდუქცია ამოწურულია, მითითებული მონაცემები არასრულია, ან არსებობს გადახდის უსაფრთხოებასთან დაკავშირებული ეჭვი. ასეთ შემთხვევაში გადახდილი თანხა სრულად ბრუნდება."
          ]},
          { h: "6. გადახდა", p: [
            "გადახდა ხორციელდება ბანკის დაცული გადახდის გვერდის მეშვეობით. ბარათის მონაცემები კომპანიის სერვერზე არ ინახება.",
            "დეტალები იხილეთ გადახდის პოლიტიკაში."
          ]},
          { h: "7. მიწოდება და დაბრუნება", p: [
            "მიწოდების ვადები, ტერიტორია და საფასური აღწერილია მიწოდების პოლიტიკაში.",
            "თანხის დაბრუნების საფუძვლები და ვადები აღწერილია დაბრუნების პოლიტიკაში."
          ]},
          { h: "8. ინტელექტუალური საკუთრება", p: [
            "ვებგვერდზე განთავსებული ტექსტი, ფოტოები, ლოგო და დიზაინი წარმოადგენს კომპანიის საკუთრებას და დაცულია საავტორო უფლებით. მათი გამოყენება წერილობითი ნებართვის გარეშე დაუშვებელია."
          ]},
          { h: "9. პასუხისმგებლობის შეზღუდვა", p: [
            "კომპანია პასუხს არ აგებს ისეთ შეფერხებაზე, რომელიც გამოწვეულია ფორსმაჟორული გარემოებით, ინტერნეტ-კავშირის ან მესამე პირის (საკურიერო, საბანკო) სერვისის ხარვეზით."
          ]},
          { h: "10. მოქმედი კანონმდებლობა და დავები", p: [
            "წინამდებარე პირობები რეგულირდება საქართველოს კანონმდებლობით. დავა წყდება მოლაპარაკებით; შეთანხმების მიუღწევლობის შემთხვევაში — საქართველოს სასამართლოში.",
            "პრეტენზიის შემთხვევაში დაგვიკავშირდით: {phone} · {email}"
          ]}
        ]
      },
      en: {
        title: "Terms & Conditions",
        intro: "These terms govern the use of the website of {legalName} (the “Company”) and the purchase of the products offered on it. By using the website you accept these terms.",
        sections: [
          { h: "1. Company information", p: [
            "Legal name: {legalName}",
            "Legal form: {legalForm}",
            "Identification number: {idCode}",
            "Date of registration: {regDate}",
            "Registering authority: {registrar}",
            "Registered address: {legalAddress}",
            "Director: {director}",
            "Trade name: {tradeName}",
            "Phone: {phone} · Email: {email}",
            "Working hours: {hours}"
          ]},
          { h: "2. Age restriction", p: [
            "This website offers alcoholic beverages. Orders may only be placed by persons aged {minAge} or over. On delivery the courier may request photo ID and may refuse to hand over the order if the recipient is underage."
          ]},
          { h: "3. Registration and account", p: [
            "Registration is not required to place an order — only the details needed for delivery and contact.",
            "The customer is responsible for the accuracy of the details provided. Delays caused by an incorrect address or phone number are not the Company's responsibility.",
            "If you create an account, you are responsible for keeping your credentials confidential."
          ]},
          { h: "4. Products and prices", p: [
            "All prices are shown in Georgian Lari (₾) and include VAT.",
            "Product photographs are illustrative; label and bottle design may vary slightly by vintage.",
            "The Company may change prices or availability at any time. Once an order is confirmed, its price does not change."
          ]},
          { h: "5. Orders and confirmation", p: [
            "An order is accepted once the customer receives a confirmation by email or phone.",
            "The Company may decline an order if the product is out of stock, the details provided are incomplete, or there is a payment-security concern. In that case any amount paid is refunded in full."
          ]},
          { h: "6. Payment", p: [
            "Payment is processed through the bank's secure payment page. Card details are never stored on the Company's servers.",
            "See the Payment Policy for details."
          ]},
          { h: "7. Delivery and returns", p: [
            "Delivery times, coverage and fees are set out in the Delivery Policy.",
            "Grounds and deadlines for refunds are set out in the Return Policy."
          ]},
          { h: "8. Intellectual property", p: [
            "All text, photographs, the logo and the design of this website are the property of the Company and are protected by copyright. They may not be used without written permission."
          ]},
          { h: "9. Limitation of liability", p: [
            "The Company is not liable for delays caused by force majeure, connectivity failures, or the failure of a third-party (courier, banking) service."
          ]},
          { h: "10. Governing law and disputes", p: [
            "These terms are governed by the law of Georgia. Disputes are settled by negotiation; failing that, before the courts of Georgia.",
            "To raise a complaint, contact us: {phone} · {email}"
          ]}
        ]
      },
      ru: {
        title: "Условия и положения",
        intro: "Настоящие условия регулируют использование веб-сайта {legalName} (далее «Компания») и покупку размещённой на нём продукции. Пользуясь сайтом, вы принимаете эти условия.",
        sections: [
          { h: "1. Информация о компании", p: [
            "Фирменное наименование: {legalName}",
            "Организационно-правовая форма: {legalForm}",
            "Идентификационный номер: {idCode}",
            "Дата регистрации: {regDate}",
            "Регистрирующий орган: {registrar}",
            "Юридический адрес: {legalAddress}",
            "Директор: {director}",
            "Торговое наименование: {tradeName}",
            "Телефон: {phone} · Эл. почта: {email}",
            "Рабочие часы: {hours}"
          ]},
          { h: "2. Возрастное ограничение", p: [
            "На сайте представлена алкогольная продукция. Заказ может оформить только лицо, достигшее {minAge} лет. При доставке курьер вправе запросить документ, удостоверяющий личность, и отказать в выдаче заказа несовершеннолетнему."
          ]},
          { h: "3. Регистрация и аккаунт", p: [
            "Регистрация для оформления заказа не требуется — достаточно данных для доставки и связи.",
            "Покупатель отвечает за достоверность указанных данных. Задержки из-за неверного адреса или телефона не являются ответственностью Компании.",
            "При создании аккаунта вы обязаны сохранять конфиденциальность данных для входа."
          ]},
          { h: "4. Продукция и цены", p: [
            "Все цены указаны в грузинских лари (₾) и включают НДС.",
            "Фотографии продукции носят иллюстративный характер; дизайн этикетки и бутылки может незначительно отличаться в зависимости от урожая.",
            "Компания вправе изменить цену или наличие товара в любое время. После подтверждения заказа его цена не меняется."
          ]},
          { h: "5. Заказ и подтверждение", p: [
            "Заказ считается принятым после получения покупателем подтверждения по электронной почте или телефону.",
            "Компания вправе отказать в исполнении заказа, если товар закончился, данные неполные или есть сомнения в безопасности платежа. В этом случае уплаченная сумма возвращается полностью."
          ]},
          { h: "6. Оплата", p: [
            "Оплата проводится через защищённую платёжную страницу банка. Данные карты не хранятся на серверах Компании.",
            "Подробности — в Политике оплаты."
          ]},
          { h: "7. Доставка и возврат", p: [
            "Сроки, территория и стоимость доставки описаны в Политике доставки.",
            "Основания и сроки возврата средств описаны в Политике возврата."
          ]},
          { h: "8. Интеллектуальная собственность", p: [
            "Текст, фотографии, логотип и дизайн сайта принадлежат Компании и защищены авторским правом. Их использование без письменного разрешения запрещено."
          ]},
          { h: "9. Ограничение ответственности", p: [
            "Компания не несёт ответственности за задержки, вызванные форс-мажором, сбоями связи или сбоями сервисов третьих лиц (курьерских, банковских)."
          ]},
          { h: "10. Применимое право и споры", p: [
            "Настоящие условия регулируются законодательством Грузии. Споры решаются путём переговоров, а при недостижении согласия — в судах Грузии.",
            "Для претензий свяжитесь с нами: {phone} · {email}"
          ]}
        ]
      }
    },

    privacy: {
      ka: {
        title: "კონფიდენციალურობის პოლიტიკა",
        intro: "{legalName} პატივს სცემს თქვენს პირად ცხოვრებას და ამუშავებს პერსონალურ მონაცემებს „პერსონალურ მონაცემთა დაცვის შესახებ“ საქართველოს კანონის შესაბამისად.",
        sections: [
          { h: "1. რა მონაცემებს ვაგროვებთ", p: [
            "სახელი და გვარი, ტელეფონის ნომერი, ელ-ფოსტა და მიწოდების მისამართი — შეკვეთის შესასრულებლად.",
            "შეკვეთის ისტორია და გადახდის ფაქტი (თანხა, თარიღი, სტატუსი).",
            "ვებგვერდზე ქცევის ტექნიკური მონაცემები (IP, ბრაუზერი, ნახული გვერდები) — სტატისტიკისა და უსაფრთხოებისთვის.",
            "ბარათის სრულ მონაცემებს არ ვაგროვებთ და არ ვინახავთ — ისინი მუშავდება ბანკის მხარეს."
          ]},
          { h: "2. რისთვის ვიყენებთ", p: [
            "შეკვეთის დამუშავება, მიწოდება და მომხმარებელთან კომუნიკაცია.",
            "საბუღალტრო და საგადასახადო ვალდებულებების შესრულება.",
            "თქვენი თანხმობის შემთხვევაში — სიახლეებისა და შეთავაზებების გაგზავნა. თანხმობის გამოხმობა შესაძლებელია ნებისმიერ დროს."
          ]},
          { h: "3. ვის ვუზიარებთ", p: [
            "საკურიერო კომპანიას — მხოლოდ მიწოდებისთვის საჭირო მოცულობით.",
            "საგადახდო პროვაიდერსა და ბანკს — ტრანზაქციის შესრულებისა და ავტორიზაციისთვის.",
            "უფლებამოსილ სახელმწიფო ორგანოს — კანონით გათვალისწინებულ შემთხვევებში.",
            "თქვენს მონაცემებს არ ვყიდით და არ გადავცემთ მესამე პირს მარკეტინგული მიზნით."
          ]},
          { h: "4. ქუქი-ფაილები", p: [
            "ვებგვერდი იყენებს ქუქი-ფაილებს ენის არჩევანის, კალათის შიგთავსისა და ასაკის დადასტურების დასამახსოვრებლად. ბრაუზერის პარამეტრებიდან მათი გათიშვა შესაძლებელია, თუმცა ამან შესაძლოა შეზღუდოს ვებგვერდის ფუნქციონირება."
          ]},
          { h: "5. შენახვის ვადა", p: [
            "შეკვეთასთან დაკავშირებულ მონაცემებს ვინახავთ კანონმდებლობით დადგენილი ვადით. ამ ვადის გასვლის შემდეგ მონაცემები იშლება ან ანონიმდება."
          ]},
          { h: "6. თქვენი უფლებები", p: [
            "თქვენ გაქვთ უფლება მოითხოვოთ ინფორმაცია თქვენს შესახებ დამუშავებული მონაცემების თაობაზე, მათი გასწორება, განახლება, დაბლოკვა ან წაშლა.",
            "მოთხოვნა გამოგვიგზავნეთ: {email}. პასუხს გაგცემთ კანონით დადგენილ ვადაში."
          ]},
          { h: "7. უსაფრთხოება და კონტაქტი", p: [
            "ვიყენებთ დაშიფრულ (HTTPS) კავშირს და წვდომის შეზღუდვას მონაცემების დასაცავად.",
            "კითხვის შემთხვევაში: {phone} · {email} · {legalAddress}"
          ]}
        ]
      },
      en: {
        title: "Privacy Policy",
        intro: "{legalName} respects your privacy and processes personal data in accordance with the Law of Georgia on Personal Data Protection.",
        sections: [
          { h: "1. What we collect", p: [
            "Name, phone number, email and delivery address — to fulfil your order.",
            "Order history and payment record (amount, date, status).",
            "Technical usage data (IP, browser, pages viewed) — for statistics and security.",
            "We do not collect or store full card details; these are processed by the bank."
          ]},
          { h: "2. Why we use it", p: [
            "To process and deliver orders and to communicate with you.",
            "To meet accounting and tax obligations.",
            "With your consent, to send news and offers. Consent can be withdrawn at any time."
          ]},
          { h: "3. Who we share it with", p: [
            "The courier company — only what is needed for delivery.",
            "The payment provider and bank — to execute and authorise the transaction.",
            "Authorised state bodies — where required by law.",
            "We do not sell your data or pass it to third parties for marketing."
          ]},
          { h: "4. Cookies", p: [
            "The website uses cookies to remember your language, cart contents and age confirmation. You may disable them in your browser, though this may limit how the site works."
          ]},
          { h: "5. Retention", p: [
            "Order-related data is kept for the period required by law. After that it is deleted or anonymised."
          ]},
          { h: "6. Your rights", p: [
            "You may request information about the data we process about you, and its correction, update, blocking or deletion.",
            "Send requests to {email}. We reply within the period set by law."
          ]},
          { h: "7. Security and contact", p: [
            "We use an encrypted (HTTPS) connection and restricted access to protect your data.",
            "Questions: {phone} · {email} · {legalAddress}"
          ]}
        ]
      },
      ru: {
        title: "Политика конфиденциальности",
        intro: "{legalName} уважает вашу частную жизнь и обрабатывает персональные данные в соответствии с Законом Грузии «О защите персональных данных».",
        sections: [
          { h: "1. Какие данные мы собираем", p: [
            "Имя и фамилия, номер телефона, эл. почта и адрес доставки — для исполнения заказа.",
            "История заказов и факт оплаты (сумма, дата, статус).",
            "Технические данные (IP, браузер, просмотренные страницы) — для статистики и безопасности.",
            "Полные данные карты мы не собираем и не храним — они обрабатываются на стороне банка."
          ]},
          { h: "2. Для чего мы их используем", p: [
            "Обработка и доставка заказов, связь с покупателем.",
            "Исполнение бухгалтерских и налоговых обязательств.",
            "С вашего согласия — рассылка новостей и предложений. Согласие можно отозвать в любой момент."
          ]},
          { h: "3. Кому мы их передаём", p: [
            "Курьерской компании — только в объёме, необходимом для доставки.",
            "Платёжному провайдеру и банку — для проведения и авторизации транзакции.",
            "Уполномоченным государственным органам — в случаях, предусмотренных законом.",
            "Мы не продаём ваши данные и не передаём их третьим лицам в маркетинговых целях."
          ]},
          { h: "4. Файлы cookie", p: [
            "Сайт использует cookie для сохранения выбора языка, содержимого корзины и подтверждения возраста. Их можно отключить в настройках браузера, но это может ограничить работу сайта."
          ]},
          { h: "5. Срок хранения", p: [
            "Данные, связанные с заказом, хранятся в течение срока, установленного законом. По его истечении данные удаляются или обезличиваются."
          ]},
          { h: "6. Ваши права", p: [
            "Вы вправе запросить информацию об обрабатываемых данных, их исправление, обновление, блокировку или удаление.",
            "Запросы направляйте на {email}. Мы ответим в установленный законом срок."
          ]},
          { h: "7. Безопасность и контакты", p: [
            "Мы используем шифрованное (HTTPS) соединение и ограничение доступа для защиты данных.",
            "Вопросы: {phone} · {email} · {legalAddress}"
          ]}
        ]
      }
    },

    delivery: {
      ka: {
        title: "მიწოდების პირობები",
        intro: "ქვემოთ აღწერილია, როგორ, სად და რა ვადებში მიგიტანთ შეკვეთას.",
        sections: [
          { h: "1. მიწოდების ტერიტორია", p: [
            "მიწოდება ხორციელდება საქართველოს მასშტაბით, {courier}-ის მეშვეობით."
          ]},
          { h: "2. ვადები", p: [
            "თბილისი: {tbilisiDays} სამუშაო დღე შეკვეთის დადასტურებიდან.",
            "საქართველოს სხვა რეგიონები: {regionDays} სამუშაო დღე.",
            "შეკვეთა, რომელიც განთავსდება დასვენების დღეს ან სამუშაო საათების ({hoursShort}) შემდეგ, მუშავდება მომდევნო სამუშაო დღეს."
          ]},
          { h: "3. მიწოდების საფასური", p: [
            "მიწოდების ღირებულებაა {fee}.",
            "{freeOver}-ზე მეტი ღირებულების შეკვეთისას მიწოდება უფასოა.",
            "საფასური კალათაში ჩანს შეკვეთის საბოლოო დადასტურებამდე."
          ]},
          { h: "4. ჩაბარება", p: [
            "კურიერი დაგიკავშირდებათ მითითებულ ტელეფონზე. გთხოვთ, უზრუნველყოთ ხელმისაწვდომობა მითითებულ მისამართზე.",
            "ალკოჰოლური პროდუქციის ჩაბარებისას კურიერი უფლებამოსილია მოითხოვოს პირადობის დამადასტურებელი დოკუმენტი. {minAge} წლამდე პირზე შეკვეთა არ ბარდება.",
            "თუ მიმღები ადგილზე არ იმყოფება, კურიერი დაუკავშირდება ხელახლა ჩაბარების შესათანხმებლად. განმეორებითი ვიზიტი შესაძლოა დამატებით ანაზღაურდეს."
          ]},
          { h: "5. შემოწმება ჩაბარებისას", p: [
            "გთხოვთ, კურიერის თანდასწრებით შეამოწმოთ შეფუთვის მთლიანობა და ბოთლების რაოდენობა.",
            "დაზიანებული ან არასწორი პროდუქციის აღმოჩენისას დაუყოვნებლივ დაგვიკავშირდით: {phone} · {email}. ასეთი შემთხვევა წყდება დაბრუნების პოლიტიკის შესაბამისად."
          ]}
        ]
      },
      en: {
        title: "Delivery Terms",
        intro: "How, where and when your order is delivered.",
        sections: [
          { h: "1. Coverage", p: [
            "We deliver across Georgia via {courier}."
          ]},
          { h: "2. Timeframes", p: [
            "Tbilisi: {tbilisiDays} working days from order confirmation.",
            "Other regions of Georgia: {regionDays} working days.",
            "Orders placed on a non-working day or outside working hours ({hoursShort}) are processed on the next working day."
          ]},
          { h: "3. Delivery fee", p: [
            "The delivery fee is {fee}.",
            "Delivery is free on orders over {freeOver}.",
            "The fee is shown in the cart before you confirm the order."
          ]},
          { h: "4. Handover", p: [
            "The courier will call the phone number you provided. Please make sure someone is available at the address.",
            "For alcoholic products the courier may request photo ID. Orders are not handed over to anyone under {minAge}.",
            "If the recipient is absent, the courier will call to arrange redelivery. A repeat visit may be chargeable."
          ]},
          { h: "5. Checking on delivery", p: [
            "Please check the packaging and the number of bottles in the courier's presence.",
            "If anything is damaged or incorrect, contact us immediately: {phone} · {email}. Such cases are handled under the Return Policy."
          ]}
        ]
      },
      ru: {
        title: "Условия доставки",
        intro: "Как, куда и в какие сроки доставляется ваш заказ.",
        sections: [
          { h: "1. Территория доставки", p: [
            "Доставка осуществляется по всей Грузии силами {courier}."
          ]},
          { h: "2. Сроки", p: [
            "Тбилиси: {tbilisiDays} рабочих дня с момента подтверждения заказа.",
            "Другие регионы Грузии: {regionDays} рабочих дня.",
            "Заказы, оформленные в выходной день или вне рабочих часов ({hoursShort}), обрабатываются в следующий рабочий день."
          ]},
          { h: "3. Стоимость доставки", p: [
            "Стоимость доставки — {fee}.",
            "При заказе на сумму свыше {freeOver} доставка бесплатная.",
            "Стоимость отображается в корзине до окончательного подтверждения заказа."
          ]},
          { h: "4. Вручение", p: [
            "Курьер свяжется с вами по указанному номеру. Просим обеспечить доступ по указанному адресу.",
            "При вручении алкогольной продукции курьер вправе запросить документ, удостоверяющий личность. Лицам младше {minAge} лет заказ не выдаётся.",
            "Если получателя нет на месте, курьер свяжется для согласования повторной доставки. Повторный визит может быть платным."
          ]},
          { h: "5. Проверка при получении", p: [
            "Просим проверить целостность упаковки и количество бутылок в присутствии курьера.",
            "При обнаружении повреждений или несоответствия немедленно свяжитесь с нами: {phone} · {email}. Такие случаи решаются согласно Политике возврата."
          ]}
        ]
      }
    },

    refund: {
      ka: {
        title: "თანხის დაბრუნების პოლიტიკა",
        intro: "ქვემოთ აღწერილია, რა შემთხვევაში, რა ვადებში და როგორ ბრუნდება გადახდილი თანხა.",
        sections: [
          { h: "1. როდის ბრუნდება თანხა", p: [
            "პროდუქცია ჩაბარდა დაზიანებული (გატეხილი ბოთლი, დაზიანებული საცობი ან ეტიკეტი).",
            "ჩაბარდა შეკვეთისგან განსხვავებული პროდუქცია ან არასწორი რაოდენობა.",
            "შეკვეთა ვერ შესრულდა კომპანიის მხრიდან (მარაგის ამოწურვა და მისთანანი).",
            "მომხმარებელმა გააუქმა შეკვეთა მის გაგზავნამდე."
          ]},
          { h: "2. მოთხოვნის ვადა", p: [
            "პრეტენზია უნდა დაფიქსირდეს შეკვეთის ჩაბარებიდან {refundDays} კალენდარული დღის განმავლობაში.",
            "დაზიანებული ან არასწორი პროდუქციის შემთხვევაში გთხოვთ, დაუყოვნებლივ დაგვიკავშირდეთ და შეძლებისდაგვარად წარმოადგინოთ ფოტო."
          ]},
          { h: "3. როგორ მოვითხოვოთ", p: [
            "მოგვწერეთ {email}-ზე ან დაგვირეკეთ {phone}-ზე სამუშაო საათებში ({hoursShort}).",
            "მიუთითეთ: შეკვეთის ნომერი, შეძენის თარიღი, პრეტენზიის აღწერა და საკონტაქტო მონაცემები."
          ]},
          { h: "4. დაბრუნების ვადა და წესი", p: [
            "პრეტენზიის დაკმაყოფილების შემდეგ თანხა ბრუნდება იმავე ბარათზე ან ანგარიშზე, საიდანაც განხორციელდა გადახდა.",
            "თანხის ჩარიცხვას სჭირდება {refundProcess} საბანკო დღე. ზუსტი ვადა დამოკიდებულია ბარათის გამომშვებ ბანკზე.",
            "დაბრუნებას ექვემდებარება პროდუქციის ღირებულება; დადასტურებული ხარვეზის შემთხვევაში — ასევე მიწოდების საფასური."
          ]},
          { h: "5. გამონაკლისები", p: [
            "თანხა არ ბრუნდება, თუ პროდუქცია დაზიანდა ჩაბარების შემდეგ, მომხმარებლის მიერ არასწორი შენახვის გამო, ან თუ ბოთლი გახსნილია — გარდა იმ შემთხვევისა, როცა დადგინდა პროდუქციის ხარისხობრივი ნაკლი.",
            "ალკოჰოლური პროდუქციის დაბრუნება ხარისხობრივი ნაკლის გარეშე, გახსნის შემდეგ, არ ხდება."
          ]},
          { h: "6. შეკვეთის გაუქმება", p: [
            "შეკვეთის გაუქმება უფასოა მის გაგზავნამდე. დაგვიკავშირდით {phone}-ზე ან {email}-ზე და თანხა სრულად დაბრუნდება."
          ]}
        ]
      },
      en: {
        title: "Refund Policy",
        intro: "When, within what period and how a payment is refunded.",
        sections: [
          { h: "1. Grounds for a refund", p: [
            "The product arrived damaged (broken bottle, damaged cork or label).",
            "A different product or the wrong quantity was delivered.",
            "The Company could not fulfil the order (out of stock and similar).",
            "The customer cancelled the order before dispatch."
          ]},
          { h: "2. Deadline for claims", p: [
            "A claim must be raised within {refundDays} calendar days of delivery.",
            "For damaged or incorrect goods, please contact us immediately and provide a photograph where possible."
          ]},
          { h: "3. How to claim", p: [
            "Write to {email} or call {phone} during working hours ({hoursShort}).",
            "Include: order number, purchase date, a description of the problem and your contact details."
          ]},
          { h: "4. Refund method and timing", p: [
            "Once a claim is accepted, the money is returned to the same card or account it was paid from.",
            "Crediting takes {refundProcess} banking days. The exact timing depends on the issuing bank.",
            "The product price is refunded; where a fault is confirmed, the delivery fee is refunded as well."
          ]},
          { h: "5. Exceptions", p: [
            "No refund is given if the product was damaged after delivery through incorrect storage by the customer, or if the bottle has been opened — unless a quality defect is established.",
            "Opened alcoholic products cannot be returned in the absence of a quality defect."
          ]},
          { h: "6. Cancelling an order", p: [
            "Cancellation is free before dispatch. Contact us on {phone} or {email} and the amount is refunded in full."
          ]}
        ]
      },
      ru: {
        title: "Политика возврата средств",
        intro: "В каких случаях, в какие сроки и каким образом возвращается оплата.",
        sections: [
          { h: "1. Основания для возврата", p: [
            "Товар доставлен повреждённым (разбитая бутылка, повреждённая пробка или этикетка).",
            "Доставлен не тот товар или неверное количество.",
            "Компания не смогла исполнить заказ (отсутствие на складе и т. п.).",
            "Покупатель отменил заказ до его отправки."
          ]},
          { h: "2. Срок обращения", p: [
            "Претензия должна быть заявлена в течение {refundDays} календарных дней с момента доставки.",
            "При повреждении или несоответствии товара просим связаться с нами немедленно и по возможности приложить фотографию."
          ]},
          { h: "3. Как обратиться", p: [
            "Напишите на {email} или позвоните по {phone} в рабочие часы ({hoursShort}).",
            "Укажите: номер заказа, дату покупки, описание проблемы и контактные данные."
          ]},
          { h: "4. Порядок и сроки возврата", p: [
            "После удовлетворения претензии сумма возвращается на ту же карту или счёт, с которых была произведена оплата.",
            "Зачисление занимает {refundProcess} банковских дней. Точный срок зависит от банка-эмитента.",
            "Возврату подлежит стоимость товара; при подтверждённом дефекте — также стоимость доставки."
          ]},
          { h: "5. Исключения", p: [
            "Возврат не производится, если товар повреждён после доставки из-за неправильного хранения покупателем, либо если бутылка вскрыта — кроме случаев установленного дефекта качества.",
            "Вскрытая алкогольная продукция без дефекта качества возврату не подлежит."
          ]},
          { h: "6. Отмена заказа", p: [
            "Отмена бесплатна до отправки заказа. Свяжитесь с нами по {phone} или {email}, и сумма будет возвращена полностью."
          ]}
        ]
      }
    },

    payment: {
      ka: {
        title: "გადახდის პოლიტიკა",
        intro: "ქვემოთ აღწერილია, როგორ ხდება ანგარიშსწორება ვებგვერდზე.",
        sections: [
          { h: "1. ვალუტა და ფასები", p: [
            "ყველა ფასი მითითებულია ქართულ ლარში (₾) და მოიცავს დღგ-ს.",
            "გადასახდელი საბოლოო თანხა, მიწოდების საფასურის ჩათვლით, ჩანს კალათაში გადახდამდე."
          ]},
          { h: "2. გადახდის საშუალებები", p: [
            "მიიღება Visa და Mastercard ბარათები.",
            "გადახდა მუშავდება ბანკის დაცული გადახდის გვერდზე."
          ]},
          { h: "3. უსაფრთხოება", p: [
            "ბარათის მონაცემები შეიყვანება უშუალოდ ბანკის გვერდზე და არ ინახება კომპანიის სერვერზე.",
            "ტრანზაქცია ხორციელდება დაშიფრული (SSL/TLS) კავშირით და 3-D Secure ავთენტიფიკაციით."
          ]},
          { h: "4. დადასტურება", p: [
            "წარმატებული გადახდის შემდეგ მიიღებთ დადასტურებას ელ-ფოსტაზე.",
            "თუ თანხა ჩამოიჭრა, მაგრამ დადასტურება არ მიგიღიათ, დაგვიკავშირდით: {phone} · {email}"
          ]},
          { h: "5. უარყოფილი გადახდა", p: [
            "გადახდაზე უარის შემთხვევაში შეკვეთა არ ფორმდება და თანხა არ ჩამოიჭრება. მიზეზის დასაზუსტებლად მიმართეთ ბარათის გამომშვებ ბანკს."
          ]}
        ]
      },
      en: {
        title: "Payment Policy",
        intro: "How payment on this website works.",
        sections: [
          { h: "1. Currency and prices", p: [
            "All prices are shown in Georgian Lari (₾) and include VAT.",
            "The final amount payable, including the delivery fee, is shown in the cart before payment."
          ]},
          { h: "2. Accepted payment methods", p: [
            "Visa and Mastercard are accepted.",
            "Payment is processed on the bank's secure payment page."
          ]},
          { h: "3. Security", p: [
            "Card details are entered directly on the bank's page and are not stored on the Company's servers.",
            "Transactions use an encrypted (SSL/TLS) connection and 3-D Secure authentication."
          ]},
          { h: "4. Confirmation", p: [
            "After a successful payment you receive a confirmation by email.",
            "If you were charged but received no confirmation, contact us: {phone} · {email}"
          ]},
          { h: "5. Declined payments", p: [
            "If a payment is declined, no order is created and no amount is charged. Contact your issuing bank for the reason."
          ]}
        ]
      },
      ru: {
        title: "Политика оплаты",
        intro: "Как производится оплата на сайте.",
        sections: [
          { h: "1. Валюта и цены", p: [
            "Все цены указаны в грузинских лари (₾) и включают НДС.",
            "Итоговая сумма к оплате, включая стоимость доставки, отображается в корзине до оплаты."
          ]},
          { h: "2. Способы оплаты", p: [
            "Принимаются карты Visa и Mastercard.",
            "Оплата обрабатывается на защищённой платёжной странице банка."
          ]},
          { h: "3. Безопасность", p: [
            "Данные карты вводятся непосредственно на странице банка и не хранятся на серверах Компании.",
            "Транзакция проходит по шифрованному (SSL/TLS) соединению с аутентификацией 3-D Secure."
          ]},
          { h: "4. Подтверждение", p: [
            "После успешной оплаты вы получите подтверждение по электронной почте.",
            "Если сумма списана, а подтверждение не получено, свяжитесь с нами: {phone} · {email}"
          ]},
          { h: "5. Отклонённый платёж", p: [
            "При отклонении платежа заказ не оформляется и сумма не списывается. Причину уточняйте в банке-эмитенте."
          ]}
        ]
      }
    }
  };

  // ---------------------------------------------------------------------------
  //  Render
  // ---------------------------------------------------------------------------
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function render() {
    const host = document.querySelector("[data-doc]");
    if (!host) return;
    const doc = DOCS[host.getAttribute("data-doc")];
    if (!doc) return;
    const lang = window.I18N ? window.I18N.getLang() : "ka";
    const d = doc[lang] || doc.en;

    host.innerHTML = `
      <div class="container legal__wrap">
        <span class="eyebrow">${esc(fill("{tradeName}"))}</span>
        <h1 class="legal__title">${esc(d.title)}</h1>
        <p class="legal__intro">${esc(fill(d.intro))}</p>
        ${d.sections.map(s => `
          <section class="legal__section">
            <h2>${esc(s.h)}</h2>
            ${s.p.map(p => `<p>${esc(fill(p))}</p>`).join("")}
          </section>`).join("")}
      </div>`;

    document.title = d.title + " — " + fill("{tradeName}");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
  document.addEventListener("langchange", render);
})();
