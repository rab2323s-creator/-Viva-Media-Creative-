from pathlib import Path
import json, html, re

ROOT = Path('/mnt/data/viva_site_clean')
WORK = ROOT/'work'

cases = [
  {
    'slug':'personal-brand-public-figure','cat':'creator','category':'بناء العلامة الشخصية','market':'الخليج','duration':'9 أشهر','visual':'creator','word':'IDENTITY',
    'title':'إعادة بناء حضور شخصية عامة حول هوية أوضح ونظام محتوى ثابت.',
    'summary':'بدأنا من تشخيص الصورة الحالية، ثم أعَدنا تعريف الرسائل، أعمدة المحتوى وطريقة الظهور قبل بناء خطة نمو وشراكات متناسقة.',
    'chips':['تموضع أوضح','نظام محتوى','فرص شراكات'],
    'profile':'شخصية عامة لديها حضور قوي ولكن الرسائل والمحتوى لم تكن تعكس قيمة واضحة يمكن للعلامات التجارية البناء عليها.',
    'start':'المحتوى كان متنوعًا دون إطار ثابت، وهوية الحساب تعتمد على الحضور الشخصي أكثر من استراتيجية علامة شخصية متكاملة.',
    'goal':'تحويل الحساب من حضور رقمي متفرق إلى علامة شخصية لها رسالة، أعمدة محتوى، أسلوب بصري ومسار واضح للشراكات.',
    'insight':'النمو لم يكن يحتاج نشرًا أكثر بقدر ما كان يحتاج تحديد ما الذي يجب أن تُعرف به الشخصية، وما الذي يجب أن يتكرر حتى يترسخ هذا الانطباع.',
    'strategy':'بناء Positioning واضح، توزيع المحتوى على محاور محددة، تصميم Formats متكررة، ومواءمة نوع الشراكات مع الصورة الجديدة للعلامة الشخصية.',
    'execution':['تدقيق الحساب والمحتوى السابق','تحديد Positioning ورسائل العلامة الشخصية','بناء Content Pillars وFormats قابلة للتكرار','كتابة أفكار وسكريبتات للحلقات القصيرة','تقويم نشر ومراجعة أداء دورية','إطار لاختيار الشراكات التجارية المناسبة'],
    'result':'أصبحت العلامة الشخصية أكثر اتساقًا وأسهل للفهم، مع نظام محتوى يمكن قياسه وتطويره وفرص شراكات أقرب إلى التوجه المطلوب.',
    'proof':'عند استبدال هذا المثال بحالة حقيقية نعرض هنا مقارنة قبل/بعد، مؤشرات الوصول والمشاهدة، ونوعية الشراكات التي نتجت عن إعادة التموضع.'
  },
  {
    'slug':'personal-brand-expert','cat':'creator','category':'بناء العلامة الشخصية','market':'السعودية','duration':'6 أشهر','visual':'copy','word':'AUTHORITY',
    'title':'تحويل خبرة مهنية إلى علامة شخصية يمكن متابعتها وفهمها بسهولة.',
    'summary':'حوّلنا المعرفة المتخصصة إلى محاور محتوى قصيرة، لغة أبسط وهوية نشر تجعل صاحب الخبرة مرجعًا مفهومًا بدل حساب مهني جامد.',
    'chips':['Authority','Content System','وضوح الرسالة'],
    'profile':'خبير في مجال متخصص لديه معرفة قوية، لكن حضوره الرقمي لا يوضح سبب متابعته أو الفرق بينه وبين الآخرين.',
    'start':'المنشورات متقطعة وطويلة، والموضوعات مفيدة لكنها لا تُقدّم ضمن سلسلة أو وعد واضح للجمهور.',
    'goal':'بناء Authority شخصية قابلة للنمو من خلال محتوى مبسط ومتكرر يعكس الخبرة ويقود إلى طلبات واستفسارات ذات صلة.',
    'insight':'المشكلة لم تكن نقص المعلومات؛ كانت في تحويل المعرفة إلى محتوى سريع الفهم له Hook واضح وتسلسل يمكن للجمهور توقعه.',
    'strategy':'تبسيط Positioning الخبير إلى وعد واحد، تحويل خبرته إلى سلاسل محتوى، وبناء نظام توزيع بين التعليم، الرأي، الحالات والتفاعل.',
    'execution':['جلسة استخراج الخبرة والرسائل الأساسية','تحديد الجمهور والأسئلة الأعلى قيمة','بناء 4 محاور محتوى ثابتة','كتابة Hooks وسكريبتات قصيرة','صياغة CTA مرتبط بالاستفسار أو الحجز','مراجعة شهرية لما يحقق أفضل استجابة'],
    'result':'أصبح الحساب يشرح قيمة صاحبه بسرعة، والمحتوى أكثر اتساقًا وقابلية للتكرار، مع أساس أوضح لتحويل المتابع إلى فرصة عمل.',
    'proof':'في النسخة الحقيقية نربط هنا أفضل السلاسل بمؤشرات المشاهدة، الحفظ، الاستفسارات ونمو الجمهور المستهدف.'
  },
  {
    'slug':'personal-brand-lifestyle-creator','cat':'creator','category':'بناء العلامة الشخصية','market':'الإمارات','duration':'8 أشهر','visual':'viral','word':'STYLE',
    'title':'تنظيم حضور صانع محتوى Lifestyle ليصبح علامة يمكن للبراندات الوثوق بها.',
    'summary':'حافظنا على العفوية التي يحبها الجمهور، لكن أضفنا نظامًا يحدد الهوية، نوع المحتوى المناسب ونوعية التعاونات التي تخدم الصورة طويلة المدى.',
    'chips':['Brand Fit','Consistency','Commercial Readiness'],
    'profile':'صانع محتوى لديه وصول جيد وتفاعل، لكن الحساب يفتقد اتجاهًا ثابتًا يجعل اختيار الشراكات وإدارة صورته التجارية أكثر صعوبة.',
    'start':'المحتوى يحقق مشاهدات متفاوتة وتوجد تعاونات متفرقة، لكن لا توجد قواعد واضحة لما يُقبل أو يُرفض أو كيف يظهر الإعلان ضمن الهوية.',
    'goal':'بناء حضور متماسك يحافظ على طبيعة الحساب ويرفع جاهزيته للتعاون مع علامات أكبر دون تحويله إلى مساحة إعلانية.',
    'insight':'أفضل نمو تجاري لم يكن في زيادة الإعلانات، بل في حماية الثقة عبر تحديد نسبة المحتوى التجاري، شكل الدمج ونوعية القطاعات المناسبة.',
    'strategy':'تحديد Brand Territory لصانع المحتوى، تنظيم Formats اليومية، وضع قواعد Integrations تجارية، وبناء Media Kit ورسائل تفاوض أوضح.',
    'execution':['تحليل أفضل وأسوأ أنماط المحتوى','تحديد Brand Territory والقطاعات المناسبة','بناء قواعد للمحتوى العضوي والتجاري','تطوير Formats قابلة للرعاية دون فقدان الأصالة','تنظيم Media Kit ورسائل التعاون','مراجعة توافق كل فرصة مع الصورة طويلة المدى'],
    'result':'أصبح الحساب أكثر اتساقًا من دون فقدان شخصيته، وأصبحت الشراكات جزءًا طبيعيًا من المحتوى بدل أن تبدو منفصلة عنه.',
    'proof':'مع البيانات الحقيقية نعرض هنا أثر النظام على متوسط المشاهدات، جودة العروض ونسبة قبول الجمهور للمحتوى التجاري.'
  },
  {
    'slug':'influencer-product-launch-saudi','cat':'influencer','category':'حملات المؤثرين','market':'السعودية','duration':'إطلاق منتج','visual':'influencer','word':'LAUNCH',
    'title':'إطلاق منتج عبر مزيج مؤثرين يغطّي الوعي والتجربة والتحويل.',
    'summary':'قسمنا الحملة إلى أدوار واضحة للمؤثرين بدل نشر الرسالة نفسها عند الجميع، وربطنا كل طبقة بهدف وCTA قابل للقياس.',
    'chips':['Creator Mix','Launch Plan','Tracking'],
    'profile':'علامة استهلاكية تستعد لإطلاق منتج جديد وتحتاج وصولًا سريعًا مع قدرة على قراءة ما الذي دفع الزيارات والطلبات.',
    'start':'الخطة الأولية تعتمد على أسماء كبيرة ورسالة واحدة، من دون توزيع أدوار أو طريقة واضحة للتمييز بين الوعي والتحويل.',
    'goal':'خلق زخم خلال فترة الإطلاق، توليد تجربة اجتماعية مقنعة، وقياس أداء كل مجموعة مؤثرين بدل الاكتفاء بإجمالي المشاهدات.',
    'insight':'الحملة تحتاج Sequence وليس موجة نشر واحدة: إثارة الفضول، إثبات التجربة، ثم دفع الجمهور إلى خطوة واضحة.',
    'strategy':'تقسيم المؤثرين إلى Reach / Trust / Conversion tiers، بناء Brief مختلف لكل دور، وجدولة النشر بحيث تبني كل مرحلة على السابقة.',
    'execution':['تحديد الجمهور ورسائل المنتج الأساسية','اختيار المؤثرين بناء على ملاءمة الجمهور لا الحجم فقط','تقسيم الحملة إلى 3 مراحل','Brief وسيناريو استخدام مرن لكل Creator','روابط وأكواد تتبع حسب المؤثر','مراجعة الأداء وتحريك الميزانية نحو الأفضل'],
    'result':'هيكل الحملة أصبح قابلًا للقراءة والتحسين أثناء التنفيذ، مع فصل واضح بين من صنع الوعي ومن دفع الزيارة أو الطلب.',
    'proof':'في الحالة المنشورة نعرض Reach، المشاهدات، الزيارات، الطلبات ونتائج كل Creator tier.'
  },
  {
    'slug':'influencer-beauty-gcc','cat':'influencer','category':'حملات المؤثرين','market':'الخليج','duration':'6 أسابيع','visual':'campaign','word':'TRUST',
    'title':'حملة Beauty مبنية على التجربة والبرهان بدل الرسائل الدعائية المباشرة.',
    'summary':'حوّلنا الرسالة من “منتج جديد” إلى تجربة يمكن للمؤثر إظهارها خطوة بخطوة، مع اختيار Creators حسب المصداقية مع الفئة.',
    'chips':['Beauty Creators','UGC Logic','Consideration'],
    'profile':'علامة تجميل تحتاج بناء ثقة حول منتج يتطلب شرح طريقة الاستخدام والنتيجة المتوقعة قبل الشراء.',
    'start':'المحتوى السابق يركّز على المنتج بصريًا لكن لا يجيب بما يكفي على أسئلة الاستخدام والملاءمة والنتيجة.',
    'goal':'زيادة جودة الاهتمام بالمنتج عبر تجارب أقرب للواقع ومحتوى يزيل الاعتراضات الأساسية قبل CTA.',
    'insight':'في منتجات الجمال، البرهان والروتين الشخصي أكثر إقناعًا من كثافة الرسالة الإعلانية.',
    'strategy':'اختيار Creators لديهم سلوك شرح وتجربة، تطوير زوايا Before/Process/After، وتوزيع الاعتراضات على مجموعة المحتوى بدل تكرار نفس الرسالة.',
    'execution':['تحليل الجمهور والاعتراضات الشرائية','اختيار المؤثرين حسب الثقة ونمط المحتوى','تطوير Creative Territories متعددة','Brief يضمن الرسائل ويترك مساحة للصوت الشخصي','إعادة استخدام أفضل المواد كأصول محتوى','تتبع النقرات واستخدام الأكواد'],
    'result':'تحولت الحملة من عرض منتج إلى منظومة محتوى تجيب عن أسئلة العميل المحتمل وتزيد جودة الاهتمام قبل الشراء.',
    'proof':'في النسخة النهائية نعرض المقارنات بين الزوايا، CTR، استخدام الأكواد والمحتوى الأعلى تأثيرًا.'
  },
  {
    'slug':'influencer-fnb-uae','cat':'influencer','category':'حملات المؤثرين','market':'الإمارات','duration':'4 أسابيع','visual':'viral','word':'VISITS',
    'title':'تحويل حملة مطعم من مشاهدات إلى زيارات فعلية خلال فترة محددة.',
    'summary':'بُنيت الحملة حول سبب للزيارة وتوقيت واضح وتجربة يمكن تصويرها، مع Creators محليين أقرب لمنطقة الفرع والجمهور المطلوب.',
    'chips':['Local Reach','Footfall','Offer Design'],
    'profile':'مطعم يريد دعم فرع أو عرض موسمي ويحتاج أن تنعكس الحملة على الزيارات لا على الوعي فقط.',
    'start':'التعاونات السابقة حققت فيديوهات جميلة لكن يصعب ربطها بالحجوزات أو الزيارات الفعلية.',
    'goal':'رفع الزيارات خلال نافذة زمنية محددة وخلق محتوى يشرح ماذا سيجد الزائر ولماذا يأتي الآن.',
    'insight':'المؤثر المحلي الأصغر قد يكون أكثر قيمة من الاسم الأكبر عندما يكون الهدف Footfall حول موقع محدد.',
    'strategy':'Geo-relevant creator mix، عرض واضح محدود الزمن، محتوى يركز على التجربة الفعلية وCTA مرتبط بالحجز أو الزيارة.',
    'execution':['تحديد مناطق الجمهور حول الفرع','اختيار Creators محليين ومناسبين للفئة','تصميم زاوية تجربة واضحة لكل فيديو','ربط العرض بفترة زمنية محددة','استخدام رموز أو حجز قابل للتتبع','تجميع أفضل المواد لإعادة استخدامها'],
    'result':'أصبحت الحملة مصممة حول سلوك الزيارة نفسه بدل قياس النجاح على المشاهدة فقط.',
    'proof':'عند إدخال بيانات المشروع الحقيقي نعرض هنا الزيارات، الحجوزات، استخدام العرض وأفضل المؤثرين حسب المنطقة.'
  },
  {
    'slug':'influencer-app-acquisition','cat':'influencer','category':'حملات المؤثرين','market':'السعودية والإمارات','duration':'8 أسابيع','visual':'seo','word':'ACTION',
    'title':'ربط محتوى المؤثرين بمسار تحميل واستخدام تطبيق بدل الاكتفاء بالوعي.',
    'summary':'صممنا الحملة من لحظة مشاهدة المحتوى إلى التثبيت والخطوة الأولى داخل التطبيق، مع رسائل مختلفة حسب نوع المستخدم.',
    'chips':['Acquisition','Deep Links','Cohorts'],
    'profile':'تطبيق رقمي يبحث عن مستخدمين جدد ويحتاج معرفة أي Creators ورسائل تجلب استخدامًا فعليًا لا مجرد Install.',
    'start':'المؤثرون كانوا يُقاسون على الوصول والنقر بينما لا يوجد ربط كافٍ بجودة المستخدم بعد التحميل.',
    'goal':'خفض الهدر وفهم أي نوع من المؤثرين والزوايا يقود إلى مستخدمين يكملون الخطوة المطلوبة داخل المنتج.',
    'insight':'التحويل الحقيقي ليس النقر أو التحميل؛ بل السلوك الذي يجعل المستخدم ذا قيمة للتطبيق.',
    'strategy':'تحديد Event نجاح داخل التطبيق، استخدام Deep Links، تقسيم الرسائل حسب use case، ومقارنة cohorts حسب Creator.',
    'execution':['تعريف Conversion Event مع الفريق','تصميم Creator briefs حسب Use Case','إعداد روابط تتبع منفصلة','تقسيم الميزانية إلى Test ثم Scale','مراجعة جودة المستخدمين بعد التحميل','توسيع Creators والزوايا الأفضل أداءً'],
    'result':'أصبح تقييم المؤثرين مرتبطًا بجودة الاكتساب بدل الأرقام السطحية فقط، ما يجعل قرارات التوسع أكثر دقة.',
    'proof':'في الحالة الحقيقية نعرض CPI/CPA، التفعيل، جودة cohorts والفارق بين أنواع Creators.'
  },
  {
    'slug':'influencer-ramadan-campaign','cat':'influencer','category':'حملات المؤثرين','market':'الشرق الأوسط','duration':'رمضان','visual':'copy','word':'MOMENT',
    'title':'حملة موسمية مبنية على لحظات رمضان لا على كثرة المنشورات.',
    'summary':'وزعنا الحملة على لحظات استخدام وسياقات مختلفة خلال الشهر بدل إطلاق موجة واحدة تفقد تأثيرها بسرعة.',
    'chips':['Seasonal Plan','Moments','Creator Roles'],
    'profile':'علامة تريد الاستفادة من رمضان ضمن سوق مزدحم جدًا بالمحتوى والعروض والتعاونات.',
    'start':'المخاطر الرئيسية هي تشابه الرسائل، ارتفاع تكلفة الوصول، وضياع الحملة وسط كثافة الإعلانات الموسمية.',
    'goal':'امتلاك لحظات محددة خلال الشهر وصناعة تكرار ذكي للرسالة من دون إرهاق الجمهور.',
    'insight':'رمضان ليس حملة واحدة؛ سلوك الجمهور والاهتمامات تتغير من بداية الشهر إلى منتصفه والعيد.',
    'strategy':'تقسيم الشهر إلى Moments، اختيار Creators مختلفين لكل لحظة، وتطوير Creative Territories تحافظ على هوية الحملة مع تنويع المحتوى.',
    'execution':['تقسيم الرحلة الموسمية إلى مراحل','اختيار المؤثرين لكل Moment','رسائل مختلفة لكل مرحلة','تقويم نشر يراعي المنافسة والأيام المهمة','مراقبة Frequency وردود الفعل','تحويل أفضل المحتوى إلى أصول لاحقة'],
    'result':'الحملة تصبح سلسلة مترابطة من اللحظات بدل Burst قصير، ما يجعل الرسالة أكثر حضورًا وأقل تكرارًا.',
    'proof':'في النسخة الموثقة نعرض أداء كل Moment ونوع المؤثرين والأيام الأعلى أثرًا.'
  },
  {
    'slug':'seo-ecommerce-architecture','cat':'seo','category':'SEO & Growth','market':'السعودية','duration':'6 أشهر','visual':'seo','word':'SEARCH',
    'title':'إعادة هيكلة متجر إلكتروني ليظهر على نوايا البحث التي تقود إلى الشراء.',
    'summary':'بدأنا من Architecture المتجر والطلب الحقيقي في البحث، ثم بنينا صفحات فئات ومحتوى يخدم القرار الشرائي بدل ملاحقة كلمات منفصلة.',
    'chips':['Architecture','Commercial Intent','CRO'],
    'profile':'متجر إلكتروني لديه منتجات جيدة وإعلانات نشطة، لكن الزيارات العضوية ضعيفة والصفحات لا تغطي طريقة بحث العميل عن الفئة.',
    'start':'هيكل الفئات مبني داخليًا حسب الكتالوج أكثر من كونه مبنيًا على الطلب والكلمات التجارية التي يستخدمها الجمهور.',
    'goal':'زيادة الظهور على عمليات بحث ذات نية شرائية وربط الزيارات بالمنتجات والفئات المناسبة بأقل احتكاك.',
    'insight':'الفرصة لم تكن في كتابة عشرات المقالات؛ كانت في إصلاح هيكل الفئات والربط الداخلي وإعطاء Google صفحات تستحق الترتيب.',
    'strategy':'Keyword mapping حسب نية البحث، إعادة تصميم taxonomy، تحسين صفحات الفئات، دعمها بمحتوى مساعد وربط القياس بالتحويل.',
    'execution':['Technical crawl وفحص الفهرسة','Keyword map للفئات والمنتجات','إعادة هيكلة Categories وURLs','تحسين Titles/H1/Copy للصفحات التجارية','Internal linking من المحتوى إلى الفئات','مراقبة Rankings والزيارات والتحويلات'],
    'result':'تحول SEO من نشاط محتوى منفصل إلى قناة نمو مرتبطة بالكتالوج ومسار الشراء.',
    'proof':'في المشروع الحقيقي نعرض نمو الزيارات غير المدفوعة، الكلمات Top 3/10، الإيراد العضوي وصفحات الفئات الأعلى تحسنًا.'
  },
  {
    'slug':'seo-local-service-uae','cat':'seo','category':'SEO & Growth','market':'الإمارات','duration':'5 أشهر','visual':'campaign','word':'LOCAL',
    'title':'بناء حضور بحث محلي لخدمة تعتمد على العملاء داخل مدينة محددة.',
    'summary':'ربطنا صفحات الخدمة والموقع الجغرافي وGoogle Business Profile ضمن هيكل واحد يطابق طريقة بحث العميل المحلي.',
    'chips':['Local SEO','Service Pages','Leads'],
    'profile':'شركة خدمات تعتمد على منطقة جغرافية محددة وتريد زيادة الطلبات القادمة من Google بدل الاعتماد الكامل على الإعلانات.',
    'start':'صفحة عامة واحدة للخدمات، إشارات محلية ضعيفة، وGoogle Business Profile غير مستثمر بما يكفي.',
    'goal':'الظهور على استفسارات الخدمة + المنطقة وتحويل البحث المحلي إلى اتصالات وطلبات مباشرة.',
    'insight':'المستخدم المحلي يحتاج صفحة تجيب عن الخدمة والمكان والثقة في نفس الوقت، وليس مجرد ذكر اسم المدينة داخل النص.',
    'strategy':'بناء صفحات خدمة محلية قوية، تحسين الكيان التجاري، Reviews workflow، وربط المحتوى بالأسئلة المحلية ذات النية العالية.',
    'execution':['Local keyword research','تحسين Google Business Profile','بناء صفحات خدمة/منطقة','Schema وبيانات NAP متسقة','خطة Reviews وFAQ','تتبع Calls وForms من Organic'],
    'result':'أصبح الموقع أكثر قابلية للاكتشاف على مستوى المنطقة، مع مسار أوضح لتحويل الباحث المحلي إلى تواصل.',
    'proof':'في الحالة النهائية نعرض Map Pack visibility، المكالمات، النماذج والكلمات المحلية الأعلى قيمة.'
  },
  {
    'slug':'seo-b2b-authority','cat':'seo','category':'SEO & Growth','market':'الخليج','duration':'9 أشهر','visual':'creator','word':'AUTHORITY',
    'title':'بناء سلطة بحثية لشركة B2B حول مشكلات يطرحها العميل قبل التواصل مع المبيعات.',
    'summary':'انتقلنا من كتابة مقالات عامة إلى Content Clusters مرتبطة بالمشكلات والقرارات التي يمر بها العميل قبل طلب العرض.',
    'chips':['B2B','Topic Clusters','Qualified Leads'],
    'profile':'شركة B2B في سوق يتطلب دورة قرار أطول، والموقع يشرح الخدمات لكنه لا يلتقط عمليات البحث التي تسبق التواصل مع المبيعات.',
    'start':'محتوى متفرق، صفحات خدمات قصيرة، ولا توجد خريطة تربط المواضيع بمراحل الوعي والمقارنة والشراء.',
    'goal':'بناء Authority على مواضيع أساسية وجذب زيارات نوعية يمكن ربطها بخدمات وحلول واضحة.',
    'insight':'العميل B2B غالبًا يبحث عن المشكلة والمعايير والمقارنة قبل أن يبحث عن اسم الخدمة نفسه.',
    'strategy':'تحديد Pillars تجارية، بناء Clusters معرفية حولها، تطوير صفحات الخدمات لتلتقط intent أعمق، وربط المحتوى بـCTA مناسب للمرحلة.',
    'execution':['Search journey mapping','تحديد Topic Clusters','إعادة كتابة صفحات الحلول','إنتاج محتوى متخصص عالي القيمة','Internal linking بين المعرفة والخدمات','قياس Leads حسب Landing page'],
    'result':'أصبح الموقع يبني الطلب قبل صفحة التواصل، ويجيب عن أسئلة العميل في مراحل مختلفة من القرار.',
    'proof':'في النسخة الحقيقية نعرض نمو Non-brand traffic، الكلمات التجارية، MQLs والصفحات التي ساهمت في التحويل.'
  },
  {
    'slug':'seo-content-hub','cat':'seo','category':'SEO & Growth','market':'الشرق الأوسط','duration':'12 شهر','visual':'viral','word':'HUB',
    'title':'تحويل مكتبة محتوى مشتتة إلى مركز معرفة يراكم الظهور بدل أن ينافس نفسه.',
    'summary':'راجعنا المحتوى القديم، دمجنا التكرار، حددنا Pillars واضحة وبنينا نظام تحديث يحافظ على قيمة الصفحات مع الوقت.',
    'chips':['Content Audit','Clusters','Evergreen Growth'],
    'profile':'موقع ينشر كثيرًا منذ سنوات لكن لديه تداخل بين الموضوعات وصفحات كثيرة ضعيفة أو قديمة.',
    'start':'عدد كبير من المقالات لا يساوي بالضرورة سلطة؛ بعض الصفحات كانت تتنافس على نفس النية وبعضها فقد ترتيبه مع الوقت.',
    'goal':'تقليل الهدر، رفع جودة الفهرسة، وتحويل الأرشيف إلى شبكة محتوى مترابطة حول مواضيع واضحة.',
    'insight':'الفرصة الأكبر كانت في تحسين الموجود ودمجه قبل إضافة حجم جديد من المحتوى.',
    'strategy':'Content pruning، consolidation، Topic clusters، تحديث دوري وربط داخلي يوضح العلاقة بين الصفحات الرئيسية والفرعية.',
    'execution':['Content inventory وتصنيف الأداء','تحديد Cannibalization والتكرار','دمج/إعادة توجيه الصفحات الضعيفة','بناء Pillar pages','تحسين الربط الداخلي','جدول تحديث للمحتوى الأعلى قيمة'],
    'result':'أصبح الأرشيف أكثر تركيزًا وأسهل للفهم من محركات البحث والمستخدم، مع أساس أفضل للنمو التراكمي.',
    'proof':'في المشروع الفعلي نعرض الصفحات التي تم دمجها، نمو الـClicks/Impressions والتغير في الكلمات لكل Cluster.'
  },
  {
    'slug':'seo-migration-technical','cat':'seo','category':'SEO & Growth','market':'الإمارات','duration':'مشروع تقني','visual':'influencer','word':'MIGRATE',
    'title':'إدارة انتقال موقع جديد بدون خسارة القيمة العضوية المبنية سابقًا.',
    'summary':'بنينا Migration map قبل الإطلاق، راقبنا الفهرسة بعده، وأصلحنا إشارات الصفحات بسرعة لحماية الزيارات والترتيبات المهمة.',
    'chips':['Migration','Technical SEO','Risk Control'],
    'profile':'شركة تعيد تصميم موقعها بالكامل وتحتاج الحفاظ على الزيارات العضوية والكلمات الحالية أثناء تغيير البنية والروابط.',
    'start':'تصميم جديد وهيكل URLs جديدان، مع خطر فقدان صفحات قوية أو خلق Redirect chains و404s واسعة.',
    'goal':'إطلاق الموقع الجديد بأقل خسارة ممكنة وإعادة تثبيت الإشارات العضوية بسرعة بعد الانتقال.',
    'insight':'SEO migration يبدأ قبل يوم الإطلاق؛ أي قرار URL أو Navigation غير محسوب قد يمحو قيمة تراكمت لسنوات.',
    'strategy':'حصر جميع URLs ذات القيمة، mapping 1:1 قدر الإمكان، QA تقني قبل الإطلاق ومراقبة يومية في الأسابيع الأولى.',
    'execution':['Crawl كامل للموقع القديم','ربط كل URL بوجهته الجديدة','QA للـcanonical/indexation/sitemaps','اختبار redirects قبل الإطلاق','مراقبة 404 وcoverage بعد الإطلاق','إصلاح سريع للصفحات والكلمات الحساسة'],
    'result':'تحول الانتقال من مخاطرة تقنية إلى مشروع محكوم بخطة حماية ومتابعة واضحة.',
    'proof':'في الحالة الموثقة نعرض مقارنة Organic traffic وTop landing pages قبل/بعد الانتقال ونسبة أخطاء الفهرسة.'
  }
]

categories = [
  ('all','الكل'),('creator','بناء العلامة الشخصية'),('influencer','حملات المؤثرين'),('seo','SEO & Growth')
]

NAV='''<header class="nav workNav" data-work-nav>
<a class="brand" href="/" aria-label="Viva Media Creative — الرئيسية"><span class="brand__mark">VMC</span><span class="brand__name">Viva Media Creative</span></a>
<button class="workNav__toggle" type="button" aria-expanded="false" aria-controls="work-nav-links" aria-label="فتح القائمة"><span></span><span></span></button>
<nav class="nav__links workNav__links" id="work-nav-links" aria-label="القائمة الرئيسية"><a href="/">الرئيسية</a><a href="/services/">الخدمات</a><a class="is-active" href="/work/">أعمالنا</a><a href="/influencer-platform/">منصة المؤثرين</a><a class="pill" href="/contact/">تواصل</a><a href="/en/" class="langCapsule" aria-label="Switch to English"><span class="langIcon">🌐</span><span class="langText">EN</span></a></nav>
</header>'''

FOOTER='''<footer class="siteFooter" role="contentinfo"><div class="siteFooter__inner">
<div class="fCol fCol--brand"><a class="fBrand" href="/" aria-label="Viva Media Creative"><img class="fBrand__logo" src="/assets/logo.jpeg" alt="Viva Media Creative logo" loading="lazy" decoding="async"/><div class="fBrand__text"><span class="fBrand__name">Viva Media Creative</span><span class="fBrand__tag">نُحوّل التأثير إلى شراكات مدفوعة، مبيعات، ونمو قابل للقياس.</span></div></a><div class="fSocial"><a class="fSocial__link" href="https://www.linkedin.com/company/viva-media-creative/" target="_blank" rel="noopener noreferrer">LinkedIn</a><a class="fSocial__link" href="https://www.facebook.com/vivamediacreative" target="_blank" rel="noopener noreferrer">Facebook</a><a class="fSocial__link" href="https://www.instagram.com/vivamediacreative/" target="_blank" rel="noopener noreferrer">Instagram</a></div></div>
<div class="fCol"><h3 class="fTitle">روابط سريعة</h3><nav class="fLinks"><a href="/services/">الخدمات</a><a href="/work/">أعمالنا</a><a href="/influencer-platform/">منصة المؤثرين</a><a href="/insights/">مركز المعرفة</a><a href="/contact/">تواصل</a></nav></div>
<div class="fCol"><h3 class="fTitle">تواصل</h3><div class="fContact"><a class="fPill" href="/contact/">اطلب استشارة</a><div class="fMeta"><span class="fMeta__k">النطاق</span><span class="fMeta__v">السعودية • الإمارات • مصر</span></div><div class="fLegal"><a href="/about/">من نحن</a><a href="/privacy/">الخصوصية</a><a href="/terms/">الشروط</a></div></div></div>
</div><div class="siteFooter__bottom"><span>© <span id="y"></span> Viva Media Creative</span></div></footer>'''

VISUALS = {
'creator':'<div class="caseVisual__orbit"><i></i><i></i><i></i></div><div class="caseVisual__signal"><span></span><span></span><span></span><span></span><span></span></div>',
'influencer':'<div class="caseVisual__nodes"><i></i><i></i><i></i><i></i><i></i><i></i></div>',
'seo':'<div class="caseVisual__chart"><i></i><i></i><i></i><i></i><i></i><i></i></div>',
'viral':'<div class="caseVisual__pulse"><i></i><i></i><i></i></div>',
'copy':'<div class="caseVisual__type"><b>HOOK</b><b>STORY</b><b>CTA</b></div>',
'campaign':'<div class="caseVisual__rings"><i></i><i></i><i></i><i></i></div>'
}

def esc(s): return html.escape(str(s))

def visual(c, n):
    v=c['visual']; return f'''<div class="caseVisual caseVisual--{v}" aria-hidden="true"><div class="caseVisual__grid"></div><span class="caseVisual__number">{n:02d}</span><span class="caseVisual__word">{esc(c['word'])}</span>{VISUALS[v]}</div>'''

def card(c,n,featured=False):
    cls='caseCard workReveal'
    if featured: cls+=' caseCard--featured'
    chips=''.join(f'<div><strong>{esc(x)}</strong><span>محور العمل</span></div>' for x in c['chips'])
    return f'''<article class="{cls}" data-category="{c['cat']}">
{visual(c,n)}
<div class="caseCard__body"><div class="caseCard__topline"><span class="caseCard__category">{esc(c['category'])}</span><span class="caseCard__market">{esc(c['market'])} · {esc(c['duration'])}</span></div><h3>{esc(c['title'])}</h3><p>{esc(c['summary'])}</p><div class="caseMetrics" aria-label="محاور المشروع">{chips}</div><a class="caseCard__action" href="/work/{c['slug']}/">شاهد كيف نفّذنا المشروع <span aria-hidden="true">↗</span></a></div></article>'''

filters=''.join(f'<button class="workFilter {"is-active" if key=="all" else ""}" type="button" data-filter="{key}">{label} <span data-count="{key}">{len(cases) if key=="all" else sum(1 for c in cases if c["cat"]==key)}</span></button>' for key,label in categories)
cards='\n'.join(card(c,i+1,featured=(i==0)) for i,c in enumerate(cases))

index=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>أعمالنا | Viva Media Creative</title><meta name="description" content="أمثلة مختارة من أعمال Viva Media Creative في بناء العلامة الشخصية، حملات المؤثرين وSEO & Growth، مع شرح مختصر لطريقة العمل من البداية إلى التنفيذ."/><link rel="canonical" href="https://vivamediacreative.com/work/"/><meta name="robots" content="noindex,nofollow"/><link rel="icon" type="image/png" href="/favicon.png"/><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;700;800&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/assets/vmc-home.css"/><link rel="stylesheet" href="/assets/vmc-work.css"/></head><body class="workPage"><div class="noise" aria-hidden="true"></div><div class="workAmbient" aria-hidden="true"><span class="workAmbient__orb workAmbient__orb--gold"></span><span class="workAmbient__orb workAmbient__orb--violet"></span><span class="workAmbient__orb workAmbient__orb--mint"></span></div>{NAV}<main>
<section class="workHero" aria-labelledby="work-title"><div class="workHero__watermark" aria-hidden="true">WORK</div><div class="workHero__grid" aria-hidden="true"></div><div class="workShell workHero__inner"><div class="workHero__copy workReveal"><p class="workEyebrow"><span>SELECTED WORK</span> / أعمالنا</p><h1 id="work-title">شاهد كيف<br><span class="workGradientText">نحوّل الخدمة إلى عمل فعلي.</span></h1><p class="workHero__lead">هذه مجموعة مختارة من أعمالنا. اختر الخدمة التي تهمك، ثم افتح أي مشروع لترى باختصار كيف بدأنا، ماذا قررنا، ماذا نفّذنا، وكيف نقيس النتيجة.</p><div class="workHero__actions"><a class="workBtn workBtn--primary" href="#cases">استعرض الأعمال <span aria-hidden="true">↙</span></a><a class="workBtn workBtn--ghost" href="/contact/">ناقش مشروعك معنا</a></div></div><aside class="workHero__aside workReveal" aria-label="مجالات الأعمال"><div class="workHero__index"><span class="workHero__indexNo">03</span><span class="workHero__indexLabel">Core Areas</span></div><div class="workHero__capabilities"><span>Personal Branding</span><span>Influencer Campaigns</span><span>SEO & Growth</span></div><div class="workHero__privacy"><span class="workHero__privacyDot" aria-hidden="true"></span><p>نعرض المشروع والمنهج والنتائج المسموح بمشاركتها، مع الحفاظ على خصوصية العميل.</p></div></aside></div><div class="workMarquee" aria-hidden="true"><div class="workMarquee__track"><span>STARTING POINT</span><i></i><span>STRATEGY</span><i></i><span>EXECUTION</span><i></i><span>MEASUREMENT</span><i></i><span>STARTING POINT</span><i></i><span>STRATEGY</span><i></i><span>EXECUTION</span><i></i><span>MEASUREMENT</span><i></i></div></div></section>
<section class="workIntro" aria-labelledby="work-intro-title"><div class="workShell workIntro__grid"><div class="workIntro__label workReveal"><span>01</span><p>كيف تستخدم الصفحة</p></div><div class="workIntro__copy workReveal"><h2 id="work-intro-title">اختر الخدمة.<br><span>ثم شاهد أمثلة من تنفيذنا.</span></h2><p>لا نعرض كل ما قمنا به. نختار عددًا محدودًا من المشاريع التي تساعد العميل على فهم طريقة عملنا: نقطة البداية، التفكير، التنفيذ، وما الذي نراقبه بعد الإطلاق.</p></div></div></section>
<section class="workCases" id="cases" aria-labelledby="cases-title"><div class="workShell"><div class="workCases__head workReveal"><div><p class="workEyebrow">SELECTED CASES / أمثلة مختارة</p><h2 id="cases-title">الأعمال حسب الخدمة</h2></div><p class="workCases__desc">يمكنك مشاهدة جميع الأمثلة أو اختيار نوع الخدمة. كل بطاقة تفتح صفحة مستقلة تشرح المشروع من البداية إلى النهاية بصورة مختصرة.</p></div><div class="workFiltersWrap"><div class="workFilters" role="group" aria-label="تصفية الأعمال حسب الخدمة">{filters}</div></div><div class="workGrid" data-work-grid>{cards}</div><div class="workEmpty" data-empty hidden><span>لا توجد حالات منشورة ضمن هذه الفئة بعد.</span></div></div></section>
<section class="workFramework" aria-labelledby="framework-title"><div class="workShell"><div class="workFramework__head workReveal"><div class="workIntro__label"><span>02</span><p>داخل كل مشروع</p></div><div><p class="workEyebrow">FROM BRIEF TO RESULT</p><h2 id="framework-title">ما الذي ستراه داخل دراسة الحالة؟</h2></div></div><div class="workFramework__grid"><article class="frameworkStep workReveal"><span>01</span><h3>نقطة البداية</h3><p>وضع العميل والسوق والمشكلة التي بدأ منها المشروع.</p></article><article class="frameworkStep workReveal"><span>02</span><h3>الهدف</h3><p>ما الذي كان يجب أن يتغير أو يتحقق، ولماذا.</p></article><article class="frameworkStep workReveal"><span>03</span><h3>الاستراتيجية</h3><p>كيف قرأنا الحالة وما القرارات التي بنينا عليها التنفيذ.</p></article><article class="frameworkStep workReveal"><span>04</span><h3>ما نفّذناه</h3><p>الخطوات العملية، المحتوى، القنوات، التحسينات والأدوات.</p></article><article class="frameworkStep workReveal"><span>05</span><h3>النتيجة</h3><p>المؤشرات المتاحة وما الذي تعلمناه من المشروع.</p></article></div></div></section>
<section class="workNda" aria-labelledby="nda-title"><div class="workShell workNda__inner workReveal"><div class="workNda__mark" aria-hidden="true">VMC</div><div class="workNda__copy"><p class="workEyebrow">SELECTED, NOT EXHAUSTIVE</p><h2 id="nda-title">أمثلة مختارة من عدد أكبر من الأعمال.</h2><p>الهدف من هذا القسم ليس نشر أسماء العملاء أو كل تفاصيل المشاريع؛ بل إعطاؤك صورة واضحة عن طريقة تفكيرنا وتنفيذنا في أنواع مختلفة من العمل.</p></div></div></section>
<section class="workCta" aria-labelledby="work-cta-title"><div class="workShell workCta__card workReveal"><p class="workEyebrow">HAVE A SIMILAR CHALLENGE?</p><h2 id="work-cta-title">إذا كان لديك تحدٍ مشابه،<br><span>نبدأ من هدفك.</span></h2><p>شاركنا طبيعة المشروع والسوق والنتيجة التي تريد الوصول إليها، ونقترح المسار المناسب بدل تقديم حل جاهز للجميع.</p><div class="workCta__actions"><a class="workBtn workBtn--primary" href="/contact/">تحدث مع فريق Viva <span aria-hidden="true">↗</span></a><a class="workBtn workBtn--ghost" href="/services/">استكشف الخدمات</a></div></div></section></main>{FOOTER}<script src="/assets/vmc-work.js" defer></script></body></html>'''
(WORK/'index.html').write_text(index, encoding='utf-8')

# Case pages
for i,c in enumerate(cases,1):
    d=WORK/c['slug']; d.mkdir(parents=True, exist_ok=True)
    exec_items=''.join(f'<li><span>{j:02d}</span><p>{esc(x)}</p></li>' for j,x in enumerate(c['execution'],1))
    chips=''.join(f'<span>{esc(x)}</span>' for x in c['chips'])
    related=[x for x in cases if x['cat']==c['cat'] and x['slug']!=c['slug']][:2]
    related_html=''.join(f'<a class="caseRelated__item" href="/work/{x["slug"]}/"><small>{esc(x["category"])} · {esc(x["market"])}</small><strong>{esc(x["title"])}</strong><span>عرض المشروع ↗</span></a>' for x in related)
    page=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>{esc(c['title'])} | أعمال Viva Media Creative</title><meta name="description" content="دراسة حالة مختصرة من Viva Media Creative: {esc(c['summary'])}"/><link rel="canonical" href="https://vivamediacreative.com/work/{c['slug']}/"/><meta name="robots" content="noindex,nofollow"/><link rel="icon" type="image/png" href="/favicon.png"/><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;700;800&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/assets/vmc-home.css"/><link rel="stylesheet" href="/assets/vmc-work.css"/></head><body class="workPage caseStudyPage"><div class="noise" aria-hidden="true"></div><div class="workAmbient" aria-hidden="true"><span class="workAmbient__orb workAmbient__orb--gold"></span><span class="workAmbient__orb workAmbient__orb--violet"></span><span class="workAmbient__orb workAmbient__orb--mint"></span></div>{NAV}<main>
<section class="caseHero"><div class="workShell"><a class="caseBack" href="/work/">← العودة إلى أعمالنا</a><div class="caseHero__grid"><div class="caseHero__copy workReveal"><p class="workEyebrow">CASE STUDY / {esc(c['category'])}</p><h1>{esc(c['title'])}</h1><p>{esc(c['summary'])}</p><div class="caseHero__chips">{chips}</div></div><div class="caseHero__visual workReveal">{visual(c,i)}</div></div><div class="caseHero__meta workReveal"><div><span>السوق</span><strong>{esc(c['market'])}</strong></div><div><span>مدة العمل</span><strong>{esc(c['duration'])}</strong></div><div><span>الخدمة</span><strong>{esc(c['category'])}</strong></div><div><span>العميل</span><strong>الهوية محجوبة</strong></div></div></div></section>
<section class="caseNarrative"><div class="workShell caseNarrative__grid"><aside class="caseRail workReveal"><span>01</span><p>المشروع باختصار</p></aside><div class="caseStory workReveal"><article><p class="workEyebrow">CLIENT PROFILE</p><h2>نوع المشروع</h2><p>{esc(c['profile'])}</p></article><article><p class="workEyebrow">STARTING POINT</p><h2>من أين بدأنا؟</h2><p>{esc(c['start'])}</p></article><article><p class="workEyebrow">OBJECTIVE</p><h2>ما الذي كان مطلوبًا؟</h2><p>{esc(c['goal'])}</p></article></div></div></section>
<section class="caseStrategy"><div class="workShell caseStrategy__grid"><div class="caseStrategy__big workReveal"><p class="workEyebrow">THE THINKING</p><h2>قراءتنا للحالة</h2><p>{esc(c['insight'])}</p></div><div class="caseStrategy__card workReveal"><span>STRATEGY</span><h3>الاستراتيجية التي بنينا عليها العمل</h3><p>{esc(c['strategy'])}</p></div></div></section>
<section class="caseExecution"><div class="workShell"><div class="workFramework__head workReveal"><div class="workIntro__label"><span>02</span><p>التنفيذ</p></div><div><p class="workEyebrow">WHAT WE DID</p><h2>ما الذي قمنا به فعليًا؟</h2></div></div><ol class="caseExecution__list">{exec_items}</ol></div></section>
<section class="caseOutcome"><div class="workShell caseOutcome__grid"><div class="caseOutcome__copy workReveal"><p class="workEyebrow">OUTCOME</p><h2>ما الذي تغيّر بعد التنفيذ؟</h2><p>{esc(c['result'])}</p></div><div class="caseOutcome__proof workReveal"><span>MEASUREMENT</span><h3>ما الذي نعرضه عند نشر الحالة الموثقة؟</h3><p>{esc(c['proof'])}</p></div></div></section>
<section class="caseRelated"><div class="workShell"><div class="caseRelated__head workReveal"><div><p class="workEyebrow">MORE WORK</p><h2>أعمال أخرى ضمن نفس الخدمة</h2></div><a href="/work/">جميع الأعمال ↗</a></div><div class="caseRelated__grid">{related_html}</div></div></section>
<section class="workCta"><div class="workShell workCta__card workReveal"><p class="workEyebrow">SIMILAR PROJECT?</p><h2>عندك مشروع مشابه؟<br><span>احكِ لنا أين تريد أن تصل.</span></h2><p>نبدأ من وضعك الحالي والهدف التجاري، ثم نبني الاستراتيجية والتنفيذ المناسبين.</p><div class="workCta__actions"><a class="workBtn workBtn--primary" href="/contact/">ناقش مشروعك معنا <span aria-hidden="true">↗</span></a><a class="workBtn workBtn--ghost" href="/work/">العودة إلى الأعمال</a></div></div></section></main>{FOOTER}<script src="/assets/vmc-work.js" defer></script></body></html>'''
    (d/'index.html').write_text(page, encoding='utf-8')

# source data for easy editing
(WORK/'cases.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2), encoding='utf-8')

print(f'Generated {len(cases)} case pages + work index')
