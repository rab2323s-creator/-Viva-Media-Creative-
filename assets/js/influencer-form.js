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


    const form = document.getElementById('infForm');
    if (form) {
      const $ = id => document.getElementById(id);
      const statusBox = $('status'), waQuick = $('waQuick'), submit = form.querySelector('button[type="submit"]');
      const choice = $('country_choice'), other = $('country_other'), phone = $('whatsapp');
      const rateKey = 'vmcInfLastSubmitAt';
      let sending = false, completed = false, previousCode = '', lastSuccess = 0;
      try { lastSuccess = Number(sessionStorage.getItem(rateKey) || 0); } catch {}
      const show = (type, message, focus = false) => {
        statusBox.className = 'status ' + type;
        statusBox.textContent = message;
        if (focus) statusBox.focus();
      };
      const clean = s => String(s || '').trim();
      const asciiDigits = s => s.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
      function syncCountry() {
        const custom = choice.value === 'other';
        $('country_other_wrap').hidden = !custom;
        other.disabled = !custom;
        other.required = custom;
        $('country').value = custom ? clean(other.value) : choice.value;
        const code = choice.selectedOptions[0]?.dataset.code || '';
        if (!clean(phone.value) || clean(phone.value) === previousCode) phone.value = code;
        phone.placeholder = code ? code + '...' : '+...';
        previousCode = code;
      }
      choice.addEventListener('change', syncCountry);
      other.addEventListener('input', () => { $('country').value = clean(other.value); });
      function linkValue(value) {
        let v = clean(value);
        if (!v) return '';
        if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = 'https://' + v;
        const u = new URL(v);
        if (!['https:', 'http:'].includes(u.protocol) || !u.hostname.includes('.') || u.username || u.password) throw Error('Invalid link');
        return u.href;
      }
      function normalizePhone(value) {
        let v = asciiDigits(clean(value)).replace(/[\s().-]/g,'');
        if (v.startsWith('00')) v = '+' + v.slice(2);
        return v;
      }
      function invalid(field, message) {
        show('err', message);
        field.closest('details')?.setAttribute('open','');
        field.focus();
      }
      function setWhatsApp(data) {
        const msg = ['مرحباً فيفا، أرغب بمتابعة تسجيل بياناتي كمؤثر.',
          'الاسم: '+data.full_name,'رابط الحساب: '+data.account_link,
          'الدولة والمدينة: '+data.country+' - '+data.city,'المجال: '+data.niche,
          'المنصات: '+data.platforms,'نطاق المتابعين: '+data.followers_range,
          data.avg_views ? 'متوسط المشاهدات: '+data.avg_views : '',
          'واتساب: '+data.whatsapp,data.note ? 'معلومات إضافية:\n'+data.note : ''].filter(Boolean).join('\n');
        $('wa_message').value = msg;
        waQuick.href = 'https://wa.me/4915565678291?text=' + encodeURIComponent(msg);
        waQuick.removeAttribute('aria-disabled');
      }
      function disableEntry(disabled) {
        for (const el of form.querySelectorAll('input:not([type=hidden]),select,textarea,button')) {
          if (el === other) el.disabled = disabled || choice.value !== 'other';
          else el.disabled = disabled;
        }
      }
      form.addEventListener('submit', async e => {
        e.preventDefault();
        if (sending || completed) return;
        if (clean($('website').value)) { show('err','تعذر إرسال التسجيل.',true); return; }
        if (Date.now() - lastSuccess < 25000) { show('err','يرجى الانتظار قليلاً قبل إرسال تسجيل آخر.',true); return; }
        syncCountry();
        if (clean($('full_name').value).length < 2) return invalid($('full_name'),'يرجى كتابة الاسم الكامل.');
        if (clean($('country').value).length < 2) return invalid(choice.value==='other'?other:choice,'يرجى اختيار الدولة أو كتابة اسمها.');
        if (clean($('city').value).length < 2) return invalid($('city'),'يرجى كتابة المدينة.');
        const selected = [...form.querySelectorAll('.pf:checked')].map(el=>el.value);
        if (!selected.length) return invalid(form.querySelector('.pf'),'يرجى اختيار منصة واحدة على الأقل.');
        let primary, extra;
        try { primary = linkValue($('account_link').value); if(!primary) throw Error(); } catch { return invalid($('account_link'),'يرجى إدخال رابط حساب صحيح.'); }
        try { extra = clean($('additional_links').value).split(/\n/).map(clean).filter(Boolean).map(linkValue); } catch { return invalid($('additional_links'),'يرجى كتابة رابط صحيح لكل حساب إضافي.'); }
        if (!$('niche').value) return invalid($('niche'),'يرجى اختيار مجال المحتوى.');
        if (!$('followers_range').value) return invalid($('followers_range'),'يرجى اختيار عدد المتابعين.');
        const number = normalizePhone(phone.value);
        if (!/^\+[1-9]\d{6,14}$/.test(number)) return invalid(phone,'يرجى إدخال رقم واتساب بصيغته الدولية مع مفتاح الدولة.');
        if ($('email').value && !$('email').checkValidity()) return invalid($('email'),'يرجى إدخال بريد إلكتروني صحيح أو تركه فارغاً.');
        $('account_link').value = primary;
        phone.value = number;
        $('platforms').value = selected.join(', ');
        $('note').value = [
          clean($('audience_market').value) ? 'أهم دولة للجمهور: '+clean($('audience_market').value) : '',
          extra.length ? 'روابط الحسابات الإضافية:\n'+extra.join('\n') : '',
          clean($('note_input').value)
        ].filter(Boolean).join('\n\n');
        const data = Object.fromEntries(['full_name','country','city','account_link','niche','platforms','followers_range','avg_views','whatsapp','email','note'].map(id=>[id,clean($(id).value)]));
        // Keep both delivery routes and the existing database field contract.
        setWhatsApp(data);
        sending = true;
        submit.disabled = true;
        submit.textContent = 'جارٍ إرسال التسجيل…';
        show('sending','جارٍ إرسال تسجيلك، يرجى عدم إغلاق الصفحة.');
        let mailSent = false, saved = false;
        try {
          if (!window.emailjs) throw Error('Email service unavailable');
          window.emailjs.init({publicKey:"SzBBlvEjgwysF8vHJ"});
          const pending = window.emailjs.sendForm('service_6w76hdv','template_11cfrv4',form);
          // sendForm captures form data synchronously. Avoid disabling named fields until it returns.
          disableEntry(true);
          await pending;
          mailSent = true;
        } catch (err) { console.error('Registration email failed',err); }
        if (mailSent) {
          try {
            if (!window.supabase) throw Error('Database client unavailable');
            const client = window.supabase.createClient("https://qpihjqzyxkpmlegijkmt.supabase.co","sb_publishable_GXP75aI8EF5i0czaZENTBA_huxSaeum");
            const {error} = await client.from('influencers').insert([{...data,status:'pending'}]);
            if (error) throw error;
            saved = true;
          } catch (err) { console.error('Registration database save failed',err); }
        }
        sending = false;
        if (mailSent) {
          lastSuccess = Date.now();
          try { sessionStorage.setItem(rateKey,String(lastSuccess)); } catch {}
          completed = true;
          disableEntry(true);
          submit.textContent = 'تم إرسال التسجيل';
          show('ok',saved ? 'تم استلام تسجيلك بنجاح. سيتواصل معك فريق فيفا عند توفر فرصة تعاون مناسبة.' : 'تم إرسال تسجيلك إلى فريق فيفا بالبريد. يمكنك متابعة الطلب عبر واتساب.',true);
        } else {
          disableEntry(false);
          submit.textContent = 'انضم إلى شبكة فيفا';
          show('err','تعذر إرسال التسجيل. يمكنك المحاولة مجدداً أو متابعة التسجيل عبر واتساب.',true);
        }
      });
      syncCountry();
    }
