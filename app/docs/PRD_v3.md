**মাদ্রাসা ব্যবস্থাপনা সফটওয়্যার**

_হলি কুরআন স্কুল এন্ড মাদরাসা — Product Requirements Document_

_সংস্করণ ৩.০ \| ৭ নভেম্বর ২০২৬ \| পর্যালোচনার জন্য প্রস্তাবিত \| v2.0 এর পর্যালোচনায় পাওয়া ১৪টি সংশোধন এবং পূর্ণ প্রোফাইল, ছাত্রী শাখা নীতি, ফান্ড থেকে ফি নিষ্পত্তি ও ফ্রন্টএন্ড ডিজাইন স্পেসিফিকেশন যুক্ত_

## কী তৈরি হবে

হলি কুরআন স্কুল এন্ড মাদরাসার ভর্তি, শিক্ষার্থী, হিফজ ও পড়াশোনা, হাজিরা, পরীক্ষা, প্রশ্নপত্র, ফি, দান, ফান্ড এবং দৈনন্দিন প্রশাসন একই ব্যবস্থায় পরিচালনার সফটওয়্যার। পরিচালক, শিক্ষা সচিব, শিক্ষক, হিসাবরক্ষক ও অভিভাবক নিজেদের দায়িত্ব অনুযায়ী আলাদা ড্যাশবোর্ড ব্যবহার করবেন। একটি মাদ্রাসা দিয়ে শুরু করা যাবে; একই পণ্যে একাধিক স্বতন্ত্র প্রতিষ্ঠান ও তাদের শাখা (বালক, বালিকা বা মিশ্র) যোগ করা যাবে।

প্রথম প্রকাশ দুই ধাপে আসবে। **R1a (পাইলট go-live)** এ enquiry ও ভর্তি থেকে শিক্ষার্থী তৈরি, দৈনিক হাজিরা, হিফজ ও সাধারণ পড়াশোনার অগ্রগতি, হোমওয়ার্ক, একক পরীক্ষার ফলাফল, মাসিক ফি ও রসিদ, ফান্ড থেকে ফি নিষ্পত্তি এবং মৌলিক হিসাব কাজ করবে। **R1b (পাইলট সম্পূর্ণ)** এ প্রশ্নপত্র ব্যাংক ও প্রিন্ট, সনদ ও কার্ড, সিলেবাস কভারেজ এবং শৃঙ্খলা মডিউল যোগ হবে — প্রথম টার্ম পরীক্ষার আগে। পরের ধাপে প্রশাসনিক মডিউল ও বাহ্যিক সংযোগ যোগ হবে।

## কার জন্য এই নথি

Product Owner, মাদ্রাসার পরিচালনা কমিটি, UI/UX Designer, Frontend ও Backend Developer এবং QA দল। এটি প্রয়োজন, আচরণ ও গ্রহণযোগ্যতার ভিত্তি; চূড়ান্ত মূল্যপ্রস্তাব, কাজের চুক্তি বা বিস্তারিত API specification নয়। Frontend দল আগে কাজ শুরু করবে বলে অধ্যায় ১২ এ ফ্রন্টএন্ড ডিজাইন স্পেসিফিকেশন ও স্ক্রিন তালিকা আলাদাভাবে দেওয়া হয়েছে।

## এই খসড়ার ভিত্তি

- Multi tenant SaaS ধরা হয়েছে। Tenant হলো একটি স্বতন্ত্র মাদ্রাসা; branch একই মাদ্রাসার শাখা। অন্য tenant এর ডাটা কখনো দৃশ্যমান হবে না।

- পাইলটের অগ্রাধিকার কওমি ও হিফজ, Noorani/Qaida স্তর সহ। আলিয়ার জন্য বিভাগ, সিলেবাস, বিষয় ও grading configurable থাকবে; পূর্ণ নিয়ম সংশ্লিষ্ট প্রতিষ্ঠানের নমুনা নিয়ে যাচাই করতে হবে।

- ছাত্রী শাখা ও পর্দা নীতি প্রথম দিন থেকেই data model ও permission এর অংশ; পরে যোগ করার বিষয় নয় (অধ্যায় ২)।

- বাংলা প্রধান ভাষা, ইংরেজি বিকল্প, আরবি প্রশ্নপত্র ও সনদে ব্যবহৃত হবে; মুদ্রা BDT এবং default timezone Asia/Dhaka। হিজরি তারিখ প্রদর্শন ও প্রতিষ্ঠানের ক্যালেন্ডার আলাদাভাবে configurable।

- P0 প্রথম প্রকাশের জন্য বাধ্যতামূলক (R1a বা R1b ট্যাগসহ); P1 পরের সম্প্রসারণ; P2 উন্নত সুবিধা। এই অগ্রাধিকার আর Basic/Standard/Premium subscription একই বিষয় নয়।

## নথি পড়ার ক্রম

শুরুতে পরিভাষা, ব্যবহারকারী, ছাত্রী শাখা নীতি, ড্যাশবোর্ড ও কাজের ধাপ; এরপর M01 থেকে M26 মডিউল। তারপর পূর্ণ শিক্ষার্থী, শিক্ষক/কর্মচারী, অভিভাবক ও দাতা প্রোফাইল এবং ফ্রন্টএন্ড ডিজাইন স্পেসিফিকেশন। শেষে প্ল্যান, হিসাব ও ফলাফলের নিয়ম, ডাটা মডেল, নোটিফিকেশন, নিরাপত্তা, প্রকাশের ধাপ এবং UAT। যেখানে সংখ্যা বা সীমা "প্রস্তাবিত" বলা হয়েছে, সেগুলো অনুমোদনের আগে যাচাইযোগ্য সিদ্ধান্ত।

## v3.0 এ যা বদলেছে

| **\#** | **পরিবর্তন**                                                                                                                                                                                | **কোথায়**                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| ১      | M25 এর priority P1 থেকে P0 (R1b) করা হয়েছে; প্রকাশের ধাপ, T19 ও go-live শর্তের সঙ্গে এখন মেলে।                                                                                                   | M25, প্রকাশের ধাপ             |
| ২      | RTO ৪ ঘণ্টা থেকে ৩ ঘণ্টা; ৯৯.৫% লক্ষ্যের মাসিক ~৩.৬ ঘণ্টা বাজেটের মধ্যে একটি worst-case incident এখন জায়গা পায়।                                                                                          | মান লক্ষ্য, Backup            |
| ৩      | Academic Admin (শিক্ষা সচিব), হিফজ প্রধান, Board Coordinator, Finance Lead, Welfare Officer সহ সব owner role সংজ্ঞায়িত; Academic Admin বনাম Branch Admin এর পার্থক্য স্পষ্ট; role × module matrix যুক্ত। | ব্যবহারকারী ও অনুমতি           |
| ৪      | হিফজ সবক আর syllabus এর উপর নির্ভরশীল নয়; syllabus ছাড়াও হোমওয়ার্ক দেওয়া যাবে।                                                                                                                    | M06, M26, নির্ভরতা           |
| ৫      | Incident, Notice, Routine, Concession, CashierSession, Resource, Sponsorship, FundAllocation সহ বাদ পড়া entity data model এ; Discipline মেনুতে যুক্ত।                                           | ডাটা মডেল, নেভিগেশন          |
| ৬      | দ্বিতীয় পাইলট প্রস্তাব: ছাত্রী শাখাসহ মাদ্রাসা, যাতে পর্দা নীতি বাস্তবে যাচাই হয়।                                                                                                                              | Discovery, সিদ্ধান্ত তালিকা     |
| ৭      | ছাত্রী শাখা, পর্দা ও ছবি নীতি নতুন অধ্যায়।                                                                                                                                                          | অধ্যায় ২, M03, M08, M15, M20 |
| ৮      | লিল্লাহ/এতিম/যাকাত ফান্ড থেকে শিক্ষার্থীর invoice ও মেস বিল নিষ্পত্তির প্রক্রিয়া।                                                                                                                        | M10, M11, হিসাবের নিয়ম      |
| ৯      | হাজিরার সকালের cutoff; অনুপস্থিতির বার্তা সকালেই যাবে, দিনের শেষেরটা শুধু final lock।                                                                                                                   | M05, কাজের ধাপ               |
| ১০     | Grace period এর পর বিদ্যমান ছাত্রের মাসিক invoice, টাকা আদায় ও জরুরি/লেনদেন বার্তা চালু থাকবে।                                                                                                            | M24                        |
| ১১     | হোমওয়ার্কে "অফলাইন — ক্লাসে যাচাই" submission; audio/file এর সীমা ও storage নীতি।                                                                                                                  | M26, সফলতার মাপ              |
| ১২     | Basic প্ল্যানে Noorani/Qaida ও Hifz দুটো track।                                                                                                                                                | প্ল্যান matrix                |
| ১৩     | প্রথম প্রকাশ R1a ও R1b তে ভাগ; go-live এর বোঝা কমানো হয়েছে।                                                                                                                                      | প্রকাশের ধাপ                  |
| ১৪     | T20 (public result lookup) P0 থেকে P1; কারণ M20 website নিজেই P1।                                                                                                                           | UAT                        |
| নতুন    | পূর্ণ শিক্ষার্থী, শিক্ষক/কর্মচারী, অভিভাবক ও দাতা প্রোফাইল; ফ্রন্টএন্ড ডিজাইন স্পেসিফিকেশন ও স্ক্রিন তালিকা; নোটিফিকেশন ক্যাটালগ; পরিভাষা; T21–T30।                                                                   | অধ্যায় ১১–১৩, ২০             |

## পরিভাষা

ডিজাইন ও কোডে একই শব্দ ব্যবহারের জন্য নিচের পরিভাষা স্থির। প্রতিষ্ঠান চাইলে প্রদর্শিত লেবেল বদলাতে পারবে, কিন্তু ভেতরের অর্থ বদলাবে না।

| **শব্দ**                     | **অর্থ**                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------- |
| **জামাত / Class**             | কওমি কাঠামোর শ্রেণি; আলিয়ায় শ্রেণি বা বিভাগ। Section তার ভাগ।                                |
| **হালাকা (Halaqa)**            | একজন হিফজ/নাজেরা শিক্ষকের অধীনে শিক্ষার্থীর দল; class থেকে আলাদা হতে পারে।                   |
| **সবক**                     | দিনের নতুন পাঠ বা নতুন মুখস্থ অংশ।                                                        |
| **সবকি (সবকিয়া)**            | সাম্প্রতিক কয়েক দিনের সবকের পুনরাবৃত্তি।                                                   |
| **আমুক্তা (মানজিল)**            | পুরোনো মুখস্থ অংশের নিয়মিত দোহরানো।                                                     |
| **Track**                   | কুরআন শিক্ষার ধারা: Noorani/Qaida, Nazera, Hifz।                                         |
| **খতম / দস্তারবন্দি**          | হিফজ সম্পন্ন হওয়া এবং তার সম্মাননা অনুষ্ঠান।                                                  |
| **মারহালা**                    | বোর্ড পরীক্ষার স্তর (বেফাক ইত্যাদি)।                                                       |
| **ইলহাক**                    | বোর্ডের সঙ্গে প্রতিষ্ঠানের অন্তর্ভুক্তি (affiliation)।                                       |
| **মুহতামিম**                  | প্রতিষ্ঠান প্রধান / পরিচালক।                                                              |
| **শিক্ষা সচিব (নাজেমে তালিমাত)** | প্রতিষ্ঠানব্যাপী একাডেমিক নীতি ও পরিকল্পনার দায়িত্বশীল; সফটওয়্যারে Academic Admin।              |
| **নেগরান**                   | আবাসিক তত্ত্বাবধায়ক; সফটওয়্যারে Hostel Supervisor।                                         |
| **লিল্লাহ বোর্ডিং**            | দান/যাকাত থেকে খরচ বহন করা আবাসিক ও খাবারের ব্যবস্থা।                                         |
| **মুহাসাবা**                    | আমল ও আখলাকের আত্মমূল্যায়ন ও শিক্ষকের পর্যবেক্ষণ।                                           |
| **Tenant / Branch**         | স্বতন্ত্র প্রতিষ্ঠান / একই প্রতিষ্ঠানের শাখা।                                                  |
| **Enrollment**              | নির্দিষ্ট session এ শিক্ষার্থীর class/section/halaqa তে ভর্তির রেকর্ড; প্রতি session এ নতুন। |
| **Snapshot / Version**      | প্রকাশিত বা লক করা রেকর্ডের অপরিবর্তনীয় কপি; সংশোধনে নতুন version।                         |
| **Idempotent**              | একই কাজ বারবার চালালেও ফল একবারই হয় (যেমন একটি payment একবারই post)।                       |
| **R1a / R1b**               | প্রথম প্রকাশের দুই ধাপ: go-live core এবং পাইলট সম্পূর্ণ।                                     |

# ১. ব্যবহারকারী ও অনুমতি

একজন ব্যবহারকারীর একাধিক role থাকতে পারে। প্রতিটি অনুমতি module, action এবং scope (tenant, branch, class/halaqa, নিজের রেকর্ড) দিয়ে নির্ধারিত হবে। Menu লুকানো যথেষ্ট নয়; প্রতিটি API, export, download ও background job একই অনুমতি যাচাই করবে। ছোট প্রতিষ্ঠানে একজন একাধিক role নিতে পারেন (যেমন মুহতামিম + Academic Admin + Exam Controller)।

| **রোল**                                               | **দায়িত্ব ও অনুমোদিত পরিসর**                                                                                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SaaS Super Admin**                                  | প্রতিষ্ঠান, প্ল্যান, subscription ও service health; শিক্ষার্থীর বিস্তারিত ডাটায় স্বয়ংক্রিয় প্রবেশ নয়।                                                                                |
| **Institution Admin**                                 | নিজ প্রতিষ্ঠানের setup, role, branch ও নীতিমালা; সংবেদনশীল পরিবর্তন audit সহ।                                                                                              |
| **মুহতামিম বা পরিচালক**                                   | প্রতিষ্ঠানের overview; ফি ছাড়, ব্যয়, ফলাফল, sponsorship ও গুরুত্বপূর্ণ আবেদনের চূড়ান্ত অনুমোদন।                                                                                     |
| **Academic Admin (শিক্ষা সচিব)**                        | প্রতিষ্ঠানব্যাপী একাডেমিক নীতি: class/subject/syllabus কাঠামো, routine, study plan অনুমোদন, document template, promotion preview। সব শাখার একাডেমিক ডাটা দেখবেন; অর্থ ও payroll নয়। |
| **Branch Admin**                                      | বরাদ্দ শাখার দৈনন্দিন পরিচালনা: হাজিরা escalation ও finalize, শাখার কর্মী ও শিক্ষার্থী, শাখার notice। অন্য শাখা নিষিদ্ধ, যদি অনুমতি না থাকে।                                                 |
| **হিফজ প্রধান**                                         | সব halaqa র সবক/সবকি/আমুক্তা অগ্রগতি, হিফজ শিক্ষকের follow up, খতম যাচাই ও সনদের প্রস্তাব।                                                                                     |
| **শিক্ষক বা হিফজ শিক্ষক**                                | বরাদ্দ class, subject বা halaqa এর হাজিরা, পড়াশোনা, হোমওয়ার্ক ও নম্বর; সব হিসাব বা payroll নয়।                                                                                   |
| **Exam Controller**                                   | প্রশ্নপত্র bank, paper approve/lock, marks review, result lock ও version control; marks entry সরাসরি নয়।                                                                 |
| **Board Coordinator**                                 | বেফাক/বোর্ড registration, candidate list, form, submission tracking ও board result import (M09)।                                                                       |
| **ভর্তি কর্মকর্তা**                                       | Enquiry, আবেদন যাচাই, admission workflow, প্রয়োজনীয় যোগাযোগ ও approved enrollment।                                                                                       |
| **Finance Lead (হিসাব প্রধান)**                          | Chart of accounts, fund নীতি, period close, refund/waiver/expense অনুমোদন (নিজের তৈরি নয়), fund allocation অনুমোদন।                                                    |
| **হিসাবরক্ষক বা cashier**                                | ফি আদায়, রসিদ, ledger entry ও reconciliation; অনুমতি ছাড়া refund, waiver বা payroll details নয়।                                                                           |
| **HR Officer**                                        | কর্মী profile, চুক্তি, ছুটি ও payroll draft; Finance Lead অনুমোদন দেবেন।                                                                                                  |
| **Storekeeper, Hostel Supervisor (নেগরান), Librarian** | যথাক্রমে মজুত/ক্যান্টিন, হোস্টেল/মেস/গেট পাস, লাইব্রেরি; নিজের মডিউলের বাইরে নয়।                                                                                                |
| **Welfare Officer**                                   | শৃঙ্খলা, অভিযোগ ও স্বাস্থ্য/কল্যাণ রেকর্ডের দায়িত্বপ্রাপ্ত (M19); ছাত্রী শাখায় একজন মহিলা Welfare Officer প্রস্তাবিত।                                                                       |
| **Website Editor / Publisher**                        | Website page draft / অনুমোদন ও প্রকাশ (M20)।                                                                                                                            |
| **অভিভাবক ও শিক্ষার্থী**                                  | যাচাইকৃত সম্পর্কের শিক্ষার্থীর নিজস্ব তথ্য; অন্য শিক্ষার্থীর তথ্য নয়।                                                                                                               |
| **দাতা ও Auditor**                                      | দাতা নিজের receipt, sponsorship ও সম্মত summary; auditor অনুমোদিত financial records read only।                                                                           |

> _Privileged role (2FA বাধ্যতামূলক): SaaS Super Admin, Institution Admin, মুহতামিম/পরিচালক, Academic Admin, Exam Controller, Finance Lead, হিসাবরক্ষক, HR Officer এবং payroll/refund/waiver/fund allocation approve করতে পারেন এমন সবাই। চূড়ান্ত তালিকা Institution Admin অনুমোদন করবেন।_

## অনুমতির বাধ্যতামূলক নিয়ম

- Action আলাদা হবে: view, create, edit, submit, approve, publish, collect, reverse, export এবং manage settings।

- নিজের তৈরি refund, expense, fund allocation বা payroll batch নিজে approve করা default বন্ধ। ক্ষুদ্র প্রতিষ্ঠানের ব্যতিক্রম owner policy ও audit সহ নির্দিষ্ট করতে হবে।

- Role পরিবর্তন বা account বন্ধ করার সঙ্গে session ও export access পুনর্মূল্যায়ন হবে। Support access সময়সীমাবদ্ধ, অনুমোদিত ও logged হবে।

- Guardian link অফিসের যাচাই বা অনুমোদিত invitation দিয়ে হবে; শুধু একই ফোন নম্বর বা student ID জানা থাকলেই account যুক্ত হবে না।

- ছাত্রী শাখার রেকর্ডে "female section access" আলাদা permission (অধ্যায় ২)।

## রোল × মডিউল অনুমতি সারণি

সংকেত: **M** = পূর্ণ পরিচালনা, **A** = অনুমোদন, **E** = নিজের scope এ তৈরি/সম্পাদনা, **V** = দেখা, **—** = প্রবেশ নেই। Scope এর বাইরে কোনো অক্ষরই প্রযোজ্য নয়। এটি default; Institution Admin template বদলাতে পারবেন, audit সহ।

| **রোল**               | **ভর্তি/শিক্ষার্থী** | **হাজিরা**  | **হিফজ/পড়াশোনা** | **পরীক্ষা/প্রশ্ন** | **ফি/হিসাব** | **HR/Payroll** | **সেটিংস** |
| --------------------- | ---------------- | --------- | -------------- | -------------- | ----------- | -------------- | ---------- |
| **Institution Admin** | M                | M         | V              | V              | V           | V              | M          |
| **মুহতামিম**            | A                | V         | V              | A              | A           | A              | V          |
| **Academic Admin**    | M                | V         | M              | A              | —           | —              | একাডেমিক    |
| **Branch Admin**      | E                | M         | V              | V              | V (সারাংশ)    | —              | —          |
| **হিফজ প্রধান**         | V                | V         | M (হিফজ)       | —              | —           | —              | —          |
| **শিক্ষক**             | V (নিজ class)    | E         | E              | E (marks)      | —           | —              | —          |
| **Exam Controller**   | V                | —         | V              | M              | —           | —              | —          |
| **ভর্তি কর্মকর্তা**       | E                | —         | —              | —              | V (ভর্তি ফি) | —              | —          |
| **Finance Lead**      | V                | —         | —              | —              | M + A       | A              | হিসাব       |
| **হিসাবরক্ষক**          | V                | —         | —              | —              | E (collect) | —              | —          |
| **HR Officer**        | —                | V (staff) | —              | —              | —           | E              | —          |
| **অভিভাবক**            | V (নিজ সন্তান)     | V         | V (summary)    | V (published)  | V + pay     | —              | —          |

# ২. ছাত্রী শাখা, পর্দা ও ছবি নীতি

অনেক মাদ্রাসায় বালক ও বালিকা শাখা আলাদা, এবং ছাত্রীদের ছবি ও যোগাযোগ তথ্যে কঠোর নিয়ম থাকে। এই নীতি প্রতিষ্ঠান ও শাখা পর্যায়ে configurable; সফটওয়্যার কোনো ধর্মীয় সিদ্ধান্ত দেবে না, শুধু প্রতিষ্ঠানের অনুমোদিত নীতি প্রয়োগ করবে।

- **শাখার ধরন:** প্রতিটি branch/section এ বালক, বালিকা বা মিশ্র (যেমন ছোটদের নূরানী/মক্তব) চিহ্নিত হবে। শিক্ষার্থীর gender বাধ্যতামূলক field; ভুল ধরনের section এ allocation blocked, ব্যতিক্রম অনুমোদন ও audit সহ।

- **ছবি নীতি (শাখা অনুযায়ী):** বাধ্যতামূলক / ঐচ্ছিক / সংরক্ষণ নয়। ছবি না থাকলে সব জায়গায় নামের আদ্যক্ষরসহ নিরপেক্ষ avatar; ID card ও admit card এর "ছবি ছাড়া" template variant, পরিচয় যাচাই QR ও অভিভাবকের তথ্য দিয়ে।

- **Female section access:** ছাত্রী শাখার ছবি, ফোন, ঠিকানা, স্বাস্থ্য ও আবাসন তথ্য দেখতে আলাদা permission লাগবে। Permission ছাড়া পুরুষ কর্মী একাডেমিক তথ্য (নাম, roll, হাজিরা, নম্বর) দেখবেন, কিন্তু ছবি ও যোগাযোগ masked থাকবে।

- **Website ও gallery:** ছাত্রীদের ছবি public website এ default blocked; মহিলা শিক্ষকের ছবি প্রকাশ ঐচ্ছিক ও তাঁর সম্মতিসাপেক্ষ।

- **আবাসন:** হোস্টেল gender অনুযায়ী আলাদা; ভিন্ন gender এর bed এ allocation অসম্ভব। ছাত্রীর গেট পাসে শুধু অনুমোদিত pickup ব্যক্তি (মাহরাম তালিকা অভিভাবক নির্ধারণ করবেন)।

- **পরীক্ষা ও seat plan:** নীতি চালু থাকলে বালক-বালিকা আলাদা room এ বসানো হবে; mixed room এ allocation blocked।

- **রিপোর্ট:** সব মূল রিপোর্টে শাখা ও gender filter; ছাত্রী শাখার aggregate রিপোর্ট সাধারণ role দেখতে পারবেন, ব্যক্তিগত বিস্তারিত নয়।

# ৩. নেভিগেশন ও ড্যাশবোর্ড

প্রধান navigation হবে দায়িত্বভিত্তিক; যার যে অনুমতি নেই, সেই menu দেখাবে না (তবে backend আলাদাভাবে যাচাই করবে)। Desktop এ বাম sidebar ও top bar; mobile এ নিচে bottom navigation (৪–৫টি প্রধান কাজ), উপরে search ও notification। Top bar এ institution, branch, session, language, global search (শিক্ষার্থী/কর্মী/invoice/রসিদ নম্বর) ও notification থাকবে।

| **মেনু**            | **অন্তর্ভুক্ত পৃষ্ঠা**                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**       | নিজস্ব dashboard, pending approvals, recent activity, আজকের কাজ                                                                                                       |
| **Academic**       | Admission (Enquiry, Applications), Students, Guardians, Attendance, Hifz & Quran, Study Diary, Syllabus, Homework, Exams & Results, Question Bank, Documents, Board |
| **Finance**        | Fees & Invoices, Collect Payment, Receipts, Sponsorship & Fund Allocation, Accounts, Funds, Donations & Donors, Reconciliation, Cashier Close                       |
| **Administration** | Staff, HR, Payroll, Leave, Purchase, Inventory, Hostel, Mess, Gate Pass, Library, Canteen                                                                           |
| **Welfare**        | Discipline, Complaints, Health & Support (restricted)                                                                                                               |
| **Communication**  | Routine, Notices, Calendar, SMS & Messages, Message Log                                                                                                             |
| **Management**     | Reports, Website, Integrations, Settings, Audit, Subscription                                                                                                       |

## পরিচালকের ড্যাশবোর্ড

| **উইজেট**             | **সংজ্ঞা ও ক্লিক করলে যা খুলবে**                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **সক্রিয় শিক্ষার্থী**     | নির্বাচিত session ও branch এর active enrollment; বালক/বালিকা ও আবাসিক/অনাবাসিক ভাগ; student তালিকা। |
| **আজকের হাজিরা**        | Present, Late, Absent, Leave ও Unmarked আলাদা; সকালের cutoff পেরোনো pending register সহ।    |
| **আজকের আদায়**         | posted receipts minus posted refunds; fee, fund allocation ও donation আলাদা।               |
| **বকেয়া**              | নির্ধারিত তারিখ পেরোনো unpaid net invoice; বয়সভিত্তিক (০–৩০, ৩১–৬০, ৬০+) due তালিকা।           |
| **ফান্ড ব্যালেন্স**        | যাকাত, লিল্লাহ, এতিম, সাধারণ ও নির্মাণ fund এর available balance; এই মাসের allocation।            |
| **হিফজ ও সবক অগ্রগতি** | লক্ষ্যের বিপরীতে অনুমোদিত সবক ও আমুক্তা; পিছিয়ে থাকা শিক্ষার্থী ও teacher follow up তালিকা।           |
| **হোমওয়ার্ক স্ট্যাটাস**     | assigned বনাম submitted/offline-checked বনাম checked; overdue class/section তালিকা।          |
| **অনুমোদন বাকি**        | ভর্তি, ছাড়, sponsorship, refund, expense, leave, result ও প্রশ্নপত্র; বয়স ও priority সহ।      |
| **আসন্ন কার্যক্রম**       | পরীক্ষা, notice, event, holiday এবং routine conflict।                                      |

## অন্য রোলের ড্যাশবোর্ড

| **রোল**             | **প্রধান কার্ড ও দ্রুত কাজ**                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Academic Admin**  | syllabus coverage gap, study plan অনুমোদন বাকি, routine conflict, promotion readiness, শিক্ষক অনুপস্থিতি ও substitute প্রয়োজন। |
| **Branch Admin**    | শাখার হাজিরা ও escalated register, আজকের notice, শাখার বকেয়া সারাংশ, gate pass overdue।                                           |
| **হিফজ প্রধান**       | halaqa ভিত্তিক আজকের সবক entry %, পিছিয়ে থাকা শিক্ষার্থী, খতমের কাছাকাছি শিক্ষার্থী, ভুলের ধরনের প্রবণতা।                               |
| **শিক্ষক**           | আজকের class/halaqa, অসম্পূর্ণ হাজিরা (cutoff countdown সহ), সবক entry, হোমওয়ার্ক check করার তালিকা, marks entry বাকি।               |
| **হিসাবরক্ষক**        | আজকের collection, cash drawer, unmatched payment, verify বাকি bKash/Nagad reference, cashier close।                       |
| **Finance Lead**    | অনুমোদন বাকি (refund, waiver, fund allocation, expense), fund balance, period close status।                                |
| **Exam Controller** | প্রশ্নপত্র review বাকি, marks entry completion %, result lock/publish অবস্থা।                                                  |
| **অভিভাবক**          | সন্তান বেছে আজকের হাজিরা, সবক, হোমওয়ার্ক, সর্বশেষ ফলাফল, বকেয়া ও "এখন পরিশোধ", notice।                                            |
| **SaaS Admin**      | tenant status, subscription, usage, failed jobs ও service alerts।                                                        |

সব card এ সময়সীমা ও last updated থাকবে। Filter বদলালে card, chart, table ও export একই scope নেবে। শূন্য ফল, data unavailable, loading এবং অনুমতি নেই — চারটি আলাদা অবস্থা হবে।

# ৪. প্রধান কাজের ধাপ

| **প্রক্রিয়া**                    | **অবস্থা ও কাজ**                                                                                                                    | **ব্যর্থতা বা সংশোধন**                                                                                                                                                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ভর্তি**                      | Enquiry → Draft → Submitted → Review → Approved → Enrolled; Rejected ও Waitlisted বিকল্প।                                         | একই আবেদন দুইবার approve হলেও একটি enrollment। Approve এর সঙ্গে admission fee invoice তৈরি; waiver হলেও শূন্য ব্যালেন্সে invoice থাকবে। Invoice থাকা বাধ্যতামূলক; পরিশোধ বাধ্যতামূলক কি না প্রতিষ্ঠানের নীতি।                                         |
| **হাজিরা**                      | Open register → Save draft → Teacher submit → Finalized → Notify (সকালেই) → দিনের শেষে Locked।                                    | Unmarked কে absent ধরা যাবে না। সকালের cutoff (প্রস্তাবিত: প্রথম পিরিয়ড শুরুর ৪৫ মিনিট পর, shift অনুযায়ী configurable) পেরোলে Branch Admin কে escalate; তিনি finalize বা reminder দেবেন। Lock এর পর correction এ কারণ, অনুমোদন ও নতুন version। |
| **ফি**                        | Fee rule → Invoice → Pending/Partial → Paid; Overdue আলাদা derived flag।                                                           | Posted টাকা delete নয়। Void, credit note বা refund নিজ নিজ ledger impact সহ।                                                                                                                                                      |
| **Sponsorship ও ফান্ড নিষ্পত্তি** | Eligibility আবেদন → যাচাই → অনুমোদন (fund, শতাংশ/অঙ্ক, মেয়াদ) → invoice তৈরি হলে fund allocation draft → Finance Lead অনুমোদন → Posted। | Fund এ পর্যাপ্ত balance না থাকলে allocation pending; অন্য fund থেকে নিজে থেকে নয়। মেয়াদ শেষে renewal reminder।                                                                                                                        |
| **প্রশ্নপত্র**                   | Question bank entry → Paper draft → Controller review → Approved/Locked → Print।                                                 | Lock এর আগে preview ও marks total validation। Locked paper edit এ নতুন version; print log।                                                                                                                                      |
| **হোমওয়ার্ক**                   | Teacher assign → Submit (text/file/audio) অথবা Teacher offline-check → Feedback।                                                  | Deadline পেরোনো submission late flag; override শুধু কারণসহ।                                                                                                                                                                       |
| **ফলাফল**                      | Exam draft → Marks entry → Review → Locked → Published।                                                                          | Missing marks এ publish বন্ধ। Reopen এর কারণ ও approval; নতুন published version।                                                                                                                                                  |
| **ক্রয়**                       | Requisition → Approval → Purchase order → Goods received → Supplier bill → Payment।                                              | Partial delivery ও return সম্ভব; receipt ছাড়া stock বাড়বে না।                                                                                                                                                                       |
| **পে রোল**                    | Attendance ও leave cutoff → Draft → Review → Approved → Paid।                                                                    | Approved batch পুনরায় payout আটকাবে; correction adjustment batch দিয়ে।                                                                                                                                                            |
| **সেশন পরিবর্তন**              | Result ও eligibility review → Promotion preview → Approve → New enrollment।                                                      | পুরোনো session অপরিবর্তিত; repeat, transfer ও withdrawal আলাদা outcome।                                                                                                                                                            |

## গুরুত্বপূর্ণ ব্যবহারকারী গল্প

- শিক্ষক হিসেবে মোবাইল থেকে নিজের class এর হাজিরা এক স্ক্রিনে দিয়ে অসম্পূর্ণ তালিকা দেখতে চাই, যাতে ভুল অনুপস্থিতির বার্তা না যায়।

- অভিভাবক হিসেবে সন্তান মাদ্রাসায় না পৌঁছালে সকালেই জানতে চাই, রাতে নয়।

- হিফজ শিক্ষক হিসেবে প্রতিটি শিক্ষার্থীর সবক, সবকি ও আমুক্তা ৩০ সেকেন্ডের মধ্যে লিখতে চাই, যাতে halaqa র সময় নষ্ট না হয়।

- হিসাবরক্ষক হিসেবে আংশিক ফি নিয়ে বাকি টাকা স্পষ্ট রাখতে চাই, যাতে একই invoice আবার তৈরি না হয়।

- Finance Lead হিসেবে যাকাত fund থেকে শুধু অনুমোদিত শিক্ষার্থীর ফি নিষ্পত্তি করতে চাই, যাতে দাতার আমানত সঠিক খাতে যায়।

- অভিভাবক হিসেবে এক account থেকে দুই সন্তানের invoice, হোমওয়ার্ক ও অগ্রগতি আলাদাভাবে দেখতে চাই।

- মুহতামিম হিসেবে ছাত্রী শাখার তথ্যের নিরাপত্তা নিশ্চিত করতে চাই, যাতে অনুমতি ছাড়া কেউ ছবি বা ফোন নম্বর না দেখে।

- Exam Controller হিসেবে প্রশ্নপত্র লক করার আগে marks total ও duplicate question যাচাই করতে চাই।

# ৫. প্রতিষ্ঠান, ভর্তি ও মানুষ

## M01 প্রতিষ্ঠান ও একাডেমিক সেটআপ

_P0 (R1a) \| Owner Institution Admin ও Academic Admin \| Setup wizard ও academic settings_

একটি প্রতিষ্ঠানের কাঠামো ও নিয়ম একবার সেট করলে সংশ্লিষ্ট সব মডিউল তা ব্যবহার করবে।

- Tenant, campus/branch (বালক/বালিকা/মিশ্র), বিভাগ, জামাত বা class, section, group, shift (সকাল/দিন/রাতের হিফজ) ও halaqa আলাদা entity। শিক্ষার্থীকে একই session এ class ও halaqa দুটোতেই যুক্ত করা যাবে।

- Session, term, subject, syllabus, room, capacity, weekly holiday, fee head, grading policy, ছবি নীতি ও হাজিরার cutoff configurable। বাংলা, ইংরেজি ও আরবি নাম সংরক্ষণ সম্ভব।

- Session বা branch switch করলে dashboard, form, report ও export এর scope বদলাবে। Consolidated report শুধু অনুমোদিত role দেখবে।

- প্রথম চালুর wizard: profile → branch ও ধরন → session → class/halaqa → user/role → fee/grade/fund → opening data। প্রতিটি ধাপ পরে সম্পাদনযোগ্য; অগ্রগতি দেখাবে। ব্যবহৃত class বা subject delete না করে archive।

- Calendar এ Gregorian date canonical; Hijri label ও স্থানীয় সমন্বয় (±১ দিন) configurable। নামাজের সময় অনুমান করে routine বদলানো যাবে না।

- Student ID ও Staff ID এর format configurable (প্রস্তাবিত: প্রতিষ্ঠান কোড-সাল-ক্রম, যেমন HQ-2026-00123); একবার দেওয়া ID বদলায় না।

**গ্রহণযোগ্যতা M01** A1 একই class name দুই শাখায় থাকলেও record গুলিয়ে যাবে না। A2 ব্যবহৃত session archive করলে historical report অক্ষত থাকবে। A3 বালিকা section এ বালক শিক্ষার্থী অনুমোদন ছাড়া যুক্ত হবে না।

## M02 ভর্তি ব্যবস্থাপনা (Enquiry সহ)

_P0 (R1a) \| Owner ভর্তি কর্মকর্তা \| Enquiry board, Application list ও review_

অনলাইন ও অফিসের enquiry ও আবেদন একই যাচাই ও অনুমোদন প্রক্রিয়ায় শিক্ষার্থীতে রূপান্তরিত হবে।

- Enquiry/lead: আগ্রহী অভিভাবকের নাম, ফোন, শিক্ষার্থীর gender ও বয়স, আগ্রহী class/track, আবাসিক কি না, source (walk-in/website/reference/ফোন), follow-up তারিখ ও status। Enquiry থেকে এক ক্লিকে application, অথবা lost/closed কারণসহ।

- Class অনুযায়ী form, required field ও document checklist (জন্ম নিবন্ধন, আগের প্রতিষ্ঠানের TC/প্রত্যয়ন, ছবি — নীতি অনুযায়ী)। অনুপস্থিত নথির exception কারণসহ।

- Draft, submitted, review, waitlisted, approved, rejected ও enrolled status; application number এবং প্রতিটি পরিবর্তনের দায়িত্বশীল ব্যক্তি।

- Seat capacity (শাখা ও gender অনুযায়ী), duplicate candidate warning (নাম + জন্মতারিখ + অভিভাবক ফোন), ভর্তি পরীক্ষা/সাক্ষাৎকার (schedule, ফল, examiner note, হিফজ শিক্ষার্থীর জন্য কতটুকু মুখস্থ আছে) অনুমোদনের আগে দেখা যাবে।

- Approve এর সঙ্গে admission fee invoice তৈরি; waiver হলেও শূন্য/আংশিক ব্যালেন্সে invoice থাকবে। Invoice ছাড়া final enrollment নয়। Enrollment এর আগে পরিশোধ বাধ্যতামূলক কি না প্রতিষ্ঠানের setting (default: বাধ্যতামূলক নয়, due হিসেবে থাকবে)।

- Sponsorship/লিল্লাহ প্রয়োজন হলে আবেদনের সময়ই eligibility request তৈরি করা যাবে (M10)।

- Final enrollment এ unique student ID; application reprocessing নতুন student তৈরি করবে না। Applicant status lookup এ phone OTP বা নিরাপদ token। Public form এ spam ও upload validation।

**গ্রহণযোগ্যতা M02** A1 একই approval retry তে একটি enrollment। A2 rejected আবেদন দিয়ে portal login বা class allocation করা যাবে না। A3 admission fee invoice তৈরি ছাড়া কোনো application enrolled হবে না। A4 পূর্ণ seat এ approve করলে waitlist প্রস্তাব দেখাবে।

## M03 শিক্ষার্থী ও অভিভাবক

_P0 (R1a) \| Owner Academic Admin \| Student list ও পূর্ণ profile (অধ্যায় ১১)_

শিক্ষার্থীর বর্তমান অবস্থা এবং সব শিক্ষাবর্ষের ইতিহাস একটি profile থেকে পাওয়া যাবে। পূর্ণ field ও tab তালিকা অধ্যায় ১১ এ।

- Student list: search (নাম, ID, roll, অভিভাবক ফোন), filter (branch, class, section, halaqa, status, gender, আবাসিক, sponsored, বকেয়া আছে), column chooser, saved view, bulk action (SMS, ID card print, section পরিবর্তন — preview সহ)।

- এক guardian এর বহু সন্তান, একটি শিক্ষার্থীর একাধিক অনুমোদিত guardian এবং primary contact। Relationship ও custody restriction যাচাই করে access।

- Status: active, leave, transferred, withdrawn, graduated (খতম/দাওরা সম্পন্ন) বা archived। Promotion এ নতুন enrollment; roll, section ও class history overwrite নয়।

- Bulk import এ template, dry run, mapping, duplicate warning, row error এবং accepted/rejected summary। Excel/CSV export role ও filter অনুযায়ী।

- Transfer certificate, clearance (বকেয়া, লাইব্রেরি, হোস্টেল), scholarship/sponsorship এবং এতিম/অসচ্ছল তথ্য restricted section এ। Eligibility প্রতিষ্ঠানের নীতি অনুযায়ী, সফটওয়্যারের অনুমান নয়।

**গ্রহণযোগ্যতা M03** A1 একই guardian phone থাকা দুই শিক্ষার্থী আলাদা থাকবে। A2 promotion retry বা transfer এ পুরোনো result ও due হারাবে না। A3 TC issue এর আগে clearance বাকি থাকলে warning ও অনুমোদন লাগবে।

## M04 শিক্ষক ও কর্মচারী

_P0 (R1a) profile ও assignment \| P1 daily work report \| Owner HR Officer ও Academic Admin_

কর্মীদের পরিচয়, যোগ্যতা, দায়িত্ব, class allocation এবং অনুমতি এক জায়গায় পরিচালিত হবে। পূর্ণ profile অধ্যায় ১১ এ।

- Employee profile এ staff ID, designation, department, branch, employment type (পূর্ণকালীন/খণ্ডকালীন/অতিথি/স্বেচ্ছাসেবী), joining date, status, contact, যোগ্যতা (দাওরায়ে হাদিস, হাফেজ, কারী, ইফতা, আলিয়া/সাধারণ ডিগ্রি) ও attachment। Salary ও bank/mobile wallet পৃথক restricted section।

- Teacher assignment class, subject ও halaqa ভিত্তিক; effective date দিয়ে শুরু ও শেষ; সাপ্তাহিক class load দেখাবে। Temporary substitute বরাদ্দ করা যাবে।

- Module ভিত্তিক permission template; attendance taker, marks entry ও result publisher আলাদা action। Role পরিবর্তনে পুরোনো session পুনরায় যাচাই।

- Daily work report (P1) এ planned class, completed class, study follow up ও reviewer comment। শুধু login count দিয়ে performance বিচার নয়।

- Resignation বা suspension এ login revoke ও দায়িত্ব হস্তান্তর (চলমান halaqa ও class কার কাছে যাবে)। Employee history, attendance ও payroll reference সংরক্ষিত।

**গ্রহণযোগ্যতা M04** A1 teacher শুধু নিজের বরাদ্দ subject এর marks দিতে পারবেন। A2 চাকরি শেষ হওয়া account দিয়ে নতুন কাজ বা export করা যাবে না। A3 দায়িত্ব হস্তান্তর না করে halaqa শিক্ষকহীন হবে না — dashboard এ warning।

# ৬. হাজিরা ও শিক্ষার অগ্রগতি

## M05 উপস্থিতি ও চলাচল

_P0 (R1a) manual \| P1 QR ও offline draft \| P2 hardware \| Owner শিক্ষক, Branch Admin ও HR_

Class/halaqa attendance এবং gate বা staff in/out আলাদা record হিসেবে কাজ করবে।

- Student ও staff attendance এ present, late, absent, leave, holiday ও unmarked। Register নির্দিষ্ট দিন, class/halaqa বা shift অনুযায়ী। আবাসিক হিফজ শিক্ষার্থীর একাধিক session (ফজরের পর, সকাল, মাগরিবের পর) আলাদা register হতে পারে।

- Teacher এর mobile screen এ default "সবাই উপস্থিত" দিয়ে শুরু করে শুধু ব্যতিক্রম চিহ্নিত করার বিকল্প (প্রতিষ্ঠান চালু করলে); submit এর আগে সারাংশ দেখাবে।

- **সকালের cutoff:** প্রতিটি shift এর জন্য submit সময়সীমা (প্রস্তাবিত: প্রথম পিরিয়ড শুরুর ৪৫ মিনিট পর)। Submit হলে finalized; তখনই অনুপস্থিতির বার্তা যাবে। Cutoff পেরোলে register Branch Admin এর কাছে escalate; তিনি reminder পাঠাবেন বা নিজে finalize করবেন, কারণ ও actor audit এ।

- **দিনের শেষের lock:** নির্ধারিত সময়ে সব register locked; এর পর correction এ কারণ, অনুমোদন ও নতুন version। Lock এর পর বদল হলে অভিভাবককে সংশোধনী বার্তা (নীতি অনুযায়ী)।

- Finalized register ছাড়া absent alert নয়; approved leave, holiday ও duplicate message বাদ।

- QR card scan (P1) teacher supervised; Gate log এ In → Break out → Break in → Out; একাধিক বৈধ cycle। Gate entry নিজে থেকে class attendance নিশ্চিত করবে না। Duplicate, revoked QR, ভুল sequence ও unmatched out flag; card token এ ব্যক্তিগত তথ্য নয়।

- Offline draft (P1) এ event ID, capture time ও sync status। Conflict review ছাড়া finalized data overwrite নয়।

**গ্রহণযোগ্যতা M05** A1 unmarked student কে absent SMS নয়। A2 সকালে submit হওয়া register এর absent বার্তা সকালেই যাবে (job delay প্রস্তাবিত ≤১০ মিনিট)। A3 cutoff পার হওয়া register dashboard এ pending, silently miss নয়। A4 একই scan retry এক event।

## M06 হিফজ, কুরআন ট্র্যাক ও পড়াশোনার ডায়েরি

_P0 (R1a) সবক ও study diary \| P0 (R1b) খতম রেকর্ড ও সনদ \| P1 মুহাসাবা \| Owner হিফজ প্রধান ও Assigned Teacher_

Noorani/Qaida থেকে হিফজ পর্যন্ত কুরআন-কেন্দ্রিক অগ্রগতি এবং সাধারণ পড়াশোনা শিক্ষক ও অভিভাবককে দেখানো হবে। এই মডিউল syllabus (M26) এর উপর নির্ভরশীল নয়; কুরআনের পারা/সূরা/পৃষ্ঠা কাঠামো system এ আগে থেকেই থাকবে।

- Track configurable: Noorani/Qaida (সবক/পাতা ও হরফ ভিত্তিক), Nazera (সূরা/পারা পঠন), Hifz (মুখস্থ)। প্রতিটি track এর নিজস্ব milestone ও unit। শিক্ষার্থী track বদলালে আগের অগ্রগতি থাকবে।

- দৈনিক সবক, সবকি ও আমুক্তা আলাদাভাবে: পারা, সূরা/আয়াত বা page range (মুসহাফ সংস্করণ প্রতিষ্ঠান নির্ধারণ করবে, যেমন ১৫ লাইনের), target, completed amount, ভুলের ধরন (ভুল, আটকে যাওয়া, তাজবিদ), মান এবং teacher note। পরিভাষা configurable।

- দ্রুত entry: halaqa র তালিকায় প্রতিটি শিক্ষার্থীর আগের দিনের শেষ অবস্থান থেকে পরের range auto-suggest; শিক্ষক শুধু নিশ্চিত বা সংশোধন করবেন।

- Tajweed/makhraj মূল্যায়ন rubric configurable; periodic assessment, score ঐচ্ছিক।

- একই অংশ পুনরাবৃত্তি নতুন মুখস্থ হিসেবে দ্বিগুণ গণনা হবে না। ভুলে যাওয়া অংশ পুনরায় মুখস্থ করলে "পুনঃমুখস্থ" চিহ্ন, মোট মুখস্থে নতুন করে যোগ নয়। ৩০ পারার grid এ মুখস্থ, চলমান ও দুর্বল অংশ রঙ ও চিহ্নে দেখাবে।

- Khatam সম্পন্ন হলে (R1b) হিফজ প্রধানের যাচাই → completion record → সনদ (M08 template); dastarbandi event আলাদা log।

- Study activity এ lesson plan, homework reference (M26), classwork ও feedback। Guardian অনুমোদিত summary দেখবেন; confidential note নয়।

- মুহাসাবা (P1) তে নামাজ, তিলাওয়াত ও আখলাকের institutional rubric; self report ও teacher observation আলাদা source।

- Score ও ranking default off; ব্যক্তিগত উন্নতি প্রধান view। Score ধর্মীয় মর্যাদা বা স্বয়ংক্রিয় শাস্তি নির্ধারণ করবে না।

**গ্রহণযোগ্যতা M06** A1 আমুক্তা/সবকি entry মোট নতুন মুখস্থ বাড়াবে না। A2 অভিভাবক অন্য শিক্ষার্থীর রিপোর্ট বা restricted note দেখবেন না। A3 খতম হলে completion record ও পুরোনো সবক history একসাথে দেখা যাবে। A4 syllabus সেট না থাকলেও সবক entry কাজ করবে।

## M26 সিলেবাস, স্টাডি প্ল্যান ও হোমওয়ার্ক

_P0 (R1a) homework core \| P0 (R1b) syllabus ও coverage \| P1 auto study plan prefill \| Owner Academic Admin ও Teacher_

Syllabus কভারেজ, শিক্ষকের পরিকল্পনা এবং হোমওয়ার্ক একই চেইনে যুক্ত থাকবে, কিন্তু হোমওয়ার্কের জন্য syllabus বাধ্যতামূলক নয়।

- Syllabus এ class/subject/track অনুযায়ী chapter, topic বা কিতাবের অংশ; প্রতিটি item এর target date ও coverage status (not started/in progress/completed)।

- Study plan (term/মাসিক/সাপ্তাহিক) teacher draft, Academic Admin approve। P1 এ syllabus থেকে auto-prefill। Plan বনাম actual coverage gap report।

- Homework assign: class/section/halaqa/individual; title, instruction, due date, attachment ও submission type — text, file, audio (তিলাওয়াত/হিফজ), অথবা **অফলাইন — ক্লাসে যাচাই** (খাতায় কাজ; শিক্ষক তালিকা থেকে checked/not done চিহ্নিত করবেন)। Syllabus item এর সঙ্গে link ঐচ্ছিক।

- Student/guardian submission; teacher check করে marks বা qualitative feedback (audio feedback সহ) দেবেন। Late submission আলাদা flag; override কারণসহ।

- **ফাইলের সীমা (প্রস্তাবিত):** audio সর্বোচ্চ ৫ মিনিট/১০ MB (browser এ compress), ছবি ৫ MB (client side resize), PDF ১০ MB। Checked audio session শেষে archive, retention প্রতিষ্ঠানের setting (default ১ session)। প্রতিটি tenant এর storage usage dashboard এ।

- Resource library: PDF, audio, chart, worksheet আপলোড করে syllabus, plan বা homework এ attach।

- Guardian portal এ নিজ সন্তানের homework status (assigned/submitted/checked/overdue) ও syllabus progress।

**গ্রহণযোগ্যতা M26** A1 teacher শুধু নিজের বরাদ্দ class/subject/halaqa তে syllabus update বা homework assign করবেন। A2 guardian শুধু নিজ সন্তানের তথ্য দেখবেন। A3 late submission silently on-time দেখাবে না। A4 offline-checked homework completion হিসাবে গণ্য হবে। A5 সীমার বেশি audio আপলোডে স্পষ্ট বাংলা বার্তা, আংশিক ফাইল save নয়।

# ৭. পরীক্ষা, প্রশ্নপত্র, নথি ও বোর্ড

## M07 পরীক্ষা ও ফলাফল

_P0 (R1a) single exam \| P1 weighted merge \| Owner Exam Controller_

অনুমোদিত নিয়মে নম্বর থেকে যাচাইকৃত ও versioned ফলাফল তৈরি হবে।

- Exam, class, subject, written/oral/practical component (কওমিতে মৌখিক পরীক্ষা গুরুত্বপূর্ণ; হিফজের জন্য তিলাওয়াত পরীক্ষা), full/pass marks, grade/বিভাগ (মুমতাজ, জায়্যিদ জিদ্দান ইত্যাদি configurable) ও optional subject rule। Published exam এর rule version স্থির।

- Teacher assigned subject এ marks দেবেন; spreadsheet ধাঁচের দ্রুত entry, range check, autosave status, missing entry report ও reviewer approval। ০, absent, exempt ও not entered আলাদা।

- Term merge (P1) এ component mapping, percentage weight, rounding ও pass rule আগে validate। উদাহরণ: ১ম পরীক্ষা (৩০%) এ ৮০ এবং ২য় (৭০%) এ ৭০ হলে final = ৮০×০.৩ + ৭০×০.৭ = ৭৩/১০০।

- Draft → reviewed → locked → published; publish এর আগে preview ও discrepancy report। Reopen এ অনুমোদন, কারণ, নতুন version ও affected guardian notification।

- Tabulation, individual marksheet, subject analysis, pass/fail summary, merit list (নীতি চালু হলে)। Printed result এ institution, session, exam ও version।

**গ্রহণযোগ্যতা M07** A1 missing marks এ publish বন্ধ। A2 weighted উদাহরণে final ৭৩; grading change পুরোনো snapshot বদলাবে না।

## M08 কার্ড, সনদ ও আসন পরিকল্পনা

_P0 (R1b) basic documents ও manual seat \| P1 automatic seat plan \| Owner Academic Admin_

একই শিক্ষার্থীর তথ্য থেকে print ready ID, admit, certificate, খতম সনদ ও seat plan তৈরি হবে।

- ID card (CR80 মাপ), admit card, testimonial, transfer, institutional certificate এবং হিফজ/খতম সনদের template, signature, photo, serial ও issue date configurable। ছবি নীতি অনুযায়ী "ছবি ছাড়া" variant।

- Batch preview, PDF print এবং reissue। Source field বদলালে issued document snapshot নীরবে বদলাবে না; revoke ও new issue আলাদা।

- Certificate QR শুধু এই প্রতিষ্ঠানের issued record যাচাই করবে; minimal status দেখাবে। External board certificate সত্যতা দাবি নয়।

- Exam eligibility institution rule অনুযায়ী; exception approval logged।

- Seat plan এ room capacity, seat number, candidate ও exam time; gender নীতি চালু থাকলে আলাদা room। একই সময়ে এক student বা seat দ্বিগুণ বরাদ্দ বন্ধ।

**গ্রহণযোগ্যতা M08** A1 revoked certificate QR এ valid দেখাবে না। A2 room capacity ছাড়ালে allocation blocked; বাংলা/আরবি ও ছবি print এ কাটা যাবে না।

## M25 প্রশ্নপত্র ব্যাংক ও প্রিন্ট

_P0 (R1b) manual bank ও print \| P1 auto paper suggestion \| P2 AI-assisted draft (M22) \| Owner Exam Controller_

Class/subject/chapter ভিত্তিক প্রশ্ন সংরক্ষণ করে নিরাপদভাবে পেপার তৈরি ও প্রিন্ট করা যাবে। প্রথম টার্ম পরীক্ষার আগে চালু থাকতে হবে।

- Question bank এ class, subject, chapter/topic (syllabus থাকলে link, না থাকলে free text), type (MCQ, short, broad, fill-in, matching, তারকিব, তরজমা, Quran/Arabic পাঠ), marks, difficulty, language (BN/EN/AR) ও source। Duplicate question flag।

- Paper builder: manual select; P1 এ configuration অনুযায়ী random pick। Total marks ও component mapping exam version (M07) এর সঙ্গে validate। একাধিক Set (A/B)।

- Workflow: Teacher draft → Exam Controller review → Approved/Locked → Print। Locked paper edit এ নতুন version, পুরোনো archive।

- Print এ Bangla/Arabic/English glyph সঠিক (আরবি RTL ও হরকত সহ), institution header, A4 layout, answer key আলাদা sheet, OMR/answer sheet template ঐচ্ছিক।

- Secrecy: approve ও print permission আলাদা role। শিক্ষক নিজের লেখা প্রশ্ন ও approved bank দেখতে পারবেন; **locked paper** এর preview ও print শুধু নির্ধারিত print window তে, Exam Controller বা print অনুমতিপ্রাপ্ত ব্যক্তি। প্রতিটি print/download event actor, সময় ও কপি সংখ্যা সহ log।

**গ্রহণযোগ্যতা M25** A1 total mismatch বা mapping না মিললে paper lock হবে না। A2 unapproved paper print এ যাবে না; প্রতিটি attempt log এ। A3 print window এর বাইরে locked paper preview blocked।

## M09 বেফাক ও অন্য বোর্ডের প্রস্তুতি

_P1 manual preparation \| P2 অনুমোদিত integration \| Owner Board Coordinator_

প্রতিষ্ঠান বোর্ড পরীক্ষার আবেদন ও নথি প্রস্তুত, জমার অবস্থা এবং প্রাপ্ত ফলাফল সংরক্ষণ করবে। \[S1\]

- Board, ইলহাক, exam year, মারহালা, candidate, registration ও roll mapping। প্রতি board ও year এর field ও template আলাদা version।

- Eligibility checklist, missing document, fee status, deadline, candidate list ও printable/exportable form। বোর্ডের বর্তমান নির্দেশনা staff যাচাই করবেন।

- Prepared, submitted externally, acknowledged, correction requested ও completed status; submission reference ও receipt attachment। Export মানেই submission নয়।

- Board result import এ source file, date ও reviewer। Internal marksheet ও official external result পৃথক label।

- API submission বা live sync শুধু board permission ও verified specification পেলে; তার আগে official portal link ও manual tracking।

**গ্রহণযোগ্যতা M09** A1 শুধু export করলে submitted দেখাবে না। A2 source ছাড়া imported result official হিসেবে প্রকাশ নয়।

# ৮. অর্থ, ফান্ড ও দান

## M10 ফি, ইনভয়েস, পেমেন্ট ও Sponsorship

_P0 (R1a) cash, verified manual ও fund allocation \| P1 gateway \[S2\] \| Owner হিসাবরক্ষক ও Finance Lead_

নিয়মিত ও এককালীন ফি, ছাড়, sponsorship, বকেয়া এবং সব আদায়ের traceable হিসাব থাকবে।

- Admission, tuition, exam, hostel, mess, খাতা-কিতাব ও অন্যান্য fee head; class/student based rule, due date, recurring invoice ও অনুমোদিত concession।

- Partial payment, advance credit, invoice allocation ও period wise arrears। Late fee default off; চালু হলে approved rule ও preview।

- Payment method: cash, bank, approved bKash/Nagad/Rocket reference, gateway এবং **fund allocation**। Manual transaction proof verification ছাড়া paid নয়। Unique receipt নম্বর ও cashier close।

- **Sponsorship:** শিক্ষার্থীর জন্য অনুমোদিত sponsorship রেকর্ড — উৎস (যাকাত, লিল্লাহ, এতিম fund বা নির্দিষ্ট দাতা), কোন fee head, পূর্ণ/শতাংশ/নির্দিষ্ট অঙ্ক, মেয়াদ, অনুমোদনকারী ও eligibility প্রমাণ (restricted)। Invoice তৈরি হলে sponsorship অনুযায়ী fund allocation draft স্বয়ংক্রিয়ভাবে তৈরি হবে; Finance Lead অনুমোদন দিলে posted।

- Fund allocation ও concession আলাদা জিনিস: concession invoice এর charge কমায় (প্রতিষ্ঠানের ছাড়), fund allocation হলো fund থেকে পরিশোধ। দুটো আলাদা রিপোর্টে।

- Gateway (P1) এর validated transaction, amount, currency ও tenant invoice মিলিয়ে post। Callback retry, duplicate reference ও settlement reconciliation।

- Refund, waiver, credit note ও reversal আলাদা অনুমোদন; posted receipt delete নয়। Guardian printable receipt ও remaining due দেখবেন। Sponsored অংশ অভিভাবকের invoice এ "ফান্ড থেকে পরিশোধিত" হিসেবে দেখাবে; দাতার নাম শুধু দাতার সম্মতি থাকলে।

**গ্রহণযোগ্যতা M10** A1 repeated invoice job duplicate bill নয়। A2 success page দেখে paid নয়; একই verified transaction একবারই ledger এ। A3 মেয়াদোত্তীর্ণ sponsorship নতুন invoice এ allocation তৈরি করবে না।

## M11 হিসাব, ফান্ড ও দান

_P0 (R1a) cashbook, basic ledger ও fund ledger \| P1 full accounting ও donor portal \| Owner Finance Lead_

ফি, দান, ব্যয় ও ফান্ডের ব্যবহার একই financial record থেকে মিলবে।

- Chart of accounts, opening balance, cash/bank/mobile wallet account, voucher, expense, transfer ও supporting attachment। Balanced journal ভিত্তি P0 থেকেই।

- Donation receipt, donor consent, recurring pledge ও received donation আলাদা। Unpaid pledge কে cash income বা available fund ধরা যাবে না।

- সাধারণ, যাকাত, সদকা, ফিতরা, কুরবানির চামড়া, ইফতার স্পন্সর, এতিম, লিল্লাহ বোর্ডিং ও নির্মাণ fund আলাদা tag ও ledger। প্রতিটি restricted fund এর **eligible use rule** (কোন fee head বা ব্যয়ে খরচ করা যাবে, কোন eligibility category দরকার) প্রতিষ্ঠান লিখিতভাবে সেট করবে।

- **Fund থেকে শিক্ষার্থীর বিল নিষ্পত্তি:** allocation post হলে fund ledger থেকে অঙ্ক কমবে এবং শিক্ষার্থীর receivable সমপরিমাণ নিষ্পত্তি হবে — একটি balanced journal এ। Eligible use rule না মিললে block; ব্যতিক্রম শুধু মুহতামিম/Finance Lead অনুমোদনে, কারণসহ।

- লিল্লাহ বোর্ডিং এর মেস বিল (M15) একইভাবে নির্ধারিত fund এ allocation হবে।

- Cashbook, income/expense, receivable, payable, fund statement (আয়, allocation, ব্যয়, ব্যালেন্স), sponsored student তালিকা, trial balance ও period close। Closed period edit নয়; adjustment entry।

- Donor profile (অধ্যায় ১১) ও donor statement; public donor list opt in। Donor portal ও gateway P1।

**গ্রহণযোগ্যতা M11** A1 সব posted journal balanced। A2 pledge fund balance বাড়াবে না। A3 যাকাত fund থেকে অযোগ্য খাতে allocation blocked। A4 fund balance এর বেশি allocation pending থাকবে, negative balance নয়।

# ৯. প্রশাসন, আবাসন ও যোগাযোগ

## M12 রুটিন, নোটিশ ও ক্যালেন্ডার

_P0 (R1a) routine ও notice \| P1 drag/drop builder \| Owner Academic Admin_

শিক্ষক, room ও class এর সময়সূচি এবং গুরুত্বপূর্ণ ঘোষণা এক জায়গায় থাকবে।

- Day, period, subject, class/halaqa, room ও teacher অনুযায়ী routine; break ও prayer window প্রতিষ্ঠান সেট করবে। একই সময়ে teacher/room conflict check।

- Builder (P1) এ valid slot suggestion, drag/drop ও আগের সপ্তাহ copy। Conflict থাকলে publish বন্ধ।

- Substitute teacher, temporary change, effective date ও routine version। পরিবর্তিত class এর শিক্ষক ও guardian কে targeted notice।

- Notice: draft, approval, schedule, publish, expiry ও audience (branch/class/role/gender section)। Attachment ও read acknowledgement।

- Exam, event, holiday ও রমজানের সময়সূচি calendar এ; Hijri তারিখসহ।

**গ্রহণযোগ্যতা M12** A1 একই teacher একই সময়ে দুই class এ publish নয়। A2 class specific notice অন্য class বা public website এ যাবে না।

## M13 HR, পে রোল ও ছুটি

_P1 \| Owner HR Officer ও Finance Lead_

ছুটি, বেতন ও কর্মীর পাওনা অনুমোদিত হিসাবের ভিত্তিতে পরিচালিত হবে।

- Employee contract, salary structure, allowance (বাসা, খাবার, হিফজ ভাতা), deduction, advance ও increment এর effective date। Payroll details শুধু HR ও Finance role।

- Leave type, balance, holiday overlap, application, approver ও substitute handover।

- Monthly cutoff, attendance review ও approved leave থেকে payroll draft; blind automatic deduction নয়।

- Draft → review → approval → paid; payslip, payment reference ও accounting posting। Advance recovery আলাদা line।

- Offboarding এ pending due, asset return, service record ও access revoke; payroll history মুছবে না।

**গ্রহণযোগ্যতা M13** A1 একই মাসের batch retry তে দ্বিগুণ বেতন নয়। A2 paid payroll নীরবে বদলাবে না; adjustment লাগবে।

## M14 ক্রয়, মজুত, ক্যান্টিন ও সম্পদ

_P1 \| Owner Storekeeper ও Finance Lead_

কেনা, পাওয়া, ব্যবহার, বিক্রি ও ফেরত দেওয়া পণ্যের পরিমাণ ও মূল্য অনুসরণযোগ্য হবে।

- Supplier, item, unit ও store; requisition, approval, PO, partial goods receipt, supplier invoice ও payment। Return ও damage আলাদা movement।

- Opening stock, receive, issue, transfer, adjustment ও count variance; negative stock default block। দানে পাওয়া পণ্য (চাল, কাপড়) in-kind donation হিসেবে stock ও donor রেকর্ডে।

- Canteen POS এ sale, return, cash/approved credit ও receipt; sale ও stock deduction একসঙ্গে commit।

- Durable asset register: serial, মূল্য, custodian, location, maintenance ও disposal।

**গ্রহণযোগ্যতা M14** A1 দুই concurrent sale শেষ stock এর বেশি consume করবে না। A2 partial delivery তে received quantity অনুযায়ী stock বাড়বে।

## M15 হোস্টেল, মেস ও গেট পাস

_P1 \| Owner Hostel Supervisor (নেগরান)_

আবাসিক শিক্ষার্থীর কক্ষ, খাবার, অনুমোদিত চলাচল ও emergency যোগাযোগ পরিচালিত হবে।

- Hostel (gender চিহ্নিত), room, bed, capacity ও allocation; move, checkout ও vacancy history। এক bed এ দুই active allocation নয়; ভিন্ন gender এর hostel এ allocation অসম্ভব।

- Mess plan, meal count, absence adjustment ও bill। লিল্লাহ বোর্ডিং শিক্ষার্থীর মেস বিল নির্ধারিত fund এ allocation (M11)।

- Leave/gate pass এ কারণ, গন্তব্য, অনুমোদিত pickup ব্যক্তি (ছাত্রীর ক্ষেত্রে মাহরাম তালিকা), guardian consent, expected ও actual out/in; overdue alert।

- Visitor log, emergency contact ও restricted allergy/medical note।

**গ্রহণযোগ্যতা M15** A1 concurrent request bed overbook করবে না। A2 অননুমোদিত pickup বা expired pass এ valid exit দেখাবে না।

## M16 লাইব্রেরি

_P1 \| Owner Librarian_

প্রতিটি কিতাব/বইয়ের physical copy, borrower এবং ফেরতের হিসাব থাকবে।

- Title (আরবি/বাংলা), লেখক, category, ভাষা, shelf ও accession/copy ID; প্রতি copy আলাদা status।

- Issue, due date, renew, return ও reservation; borrower limit ও overdue policy configurable। Fine default off।

- Charge থাকলে fee ledger এ reference দিয়ে post; একই fine দুবার collect নয়। TC clearance এ লাইব্রেরি বকেয়া দেখাবে।

**গ্রহণযোগ্যতা M16** A1 একই copy দুজনকে issue নয়। A2 returned book পুনরায় return এ duplicate fine বা stock increment নয়।

## M17 SMS, ইমেইল ও বার্তা

_P0 (R1a) text SMS ও in app \| P1 email/voice/push \| Owner Authorised Operator_

সঠিক ব্যক্তি সঠিক event এর বার্তা পাবেন; খরচ ও delivery status ট্র্যাক হবে। Event তালিকা অধ্যায় ১৩ এ।

- Bulk ও event based template; language ও recipient scope অনুযায়ী preview।

- Unicode segment estimate, recipient count, credit ও আনুমানিক খরচ পাঠানোর আগে দেখাবে। বাংলা SMS এর segment দৈর্ঘ্য ইংরেজির চেয়ে কম — template editor এ live counter।

- Draft, queued, sent, delivered, failed ও unknown state; provider callback, retry limit, per recipient log। Sent মানেই delivered নয়।

- বার্তার শ্রেণি: **লেনদেন** (রসিদ, অনুপস্থিতি, ফলাফল), **জরুরি** (নিরাপত্তা, ছুটি ঘোষণা) ও **সাধারণ/প্রচার**। Subscription সীমিত মোডেও প্রথম দুটি চলবে (M24)।

- Event + recipient + channel দিয়ে duplicate prevention; quiet hours (প্রস্তাবিত রাত ১০টা–সকাল ৭টা, জরুরি ব্যতীত)।

**গ্রহণযোগ্যতা M17** A1 retry একই receipt SMS দুবার পাঠাবে না। A2 credit কম থাকলে silent failure নয়; dashboard ও admin alert।

## M18 অভিভাবক ও শিক্ষার্থী পোর্টাল

_P0 (R1a) responsive portal \| P1 self service \| Owner Guardian/Student_

অভিভাবক অফিসে না গিয়েও প্রয়োজনীয় তথ্য দেখতে ও আবেদন করতে পারবেন। কম দামি Android ফোন ও ধীর নেটওয়ার্ক প্রধান লক্ষ্য।

- Phone OTP login; verified guardian account থেকে child switch; আজকের হাজিরা, সবক, হোমওয়ার্ক, published result, invoice ও receipt।

- হোমওয়ার্ক audio রেকর্ড করে সরাসরি জমা (তিলাওয়াত), upload progress ও retry।

- Notice, routine ও calendar; acknowledgement। Staff এর ব্যক্তিগত নম্বর প্রকাশ নয়।

- P1 এ leave, profile correction, complaint ও certificate request; guardian edit সরাসরি official record বদলাবে না।

- Gateway সক্রিয় হলে invoice payment; অন্যথায় অফিস/bKash নির্দেশনা ও payment proof upload (proof মানেই confirmed নয়)।

- Phone change, custody change এ যাচাই; পুরোনো link revoke।

**গ্রহণযোগ্যতা M18** A1 child switch এ fee, homework ও result সঠিক সন্তানেই থাকবে। A2 link revoke এর পর পুরোনো session দিয়ে attachment দেখা যাবে না।

## M19 শৃঙ্খলা, অভিযোগ ও কল্যাণ

_P0 (R1b) basic discipline \| P1 complaint ও wellbeing \| Owner Welfare Officer_

ঘটনা, সহায়তার প্রয়োজন ও অভিযোগের ন্যায্য follow up রাখা হবে। Navigation এ "Welfare" মেনুতে।

- Incident type, date, reporter, factual description, attachment ও status; allegation ও verified finding আলাদা। সংশ্লিষ্ট role ছাড়া access নয়; ছাত্রী শাখার incident মহিলা Welfare Officer এর কাছে।

- Review, student/guardian response, corrective support, follow up ও closure; appeal record। কোনো automated punishment নয়।

- Complaint/helpdesk ticket: category, assignee, priority ও response deadline।

- Emergency medical note, allergy, authorised contact ও referral record; teacher dashboard এ অপ্রয়োজনীয় health detail নয় — শুধু "চিকিৎসা সতর্কতা আছে" চিহ্ন।

**গ্রহণযোগ্যতা M19** A1 সাধারণ শিক্ষক সব incident দেখতে পারবেন না। A2 correction original history মুছবে না।

## M20 সমন্বিত ওয়েবসাইট

_P1 \| Owner Website Editor_

প্রতিষ্ঠানের public website থেকে অনুমোদিত তথ্য, ভর্তি ও দানের সুবিধা পাওয়া যাবে।

- Home, পরিচিতি, বিভাগ, শিক্ষক পরিচিতি (ছবি ঐচ্ছিক), ভর্তি, notice, gallery, contact ও donation page; mobile responsive template।

- Editor draft, publisher approve; scheduled publishing, preview ও rollback।

- Admission form M02 এবং donation M11 ব্যবহার করবে। Public result lookup এ roll + verified token (DOB বা OTP); rate limit।

- Custom domain, HTTPS, SEO metadata, sitemap। Domain ownership verify ছাড়া bind নয়।

- ছবি প্রকাশের অনুমতি ও gallery moderation; ছাত্রীর ছবি default blocked।

**গ্রহণযোগ্যতা M20** A1 draft page public হবে না। A2 ভুল tenant domain অন্য প্রতিষ্ঠানের তথ্য প্রকাশ করবে না। A3 sequential roll চেষ্টায় token ছাড়া result নয়।

# ১০. প্ল্যাটফর্ম, মোবাইল ও SaaS

## M21 মোবাইল PWA ও ভাষা

_P0 (R1a) responsive PWA BN/EN \| P2 Android/iOS ও AR/UR \| Owner Product Team_

একই নিরাপদ সেবা কম ক্ষমতার mobile এবং desktop থেকে ব্যবহারযোগ্য হবে।

- PWA install, responsive UI, minimal cached shell ও draft indicator। Financial posting online only; offline transaction confirmed দেখানো যাবে না।

- Shared Android app একই API; guardian child switch, teacher attendance, সবক entry, notices, fees, homework। Push permission ও session revoke।

- iOS আলাদা add on; store approval guarantee নয়।

- BN/EN P0; Arabic/Urdu P2 তে RTL। Quranic/Arabic content সব ভাষার interface এ সঠিক RTL এ দেখাবে (P0)।

**গ্রহণযোগ্যতা M21** A1 network বন্ধ হলে unsaved/queued state স্পষ্ট। A2 revoked account mobile token দিয়ে access পাবে না।

## M22 স্মার্ট AI ও প্রশ্নের খসড়া

_P2 \| Owner Academic Lead ও Product Team_

অনুমোদিত তথ্য খোঁজা এবং M25 প্রশ্ন ব্যাংকের খসড়া তৈরিতে সহায়তা।

- Public assistant শুধু approved FAQ, admission ও office তথ্য থেকে উত্তর; source ও last updated; তথ্য না থাকলে human contact।

- Private assistant permission অনুযায়ী; student records third party model এ দেওয়ার আগে data minimisation ও institution approval।

- Question draft: approved book/chapter, class, syllabus, marks ও type থেকে; teacher review ছাড়া bank এ publish নয়। Arabic ও ধর্মীয় content specialist review।

- AI fee/refund/result পরিবর্তন বা নিজে থেকে guardian কে বার্তা পাঠাতে পারবে না।

**গ্রহণযোগ্যতা M22** A1 অন্য tenant data প্রকাশ নয়। A2 unapproved draft publish নয়; বানানো source flagged।

## M23 রিপোর্ট, এক্সপোর্ট ও ডাটা স্থানান্তর

_P0 (R1a) essential reports ও import \| P1 full reports \| P2 custom analytics_

একই অনুমোদিত ডাটা থেকে কার্যকর report ও export হবে।

- Core: admission, student register, attendance, fee due/collection, fund allocation, result, হিফজ, homework completion, দাতা/fund ও audit। R1b: syllabus coverage। P1: payroll, hostel, stock, library।

- Date, branch, gender section, class, session, status ও payment method filter; dashboard ও detail একই definition। CSV/XLSX/PDF role অনুযায়ী।

- বড় export asynchronous; job status, expiry ও secure download। Permission দুইবার check; formula injection protection।

- Migration: template, mapping, dry run, duplicate review, rollback before go live, totals reconciliation। Opening due ও fund balance আলাদা approval।

**গ্রহণযোগ্যতা M23** A1 report total filtered source record এর সঙ্গে মেলে। A2 import retry duplicate নয়; unauthorized export blocked।

## M24 SaaS প্রশাসন ও সাপোর্ট

_P0 (R1a) tenant security ও entitlement \| P1 billing/support automation \| Owner SaaS Admin_

একই সফটওয়্যারে বহু প্রতিষ্ঠান নিরাপদে onboard, bill, support ও maintain করা যাবে।

- Tenant create, onboarding status, trial/active/grace/limited/suspended/closed, plan, feature flags ও quota (active student, storage, SMS)। Entitlement সব backend action এ যাচাই।

- Subscription invoice এবং student fee invoice আলাদা owner ও ledger। বকেয়া subscription এ student payment record মুছবে না।

- **মেয়াদ শেষের ধাপ (প্রস্তাবিত):** (১) **Grace — ১৪ দিন:** সব কাজ চালু, প্রতিটি admin screen এ banner। (২) **সীমিত মোড — পরের ৩০ দিন:** চালু থাকবে — read, export, backup, হাজিরা, সবক, হোমওয়ার্ক, বিদ্যমান শিক্ষার্থীর নিয়মিত মাসিক invoice, বিদ্যমান invoice এর টাকা আদায় ও রসিদ, লেনদেন ও জরুরি বার্তা। বন্ধ থাকবে — নতুন enquiry/admission, নতুন user/branch, সাধারণ/প্রচার bulk SMS, plan-gated module এ নতুন write। (৩) **Suspended:** read ও export only। চূড়ান্ত তালিকা Business Owner অনুমোদন করবেন।

- Health dashboard: failed jobs, backup status, provider outage, usage ও support ticket। Tenant support access অনুমোদিত, সময়সীমাবদ্ধ ও audited।

- Data export/offboarding, maintenance notice, staged release, rollback ও incident workflow।

**গ্রহণযোগ্যতা M24** A1 UI ছাড়াও API তে quota enforce। A2 suspended tenant এর historical data অক্ষত ও export চালু। A3 সীমিত মোডে বিদ্যমান invoice এর payment ও অনুপস্থিতির বার্তা চালু থাকবে।

# ১১. পূর্ণ প্রোফাইল স্পেসিফিকেশন

প্রতিটি profile এর গঠন একই: উপরে **profile header** (পরিচয়, অবস্থা ও দ্রুত কাজ), তার নিচে **tab bar**, প্রতিটি tab এ section ভিত্তিক card। কোনো tab দেখার অনুমতি না থাকলে tab টি দেখাবে না; একটি field restricted হলে "সীমিত তথ্য" চিহ্নসহ masked থাকবে। প্রতিটি পরিবর্তন audit এ যাবে; সংবেদনশীল field এ কারণ বাধ্যতামূলক।

## ১১.১ শিক্ষার্থী প্রোফাইল

### Profile header

- ছবি (নীতি অনুযায়ী; না থাকলে আদ্যক্ষর avatar), পূর্ণ নাম বাংলায় বড় করে, নিচে ইংরেজি ও আরবি নাম; Student ID (copy বাটন)।

- Chip: বর্তমান class/section, halaqa, roll, branch, session; status badge (Active/Leave/Transferred…), আবাসিক/অনাবাসিক, Sponsored, "চিকিৎসা সতর্কতা" (শুধু চিহ্ন), "custody restriction"।

- মূল সংখ্যা (৪টি): এই মাসের হাজিরা %, বর্তমান বকেয়া ৳, হিফজ অগ্রগতি (যেমন ১২.৫/৩০ পারা), সর্বশেষ ফলাফল।

- দ্রুত কাজ (অনুমতি অনুযায়ী): ফি আদায়, অভিভাবককে বার্তা, ID card print, নথি ইস্যু, section/halaqa পরিবর্তন, status পরিবর্তন। অভিভাবকের ফোন সরাসরি দেখানোর বদলে "কল" বাটন (নম্বর masked, নীতি অনুযায়ী)।

### Tab তালিকা

| **Tab**               | **বিষয়বস্তু**                                                                                                                                     | **দেখবেন**                                       | **সম্পাদনা**                   | **রিলিজ** |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------- | --------- |
| **সারসংক্ষেপ**          | হাজিরার ৩০ দিনের strip, বকেয়া, হিফজ অগ্রগতি, হোমওয়ার্ক অবস্থা, সর্বশেষ ফলাফল, সক্রিয় alert ও সাম্প্রতিক কার্যক্রম timeline                                       | অনুমতিপ্রাপ্ত সবাই (নিজ scope)                        | —                           | R1a       |
| **ব্যক্তিগত তথ্য**       | নাম (BN/EN/AR), জন্মতারিখ (হিজরি প্রদর্শনসহ), জন্ম নিবন্ধন নম্বর, gender, রক্তের গ্রুপ, জাতীয়তা, মাতৃভাষা, বর্তমান ও স্থায়ী ঠিকানা, ছবি                                | Admin, শ্রেণি শিক্ষক (ঠিকানা masked)                 | Academic Admin, ভর্তি কর্মকর্তা | R1a       |
| **অভিভাবক ও যোগাযোগ**   | বাবা, মা, আইনগত অভিভাবক, primary contact, জরুরি যোগাযোগ (২), অনুমোদিত pickup/মাহরাম তালিকা, custody restriction, পছন্দের ভাষা ও channel, portal account অবস্থা  | Admin, Branch Admin                              | Admin (যাচাইসহ)               | R1a       |
| **ভর্তি ও শিক্ষা ইতিহাস** | Application নম্বর, ভর্তির তারিখ ও class, আগের প্রতিষ্ঠান, প্রতি session এর enrollment (class, section, halaqa, roll, ফল, outcome), transfer/withdrawal | Admin, Academic Admin                            | Academic Admin              | R1a       |
| **হাজিরা**              | মাসিক calendar heatmap, session অনুযায়ী সারাংশ, late count, ছুটির ইতিহাস, gate log (P1)                                                                | Admin, শিক্ষক, অভিভাবক                             | শিক্ষক (register থেকে)       | R1a       |
| **কুরআন ও হিফজ**       | Track, বর্তমান অবস্থান, ৩০ পারার grid, সবক/সবকি/আমুক্তা log, ভুলের প্রবণতা, তাজবিদ মূল্যায়ন, target বনাম actual chart, খতম রেকর্ড                                 | Admin, হিফজ প্রধান, halaqa শিক্ষক, অভিভাবক (summary) | Halaqa শিক্ষক                | R1a       |
| **পড়াশোনা ও হোমওয়ার্ক**   | বিষয়ভিত্তিক syllabus অগ্রগতি, হোমওয়ার্ক তালিকা ও status, শিক্ষকের feedback (audio সহ)                                                                  | Admin, শিক্ষক, অভিভাবক                             | শিক্ষক                       | R1a/R1b   |
| **পরীক্ষা ও ফলাফল**      | পরীক্ষাভিত্তিক marksheet, published version, বিষয়ভিত্তিক প্রবণতা, বোর্ড registration (P1)                                                              | Admin, Exam Controller, অভিভাবক (published)       | —                           | R1a       |
| **ফি ও পেমেন্ট**       | Invoice তালিকা, payment ও রসিদ, advance credit, concession, sponsorship ও fund allocation, বকেয়ার বয়স                                              | Admin, হিসাবরক্ষক, অভিভাবক                          | হিসাবরক্ষক (collect)          | R1a       |
| **আবাসন**              | Hostel/room/bed, মেস plan, গেট পাস ইতিহাস, visitor log (শুধু আবাসিক)                                                                                 | Admin, Hostel Supervisor                         | Hostel Supervisor           | P1        |
| **স্বাস্থ্য ও কল্যাণ**      | Allergy, দীর্ঘমেয়াদি অসুস্থতা, ওষুধ নোট, চিকিৎসকের যোগাযোগ, বিশেষ সহায়তা, incident ও sponsorship eligibility প্রমাণ                                        | Welfare Officer, মুহতামিম                          | Welfare Officer             | R1b       |
| **আমল ও মুহাসাবা**        | Rubric ভিত্তিক মূল্যায়ন, self report বনাম teacher observation                                                                                        | নির্ধারিত শিক্ষক, অভিভাবক (summary)                  | নির্ধারিত শিক্ষক               | P1        |
| **নথি ও সনদ**         | আপলোড করা নথি ও checklist অবস্থা, ইস্যু করা ID/admit/সনদ/TC, revoke ইতিহাস                                                                             | Admin                                            | Academic Admin              | R1b       |
| **যোগাযোগ লগ**         | পাঠানো SMS/notice, delivery অবস্থা, অভিভাবকের acknowledgement, অভিযোগ                                                                                | Admin                                            | —                           | R1a       |
| **অডিট**              | এই শিক্ষার্থীর রেকর্ডে সব পরিবর্তন: কে, কখন, কী, কেন                                                                                                 | Institution Admin                                | —                           | R1a       |

### শিক্ষার্থীর মূল field

| **Field**              | **ধরন**     | **বাধ্যতামূলক**     | **নোট**                                                    |
| ---------------------- | ----------- | --------------- | ---------------------------------------------------------- |
| **Student ID**         | স্বয়ংক্রিয়    | হ্যাঁ              | অপরিবর্তনীয়; format প্রতিষ্ঠান নির্ধারিত                         |
| **নাম (বাংলা)**           | text        | হ্যাঁ              | জন্ম নিবন্ধনের বানান অনুযায়ী; সনদে এটাই                           |
| **নাম (ইংরেজি / আরবি)** | text        | ঐচ্ছিক           | সনদ ও বোর্ড form এ; আরবি RTL input                          |
| **জন্মতারিখ**            | date        | হ্যাঁ              | Gregorian সংরক্ষণ, হিজরি প্রদর্শন; বয়স স্বয়ংক্রিয়               |
| **জন্ম নিবন্ধন নম্বর**    | ১৭ অঙ্ক      | নীতি অনুযায়ী      | অঙ্ক যাচাই; duplicate warning                                 |
| **Gender**             | enum        | হ্যাঁ              | Section ও hostel allocation নিয়ন্ত্রণ করে                    |
| **রক্তের গ্রুপ**          | enum        | ঐচ্ছিক           | "জানা নেই" বিকল্প                                             |
| **ঠিকানা (বর্তমান/স্থায়ী)**  | structured  | বর্তমান হ্যাঁ        | বিভাগ → জেলা → উপজেলা → ইউনিয়ন/ওয়ার্ড → গ্রাম/রাস্তা; "একই" checkbox |
| **ছবি**                | image       | নীতি অনুযায়ী      | crop ৩:৪; ছাত্রী শাখায় restricted                              |
| **বাবা / মা**             | person      | হ্যাঁ              | নাম, জীবিত/মৃত, পেশা, ফোন, NID (ঐচ্ছিক, restricted)            |
| **আইনগত অভিভাবক**       | person      | বাবা না থাকলে হ্যাঁ    | সম্পর্ক, ফোন, ঠিকানা                                           |
| **Primary contact**    | link        | হ্যাঁ              | একজনই; OTP দিয়ে যাচাই                                        |
| **এতিম/অসচ্ছল অবস্থা**    | enum + প্রমাণ | ঐচ্ছিক           | Restricted; sponsorship eligibility তে ব্যবহৃত               |
| **আবাসিক অবস্থা**         | enum        | হ্যাঁ              | আবাসিক / অনাবাসিক / শুধু খাবার                                    |
| **আগের প্রতিষ্ঠান**       | text + নথি  | ঐচ্ছিক           | শেষ class, সাল, TC                                          |
| **হিফজ শুরুর অবস্থা**      | পারা/পৃষ্ঠা      | হিফজ track এ হ্যাঁ | ভর্তির সময় কতটুকু মুখস্থ ছিল; অগ্রগতির ভিত্তি                     |

## ১১.২ শিক্ষক ও কর্মচারী প্রোফাইল

### Profile header

- ছবি (ঐচ্ছিক; মহিলা কর্মীর ক্ষেত্রে নিজের সম্মতিসাপেক্ষ), নাম (BN/EN/AR), Staff ID, পদবি, বিভাগ, branch, employment type ও status badge।

- মূল সংখ্যা: সাপ্তাহিক class load, এই মাসের হাজিরা, ছুটির ব্যালেন্স, অসম্পূর্ণ কাজ (submit বাকি register, marks entry বাকি, check বাকি হোমওয়ার্ক)।

- দ্রুত কাজ: দায়িত্ব বরাদ্দ, substitute দেওয়া, বার্তা, access বন্ধ, অব্যাহতি প্রক্রিয়া শুরু।

### Tab তালিকা

| **Tab**           | **বিষয়বস্তু**                                                                                                                                                                | **দেখবেন**                             | **রিলিজ**             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------- |
| **সারসংক্ষেপ**      | আজকের class/halaqa, অসম্পূর্ণ কাজ, সাম্প্রতিক কার্যক্রম                                                                                                                              | নিজে, Admin, Academic Admin            | R1a                   |
| **ব্যক্তিগত তথ্য**   | নাম, জন্মতারিখ, gender, NID, রক্তের গ্রুপ, ঠিকানা, জরুরি যোগাযোগ, বৈবাহিক অবস্থা (ঐচ্ছিক)                                                                                                | নিজে, HR Officer, Admin                | R1a                   |
| **যোগ্যতা ও সনদ**   | ডিগ্রি (দাওরায়ে হাদিস/তাকমিল, ফজিলত, হাফেজ, কারী, ইফতা, আলিয়া কামিল/ফাজিল, সাধারণ ডিগ্রি), প্রতিষ্ঠান, সাল, ফল; ইজাজত/সনদ; প্রশিক্ষণ; বিশেষজ্ঞতা (হিফজ, তাজবিদ, আরবি, ফিকহ, হাদিস, বাংলা/ইংরেজি/গণিত) | নিজে, HR, Academic Admin               | R1a                   |
| **চাকরি তথ্য**      | যোগদান, পদবির ইতিহাস, চুক্তি, probation, কার কাছে রিপোর্ট করেন, employment type                                                                                                   | HR, Admin                              | R1a                   |
| **শিক্ষাদান দায়িত্ব**  | Class/subject/halaqa বরাদ্দ (effective date), সাপ্তাহিক routine, load, substitute ইতিহাস                                                                                         | নিজে, Academic Admin, Branch Admin     | R1a                   |
| **হাজিরা ও ছুটি**    | Attendance, ছুটির ব্যালেন্স ও আবেদন                                                                                                                                            | নিজে, HR, Branch Admin                 | R1a (হাজিরা) / P1 (ছুটি) |
| **বেতন ও পে রোল** | Salary structure, ভাতা, bank/mobile wallet, payslip, advance                                                                                                                 | নিজে (নিজের payslip), HR, Finance Lead | P1                    |
| **কাজ ও মূল্যায়ন**    | Daily work report, halaqa র সামগ্রিক অগ্রগতি, হোমওয়ার্ক check হার, পর্যবেক্ষণ নোট (restricted)                                                                                     | Academic Admin, হিফজ প্রধান, মুহতামিম      | P1                    |
| **নথি**           | CV, সনদের কপি, NID, নিয়োগপত্র, অভিজ্ঞতা সনদ                                                                                                                                   | HR, Admin                              | R1a                   |
| **সিস্টেম অ্যাক্সেস** | Role, 2FA অবস্থা, শেষ login, সক্রিয় session, revoke                                                                                                                           | Institution Admin                      | R1a                   |
| **অডিট**          | এই রেকর্ডের সব পরিবর্তন                                                                                                                                                      | Institution Admin                      | R1a                   |

## ১১.৩ অভিভাবক প্রোফাইল

- নাম, সম্পর্ক (প্রতি সন্তানের সঙ্গে আলাদা), যাচাইকৃত ফোন (একাধিক), ঠিকানা, পেশা, পছন্দের ভাষা ও যোগাযোগ channel।

- যুক্ত সন্তানদের card: link অবস্থা (verified/pending/revoked), প্রতি সন্তানের বকেয়া, হাজিরা ও সর্বশেষ notice।

- Portal account অবস্থা, শেষ login, notification preference; প্রতি সন্তানের আলাদা advance credit (এক সন্তানের credit অন্যের বকেয়ায় নিজে থেকে যাবে না)।

- সব সন্তানের সম্মিলিত payment history ও রসিদ।

- Restriction: custody বা আদালতের নির্দেশনা থাকলে সংশ্লিষ্ট সন্তানের access বন্ধ, কারণ restricted।

## ১১.৪ দাতা প্রোফাইল

- নাম (বা "বেনামি"), যোগাযোগ, দেশ (প্রবাসী দাতা), প্রকাশের সম্মতি, পছন্দের fund।

- Pledge, প্রাপ্ত দান, রসিদ, sponsor করা শিক্ষার্থী (দাতা শুধু সম্মত summary দেখবেন — নাম, class, অগ্রগতির সংক্ষেপ; ছবি নীতি অনুযায়ী)।

- বার্ষিক donor statement ও fund utilisation summary।

# ১২. ফ্রন্টএন্ড ডিজাইন স্পেসিফিকেশন

এই অধ্যায় UI/UX Designer ও Frontend Developer এর জন্য। লক্ষ্য: একটি শান্ত, মর্যাদাপূর্ণ ও দ্রুত ব্যবহারযোগ্য interface, যা মাদ্রাসার অফিসের desktop এবং শিক্ষক-অভিভাবকের কম দামি Android ফোন — দুই জায়গাতেই ভালো কাজ করে।

## ১২.১ ডিজাইন নীতি

- **বাংলা আগে:** সব layout বাংলা লেখার দৈর্ঘ্য ধরে ডিজাইন; ইংরেজি ছোট হলে ফাঁকা দেখাবে না। Bangla line-height কমপক্ষে ১.৬।

- **শান্ত ও মর্যাদাপূর্ণ:** গাঢ় সবুজ, বালুরঙা নিরপেক্ষ পটভূমি ও সংযত সোনালি accent। জ্যামিতিক ইসলামি নকশা শুধু login, empty state ও print header এ খুব হালকাভাবে (৩–৫% opacity)। মসজিদ/চাঁদ clipart নয়।

- **কাজ আগে, সাজ পরে:** প্রতিটি স্ক্রিনের প্রধান কাজ এক নজরে; শিক্ষক মোবাইলে হাজিরা ৩০ সেকেন্ডে, সবক entry শিক্ষার্থী প্রতি ১০ সেকেন্ডে।

- **অবস্থা সবসময় স্পষ্ট:** draft, saved, unsynced, pending approval, locked, published — প্রতিটির নির্দিষ্ট badge, রঙ ও icon; শুধু রঙ দিয়ে নয়।

- **ভুল কঠিন, সংশোধন সহজ:** ধ্বংসাত্মক কাজে প্রভাবের সংখ্যা দেখিয়ে confirm; যেখানে সম্ভব undo।

- **গোপনীয়তা দৃশ্যমান:** masked field, restricted tab ও ছবিহীন avatar স্বাভাবিক অবস্থা হিসেবে ডিজাইন করা, ত্রুটি হিসেবে নয়।

## ১২.২ ভিজ্যুয়াল টোকেন (প্রস্তাবিত)

| **টোকেন**                             | **Light**                                 | **Dark (P1)**       | **ব্যবহার**                                       |
| ------------------------------------- | ----------------------------------------- | ------------------- | ----------------------------------------------- |
| **Primary**                           | \#0F6B4A                                  | \#3FA57D            | প্রধান বাটন, active nav, link                      |
| **Primary soft**                      | \#E7F0EC                                  | \#173328            | selected row, chip পটভূমি                        |
| **Accent (সোনালি)**                    | \#B8862B                                  | \#D9AE5C            | গুরুত্বপূর্ণ highlight, খতম/সনদ, premium             |
| **Background**                        | \#FAF8F3                                  | \#121614            | পাতার পটভূমি (উষ্ণ বালুরঙা)                            |
| **Surface**                           | \#FFFFFF                                  | \#1A201D            | card, table                                     |
| **Border**                            | \#E4E0D6                                  | \#2C3430            | বিভাজন                                           |
| **Text / Muted**                      | \#1C2420 / \#5F6B65                       | \#ECEFED / \#9AA59F | মূল লেখা / সহায়ক লেখা                               |
| **Success / Warning / Danger / Info** | \#1E8E5A / \#C77700 / \#C2413A / \#2F6FB0 | উজ্জ্বলতর সংস্করণ      | Present/Paid, Late/Pending, Absent/Overdue, তথ্য |

- **Font:** বাংলা — Hind Siliguri বা Noto Sans Bengali; ইংরেজি ও সংখ্যা — Inter; আরবি/কুরআনি লেখা — Noto Naskh Arabic বা Amiri (কুরআনের আয়াতে Amiri Quran)।

- **Type scale:** ১২ / ১৪ / ১৬ (body) / ১৮ / ২০ / ২৪ / ৩০ px; বাংলা body কমপক্ষে ১৫–১৬ px।

- **Spacing:** ৪ px ভিত্তিক (৪, ৮, ১২, ১৬, ২৪, ৩২, ৪৮)। **Radius:** input ৮, card ১২, modal ১৬। **Shadow:** খুব হালকা, শুধু floating element এ।

- **সংখ্যা:** বাংলা ইন্টারফেসে বাংলা অঙ্ক (১২৩) default, setting এ ইংরেজি অঙ্ক; ID, ফোন ও রসিদ নম্বর সবসময় ইংরেজি অঙ্কে (copy ও search এর সুবিধায়)। টাকা: ৳ ১২,৫০০ (দক্ষিণ এশীয় comma নিয়ম: ১২,৩৪,৫৬৭)।

## ১২.৩ Layout ও navigation

- Desktop: বাম sidebar ২৬৪ px (collapse করলে ৭২ px, শুধু icon), উপরে ৬৪ px top bar, content সর্বোচ্চ ১৪৪০ px, ১২ column grid।

- Breakpoint: ৩৬০ / ৭৬৮ / ১০২৪ / ১২৮০ / ১৫৩৬ px। ৩৬০ px এ কোনো অনুভূমিক scroll নয় (বড় table নিজের container এ scroll)।

- Mobile: bottom navigation (role অনুযায়ী ৪–৫টি — যেমন শিক্ষক: আজ, হাজিরা, সবক, হোমওয়ার্ক, আরও), উপরে branch/session switcher ও search।

- Global search / command palette (Ctrl+K): শিক্ষার্থী, কর্মী, invoice, রসিদ, পৃষ্ঠা।

- Breadcrumb ও page header: শিরোনাম, সংক্ষিপ্ত বিবরণ, প্রধান কাজের বাটন ডানে।

## ১২.৪ Component তালিকা

| **Component**                                     | **আচরণ**                                                                                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **KPI card**                                      | শিরোনাম, মান, তুলনা (গতকাল/গত মাস), সময়সীমা, last updated; ক্লিকে বিস্তারিত তালিকা; loading skeleton                                                      |
| **Data table**                                    | Sticky header, column chooser, sort, filter chip, saved view, row selection ও bulk action bar, pagination, density toggle, mobile এ card view |
| **Status badge**                                  | icon + লেখা + রঙ; সব workflow অবস্থার জন্য একক নকশা                                                                                                |
| **Workflow stepper**                              | ভর্তি, প্রশ্নপত্র, ফলাফল, payroll এর অবস্থা ও পরের কাজ                                                                                                |
| **Approval card**                                 | কী, কে চেয়েছে, প্রভাব (টাকা/শিক্ষার্থী সংখ্যা), সংযুক্তি, অনুমোদন/ফেরত (কারণসহ)                                                                            |
| **Profile header ও tab bar**                      | অধ্যায় ১১ অনুযায়ী; mobile এ tab অনুভূমিক scroll                                                                                                     |
| **Attendance grid**                               | শিক্ষার্থীর তালিকায় P/L/A/Lv এক-ট্যাপ toggle, "সবাই উপস্থিত", unmarked হাইলাইট, submit এর আগে সারাংশ, cutoff countdown                                     |
| **সবক entry row**                                 | শিক্ষার্থী, auto-suggest range (পারা/পৃষ্ঠা stepper), মান (৩–৫ ধাপ), ভুলের ধরন chip, note; এক স্ক্রিনে পুরো halaqa                                          |
| **৩০ পারার grid**                                   | ৩০টি ঘর, অবস্থা অনুযায়ী রঙ ও প্যাটার্ন (মুখস্থ, চলমান, দুর্বল, শুরু হয়নি)                                                                                    |
| **Audio recorder/player**                         | রেকর্ড, থামানো, শোনা, আবার রেকর্ড, upload progress, সময়সীমা দেখানো; waveform                                                                          |
| **Fee collection panel**                          | শিক্ষার্থী খুঁজে বকেয়া invoice তালিকা, allocation, method, টাকা, ভাংতি হিসাব, রসিদ preview ও print (A4/৮০ mm thermal)                                     |
| **Form section**                                  | শিরোনামসহ ভাগ, inline validation, বাংলা/ইংরেজি অঙ্ক normalization, autosave indicator, sticky save bar                                             |
| **File upload**                                   | drag/drop ও ক্যামেরা, preview, size/type সীমা, compress অবস্থা                                                                                      |
| **Print preview**                                 | A4/thermal/CR80, প্রতিষ্ঠানের header, serial, QR; বাংলা/আরবি glyph যাচাই                                                                             |
| **Empty / loading / error / offline / অনুমতি নেই** | প্রতিটির আলাদা নকশা ও পরের কাজের বাটন                                                                                                               |
| **Toast ও confirm dialog**                        | সফল/ব্যর্থ বার্তা; ধ্বংসাত্মক কাজে প্রভাবিত সংখ্যা ও লিখে নিশ্চিত করা (বড় bulk এ)                                                                            |

## ১২.৫ স্ক্রিন তালিকা

Designer আগে R1a স্ক্রিনগুলো শেষ করবেন। "ডিভাইস" কলামে প্রধান ব্যবহার নির্দেশ করা হয়েছে; সব স্ক্রিন responsive।

| **\#** | **স্ক্রিন**                                                          | **রোল**                | **ডিভাইস** | **রিলিজ** |
| ------ | ------------------------------------------------------------------ | ---------------------- | --------- | --------- |
| S01    | Login (ফোন OTP / পাসওয়ার্ড + 2FA), প্রতিষ্ঠান বাছাই                        | সবাই                    | উভয়       | R1a       |
| S02    | Setup wizard (৭ ধাপ)                                                | Institution Admin      | Desktop   | R1a       |
| S03    | পরিচালকের dashboard                                                 | মুহতামিম                 | উভয়       | R1a       |
| S04    | শিক্ষকের "আজ" স্ক্রিন                                                 | শিক্ষক                  | Mobile    | R1a       |
| S05    | Enquiry board (kanban) ও enquiry form                              | ভর্তি কর্মকর্তা            | Desktop   | R1a       |
| S06    | আবেদন তালিকা ও review (নথি, ইন্টারভিউ, seat, duplicate)                | ভর্তি কর্মকর্তা            | Desktop   | R1a       |
| S07    | Student list (filter, saved view, bulk action)                     | Admin                  | Desktop   | R1a       |
| S08    | শিক্ষার্থী প্রোফাইল (সব tab)                                            | Admin, শিক্ষক           | উভয়       | R1a       |
| S09    | শিক্ষার্থী যোগ/সম্পাদনা form                                             | Admin                  | Desktop   | R1a       |
| S10    | Bulk import (template, mapping, dry run, ফল)                       | Admin                  | Desktop   | R1a       |
| S11    | Staff list ও কর্মী প্রোফাইল                                           | HR, Admin              | Desktop   | R1a       |
| S12    | হাজিরা register (mobile)                                             | শিক্ষক                  | Mobile    | R1a       |
| S13    | হাজিরা overview ও escalation                                         | Branch Admin           | Desktop   | R1a       |
| S14    | Halaqa সবক entry                                                   | হিফজ শিক্ষক             | Mobile    | R1a       |
| S15    | হিফজ অগ্রগতি dashboard                                              | হিফজ প্রধান              | উভয়       | R1a       |
| S16    | হোমওয়ার্ক তৈরি ও check তালিকা                                          | শিক্ষক                  | উভয়       | R1a       |
| S17    | পরীক্ষা setup ও marks entry (spreadsheet ধাঁচ)                         | Exam Controller, শিক্ষক | Desktop   | R1a       |
| S18    | Result review, lock ও publish                                      | Exam Controller        | Desktop   | R1a       |
| S19    | Fee rule ও invoice generation (preview সহ)                         | Finance Lead           | Desktop   | R1a       |
| S20    | ফি আদায় (collection desk) ও রসিদ                                    | হিসাবরক্ষক               | Desktop   | R1a       |
| S21    | Sponsorship ও fund allocation অনুমোদন                               | Finance Lead           | Desktop   | R1a       |
| S22    | Cashbook, fund statement ও cashier close                           | হিসাবরক্ষক, Finance Lead | Desktop   | R1a       |
| S23    | দান গ্রহণ ও দাতা প্রোফাইল                                                | হিসাবরক্ষক               | Desktop   | R1a       |
| S24    | Routine view ও notice composer                                     | Academic Admin         | Desktop   | R1a       |
| S25    | SMS composer (খরচ preview) ও message log                           | Operator               | Desktop   | R1a       |
| S26    | অভিভাবক portal হোম (child switcher)                                 | অভিভাবক                 | Mobile    | R1a       |
| S27    | অভিভাবক: হাজিরা, সবক, হোমওয়ার্ক জমা (audio), ফলাফল, ফি                    | অভিভাবক                 | Mobile    | R1a       |
| S28    | অনুমোদন inbox                                                       | মুহতামিম, Finance Lead   | উভয়       | R1a       |
| S29    | Reports হাব ও export job                                            | Admin                  | Desktop   | R1a       |
| S30    | Settings (প্রতিষ্ঠান, role ও permission, ছবি নীতি, cutoff, fund rule) | Institution Admin      | Desktop   | R1a       |
| S31    | Audit log                                                          | Institution Admin      | Desktop   | R1a       |
| S32    | Syllabus ও coverage                                                | Academic Admin, শিক্ষক  | Desktop   | R1b       |
| S33    | প্রশ্ন ব্যাংক, paper builder ও print                                   | Exam Controller, শিক্ষক | Desktop   | R1b       |
| S34    | Document/সনদ template ও batch print                                | Academic Admin         | Desktop   | R1b       |
| S35    | Seat plan                                                          | Exam Controller        | Desktop   | R1b       |
| S36    | Discipline/incident                                                | Welfare Officer        | Desktop   | R1b       |
| S37    | Subscription ও usage                                               | Institution Admin      | Desktop   | R1a       |
| S38    | SaaS admin console                                                 | SaaS Admin             | Desktop   | R1a       |

## ১২.৬ আচরণ ও মানের নিয়ম

- প্রতিটি form এ autosave অবস্থা ("সংরক্ষিত ১০:৪২", "সংরক্ষণ হচ্ছে…", "সংযোগ নেই — ড্রাফট ফোনে আছে")।

- Bulk কাজে আগে preview: কতজন প্রভাবিত, কতজন বাদ (কারণসহ), তারপর নিশ্চিতকরণ, শেষে ফলাফলের সারাংশ।

- বড় table এ server side pagination; ১০,০০০ সারি পর্যন্ত মসৃণ। Mobile এ table এর বদলে card তালিকা।

- Accessibility: WCAG 2.2 AA contrast, touch target কমপক্ষে ৪৪×৪৪ px, দৃশ্যমান focus ring, সব input এ label, keyboard দিয়ে পুরো marks entry ও fee collection সম্ভব।

- Performance: প্রথম স্ক্রিন ৩G-তুল্য নেটওয়ার্কে ব্যবহারযোগ্য; ছবি lazy load; font subset।

- Microcopy সহজ বাংলায়, দোষারোপহীন: "এই শিক্ষার্থীর হাজিরা দেওয়া হয়নি" — "আপনি ভুল করেছেন" নয়।

- Print template: A4 রসিদ ও marksheet, ৮০ mm thermal রসিদ, CR80 ID card, admit card, প্রশ্নপত্র (BN/AR), সনদ (landscape)।

## ১২.৭ Designer এর deliverable

- Design token ও component library (light; dark P1), সব অবস্থাসহ।

- R1a এর ৩৩টি স্ক্রিন desktop ও mobile (৩৬০ px) এ; empty/loading/error/permission অবস্থা।

- বাস্তবসম্মত বাংলা নমুনা ডাটা (ছবিহীন শিক্ষার্থী, লম্বা নাম, শূন্য বকেয়া, অনেক বকেয়া — সব ক্ষেত্র)।

- Clickable prototype: ভর্তি → enrollment, হাজিরা submit, সবক entry, ফি আদায় → রসিদ, অভিভাবকের হোমওয়ার্ক জমা।

- Print template এর PDF নমুনা।

# ১৩. নোটিফিকেশন ক্যাটালগ

Channel: SMS, in-app, push (P1), email (P1)। শ্রেণি: লেনদেন (ল), জরুরি (জ), সাধারণ (স)। সব event idempotent; একই event + recipient + channel এ একবার।

| **Event**                        | **প্রাপক**                  | **Channel**   | **শর্ত**                                                | **শ্রেণি** |
| -------------------------------- | ------------------------- | ------------- | ------------------------------------------------------ | --------- |
| **অনুপস্থিতি**                     | Primary contact           | SMS, in-app   | Register finalized, absent চিহ্নিত, approved leave নয়   | ল         |
| **দেরিতে উপস্থিতি**               | Primary contact           | in-app        | প্রতিষ্ঠান চালু করলে                                        | স         |
| **হাজিরা submit বাকি**              | শিক্ষক → Branch Admin      | in-app, push  | Cutoff এর ১৫ মিনিট আগে শিক্ষককে; পেরোলে Branch Admin কে | ল         |
| **রসিদ**                         | Primary contact           | SMS, in-app   | Payment posted                                         | ল         |
| **বকেয়া reminder**                | Primary contact           | SMS           | Due date এর পর, প্রতিষ্ঠানের নির্ধারিত ব্যবধানে; অঙ্ক যাচাইসহ    | ল         |
| **ফলাফল প্রকাশ**                    | অভিভাবক                    | SMS, in-app   | Result published বা নতুন version                         | ল         |
| **নতুন হোমওয়ার্ক / overdue**        | অভিভাবক, শিক্ষার্থী           | in-app        | Assign হলে; due পেরোলে একবার                            | স         |
| **হোমওয়ার্ক feedback**             | অভিভাবক                    | in-app        | Teacher check করলে                                     | স         |
| **ভর্তি অবস্থা**                    | আবেদনকারী                  | SMS           | Approved, waitlisted, rejected                         | ল         |
| **অনুমোদন প্রয়োজন**                | অনুমোদনকারী                 | in-app, push  | নতুন request; ৪৮ ঘণ্টা পর reminder                        | ল         |
| **গেট পাস overdue**               | Hostel Supervisor, অভিভাবক | in-app, SMS   | Expected return পেরোলে                                 | জ         |
| **জরুরি ঘোষণা**                    | নির্বাচিত audience          | SMS, in-app   | Authorised role, explicit confirmation                 | জ         |
| **Sponsorship মেয়াদ শেষ**         | Finance Lead              | in-app        | মেয়াদ শেষের ১৫ দিন আগে                                  | ল         |
| **SMS credit কম**                | Institution Admin         | in-app, email | নির্ধারিত সীমার নিচে                                      | ল         |
| **Subscription grace/সীমিত মোড** | Institution Admin, মুহতামিম | in-app, SMS   | প্রতিটি ধাপের শুরুতে ও শেষের ৩ দিন আগে                     | ল         |

# ১৪. সাবস্ক্রিপশন প্ল্যানের প্রস্তাব

Basic ছোট প্রতিষ্ঠানের দৈনন্দিন কাজ, Standard পূর্ণ পরিচালনা এবং Premium একাধিক শাখা ও উন্নত automation এর জন্য। P1/P2 ফিচার তৈরি না হওয়া পর্যন্ত available হিসেবে বিক্রি বা দেখানো যাবে না।

| **সুবিধা**                              | **Basic**                   | **Standard**             | **Premium**                            |
| ------------------------------------- | --------------------------- | ------------------------ | -------------------------------------- |
| **Setup ও branch**                    | ১ শাখা                        | ৩ শাখা পর্যন্ত               | বহু শাখা                                  |
| **ছাত্রী শাখা ও পর্দা নীতি**                | হ্যাঁ                          | হ্যাঁ                       | হ্যাঁ                                     |
| **ভর্তি, enquiry ও guardian records**  | হ্যাঁ                          | হ্যাঁ                       | হ্যাঁ                                     |
| **পূর্ণ শিক্ষার্থী ও কর্মী প্রোফাইল**         | হ্যাঁ                          | হ্যাঁ                       | হ্যাঁ                                     |
| **Manual attendance**                 | হ্যাঁ                          | হ্যাঁ                       | হ্যাঁ                                     |
| **QR ও in/out attendance**            | Add on                      | হ্যাঁ                       | হ্যাঁ                                     |
| **কুরআন track**                        | Noorani/Qaida ও Hifz        | সব track, মুহাসাবা সহ        | সব track, মুহাসাবা ও analytics             |
| **সিলেবাস, স্টাডি প্ল্যান ও হোমওয়ার্ক**       | সিলেবাস ও হোমওয়ার্ক (audio সহ) | auto study plan সহ       | auto study plan ও completion analytics |
| **প্রশ্নপত্র bank ও প্রিন্ট**              | মৌলিক bank, manual print    | পূর্ণ bank, Set A/B        | পূর্ণ bank, Set A/B, archive analytics   |
| **Exam ও result**                     | একক পরীক্ষা                   | Weighted merge           | Weighted merge                         |
| **ID, admit, certificate, seat plan** | Manual seat                 | Auto seat                | Auto seat                              |
| **Board preparation**                 | Generic export              | Board template           | Template ও adapter                     |
| **Fees, invoice ও sponsorship**       | হ্যাঁ                          | হ্যাঁ                       | হ্যাঁ                                     |
| **হিসাব ও cashbook**                   | মৌলিক                       | পূর্ণ ledger               | Consolidated view                      |
| **Donation ও fund segregation**       | হ্যাঁ                          | হ্যাঁ                       | হ্যাঁ                                     |
| **শৃঙ্খলা ও কল্যাণ**                       | মৌলিক incident              | Complaint ও wellbeing সহ | Complaint ও wellbeing সহ               |
| **Routine, notice, calendar**         | মৌলিক                       | Builder সহ               | Builder সহ                             |
| **Guardian web portal**               | হ্যাঁ                          | হ্যাঁ                       | হ্যাঁ                                     |
| **Storage (প্রস্তাবিত, যাচাইসাপেক্ষ)**       | ছোট quota                   | মাঝারি quota               | বড় quota                               |
| **Reports ও data export**             | মূল রিপোর্ট                   | পূর্ণ রিপোর্ট               | Custom analytics                       |

> _Basic এ Noorani/Qaida রাখা হয়েছে কারণ ছোট হিফজখানায় নূরানী বিভাগ প্রায় সবসময় থাকে। "মৌলিক/পূর্ণ" এর চূড়ান্ত feature flag তালিকা Business Owner ও Tech Lead নির্ধারণ করবেন।_

## সকল প্ল্যানে যে ভিত্তি থাকবে

Tenant isolation, role permission, ছাত্রী শাখার গোপনীয়তা, audit trail, encrypted backup, account recovery, guardian link verification এবং নিজের ডাটা export। নিরাপত্তা Premium এর ওপর নির্ভর করবে না। 2FA সবার জন্য থাকবে; privileged role এ বাধ্যতামূলক।

## অতিরিক্ত সুবিধা ও চার্জ

| **সুবিধা**                             | **Basic**       | **Standard**    | **Premium**      |
| ------------------------------------ | --------------- | --------------- | ---------------- |
| **Staff leave**                      | মৌলিক           | হ্যাঁ              | হ্যাঁ               |
| **HRM ও payroll**                    | Add on          | হ্যাঁ              | হ্যাঁ               |
| **Purchase, stock, canteen, assets** | Add on          | হ্যাঁ              | হ্যাঁ               |
| **Hostel, mess, library**            | Add on          | হ্যাঁ              | হ্যাঁ               |
| **Public website**                   | Basic pages     | Admission সহ    | Custom domain সহ |
| **Android shared app**               | Add on          | হ্যাঁ              | হ্যাঁ               |
| **iOS shared app**                   | Add on          | Add on          | Add on           |
| **Arabic/Urdu interface**            | P2 এ            | P2 এ            | P2 এ             |
| **AI assistant ও question draft**    | Add on          | Add on          | Quota সহ         |
| **SMS/email/voice**                  | Usage charge    | Usage charge    | Usage charge     |
| **Online payment gateway**           | Provider charge | Provider charge | Provider charge  |
| **Biometric/RFID device**            | Add on          | Add on          | Add on           |
| **Support**                          | নির্ধারিত সময়     | অগ্রাধিকার         | চুক্তিভিত্তিক       |

## মূল্য নির্ধারণের নিয়ম

- মাসিক বা বার্ষিক subscription, onboarding, migration এবং custom development আলাদা line item। এই নথিতে কোনো মূল্য অনুমান করা হয়নি।

- SMS, AI token, payment processing, iOS, domain ও device খরচ subscription এ অন্তর্ভুক্ত ধরা যাবে না।

- Upgrade এ entitlement বাড়বে; downgrade এ ডাটা মুছবে না। মেয়াদ শেষের ধাপ M24 অনুযায়ী (grace ১৪ দিন → সীমিত মোড ৩০ দিন → suspended)।

# ১৫. হিসাব ও ফলাফলের নির্দিষ্ট নিয়ম

## ফি ও লেনদেন

- টাকার অঙ্ক integer paisa বা fixed decimal; floating point নয়। Invoice line, discount, payment allocation, fund allocation ও refund আলাদা record।

- একই fee rule, enrollment ও billing period এর invoice একবার। Retry ও একই provider transaction নতুন আদায় সৃষ্টি করবে না।

- Invoice balance = charge − approved credit/waiver − net payment allocation − posted fund allocation। Reversal/refund এর প্রভাব একবারই। Unallocated advance আলাদা credit; অন্য সন্তানের বকেয়ায় নিজে থেকে যাবে না।

- Gateway collection, fee, net settlement ও bank deposit আলাদা। Cashier close এ expected, counted, variance ও reviewer।

| **পরীক্ষার উদাহরণ**                                                   | **প্রত্যাশিত হিসাব**                                                                                         |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **ফি ১,০০০; ছাড় ১০০; আদায় ৬০০**                                      | Net invoice ৯০০; paid ৬০০; due ৩০০।                                                                      |
| **পুরো paid invoice ৯০০ থেকে ২০০ বাতিল ও ফেরত**                      | Credit note ২০০; refund ২০০; net invoice ৭০০; net payment ৭০০; due ০।                                    |
| **Payment ২০০ reverse**                                            | ৯০০ charge; valid payment ৭০০; due ২০০ পুনরায় খোলা।                                                         |
| **৯০০ টাকার webhook তিনবার**                                          | একটি posted payment, একটি receipt, ledger এ একবার।                                                        |
| **মাসিক ফি ১,২০০; যাকাত fund থেকে ৭৫% sponsorship; অভিভাবক দিলেন ৩০০** | Fund allocation ৯০০ (যাকাত fund −৯০০, receivable −৯০০, journal balanced); payment ৩০০; due ০।              |
| **যাকাত fund এ ব্যালেন্স ৫০০, allocation দরকার ৯০০**                     | Allocation pending (insufficient fund); invoice due ১,২০০ − অভিভাবকের payment; অন্য fund থেকে স্বয়ংক্রিয় নয়। |

## পরীক্ষা ও সেশন

- Full marks, pass marks, component weight ও grade range exam version এ স্থির। Mapping না মিললে merge বন্ধ।

- উদাহরণ: ১ম পরীক্ষা (৩০%) এ ৮০/১০০ এবং ২য় (৭০%) এ ৭০/১০০ হলে final = (৮০×০.৩) + (৭০×০.৭) = ৭৩/১০০। Weight এর যোগফল ১০০%; rounding policy version এ।

- ০, Absent, Exempt এবং Not entered আলাদা। Absent এর treatment প্রতিষ্ঠানের লিখিত নীতি; Not entered রেখে publish নয়।

- Tie handling, optional subject, merit ও promotion rule আগে সংজ্ঞায়িত। পুরোনো ফলাফল নীরবে পুনর্গণনা নয়।

# ১৬. ডাটা মডেল ও সংযোগ

প্রস্তাবিত বাস্তবায়ন: TypeScript ভিত্তিক web client, API service, relational database, object storage এবং background queue। Next.js, NestJS ও PostgreSQL ব্যবহার করা যেতে পারে; এটি বাধ্যতামূলক stack নয়।

| **ডাটার গুচ্ছ**       | **প্রধান entity ও সম্পর্ক**                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **পরিচয় ও scope** | Tenant → Branch (type: বালক/বালিকা/মিশ্র); User ↔ Membership ↔ Role ↔ Permission; AcademicSession → Term; Shift।                                                                                        |
| **ভর্তি**          | Enquiry → Application → Enrollment; DocumentChecklist, InterviewResult।                                                                                                                             |
| **শিক্ষার্থী**       | Student ↔ GuardianLink ↔ Guardian; Student → Enrollment → Class/Section/Halaqa; EmergencyContact, PickupPerson, CustodyRestriction, MedicalNote, StudentDocument।                                   |
| **কর্মী**          | Employee → EmploymentHistory, StaffQualification, StaffDocument; TeacherAssignment (effective dated)।                                                                                               |
| **পড়াশোনা**         | Subject, AttendanceSession/Record/Version, QuranTrack, HifzEntry (sabak/sabaki/amukta), TajweedAssessment, KhatamRecord, MuhasabaEntry, Syllabus/Topic, StudyPlan, LessonPlan, Resource।            |
| **হোমওয়ার্ক**       | Homework → Assignment (class/section/halaqa/student) → Submission (text/file/audio/offline-checked) → Feedback।                                                                                     |
| **পরীক্ষা ও নথি**   | QuestionBankItem → Paper/PaperVersion → PrintEvent; ExamVersion → Component → Marks → ResultSnapshot; DocumentTemplate → DocumentIssue/Revocation; SeatPlan।                                        |
| **অর্থ**           | FeeRule → Invoice/Line → Payment/Allocation; Concession, Sponsorship → FundAllocation; CreditNote, Refund, CashierSession, Journal/Line, Fund (eligible use rule), Donor → DonationPledge/Received। |
| **যোগাযোগ ও কল্যাণ** | Notice/NoticeAudience/Acknowledgement, Routine/RoutineVersion/Period, CalendarEvent, Incident, ComplaintTicket।                                                                                     |
| **অপারেশন**        | Leave, PayrollBatch; Supplier, PO, StockMovement; Hostel/Room/Bed, MealRecord, GatePass, Visitor; LibraryCopy/Loan; WebsitePage।                                                                    |
| **সেবা ও audit**   | MessageJob/DeliveryAttempt, NotificationPreference, IntegrationEvent, ImportBatch, ExportJob, AuditEvent, Subscription/Entitlement/Usage।                                                           |

## ডাটা অখণ্ডতা

- সব tenant owned entity তে tenant_id; branch scoped record এ branch_id। Composite foreign key বা equivalent validation অন্য tenant এর reference আটকাবে।

- এক Student এর বহু session enrollment এবং এক Guardian এর একাধিক সন্তান সম্ভব। Phone number student এর unique key নয়।

- Published result snapshot, posted journal, issued receipt, posted fund allocation ও locked question paper immutable। সংশোধনে version, adjustment বা reversal।

## বাহ্যিক সেবা ও fallback

Provider adapter দিয়ে payment, SMS, email, voice ও device event আসবে। Credential secret store এ। Idempotency key, signed request বা provider validation, retry limit, dead letter queue ও reconciliation page। Provider unavailable হলে local কাজ draft/pending থাকবে। P0 এ cash/manual verified payment, text SMS ও platform backup; P1 এ gateway, QR, email/voice; P2 এ board adapter, hardware ও AI।

# ১৭. ব্যবহারযোগ্যতা ও মানের লক্ষ্য

| **মানদণ্ড**          | **প্রস্তাবিত গ্রহণযোগ্যতা**                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pilot load**     | এক tenant এ ১,০০০ active student, ১০০ staff, ১ লাখ attendance record; ১০০ concurrent session দিয়ে test।                                                    |
| **সাধারণ API**       | Common read/write p95 ≤ ১.৫ সেকেন্ড; third party সময় বাদ দিয়ে।                                                                                              |
| **মূল screen**      | ১০ Mbps ও ১০০ms latency এ usable page p95 ≤ ৩ সেকেন্ড; ধীর ৩G profile এ শিক্ষকের হাজিরা স্ক্রিন ≤ ৬ সেকেন্ড।                                                     |
| **Reliability**    | ৯৯.৫% monthly availability (মাসে ~৩.৬ ঘণ্টা downtime বাজেট)। RTO ৩ ঘণ্টা, ফলে একটি worst-case incident বাজেটের মধ্যে থাকে। Monitoring দিয়ে মাপা; contractual SLA নয়। |
| **Job handling**   | SMS, payment ও export retry observable; duplicate business action শূন্য।                                                                                    |
| **Data integrity** | প্রতি posted journal এ debit = credit; collection, allocation, fund ও ledger reconcile।                                                                    |
| **Locale quality** | BN/EN MVP; কুরআনি/আরবি লেখা সঠিক RTL P0; AR/UR interface P2।                                                                                                |

# ১৮. নিরাপত্তা ও ডাটা সুরক্ষা

- TLS, managed secret, encryption at rest, secure password hashing, login rate limit, session expiry ও privileged role এর 2FA।

- Tenant, branch ও female section isolation database/API/export/storage/queue স্তরে পরীক্ষা। Object URL স্বল্পমেয়াদি signed।

- Discipline, health, এতিম/sponsorship eligibility, religious practice, payroll ও ছাত্রীর ছবি/যোগাযোগ restricted scope এ; public ranking, বিজ্ঞাপন বা model training এ নয়।

- Audit এ actor, role, tenant, action, entity, timestamp, reason ও পরিবর্তনের summary; password বা token নয়।

- Shared device এ logout করলে cached ব্যক্তিগত ডাটা মুছে যাবে।

## Backup ও পুনরুদ্ধার

RPO সর্বোচ্চ ১ ঘণ্টা এবং RTO সর্বোচ্চ ৩ ঘণ্টা। Point in time recovery, object versioning ও encrypted daily snapshot; retention: daily ৩০ দিন, weekly ১২ সপ্তাহ। প্রতি মাসে isolated environment এ একটি tenant restore করে student count, invoice balance, fund balance, journal totals ও documents মিলিয়ে report।

## ধরে রাখা ও account বন্ধ

প্রতিষ্ঠান data owner হিসেবে retention policy অনুমোদন করবে; academic, financial, health ও communication records এর সময়সীমা আলাদা। Subscription বন্ধ হলে export window, পরে অনুমোদিত deletion; সব ধাপ audit এ।

# ১৯. উন্নয়ন ও প্রকাশের ধাপ

| **ধাপ**                      | **ফলাফল**                                                                                                                                                                                                                    | **শেষ হওয়ার শর্ত**                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Discovery**               | দুই পাইলট — হলি কুরআন মাদরাসা (কওমি + হিফজ) এবং একটি ছাত্রী শাখাসহ মাদ্রাসা (প্রস্তাবিত) — এর workflow, form, fee rule, fund নীতি, result ও permission যাচাই; দুই সপ্তাহের manual baseline সময় ও ভুল সংগ্রহ। এই সময়েই design শুরু।                    | Product Owner scope, pilot ও rules অনুমোদন; R1a স্ক্রিনের design অনুমোদিত।                                         |
| **R1a — পাইলট go-live (P0)** | M01–M05 core, M06 সবক/diary, M07 single exam, M10 (fund allocation সহ), M11 cashbook ও fund ledger, M12 routine/notice, M17 text/in app, M18 web, M21 PWA, M23 core, M24 foundation, M26 homework, পূর্ণ শিক্ষার্থী/কর্মী প্রোফাইল। | Enquiry থেকে collection, fund allocation ও একক পরীক্ষার result publish সম্পন্ন; R1a UAT, isolation ও restore pass। |
| **R1b — পাইলট সম্পূর্ণ (P0)**   | M25 প্রশ্নপত্র ব্যাংক ও print, M08 documents ও manual seat, M26 syllabus ও coverage, M06 খতম রেকর্ড ও সনদ, M19 basic discipline।                                                                                                  | প্রথম টার্ম পরীক্ষার আগে; প্রশ্নপত্র print rehearsal ও R1b UAT pass।                                                   |
| **P1 পূর্ণ পরিচালনা**           | Weighted exam, auto seat, M09, HR/payroll, purchase, hostel, library, website; QR, gateway, email/push; M25 auto suggestion; M26 auto study plan; মুহাসাবা; dark mode।                                                          | Provider checklist, accounts reconciliation ও operator training।                                               |
| **P2 সম্প্রসারণ**              | Native apps, Arabic/Urdu interface, AI, advanced analytics, hardware, board API।                                                                                                                                            | প্রতি integration এর approval, capacity ও support readiness।                                                    |

## কাজের নির্ভরতা

- Tenant, role, branch type ও academic setup আগে; তারপর admission/student/attendance।

- Fee ledger, fund ledger ও invoice model ছাড়া sponsorship, gateway বা donation portal নয়।

- Versioned exam rules ছাড়া result merge নয়। Verified guardian link ছাড়া guardian notification নয়।

- M06 সবক entry কুরআনের অন্তর্নির্মিত পারা/সূরা/পৃষ্ঠা কাঠামো ব্যবহার করবে; syllabus (M26) এর উপর নির্ভর নয়। হোমওয়ার্কও syllabus ছাড়া চলবে; syllabus থাকলে link ঐচ্ছিক।

- Question bank (M25) এর আগে subject (M01) ও exam version (M07); syllabus link ঐচ্ছিক।

- Payroll এর আগে staff, leave ও attendance cutoff; canteen/mess এর আগে stock ও finance posting।

- Design: token ও component library → R1a স্ক্রিন → prototype → developer handoff; frontend দল mock API দিয়ে backend এর সমান্তরালে কাজ করবে।

## প্রথম প্রকাশের বাইরে

বোর্ডের অনুমোদনহীন auto submission বা official certificate, biometric facial recognition, নিজস্ব payment custody, automated religious ruling, autonomous punishment, live class video এবং custom white label app। Transport ও alumni ভবিষ্যৎ backlog।

# ২০. গ্রহণযোগ্যতা পরীক্ষার তালিকা

প্রতিটি module এর নিজস্ব গ্রহণযোগ্যতার পাশাপাশি নিচের পরীক্ষাগুলো সংশ্লিষ্ট release এর আগে pass করতে হবে।

| **ID**      | **পরীক্ষা**                                                            | **পাস করার ফল**                                                                 |
| ----------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **T01 R1a** | Tenant A থেকে B এর ID বা export URL ব্যবহার                             | Access denied; কোনো metadata প্রকাশ নয়।                                         |
| **T02 R1a** | শিক্ষক unassigned class এর marks edit                                 | Server reject; audit এ চেষ্টা দৃশ্যমান।                                            |
| **T03 R1a** | এক আবেদন দুবার approve                                                 | এক Student, এক Enrollment, admission fee invoice একবার।                        |
| **T04 R1a** | CSV তে duplicate ও invalid row                                       | Dry run এ row error; retry duplicate নয়।                                      |
| **T05 R1a** | Unmarked attendance, approved leave ও cutoff পর্যন্ত submit না করা       | Absent SMS নয়; Branch Admin dashboard এ pending; finalized absent এ একবার job। |
| **T06 P1**  | এক QR event বারবার ও ভুল in/out order                                   | Duplicate ignored; invalid transition flagged।                                |
| **T07 R1a** | ১,০০০ fee, ১০০ waiver, ৬০০ payment                                   | Net ৯০০; outstanding ৩০০; ledger মেলে।                                        |
| **T08 P1**  | Webhook duplicate, amount mismatch ও late callback                   | এক posted payment; mismatch pending review।                                   |
| **T09 R1a** | Credit note ও refund বনাম শুধু reversal                                 | উদাহরণের due আলাদা; original entry অক্ষত।                                         |
| **T10 R1a** | Missing mark, absent, zero ও exempt                                  | আলাদা অবস্থা; missing এ publish বন্ধ।                                              |
| **T11 P1**  | Weighted merge ৩০%/৭০%                                               | ৭৩; ভুল weight এ error।                                                        |
| **T12 R1a** | Published result reopen ও republish                                  | Approval, reason, নতুন version।                                                |
| **T13 R1a** | Session promotion পুনরায় চালানো                                          | Duplicate enrollment নয়; history অক্ষত।                                        |
| **T14 R1a** | Guardian অন্য সন্তানের ID ব্যবহার                                         | Linked সন্তান ছাড়া কিছুই খুলবে না।                                                   |
| **T15 P1**  | এক bed বা stock একসঙ্গে বরাদ্দ/বিক্রি                                     | Overbooking বা negative stock আটকাবে।                                           |
| **T16 R1a** | Backup থেকে isolated restore                                         | RPO ১ ঘণ্টা/RTO ৩ ঘণ্টা মেলে; balance যাচাই pass।                                   |
| **T17 R1a** | BN print, ৩৬০ px mobile ও flaky network                              | Readable output; draft/saved status সঠিক।                                     |
| **T18 P2**  | AI কে অন্য tenant data দিতে বলা                                        | Unauthorized data নয়।                                                         |
| **T19 R1b** | Unapproved প্রশ্নপত্র print ও print window এর বাইরে preview              | Blocked; attempt audit এ।                                                     |
| **T20 P1**  | Public website এ sequential roll দিয়ে result                         | Token ছাড়া blocked; rate limit।                                                 |
| **T21 R1a** | সকাল ৮:৩০ এ register submit, একজন absent                              | অভিভাবক ৮:৪০ এর মধ্যে SMS পান; দিনের শেষের lock এ দ্বিতীয় SMS নয়।                 |
| **T22 R1a** | Female section access ছাড়া পুরুষ কর্মী ছাত্রীর profile খোলেন                | ছবি, ফোন, ঠিকানা ও স্বাস্থ্য masked; একাডেমিক তথ্য দৃশ্যমান; API response এও masked।     |
| **T23 R1a** | অযোগ্য শিক্ষার্থীর জন্য যাকাত fund allocation                               | Blocked; যোগ্য শিক্ষার্থীর ক্ষেত্রে journal balanced ও fund balance কমে।            |
| **T24 R1a** | Subscription সীমিত মোডে fee collection, অনুপস্থিতি SMS ও নতুন admission | প্রথম দুটি সফল; নতুন admission blocked, স্পষ্ট বার্তাসহ।                              |
| **T25 R1a** | Offline-checked হোমওয়ার্ক ও ৬ মিনিটের audio                            | Offline-checked completion এ গণ্য; audio স্পষ্ট বার্তায় প্রত্যাখ্যাত।                    |
| **T26 R1a** | Syllabus সেট ছাড়া সবক entry ও হোমওয়ার্ক                                  | দুটোই সফল।                                                                     |
| **T27 P1**  | বালিকা hostel এ বালক শিক্ষার্থী allocation                                 | Blocked।                                                                      |
| **T28 R1a** | শিক্ষক শিক্ষার্থীর ফি ও স্বাস্থ্য tab খোলার চেষ্টা                              | Tab দেখায় না; সরাসরি URL/API তেও denied।                                         |
| **T29 R1a** | HR ছাড়া অন্য কেউ কর্মীর বেতন tab দেখা                                     | Denied; কর্মী নিজের payslip দেখতে পারেন।                                        |
| **T30 R1a** | Basic প্ল্যানে Noorani, Hifz ও Nazera track চালু করা                       | প্রথম দুটি চালু; Nazera upgrade বার্তাসহ locked।                                     |

# ২১. সফলতার মাপ ও go-live শর্ত

| **মাপ**                      | **সংজ্ঞা ও লক্ষ্য**                                                                      | **দায়িত্ব**        |
| --------------------------- | ------------------------------------------------------------------------------------ | ---------------- |
| **Daily adoption**          | ৩০ দিনের মধ্যে হাজিরা register এর ≥৯০% সকালের cutoff এর মধ্যে finalize।                   | Branch Admin     |
| **Collection traceability** | প্রতিটি collection ও fund allocation এর receipt ও ledger link ১০০%।                   | Finance Lead     |
| **Student completeness**    | Active student এর ≥৯৫% required field ও verified primary guardian।                   | ভর্তি কর্মকর্তা      |
| **কাজের সময়**                | Baseline এর তুলনায় fee receipt ও result preparation এর median সময় ≥৩০% কম।             | Product Owner    |
| **Critical integrity**      | Duplicate payment, tenant/female section data leak ও ledger mismatch শূন্য।            | Engineering ও QA |
| **হিফজ follow up**          | নির্ধারিত diary এর ≥৯০% একই দিনে teacher entry।                                        | হিফজ প্রধান        |
| **হোমওয়ার্ক completion**      | Assigned homework এর ≥৮০% due date এর মধ্যে submitted বা offline-checked, এবং checked। | Academic Admin   |
| **অভিভাবক সক্রিয়তা**           | Pilot অভিভাবকের ≥৬০% ৬০ দিনের মধ্যে অন্তত একবার portal ব্যবহার (প্রস্তাবিত)।                  | Product Owner    |

## প্রথম মাদ্রাসায় চালুর শর্ত (R1a)

- R1a acceptance pass, critical/high issue বন্ধ, role, tenant ও female section access verified।

- Imported student count, opening due, fund balance ও account balance প্রতিষ্ঠানের দায়িত্বপ্রাপ্ত ব্যক্তি মিলিয়ে অনুমোদন করেছেন।

- একটি সম্পূর্ণ attendance day, invoice cycle, sponsorship allocation, payment/refund ও একক পরীক্ষা publish rehearsal সম্পন্ন। প্রশ্নপত্র print rehearsal R1b শর্ত।

- Backup restore, monitoring alert, support contact, administrator training ও rollback plan পরীক্ষিত।

- Product Owner, মুহতামিম, academic ও finance প্রতিনিধি go live অনুমোদন দিয়েছেন।

# ২২. চূড়ান্ত করার সিদ্ধান্ত ও সূত্র

| **সিদ্ধান্ত**                     | **এই খসড়ার প্রস্তাব**                                           | **চূড়ান্ত করবেন**              |
| ------------------------------ | ----------------------------------------------------------- | --------------------------- |
| **পাইলট**                       | হলি কুরআন মাদরাসা (কওমি + হিফজ) এবং একটি ছাত্রী শাখাসহ দ্বিতীয় মাদ্রাসা। | Product Owner               |
| **ছবি ও পর্দা নীতি**             | শাখাভিত্তিক ছবি নীতি ও female section access permission।       | মুহতামিম ও Institution Admin  |
| **হাজিরার cutoff**               | প্রথম পিরিয়ড শুরুর ৪৫ মিনিট পর; shift অনুযায়ী।                   | Academic Admin              |
| **Fund eligible use rule**     | প্রতিটি restricted fund এর লিখিত নিয়ম।                       | Finance Lead ও পরিচালনা কমিটি |
| **Board ও grading**            | বর্তমান নথি অনুযায়ী versioned rules।                            | Academic Admin              |
| **Quota ও দাম**                 | Active student, storage, SMS ও মূল্য cost review এর পরে।      | Business Owner              |
| **Payment ও messaging**        | এক approved gateway ও এক SMS provider।                      | Finance ও Tech Lead         |
| **Subscription মেয়াদ শেষের ধাপ** | Grace ১৪ দিন → সীমিত মোড ৩০ দিন → suspended।                | Business Owner              |
| **ফাইলের সীমা ও storage**        | Audio ৫ মিনিট/১০ MB, ছবি ৫ MB, PDF ১০ MB।                   | Tech Lead                   |
| **Data retention**             | ধরন অনুযায়ী সময়সীমা।                                           | Institution Admin           |
| **Reliability**                | ৯৯.৫% monthly, RTO ৩ ঘণ্টা; capacity test এর পরে চূড়ান্ত।        | Tech Lead                   |
| **Release budget ও deadline**  | Discovery ও team capacity অনুযায়ী।                            | Product Owner ও Tech Lead   |

## সূত্র এবং যাচাইয়ের সীমা

মূল feature scope ক্লায়েন্টের সরবরাহ করা তালিকা থেকে। Hostel/mess, guardian verification, sponsorship ও fund allocation, ছাত্রী শাখা নীতি, migration, support, SaaS entitlement, reconciliation, প্রশ্ন ব্যাংক, syllabus/homework এবং পূর্ণ প্রোফাইল বাড়তি product requirement হিসেবে প্রস্তাবিত।

বেফাকের প্রকাশ্য ওয়েবসাইটে নিবন্ধন, প্রবেশপত্র, সিলেবাস ও ফলাফলের নোটিশ রয়েছে; অনুমোদিত public API নিশ্চিত হয়নি, তাই M09 এ manual workflow। \[S1\] SSLCOMMERZ এর নির্দেশনায় IPN পাওয়ার পর validation API দিয়ে যাচাই; তাই browser redirect কে payment confirmation ধরা হয়নি। \[S2\]

S1 বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ — https://wifaqbd.org/ — v2 প্রস্তুতির সময় দেখা। S2 SSLCOMMERZ Developer Arena — https://developer.sslcommerz.com/ — v2 প্রস্তুতির সময় দেখা। বাস্তবায়নের আগে দুটোই আবার যাচাই করতে হবে।

এই সফটওয়্যার ধর্মীয় আমল, eligibility, যাকাতের খাত, curriculum, বোর্ডের grade বা অর্থ ব্যবহারের নিয়ম নিজে নির্ধারণ করবে না; প্রতিষ্ঠানের অনুমোদিত নীতি configuration ও review workflow এর মাধ্যমে প্রয়োগ করবে।
