"""Builds the site: wraps each page in _src/pages/ with the shared header and footer.

Usage:  python _src/build.py
Edit page content in _src/pages/*.html, shared chrome here, then rebuild.
Each page file starts with a front-matter block:
    ---
    title: About
    description: ...
    nav: about
    ---
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ROOT / '_src' / 'pages'

ICONS = {
    'arrow': '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    'chev': '<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    'phone': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 6l9 7 9-7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    'pin': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    'fb': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" fill="currentColor"/></svg>',
    'cal': '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.6"/></svg>',
    'doc': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 3v4h4M9 12h6M9 16h6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    'users': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    'coin': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v12" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    'check': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    'info': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="2"/></svg>',
    'book': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6c-2-1.5-5-2-9-2v14c4 0 7 .5 9 2 2-1.5 5-2 9-2V4c-4 0-7 .5-9 2zM12 6v14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
}

NAV = [
    ('about', 'About', 'about.html', [
        ('about.html#who-we-are', 'Who we are', 'Our story and what we stand for'),
        ('about.html#mission', 'Mission', 'Why we unite three streams of education'),
        ('about.html#principal', 'Principal', 'Md Saifullah'),
    ]),
    ('academics', 'Academics', 'academics.html', [
        ('academics.html#curriculum', 'Integrated curriculum', 'Islamic and general subjects together'),
        ('academics.html#assessment', 'Exams &amp; assessment', 'Monthly tests, semesters, annual exam'),
        ('academics.html#routine', 'Routine &amp; syllabus', 'Class routine and academic calendar'),
    ]),
    ('admissions', 'Admissions', 'admissions.html', None),
    ('guidelines', 'Students &amp; Parents', 'guidelines.html', [
        ('guidelines.html#students', 'Student regulations', 'Conduct, class and exam rules'),
        ('guidelines.html#uniform', 'Uniform', 'Boys’ and girls’ uniform'),
        ('guidelines.html#guardians', 'Guardian guidelines', 'How families support learning'),
    ]),
    ('notices', 'Notices', 'notices.html', None),
    ('gallery', 'Gallery', 'gallery.html', None),
    ('contact', 'Contact', 'contact.html', None),
]


def nav_html(active):
    out = []
    for key, label, href, sub in NAV:
        cur = ' aria-current="page"' if key == active else ''
        if sub:
            items = ''.join(f'<a href="{h}"><b>{t}</b><small>{d}</small></a>' for h, t, d in sub)
            out.append(
                f'<li><a href="{href}"{cur} class="has-drop">{label}{ICONS["chev"]}</a>'
                f'<div class="drop">{items}</div></li>')
        else:
            out.append(f'<li><a href="{href}"{cur}>{label}</a></li>')
    return ''.join(out)


HEADER = '''<a class="skip" href="#main">Skip to content</a>
<div class="utility">
  <div class="wrap">
    <div class="utility-l">
      <a class="hot" href="tel:+8801904870401"><b>Hotline</b>+88 0190-4870401</a>
      <a class="hide-sm" href="tel:01911020507">01911-020507</a>
    </div>
    <div class="utility-r">
      <a href="mailto:hqsmedu@gmail.com">{mail}hqsmedu@gmail.com</a>
      <a href="notices.html">Notices</a>
      <a href="https://www.facebook.com/hqsmedu" target="_blank" rel="noopener" aria-label="Facebook">{fb}Facebook</a>
    </div>
  </div>
</div>
<header class="header" id="header">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="Holy Quran School &amp; Madrasah — home">
      <img src="assets/crest.png" alt="" width="58" height="58">
      <span class="brand-text">
        <span class="brand-en">Holy Quran <span>School &amp; Madrasah</span></span>
        <span class="brand-bn" lang="bn">হলি কুরআন স্কুল এন্ড মাদ্‌রাসা</span>
      </span>
    </a>
    <button class="menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
    <ul class="nav" id="nav">{nav}<li class="header-cta"><a class="btn btn-red btn-sm" href="admissions.html#inquiry">Admission inquiry</a></li></ul>
  </div>
</header>
<div class="ticker" role="region" aria-label="Latest updates">
  <div class="wrap">
    <span class="ticker-tag">Updates</span>
    <div class="ticker-track"><span>No upcoming exams</span><span>No new admission dates announced yet</span><span>Monthly fees are due by the 7th</span></div>
    <a href="notices.html">All notices →</a>
  </div>
</div>'''

FOOTER = '''<footer class="footer">
  <div class="footer-rule"></div>
  <div class="wrap footer-top">
    <div class="footer-brand">
      <img src="assets/logo.png" alt="Holy Quran School &amp; Madrasah crest" width="120" height="120" loading="lazy">
      <div>
        <div class="en">Holy Quran School &amp; Madrasah</div>
        <div class="bn" lang="bn">হলি কুরআন স্কুল এন্ড মাদ্‌রাসা</div>
        <div class="ar" lang="ar" dir="rtl">هولي قرآن اسكول اند مدرسة</div>
      </div>
      <p>Enlightening minds, nurturing souls — Islamic and general education under one roof in Rangpur.</p>
    </div>
    <div>
      <h4>School</h4>
      <ul>
        <li><a href="about.html">About us</a></li>
        <li><a href="about.html#mission">Mission</a></li>
        <li><a href="about.html#principal">Principal</a></li>
        <li><a href="academics.html">Academics</a></li>
        <li><a href="gallery.html">Gallery</a></li>
      </ul>
    </div>
    <div>
      <h4>Families</h4>
      <ul>
        <li><a href="admissions.html">Admissions</a></li>
        <li><a href="admissions.html#fees">Fees &amp; payments</a></li>
        <li><a href="guidelines.html#students">Student regulations</a></li>
        <li><a href="guidelines.html#guardians">Guardian guidelines</a></li>
        <li><a href="notices.html">Notices &amp; results</a></li>
      </ul>
    </div>
    <div>
      <h4>Contact</h4>
      <ul class="footer-contact">
        <li><small>Address</small>Kazi Nazrul Islam Road, Road No. 01, Ward No. 19, Rangpur Sadar, Rangpur</li>
        <li><small>Office</small><span><a href="tel:01911020507">01911-020507</a> · <a href="tel:01908868707">01908-868707</a></span></li>
        <li><small>Hotline</small><a href="tel:+8801904870401">+88 0190-4870401</a></li>
        <li><small>Email</small><a href="mailto:hqsmedu@gmail.com">hqsmedu@gmail.com</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© <span data-year>2026</span> Holy Quran School &amp; Madrasah, Rangpur. All rights reserved.</span>
    <span class="ar" lang="ar" dir="rtl">رَّبِّ زِدْنِي عِلْمًا</span>
  </div>
</footer>'''

TEMPLATE = '''<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<meta name="theme-color" content="#0A3D24">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="assets/logo.png">
<link rel="icon" href="assets/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri&family=Archivo:wdth,wght@62..125,400..700&family=Libre+Caslon+Display&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Noto+Serif+Bengali:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<script>document.documentElement.classList.remove('no-js')</script>
</head>
<body>
{header}
<main id="main">
{body}
</main>
{footer}
<script src="script.js"></script>
</body>
</html>
'''


def build():
    for path in sorted(PAGES.glob('*.html')):
        raw = path.read_text(encoding='utf-8')
        m = re.match(r'---\n(.*?)\n---\n', raw, re.S)
        meta = dict(line.split(':', 1) for line in m.group(1).splitlines())
        meta = {k.strip(): v.strip() for k, v in meta.items()}
        body = raw[m.end():]
        for name, svg in ICONS.items():
            body = body.replace('{{' + name + '}}', svg)
        title = meta['title']
        full_title = 'Holy Quran School &amp; Madrasah · Rangpur' if meta['nav'] == 'home' else f'{title} · Holy Quran School &amp; Madrasah'
        header = HEADER.format(nav=nav_html(meta['nav']), mail=ICONS['mail'], fb=ICONS['fb'])
        html = TEMPLATE.format(title=full_title, description=meta['description'], header=header, body=body.strip(), footer=FOOTER)
        (ROOT / path.name).write_text(html, encoding='utf-8')
        print('built', path.name)


if __name__ == '__main__':
    build()
