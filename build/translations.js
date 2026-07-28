// Source of truth for every language on the site.
// Edit here, then run:  node build/generate.js
// The English strings live directly in index.html; these fill the other four.

const translations = {
    // NAV
    navWork:       { en: "Work",         pl: "Projekty",   ru: "Работы",         tr: "İşler",        es: "Proyectos" },
    navProcess:    { en: "Process",      pl: "Proces",     ru: "Процесс",        tr: "Süreç",        es: "Proceso" },
    navServices:   { en: "Services",     pl: "Usługi",     ru: "Услуги",         tr: "Hizmetler",    es: "Servicios" },
    navCta:        { en: "Work With Us", pl: "Współpraca",  ru: "Сотрудничество", tr: "Bizimle Çalış", es: "Trabaja con nosotros" },

    // HERO
    heroBadge:     { en: "Working worldwide · Taking new projects", pl: "Pracujemy na całym świecie · Przyjmujemy nowe projekty", ru: "Работаем по всему миру · Берём новые проекты", tr: "Tüm dünyada çalışıyoruz · Yeni projeler alıyoruz", es: "Trabajamos en todo el mundo · Aceptando nuevos proyectos" },
    heroTitle:     { en: 'We turn ideas<br><span class="gradient-text">into working products.</span>', pl: 'Zamieniamy pomysły<br><span class="gradient-text">w działające produkty.</span>', ru: 'Превращаем идеи<br><span class="gradient-text">в работающие продукты.</span>', tr: 'Fikirleri<br><span class="gradient-text">çalışan ürünlere dönüştürüyoruz.</span>', es: 'Convertimos ideas<br><span class="gradient-text">en productos que funcionan.</span>' },
    heroSub:       { en: "<strong>OnlyMaxon</strong> is a product studio. We design, build, launch and grow real products — <strong>development and SEO</strong> under one roof.", pl: "<strong>OnlyMaxon</strong> to studio produktowe. Projektujemy, budujemy, wdrażamy i rozwijamy prawdziwe produkty — <strong>development i SEO</strong> pod jednym dachem.", ru: "<strong>OnlyMaxon</strong> — продуктовая студия. Проектируем, разрабатываем, запускаем и развиваем реальные продукты — <strong>разработка и SEO</strong> под одной крышей.", tr: "<strong>OnlyMaxon</strong> bir ürün stüdyosudur. Gerçek ürünleri tasarlar, geliştirir, yayınlar ve büyütürüz — <strong>geliştirme ve SEO</strong> tek çatı altında.", es: "<strong>OnlyMaxon</strong> es un estudio de producto. Diseñamos, construimos, lanzamos y hacemos crecer productos reales — <strong>desarrollo y SEO</strong> bajo un mismo techo." },
    heroBtnCall:     { en: "Send a message", pl: "Napisz do nas",  ru: "Написать нам", tr: "Mesaj gönder", es: "Enviar mensaje" },
    heroBtnProjects: { en: "See Projects", pl: "Zobacz projekty", ru: "Смотреть проекты", tr: "Projeleri gör", es: "Ver proyectos" },
    heroStatProducts:{ en: "Products Built", pl: "Zbudowanych produktów", ru: "Продуктов создано", tr: "Yapılan ürün", es: "Productos creados" },
    heroStatMvpVal:  { en: "3–6w",        pl: "3–6 tyg.",   ru: "3–6 нед.", tr: "3–6 hf", es: "3–6 sem" },
    heroStatMvp:     { en: "MVP Timeline",pl: "Czas MVP",   ru: "Срок MVP", tr: "MVP süresi", es: "Plazo MVP" },

    // PRICING
    vkEyebrow: { en: "Business-card website", pl: "Strona wizytówka", ru: "Сайт-визитка", tr: "Kartvizit web sitesi", es: "Web de presentación" },
    vkTitle:   { en: "What's a business-card site?", pl: "Czym jest strona wizytówka?", ru: "Что такое сайт-визитка?", tr: "Kartvizit sitesi nedir?", es: "¿Qué es una web de presentación?" },
    vkDesc:    { en: "One clean page — who you are, what you do, your prices and contacts. Like a paper business card, but online: people find you on Google and reach you in one tap. Here's what one looks like:", pl: "Jedna czysta strona — kim jesteś, co robisz, ceny i kontakt. Jak papierowa wizytówka, ale online: klienci znajdują Cię w Google i dzwonią jednym dotknięciem. Oto jak to wygląda:", ru: "Одна аккуратная страница — кто ты, что делаешь, цены и контакты. Как бумажная визитка, только онлайн: тебя находят в Google и звонят в одно касание. Вот как это выглядит:", tr: "Tek temiz sayfa — kim olduğun, ne yaptığın, fiyatların ve iletişimin. Kâğıt kartvizit gibi ama online: insanlar seni Google'da bulur ve tek dokunuşla ulaşır. İşte böyle görünür:", es: "Una página limpia — quién eres, qué haces, tus precios y contacto. Como una tarjeta de visita, pero online: te encuentran en Google y te contactan con un toque. Así se ve:" },
    vkCaption: { en: "Three examples — yours can look however you want.", pl: "Trzy przykłady — Twój może wyglądać, jak tylko chcesz.", ru: "Три примера — твой может выглядеть как захочешь.", tr: "Üç örnek — seninki nasıl istersen öyle görünebilir.", es: "Tres ejemplos — el tuyo puede verse como tú quieras." },

    // ── DEMO PHONES ──────────────────────────────────────────────────────────
    // Three mock business-card sites. Names, cities and services are localised so a
    // visitor sees a business from their own market, not a foreign one.
    // Prices are EUR everywhere; only the symbol's position follows local habit
    // (en/tr "€18", pl/ru/es "18 €") — same convention as the pricing section above.
    vkCall: { en: "Call", pl: "Zadzwoń", ru: "Позвонить", tr: "Ara", es: "Llamar" },
    vkBook: { en: "Book", pl: "Rezerwuj", ru: "Записаться", tr: "Randevu", es: "Reservar" },

    // phone 1 — barber (amber)
    vk1Ava:   { en: "M", pl: "M", ru: "М", tr: "E", es: "C" },
    vk1Name:  { en: "Mark", pl: "Marek", ru: "Марк", tr: "Emre", es: "Carlos" },
    vk1Role:  { en: "BARBER · LONDON", pl: "BARBER · WARSZAWA", ru: "БАРБЕР · БАКУ", tr: "BERBER · İSTANBUL", es: "BARBERÍA · MADRID" },
    vk1Rate:  { en: "4.9 · 120 reviews", pl: "4,9 · 120 opinii", ru: "4,9 · 120 отзывов", tr: "4,9 · 120 yorum", es: "4,9 · 120 reseñas" },
    vk1S1:    { en: "Haircut", pl: "Strzyżenie", ru: "Стрижка", tr: "Saç kesimi", es: "Corte" },
    vk1P1:    { en: "€18", pl: "18 €", ru: "18 €", tr: "€18", es: "18 €" },
    vk1S2:    { en: "Beard trim", pl: "Broda", ru: "Борода", tr: "Sakal", es: "Barba" },
    vk1P2:    { en: "€12", pl: "12 €", ru: "12 €", tr: "€12", es: "12 €" },
    vk1S3:    { en: "Cut + beard", pl: "Strzyżenie + broda", ru: "Стрижка + борода", tr: "Saç + sakal", es: "Corte + barba" },
    vk1P3:    { en: "€26", pl: "26 €", ru: "26 €", tr: "€26", es: "26 €" },
    vk1Hours: { en: "Mon–Sat · 10:00–20:00", pl: "Pn–Sob · 10:00–20:00", ru: "Пн–Сб · 10:00–20:00", tr: "Pzt–Cmt · 10:00–20:00", es: "Lun–Sáb · 10:00–20:00" },

    // phone 2 — beauty studio (rose) · featured, centre
    vk2Ava:   { en: "S", pl: "Z", ru: "С", tr: "E", es: "L" },
    vk2Name:  { en: "Sofia", pl: "Zofia", ru: "София", tr: "Elif", es: "Lucía" },
    vk2Role:  { en: "BEAUTY STUDIO · LONDON", pl: "STUDIO URODY · WARSZAWA", ru: "БЬЮТИ-СТУДИЯ · БАКУ", tr: "GÜZELLİK · İSTANBUL", es: "ESTÉTICA · MADRID" },
    vk2Rate:  { en: "5.0 · 86 reviews", pl: "5,0 · 86 opinii", ru: "5,0 · 86 отзывов", tr: "5,0 · 86 yorum", es: "5,0 · 86 reseñas" },
    vk2S1:    { en: "Manicure", pl: "Manicure", ru: "Маникюр", tr: "Manikür", es: "Manicura" },
    vk2P1:    { en: "€25", pl: "25 €", ru: "25 €", tr: "€25", es: "25 €" },
    vk2S2:    { en: "Pedicure", pl: "Pedicure", ru: "Педикюр", tr: "Pedikür", es: "Pedicura" },
    vk2P2:    { en: "€30", pl: "30 €", ru: "30 €", tr: "€30", es: "30 €" },
    vk2S3:    { en: "Lash extensions", pl: "Przedłużanie rzęs", ru: "Наращивание ресниц", tr: "Kirpik uygulaması", es: "Extensión de pestañas" },
    vk2P3:    { en: "€40", pl: "40 €", ru: "40 €", tr: "€40", es: "40 €" },
    // the featured phone is taller, so it carries a fourth row — otherwise the extra
    // height shows up as dead space above the buttons
    vk2S4:    { en: "Facial", pl: "Zabieg na twarz", ru: "Уход за лицом", tr: "Cilt bakımı", es: "Tratamiento facial" },
    vk2P4:    { en: "€55", pl: "55 €", ru: "55 €", tr: "€55", es: "55 €" },
    vk2Hours: { en: "Tue–Sat · 09:00–19:00", pl: "Wt–Sob · 09:00–19:00", ru: "Вт–Сб · 09:00–19:00", tr: "Sal–Cmt · 09:00–19:00", es: "Mar–Sáb · 09:00–19:00" },

    // phone 3 — photographer (cyan)
    vk3Ava:   { en: "D", pl: "T", ru: "Д", tr: "K", es: "J" },
    vk3Name:  { en: "Daniel", pl: "Tomasz", ru: "Даниил", tr: "Kerem", es: "Javier" },
    vk3Role:  { en: "PHOTOGRAPHER · LONDON", pl: "FOTOGRAF · WARSZAWA", ru: "ФОТОГРАФ · БАКУ", tr: "FOTOĞRAFÇI · İSTANBUL", es: "FOTÓGRAFO · MADRID" },
    vk3Rate:  { en: "4.9 · 64 reviews", pl: "4,9 · 64 opinie", ru: "4,9 · 64 отзыва", tr: "4,9 · 64 yorum", es: "4,9 · 64 reseñas" },
    vk3S1:    { en: "Portrait session", pl: "Sesja portretowa", ru: "Портретная съёмка", tr: "Portre çekimi", es: "Sesión de retrato" },
    vk3P1:    { en: "€90", pl: "90 €", ru: "90 €", tr: "€90", es: "90 €" },
    vk3S2:    { en: "Family shoot", pl: "Sesja rodzinna", ru: "Семейная съёмка", tr: "Aile çekimi", es: "Sesión familiar" },
    vk3P2:    { en: "€140", pl: "140 €", ru: "140 €", tr: "€140", es: "140 €" },
    vk3S3:    { en: "Wedding", pl: "Wesele", ru: "Свадьба", tr: "Düğün", es: "Boda" },
    vk3P3:    { en: "€450", pl: "450 €", ru: "450 €", tr: "€450", es: "450 €" },
    vk3Hours: { en: "Mon–Fri · 09:00–18:00", pl: "Pn–Pt · 09:00–18:00", ru: "Пн–Пт · 09:00–18:00", tr: "Pzt–Cum · 09:00–18:00", es: "Lun–Vie · 09:00–18:00" },
    pricingEyebrow: { en: "Pricing",              pl: "Cennik",              ru: "Цены", tr: "Fiyatlar", es: "Precios" },
    pricingTitle:   { en: "Simple, upfront pricing", pl: "Proste, jasne ceny", ru: "Простые, прозрачные цены", tr: "Basit, şeffaf fiyatlar", es: "Precios simples y claros" },
    pricingDesc:    { en: "Dreaming of a website or app — for your business, your idea, or someone you love? Here's the price and timeline up front, no hidden costs.", pl: "Marzysz o stronie lub aplikacji — dla swojego biznesu, pomysłu albo kogoś bliskiego? Oto cena i termin z góry, bez ukrytych kosztów.", ru: "Мечтаешь о сайте или приложении — для бизнеса, своей идеи или близкого человека? Вот цена и сроки сразу, без скрытых расходов.", tr: "Bir web sitesi veya uygulama mı hayal ediyorsun — işin, fikrin ya da sevdiğin biri için? İşte fiyat ve süre baştan, gizli maliyet yok.", es: "¿Sueñas con una web o una app — para tu negocio, tu idea o alguien a quien quieres? Aquí tienes el precio y el plazo por adelantado, sin costes ocultos." },
    price1Name:   { en: "Business-card website",       pl: "Strona wizytówka",           ru: "Сайт-визитка", tr: "Kartvizit web sitesi", es: "Web de presentación" },
    price1Amount: { en: "from €390",                   pl: "od 390 €",                   ru: "от 390 €", tr: "€390'dan", es: "desde 390 €" },
    price1Time:   { en: "1 week",                      pl: "1 tydzień",                  ru: "1 неделя", tr: "1 hafta", es: "1 semana" },
    price2Name:   { en: "Website with online booking", pl: "Strona z rezerwacją online", ru: "Сайт с онлайн-бронированием", tr: "Online rezervasyonlu site", es: "Web con reservas online" },
    price2Amount: { en: "from €690",                   pl: "od 690 €",                   ru: "от 690 €", tr: "€690'dan", es: "desde 690 €" },
    price2Time:   { en: "2 weeks",                     pl: "2 tygodnie",                 ru: "2 недели", tr: "2 hafta", es: "2 semanas" },
    price3Name:   { en: "Mobile app",                  pl: "Aplikacja mobilna",          ru: "Мобильное приложение", tr: "Mobil uygulama", es: "App móvil" },
    price3Amount: { en: "from €1400",                  pl: "od 1400 €",                  ru: "от 1400 €", tr: "€1400'den", es: "desde 1400 €" },
    price3Time:   { en: "4–6 weeks",                   pl: "4–6 tygodni",                ru: "4–6 недель", tr: "4–6 hafta", es: "4–6 semanas" },
    price4Name:   { en: "Ongoing SEO / ASO / AI",      pl: "Stałe SEO / ASO / AI",       ru: "Постоянное SEO / ASO / AI", tr: "Sürekli SEO / ASO / AI", es: "SEO / ASO / AI continuo" },
    price4Amount: { en: "from €200/mo",                pl: "od 200 €/mies",              ru: "от 200 €/мес", tr: "€200/ay'dan", es: "desde 200 €/mes" },
    price4Time:   { en: "monthly · ongoing",           pl: "miesięcznie",                ru: "ежемесячно", tr: "aylık · sürekli", es: "mensual · continuo" },
    priceCta:     { en: "Get in touch",                pl: "Napisz do nas",              ru: "Написать нам", tr: "İletişime geç", es: "Contáctanos" },

    // PROJECTS
    projEyebrow: { en: "Our work", pl: "Nasze prace", ru: "Наши работы", tr: "İşlerimiz", es: "Nuestro trabajo" },
    projTitle:   { en: "Products we've brought to life", pl: "Produkty, które ożywiliśmy", ru: "Продукты, которые мы оживили", tr: "Hayata geçirdiğimiz ürünler", es: "Productos que hemos dado vida" },
    projDesc:    { en: "Real products used by real people — designed, built, and launched by OnlyMaxon.", pl: "Prawdziwe produkty używane przez prawdziwych ludzi — zaprojektowane, zbudowane i wdrożone przez OnlyMaxon.", ru: "Реальные продукты для реальных людей — спроектированы, созданы и запущены OnlyMaxon.", tr: "Gerçek insanların kullandığı gerçek ürünler — OnlyMaxon tarafından tasarlandı, geliştirildi ve yayınlandı.", es: "Productos reales usados por personas reales — diseñados, construidos y lanzados por OnlyMaxon." },
    badgeLive:   { en: "Live",     pl: "Live",       ru: "Онлайн", tr: "Yayında", es: "En vivo" },
    badgeDev:    { en: "In dev",   pl: "W budowie",  ru: "В разработке", tr: "Geliştiriliyor", es: "En desarrollo" },
    linkVisit:   { en: "Visit site", pl: "Zobacz stronę", ru: "Открыть сайт", tr: "Siteyi ziyaret et", es: "Visitar sitio" },
    linkInDev:   { en: "In development", pl: "W budowie", ru: "В разработке", tr: "Geliştiriliyor", es: "En desarrollo" },
    projNextcargo: { en: "Cargo & delivery platform with full client cabinet, real-time support chat, and shipment tracking.", pl: "Platforma cargo i dostaw z pełnym panelem klienta, czatem wsparcia w czasie rzeczywistym i śledzeniem przesyłek.", ru: "Платформа грузоперевозок и доставки с полным кабинетом клиента, чатом поддержки в реальном времени и отслеживанием отправлений.", tr: "Tam müşteri paneli, gerçek zamanlı destek sohbeti ve gönderi takibi olan kargo ve teslimat platformu.", es: "Plataforma de carga y entrega con panel de cliente completo, chat de soporte en tiempo real y seguimiento de envíos." },
    projBirklik:   { en: "Rental marketplace for Azerbaijan — booking calendar, host dashboard, tiered listings, and payment integration.", pl: "Marketplace wynajmu dla Azerbejdżanu — kalendarz rezerwacji, panel gospodarza, listingi i integracja płatności.", ru: "Маркетплейс аренды для Азербайджана — календарь бронирований, панель хоста, тарифные объявления и приём платежей.", tr: "Azerbaycan için kiralama pazarı — rezervasyon takvimi, ev sahibi paneli, kademeli ilanlar ve ödeme entegrasyonu.", es: "Marketplace de alquiler para Azerbaiyán — calendario de reservas, panel de anfitrión, anuncios por niveles e integración de pagos." },
    projYodin:     { en: "Social platform for international students across universities — behavior-based matching that connects people beyond nationalities.", pl: "Platforma społecznościowa dla studentów zagranicznych ze wszystkich uczelni — dopasowanie oparte na zachowaniach, które łączy ludzi ponad narodowościami.", ru: "Социальная платформа для иностранных студентов из всех университетов — подбор по поведению, соединяющий людей поверх национальностей.", tr: "Üniversitelerdeki uluslararası öğrenciler için sosyal platform — insanları milliyetlerin ötesinde birleştiren davranış temelli eşleştirme.", es: "Plataforma social para estudiantes internacionales de todas las universidades — emparejamiento por comportamiento que conecta a las personas más allá de las nacionalidades." },

    // PROCESS
    procEyebrow: { en: "How we work", pl: "Jak pracujemy", ru: "Как мы работаем", tr: "Nasıl çalışıyoruz", es: "Cómo trabajamos" },
    procTitle:   { en: "You focus on the vision.<br>We handle the rest.", pl: "Ty skupiasz się na wizji.<br>My robimy resztę.", ru: "Ты — на видении.<br>Мы — на всём остальном.", tr: "Sen vizyona odaklan.<br>Gerisini biz halledelim.", es: "Tú te enfocas en la visión.<br>Nosotros hacemos el resto." },
    procDesc:    { en: "One team takes your idea from first sketch to a live, growing product — and you stay in control the whole way.", pl: "Jeden zespół prowadzi Twój pomysł od pierwszego szkicu do działającego, rozwijającego się produktu — a Ty przez cały czas masz kontrolę.", ru: "Одна команда ведёт твою идею от первого наброска до живого, растущего продукта — а ты всё время сохраняешь контроль.", tr: "Tek bir ekip fikrini ilk taslaktan canlı, büyüyen bir ürüne taşır — ve tüm süreç boyunca kontrol sende kalır.", es: "Un solo equipo lleva tu idea desde el primer boceto hasta un producto vivo y en crecimiento — y tú mantienes el control todo el camino." },
    proc1Title: { en: "End-to-end delivery", pl: "Realizacja end-to-end", ru: "Реализация под ключ", tr: "Uçtan uca teslimat", es: "Entrega integral" },
    proc1Desc:  { en: "Design, code, deployment, launch — we handle everything, so you don't have to juggle it.", pl: "Projekt, kod, wdrożenie, launch — zajmujemy się wszystkim, żebyś nie musiał tego ogarniać.", ru: "Дизайн, код, деплой, запуск — берём всё на себя, чтобы тебе не пришлось всё это разруливать.", tr: "Tasarım, kod, dağıtım, lansman — her şeyi biz hallederiz, sen uğraşmak zorunda kalmazsın.", es: "Diseño, código, despliegue, lanzamiento — nos encargamos de todo, para que tú no tengas que hacer malabares." },
    proc2Title: { en: "Ship fast", pl: "Szybkie wdrożenie", ru: "Быстрый запуск", tr: "Hızlı yayınla", es: "Lanza rápido" },
    proc2Desc:  { en: "MVPs in 3–6 weeks, not 6 months. Real users, real feedback, real iteration.", pl: "MVP w 3–6 tygodni, nie 6 miesięcy. Prawdziwi użytkownicy, prawdziwy feedback, prawdziwa iteracja.", ru: "MVP за 3–6 недель, а не за 6 месяцев. Реальные пользователи, реальный фидбэк, реальные итерации.", tr: "6 ayda değil, 3–6 haftada MVP. Gerçek kullanıcılar, gerçek geri bildirim, gerçek iterasyon.", es: "MVPs en 3–6 semanas, no en 6 meses. Usuarios reales, feedback real, iteración real." },
    proc3Title: { en: "More than code", pl: "Więcej niż kod", ru: "Больше, чем код", tr: "Sadece koddan fazlası", es: "Más que código" },
    proc3Desc:  { en: "SEO to get your product found on Google and growing — not just code that ships and sits.", pl: "SEO, żeby Twój produkt był znajdowany w Google i rósł — a nie tylko kod, który leży bezczynnie.", ru: "SEO, чтобы продукт находили в Google и он рос — а не просто код, который лежит без дела.", tr: "Ürününün Google'da bulunup büyümesi için SEO — sadece yayınlanıp bekleyen kod değil.", es: "SEO para que tu producto se encuentre en Google y crezca — no solo código que se publica y se queda ahí." },
    proc4Title: { en: "Transparent by default", pl: "Domyślnie transparentnie", ru: "Прозрачность по умолчанию", tr: "Baştan şeffaf", es: "Transparente por defecto" },
    proc4Desc:  { en: "Weekly updates, clear progress. No surprises, no hidden blockers.", pl: "Cotygodniowe aktualizacje, jasny postęp. Bez niespodzianek i ukrytych blokad.", ru: "Еженедельные апдейты, понятный прогресс. Без сюрпризов и скрытых блокеров.", tr: "Haftalık güncellemeler, net ilerleme. Sürpriz yok, gizli engel yok.", es: "Actualizaciones semanales, progreso claro. Sin sorpresas, sin bloqueos ocultos." },

    // SERVICES
    servEyebrow: { en: "What we do", pl: "Co robimy", ru: "Что мы делаем", tr: "Ne yapıyoruz", es: "Qué hacemos" },
    servTitle:   { en: "Everything under one roof", pl: "Wszystko pod jednym dachem", ru: "Всё под одной крышей", tr: "Her şey tek çatı altında", es: "Todo bajo un mismo techo" },
    servDesc:    { en: "Two teams, one goal — get your product built, launched, and growing.", pl: "Dwa zespoły, jeden cel — zbudować, wdrożyć i rozwijać Twój produkt.", ru: "Две команды, одна цель — создать, запустить и развивать твой продукт.", tr: "İki ekip, tek hedef — ürününü geliştir, yayınla ve büyüt.", es: "Dos equipos, un objetivo — construir, lanzar y hacer crecer tu producto." },
    devName: { en: "Development", pl: "Development", ru: "Разработка", tr: "Geliştirme", es: "Desarrollo" },
    devDesc: { en: "Full-stack engineering — web, mobile, maps & real-time apps built from scratch and shipped to production.", pl: "Inżynieria full-stack — web, mobile, mapy i aplikacje real-time budowane od zera i wdrażane na produkcję.", ru: "Full-stack инженерия — web, mobile, карты и real-time приложения с нуля и до продакшена.", tr: "Full-stack mühendislik — web, mobil, harita ve gerçek zamanlı uygulamalar sıfırdan geliştirilip yayına alınır.", es: "Ingeniería full-stack — web, móvil, mapas y apps en tiempo real creadas desde cero y llevadas a producción." },
    devSub:  { en: "We build with", pl: "Budujemy w", ru: "Мы используем", tr: "Kullandıklarımız", es: "Construimos con" },
    mktName: { en: "SEO / ASO / AI", pl: "SEO / ASO / AI", ru: "SEO / ASO / AI", tr: "SEO / ASO / AI", es: "SEO / ASO / AI" },
    mktDesc: { en: "Websites ship SEO-ready, apps ASO-ready, and your brand tuned to be recommended by AI (ChatGPT, Perplexity, Google AI). Ongoing ranking work available too.", pl: "Strony gotowe pod SEO, aplikacje pod ASO, a Twoja marka dostrojona tak, by polecało ją AI (ChatGPT, Perplexity, Google AI). Dostępna też stała praca nad pozycjami.", ru: "Сайты готовы к SEO, приложения — к ASO, а бренд настроен так, чтобы его рекомендовал ИИ (ChatGPT, Perplexity, Google AI). Постоянная работа над позициями — тоже по желанию.", tr: "Web siteleri SEO'ya, uygulamalar ASO'ya hazır gelir ve markanız yapay zekânın (ChatGPT, Perplexity, Google AI) önerebileceği şekilde ayarlanır. Sürekli sıralama çalışması da mevcut.", es: "Las webs se entregan listas para SEO, las apps para ASO, y tu marca ajustada para que la recomiende la IA (ChatGPT, Perplexity, Google AI). También hay trabajo continuo de posicionamiento." },
    mktSub:  { en: "We handle", pl: "Zajmujemy się", ru: "Мы занимаемся", tr: "İlgilendiklerimiz", es: "Nos encargamos de" },

    // CONTACT
    contactEyebrow: { en: "Let's talk", pl: "Porozmawiajmy", ru: "Давай обсудим", tr: "Konuşalım", es: "Hablemos" },
    contactTitle:   { en: 'Got an idea?<br><span class="gradient-text">Let\'s build it.</span>', pl: 'Masz pomysł?<br><span class="gradient-text">Zbudujmy go.</span>', ru: 'Есть идея?<br><span class="gradient-text">Давай сделаем.</span>', tr: 'Bir fikrin mi var?<br><span class="gradient-text">Hadi inşa edelim.</span>', es: '¿Tienes una idea?<br><span class="gradient-text">Construyámosla.</span>' },
    contactDesc:    { en: "Tell us what you're building. First call is free.<br>OnlyMaxon is currently taking on new projects and collaborations.", pl: "Powiedz nam, co budujesz. Pierwsza rozmowa jest bezpłatna.<br>OnlyMaxon przyjmuje teraz nowe projekty i współprace.", ru: "Расскажи, что ты создаёшь. Первый созвон — бесплатно.<br>OnlyMaxon сейчас берёт новые проекты и коллаборации.", tr: "Ne inşa ettiğini anlat. İlk görüşme ücretsiz.<br>OnlyMaxon şu anda yeni projeler ve iş birlikleri alıyor.", es: "Cuéntanos qué estás creando. La primera llamada es gratis.<br>OnlyMaxon está aceptando nuevos proyectos y colaboraciones." },
    contactBtnEmail:{ en: "Send an Email", pl: "Napisz e-mail", ru: "Написать письмо", tr: "E-posta gönder", es: "Enviar un email" },

    // FOOTER
    footerCopyright: { en: "© 2026 OnlyMaxon Studio. All rights reserved.", pl: "© 2026 OnlyMaxon Studio. Wszelkie prawa zastrzeżone.", ru: "© 2026 OnlyMaxon Studio. Все права защищены.", tr: "© 2026 OnlyMaxon Studio. Tüm hakları saklıdır.", es: "© 2026 OnlyMaxon Studio. Todos los derechos reservados." },
    footerTagline:   { en: "🌍 Working worldwide · Remote-first", pl: "🌍 Pracujemy na całym świecie · Remote-first", ru: "🌍 Работаем по всему миру · Remote-first", tr: "🌍 Tüm dünyada çalışıyoruz · Remote-first", es: "🌍 Trabajamos en todo el mundo · Remote-first" },

    // CONTACT MODAL
    modalTitle:   { en: "Let's work together", pl: "Popracujmy razem", ru: "Давайте поработаем вместе", tr: "Birlikte çalışalım", es: "Trabajemos juntos" },
    modalNote:    { en: "Tell us clearly what you want to build and why you'd like to work with us — the more detail you give, the faster and better we can help.", pl: "Napisz jasno, co chcesz zbudować i dlaczego chcesz z nami pracować — im więcej szczegółów, tym szybciej i lepiej pomożemy.", ru: "Опиши чётко, что хочешь создать и почему хочешь работать с нами — чем больше деталей, тем быстрее и лучше мы поможем.", tr: "Ne inşa etmek istediğini ve neden bizimle çalışmak istediğini net anlat — ne kadar detay verirsen o kadar hızlı ve iyi yardımcı oluruz.", es: "Cuéntanos claramente qué quieres crear y por qué quieres trabajar con nosotros — cuanto más detalle des, más rápido y mejor podremos ayudarte." },
    modalName:    { en: "Your name", pl: "Twoje imię", ru: "Ваше имя", tr: "Adın", es: "Tu nombre" },
    modalEmail:   { en: "Your email", pl: "Twój e-mail", ru: "Ваш e-mail", tr: "E-postan", es: "Tu email" },
    modalMessage: { en: "Describe your project and why you want to work with us…", pl: "Opisz swój projekt i dlaczego chcesz z nami pracować…", ru: "Опишите проект и почему хотите работать с нами…", tr: "Projeni ve neden bizimle çalışmak istediğini anlat…", es: "Describe tu proyecto y por qué quieres trabajar con nosotros…" },
    modalSend:    { en: "Send message", pl: "Wyślij", ru: "Отправить", tr: "Gönder", es: "Enviar" },
    modalSuccess: { en: "Thanks! We'll get back to you soon.", pl: "Dziękujemy! Odezwiemy się wkrótce.", ru: "Спасибо! Скоро свяжемся с вами.", tr: "Teşekkürler! Yakında size döneceğiz.", es: "¡Gracias! Te responderemos pronto." },
    modalError:   { en: "Something went wrong — please email hello@onlymaxon.com", pl: "Coś poszło nie tak — napisz na hello@onlymaxon.com", ru: "Что-то пошло не так — напишите на hello@onlymaxon.com", tr: "Bir şeyler ters gitti — lütfen hello@onlymaxon.com adresine yazın", es: "Algo salió mal — escríbenos a hello@onlymaxon.com" },

    // SERVICE "WHY" EXPLAINERS
    devWhy: { en: "<b>What it is:</b> building your website or app itself. <b>Why:</b> a fast, custom product that's truly yours — no templates, no limits.", pl: "<b>Co to:</b> zbudowanie samej strony lub aplikacji. <b>Po co:</b> szybki, indywidualny produkt, który jest naprawdę Twój — bez szablonów i ograniczeń.", ru: "<b>Что это:</b> создание самого сайта или приложения. <b>Зачем:</b> быстрый, индивидуальный продукт, который реально твой — без шаблонов и ограничений.", tr: "<b>Nedir:</b> web sitenizin veya uygulamanızın kendisini oluşturmak. <b>Neden:</b> gerçekten size ait, hızlı ve özel bir ürün — şablon yok, sınır yok.", es: "<b>Qué es:</b> construir tu web o app en sí. <b>Por qué:</b> un producto rápido y a medida que es realmente tuyo — sin plantillas, sin límites." },
    seoWhy: { en: "<b>What it is:</b> making Google, app stores and AI assistants show your product. <b>Why:</b> so customers actually find you — not your competitors.", pl: "<b>Co to:</b> sprawienie, że Google, sklepy z aplikacjami i asystenci AI pokazują Twój produkt. <b>Po co:</b> żeby klienci naprawdę Cię znajdowali — a nie konkurencję.", ru: "<b>Что это:</b> чтобы Google, магазины приложений и ИИ-ассистенты показывали твой продукт. <b>Зачем:</b> чтобы клиенты находили именно тебя — а не конкурентов.", tr: "<b>Nedir:</b> Google, uygulama mağazaları ve yapay zekâ asistanlarının ürününüzü göstermesini sağlamak. <b>Neden:</b> müşteriler rakiplerinizi değil sizi bulsun diye.", es: "<b>Qué es:</b> hacer que Google, las tiendas de apps y los asistentes de IA muestren tu producto. <b>Por qué:</b> para que los clientes te encuentren a ti — no a tu competencia." },

    // FAQ
    faqEyebrow: { en: "FAQ", pl: "FAQ", ru: "Вопросы", tr: "SSS", es: "FAQ" },
    faqTitle:   { en: "Frequently asked questions", pl: "Najczęstsze pytania", ru: "Частые вопросы", tr: "Sık sorulan sorular", es: "Preguntas frecuentes" },
    faqDesc:    { en: "Everything you might be wondering — answered up front.", pl: "Wszystko, o co możesz pytać — z góry wyjaśnione.", ru: "Всё, что ты можешь спросить — отвечаем сразу.", tr: "Merak edebileceğin her şey — baştan yanıtlandı.", es: "Todo lo que puedas preguntarte — respondido de antemano." },
    faq1Q: { en: "How much does a website cost?", pl: "Ile kosztuje strona?", ru: "Сколько стоит сайт?", tr: "Web sitesi ne kadar?", es: "¿Cuánto cuesta una web?" },
    faq1A: { en: "Websites start at €390 (business-card) and €690 (with online booking). Mobile apps from €1400. You always see the price and timeline before we start — no hidden costs.", pl: "Strony zaczynają się od 390 € (wizytówka) i 690 € (z rezerwacją online). Aplikacje od 1400 €. Cenę i termin widzisz zawsze przed startem — bez ukrytych kosztów.", ru: "Сайты — от 390 € (визитка) и 690 € (с онлайн-бронированием). Приложения — от 1400 €. Цену и сроки видишь до старта — без скрытых расходов.", tr: "Web siteleri 390 €'dan (kartvizit) ve 690 €'dan (online rezervasyonlu) başlar. Mobil uygulamalar 1400 €'dan. Fiyatı ve süreyi başlamadan önce görürsün — gizli maliyet yok.", es: "Las webs empiezan en 390 € (presentación) y 690 € (con reservas online). Apps desde 1400 €. Siempre ves el precio y el plazo antes de empezar — sin costes ocultos." },
    faq2Q: { en: "How long does it take?", pl: "Ile to trwa?", ru: "Сколько времени занимает?", tr: "Ne kadar sürer?", es: "¿Cuánto tarda?" },
    faq2A: { en: "A simple website takes about 1 week, a booking site around 2 weeks, and a mobile app 4–6 weeks. We agree the timeline up front and send you weekly updates.", pl: "Prosta strona to około 1 tydzień, strona z rezerwacją ~2 tygodnie, aplikacja 4–6 tygodni. Termin ustalamy z góry i wysyłamy cotygodniowe aktualizacje.", ru: "Простой сайт — около 1 недели, сайт с бронированием ~2 недели, приложение 4–6 недель. Сроки согласуем заранее и присылаем еженедельные апдейты.", tr: "Basit bir site yaklaşık 1 hafta, rezervasyonlu site ~2 hafta, mobil uygulama 4–6 hafta sürer. Süreyi baştan belirler, haftalık güncelleme göndeririz.", es: "Una web sencilla lleva ~1 semana, una con reservas ~2 semanas y una app 4–6 semanas. Acordamos el plazo por adelantado y enviamos avances semanales." },
    faq3Q: { en: "Do I own the website and the code?", pl: "Czy strona i kod są moje?", ru: "Сайт и код принадлежат мне?", tr: "Site ve kod bana mı ait?", es: "¿La web y el código son míos?" },
    faq3A: { en: "Yes — 100%. Once it's done, the site, the code and all accounts are fully yours. No lock-in, no strings attached.", pl: "Tak — w 100%. Po zakończeniu strona, kod i wszystkie konta są w pełni Twoje. Bez uzależnienia, bez haczyków.", ru: "Да — на 100%. После завершения сайт, код и все аккаунты полностью твои. Без привязки и подводных камней.", tr: "Evet — %100. Bittiğinde site, kod ve tüm hesaplar tamamen senindir. Bağlılık yok, gizli şart yok.", es: "Sí — al 100%. Cuando termina, la web, el código y todas las cuentas son totalmente tuyos. Sin ataduras." },
    faq4Q: { en: "What if I need changes later?", pl: "A jeśli później będę potrzebować zmian?", ru: "А если понадобятся правки позже?", tr: "Sonra değişiklik gerekirse?", es: "¿Y si necesito cambios después?" },
    faq4A: { en: "No problem. Small tweaks are easy, and for ongoing work (new features, SEO/ASO) we agree a clear rate up front. You're never stuck.", pl: "Żaden problem. Drobne poprawki są proste, a przy stałej pracy (nowe funkcje, SEO/ASO) ustalamy jasną stawkę z góry. Nigdy nie utkniesz.", ru: "Без проблем. Мелкие правки — легко, а для постоянной работы (новые функции, SEO/ASO) заранее согласуем понятную ставку. Ты никогда не застрянешь.", tr: "Sorun değil. Küçük düzenlemeler kolaydır; sürekli işler (yeni özellikler, SEO/ASO) için baştan net bir ücret belirleriz. Asla takılıp kalmazsın.", es: "Sin problema. Los ajustes pequeños son fáciles, y para trabajo continuo (nuevas funciones, SEO/ASO) acordamos una tarifa clara por adelantado. Nunca te quedas atascado." },
    faq5Q: { en: "How do we start?", pl: "Jak zaczynamy?", ru: "Как начать?", tr: "Nasıl başlıyoruz?", es: "¿Cómo empezamos?" },
    faq5A: { en: "Just send a message with your idea. The first call is free — we'll figure out what you need, give you a price and timeline, and start whenever you're ready.", pl: "Po prostu napisz wiadomość ze swoim pomysłem. Pierwsza rozmowa jest bezpłatna — ustalimy, czego potrzebujesz, podamy cenę i termin, i zaczniemy, gdy będziesz gotowy.", ru: "Просто напиши сообщение со своей идеей. Первый созвон бесплатный — поймём, что тебе нужно, назовём цену и сроки и начнём, когда будешь готов.", tr: "Sadece fikrini içeren bir mesaj gönder. İlk görüşme ücretsiz — neye ihtiyacın olduğunu anlarız, fiyat ve süre veririz ve hazır olduğunda başlarız.", es: "Solo envía un mensaje con tu idea. La primera llamada es gratis — averiguamos qué necesitas, te damos precio y plazo, y empezamos cuando quieras." }
  };

module.exports = translations;
