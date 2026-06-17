 // year
    const y = document.getElementById("y");
    if (y) y.textContent = String(new Date().getFullYear());

    // reveal
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) e.target.classList.add("is-in"); },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // magnetic
    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = 10;
      el.addEventListener("pointermove", (ev) => {
        const r = el.getBoundingClientRect();
        const dx = ev.clientX - (r.left + r.width / 2);
        const dy = ev.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx / strength}px, ${dy / strength}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = `translate(0px, 0px)`; });
    });

    // EmailJS init (same public key as your contact page)
    emailjs.init({ publicKey: "SzBBlvEjgwysF8vHJ" });
    const supabaseUrl = "https://qpihjqzyxkpmlegijkmt.supabase.co";
const supabaseKey = "sb_publishable_GXP75aI8EF5i0czaZENTBA_huxSaeum";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    // anti-spam
    const VMC_RATE_LIMIT_MS = 25000; // 25s
    let vmcLastSubmitAt = Number(sessionStorage.getItem('vmcInfLastSubmitAt') || '0');

    function vmcIsBotSubmission() {
      const hp = document.getElementById("website");
      if (hp && hp.value && hp.value.trim().length > 0) return true;
      return false;
    }
    function vmcCanSubmitNow() {
      const now = Date.now();
      if (now - vmcLastSubmitAt < VMC_RATE_LIMIT_MS) return false;
      vmcLastSubmitAt = now;
      sessionStorage.setItem('vmcInfLastSubmitAt', String(now));
      return true;
    }

    const form = document.getElementById('infForm');
    const statusBox = document.getElementById('status');
    const waQuick = document.getElementById('waQuick');
    const waMessageField = document.getElementById('wa_message');
    const platformsHidden = document.getElementById('platforms');

    function showStatus(type, msg){
      statusBox.className = 'status ' + type;
      statusBox.textContent = msg;
    }

    function getPlatforms(){
      const selected = Array.from(document.querySelectorAll('.pf'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      return selected;
    }

    function buildWhatsAppText(data){
      const parts = [
        "مرحبًا VMC، قمت بتسجيل بياناتي كمؤثر عبر الموقع وأرغب بالمتابعة.",
        "",
        `الاسم: ${data.full_name}`,
        `رابط الحساب: ${data.account_link}`,
        `الدولة/المدينة: ${data.country} - ${data.city}`,
        `المجال: ${data.niche}`,
        `المنصات: ${data.platforms || '-'}`,
        `نطاق المتابعين: ${data.followers_range}`,
        data.avg_views ? `متوسط المشاهدات: ${data.avg_views}` : null,
        `واتساب: ${data.whatsapp}`
      ].filter(Boolean);
      return parts.join("\n");
    }

    function setWhatsAppLink(text){
      const encoded = encodeURIComponent(text);
      const href = `https://wa.me/4915565678291?text=${encoded}`;
      waQuick.setAttribute('href', href);
      waQuick.removeAttribute('aria-disabled');
    }

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (vmcIsBotSubmission()) {
        showStatus('err', '❌ تعذر إرسال الطلب.');
        return;
      }
      if (!vmcCanSubmitNow()) {
        showStatus('err', 'من فضلك انتظر قليلًا ثم أعد المحاولة.');
        return;
      }

      statusBox.className = 'status';
      statusBox.textContent = '';

      const platforms = getPlatforms();
      platformsHidden.value = platforms.join(", ");

      const data = {
        full_name: form.full_name.value.trim(),
        account_link: form.account_link.value.trim(),
        country: form.country.value.trim(),
        city: form.city.value.trim(),
        niche: form.niche.value,
        platforms: platformsHidden.value,
        followers_range: form.followers_range.value,
        avg_views: form.avg_views.value,
        whatsapp: form.whatsapp.value.trim(),
        email: form.email.value.trim(),
        note: form.note.value.trim()
      };

      // validation
      if (data.full_name.length < 2){ showStatus('err', 'اكتب الاسم بشكل صحيح.'); return; }
      try { new URL(data.account_link); } catch { showStatus('err', 'اكتب رابط حساب صحيح.'); return; }
      if (data.country.length < 2){ showStatus('err', 'اكتب الدولة.'); return; }
      if (data.city.length < 2){ showStatus('err', 'اكتب المدينة.'); return; }
      if (!data.niche){ showStatus('err', 'اختر المجال.'); return; }
      if (platforms.length === 0){ showStatus('err', 'اختر منصة واحدة على الأقل.'); return; }
      if (!data.followers_range){ showStatus('err', 'اختر نطاق المتابعين.'); return; }
      if (data.whatsapp.length < 6){ showStatus('err', 'اكتب رقم واتساب صحيح.'); return; }
      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)){ showStatus('err', 'اكتب بريد إلكتروني صحيح أو اتركه فارغًا.'); return; }

      // WhatsApp message
      const waText = buildWhatsAppText(data) + (data.note ? `\n\nملاحظة:\n${data.note}` : "");
      waMessageField.value = waText;
      setWhatsAppLink(waText);

   showStatus('ok', 'تمام! يتم إرسال تسجيلك الآن...');

try {
  await emailjs.sendForm(
    'service_6w76hdv',
    'template_11cfrv4',
    form
  );

  const { error } = await supabaseClient
    .from('influencers')
    .insert([{
      full_name: data.full_name,
      country: data.country,
      city: data.city,
      account_link: data.account_link,
      niche: data.niche,
      platforms: data.platforms,
      followers_range: data.followers_range,
      avg_views: data.avg_views,
      whatsapp: data.whatsapp,
      email: data.email,
      note: data.note,
      status: 'pending'
    }]);

  if (error) {
    console.error('Supabase error:', error);
  }

  form.reset();
  platformsHidden.value = '';

  showStatus(
    'ok',
    '🚀 تم استلام تسجيلك بنجاح.\n\nسيتواصل معك فريقنا خلال 24 ساعة عمل بالخطوة التالية.'
  );

} catch (err) {
  console.error(err);
  showStatus('err', '❌ حصل خطأ في إرسال الإيميل. تابع عبر واتساب.');
}
    });
