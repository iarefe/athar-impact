export const donor = "مؤسسة مانحة تجريبية";
export const roles = {
  donor: {name:donor, label:"مؤسسة مانحة", description:"مراجعة التقييمات وإصدار الاعتمادات"},
  fresh: {name:"جمعية تجريبية أ", label:"جمعية جديدة", description:"تقييم مشروع سابق مع مانح آخر"},
  partner: {name:"جمعية تجريبية ب", label:"جمعية شريكة", description:"تقييم مشاريع منتهية مع المؤسسة"},
} as const;
export type Role = keyof typeof roles;
export const orgNames:Record<string,string>={fresh:roles.fresh.name,partner:roles.partner.name,ghars:"جمعية تجريبية ج"};
export type FileRef={id:string;name:string;sample?:string};
export type Project={id:string;name:string;funder:string;end:string;proof:FileRef|null};
export type Answer={goal:string;before:string;after:string;reach:string;contribution:string;limits:string;evidence:string;file:FileRef|null};
export type Cycle={id:string;name:string;start:string;end:string;validUntil:string};
export type Status="draft"|"sent"|"returned"|"approved"|"improve";
export type Report={id:string;org:string;cycle:string;projects:Project[];answers:Record<string,Answer>;practice:string;change:string;status:Status;note:string;decided:string;submitted:string};
export type Data={cycles:Cycle[];projects:Record<string,Project[]>;reports:Report[]};
export const labels:Record<Status,string>={draft:"مسودة",sent:"بانتظار المراجعة",returned:"مطلوب استكمال",approved:"معتمد",improve:"تقرير تحسين"};
export const fields = [
 ["goal","ما التغيير المهم للمستفيدين؟","وضّح الحاجة وكيف عبّر عنها المستفيدون."],
 ["before","ما وضع المستفيدين قبل المشروع؟","اذكر خط الأساس أو صف ما تعرفه عن الوضع السابق."],
 ["after","ماذا تغيّر بعد المشروع؟","اذكر النتيجة ووقت قياسها، بما في ذلك النتائج غير المتوقعة."],
 ["reach","لمن تحقق التغيير؟","ميّز بين إجمالي المشاركين ومن شملتهم المتابعة ومن تحسّن وضعهم."],
 ["contribution","كيف ساهم المشروع في التغيير؟","وضّح دور المشروع والشركاء وأي عوامل أخرى."],
 ["limits","ما حدود ما يمكن استنتاجه؟","اذكر من تعذّرت متابعته وأي أثر سلبي أو تفسير بديل."],
 ["evidence","ما الشاهد على النتيجة؟","صف مصدر البيانات وطريقة جمعها وتاريخها."],
] as const;
export const emptyAnswer=():Answer=>({goal:"",before:"",after:"",reach:"",contribution:"",limits:"",evidence:"",file:null});
export const today=()=>new Date(Date.now()+3*3600000).toISOString().slice(0,10);
export const cycleStatus=(c:Cycle)=>today()<c.start?"قادمة":today()>c.end?"مغلقة":"مفتوحة";
export const dateAr=(s:string)=>s?new Intl.DateTimeFormat("ar-SA",{day:"numeric",month:"short",year:"numeric",calendar:"gregory",timeZone:"UTC"}).format(new Date(s.slice(0,10)+"T12:00:00Z")):"—";
export const num=(n:number)=>n.toLocaleString("ar-SA");
export const demoProject:Project={id:"external",name:"مهارات للعمل",funder:"مانح تجريبي خارجي",end:"2026-06-30",proof:{id:"sample-proof",name:"إفادة إتمام المشروع.txt",sample:"نفّذت جمعية تجريبية أ مشروع مهارات للعمل بتمويل مانح تجريبي خارجي. أُقفل المشروع في 30 يونيو 2026. سجل افتراضي للتجربة."}};
export const jobAnswer:Answer={goal:"عبّر الباحثون عن عمل عن حاجتهم إلى فرص توظيف تتناسب مع مهاراتهم.",before:"كان المشاركون الستون يبحثون عن عمل عند التسجيل.",after:"بعد ثلاثة أشهر من التدريب أفاد 18 مشاركًا بأنهم التحقوا بعمل.",reach:"شارك 60 شخصًا، وتواصل الفريق مع 45 منهم، والتحق 18 منهم بعمل.",contribution:"وفّر المشروع تدريبًا ومقابلات مع أصحاب العمل، وساعدت خدمات التوظيف المحلية بعض المشاركين.",limits:"تعذّر الوصول إلى 15 مشاركًا. وقد يكون بعض المشاركين وجدوا عملًا من قنوات أخرى.",evidence:"سجل متابعة هاتفي بعد ثلاثة أشهر من انتهاء التدريب، مع تأكيد حالة التوظيف من المشاركين.",file:{id:"sample-jobs",name:"ملخص متابعة التوظيف.csv",sample:"البند,العدد\nالمشاركون,60\nتمت متابعتهم,45\nالتحقوا بعمل,18"}};
export const eduAnswer:Answer={goal:"حددت الأسر والمعلمون الطلاقة القرائية أولوية للطلاب.",before:"أظهر التقويم القبلي حاجة الطلاب إلى دعم إضافي في قراءة نص قصير.",after:"ارتفع مستوى الطلاقة بدرجة واحدة على الأقل لدى 24 طالبًا عند التقييم البعدي.",reach:"شارك 40 طالبًا، وأكمل 32 القياسين، وتحسّن 24 منهم.",contribution:"أتاح البرنامج جلسات قراءة فردية، وساهم تدريب المعلمين والمتابعة المنزلية في التحسن.",limits:"غاب ثمانية طلاب عن القياس البعدي؛ ولم تقس المجموعة استمرار التحسن بعد الإجازة.",evidence:"ملخص نتائج بطاقات المعلمين قبل الجلسات وبعدها، في نهاية الفصل.",file:{id:"sample-edu",name:"ملخص قياس القراءة.csv",sample:"البند,العدد\nالمشاركون,40\nأكملوا القياسين,32\nتحسّنوا,24"}};
export const practiceSample="يتولى منسق البرامج متابعة النتائج، ويعرضها على فريق الجمعية في اجتماع ربع سنوي.";
export const changeSample="بعد مراجعة حالات الانقطاع أضفنا موعد متابعة مسائيًا ووسيلة تواصل بديلة.";
export function makeReport(org:string,cycle:string,projects:Project[]):Report{return {id:org+"-"+cycle,org,cycle,projects,answers:{},practice:"",change:"",status:"draft",note:"",decided:"",submitted:""}}
export function initialData():Data{
 const year=Number(today().slice(0,4));
 const c={id:"cycle-"+year,name:"الدورة السنوية "+year.toLocaleString("ar-SA",{useGrouping:false}),start:year+"-01-01",end:year+"-12-31",validUntil:(year+1)+"-12-31"};
 const p=[{id:"career",name:"مسارات التوظيف",funder:donor,end:(year-1)+"-12-15",proof:null},{id:"reading",name:"نادي القراءة المجتمعي",funder:donor,end:year+"-06-01",proof:null}];
 const g=[{id:"ghars-read",name:"خطوة قارئ",funder:donor,end:year+"-05-15",proof:null}];
 const pending=makeReport("ghars",c.id,g);Object.assign(pending,{answers:{"ghars-read":eduAnswer},practice:practiceSample,change:"أضفنا متابعة هاتفية للأسر التي تعذّر حضور أبنائها جلسة القياس.",status:"sent",submitted:today()});
 return {cycles:[c],projects:{partner:p,fresh:[],ghars:g},reports:[pending]};
}
