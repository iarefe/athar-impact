import {z} from "zod";
import {db,fail,registry,view,roleOf,sessionKey,sameOrigin,knownRole,errorResponse,clean,validDate,fileRef} from "../../../lib/service";
import {makeReport,emptyAnswer,fields,cycleStatus,today,donor} from "../../../lib/impact";
import type {Project,Role,Answer} from "../../../lib/impact";
const fileShape=z.object({id:z.string(),name:z.string()}).nullable().optional();
const bodySchema=z.object({
 action:z.enum(["logout","login","cycle","decide","save","send"]),role:z.string().optional(),rev:z.number().optional(),
 name:z.string().default(""),start:z.string().default(""),end:z.string().default(""),validUntil:z.string().default(""),
 id:z.string().optional(),status:z.enum(["approved","returned","improve"]).optional(),note:z.string().optional(),checks:z.array(z.boolean()).optional(),
 cycle:z.string().optional(),practice:z.string().optional(),change:z.string().optional(),
 external:z.object({name:z.string(),funder:z.string(),end:z.string(),proof:fileShape}).optional(),
 answers:z.record(z.object({goal:z.string().optional(),before:z.string().optional(),after:z.string().optional(),reach:z.string().optional(),contribution:z.string().optional(),limits:z.string().optional(),evidence:z.string().optional(),file:fileShape})).optional()
});
const reply=(x:unknown,headers:Record<string,string>={})=>Response.json(x,{headers:{"Cache-Control":"no-store",...headers}});
export async function GET(req:Request){try{const role=await roleOf(req);if(!role)return reply({role:null});const {data,rev}=await registry();return reply({role,data:view(role,data),rev})}catch(e){return errorResponse(e)}}
export async function POST(req:Request){try{
 sameOrigin(req);const parsed=bodySchema.safeParse(await req.json());if(!parsed.success)fail("بيانات الطلب غير مكتملة.");const b=parsed.data;
 const attrs="; Path=/; HttpOnly; SameSite=Lax"+(new URL(req.url).protocol==="https:"?"; Secure":"");
 if(b.action==="logout"){await db().prepare("DELETE FROM sessions WHERE id=?").bind(sessionKey(req)).run();return reply({role:null},{"Set-Cookie":"athar_session=; Max-Age=0"+attrs})}
 if(b.action==="login"){if(!knownRole(b.role))fail("اختر حسابًا تجريبيًا.");const role:Role=b.role;const key=crypto.randomUUID();const {data,rev}=await registry();await db().batch([db().prepare("DELETE FROM sessions WHERE id=? OR expires<?").bind(sessionKey(req),Date.now()),db().prepare("INSERT INTO sessions VALUES(?,?,?)").bind(key,role,Date.now()+86400000)]);return reply({role,data:view(role,data),rev},{"Set-Cookie":"athar_session="+key+"; Max-Age=86400"+attrs})}
 const role=await roleOf(req);if(!role)fail("انتهت الجلسة. ادخل بالحساب مرة أخرى.",401);
 const {data,rev}=await registry();if(b.rev!==rev)fail("تغيّرت البيانات أثناء العمل. حدّث الصفحة ثم أعد فتح السجل.",409);
 if(b.action==="cycle"){if(role!=="donor")fail("صلاحية المؤسسة مطلوبة.",403);const {start,end,validUntil}=b;const name=clean(b.name,100);if(!name||![start,end,validUntil].every(validDate)||start>end||end>=validUntil)fail("تحقق من اسم الدورة وترتيب التواريخ. يجب أن تنتهي صلاحية الاعتماد بعد إقفال الدورة.");if(data.cycles.some(c=>start<=c.end&&end>=c.start))fail("تتداخل هذه الفترة مع دورة قائمة.");data.cycles.push({id:crypto.randomUUID(),name,start,end,validUntil})}
 else if(b.action==="decide"){if(role!=="donor")fail("صلاحية المؤسسة مطلوبة.",403);const r=data.reports.find(r=>r.id===b.id);if(!r||r.status!=="sent")fail("هذا الطلب غير متاح للمراجعة.");if(!b.status)fail("اختر القرار.");const note=clean(b.note);if(!note)fail("اكتب سبب القرار أو المطلوب استكماله.");if(b.status==="approved"&&(!Array.isArray(b.checks)||b.checks.length!==3||!b.checks.every((v:unknown)=>v===true)))fail("تحقّق من شروط الاعتماد الثلاثة.");if(b.status==="approved"&&data.cycles.find(c=>c.id===r.cycle)!.validUntil<today())fail("انتهت صلاحية اعتماد هذه الدورة.");Object.assign(r,{status:b.status,note,decided:today()})}
 else if(b.action==="save"||b.action==="send"){
 if(role==="donor")fail("هذا المسار خاص بالجمعية.",403);const cycle=data.cycles.find(c=>c.id===b.cycle);if(!cycle)fail("الدورة غير متاحة.");const existing=data.reports.find(r=>r.cycle===cycle.id&&r.org===role);if(existing&&!["draft","returned"].includes(existing.status))fail("سبق إرسال التقييم.");if(cycleStatus(cycle)!=="مفتوحة"&&!(existing?.status==="returned"&&cycle.validUntil>=today()))fail("فترة التقديم مغلقة.");
 let projects:Project[]=data.projects[role]||[];
 if(role==="fresh"){const p=b.external;if(!p||!clean(p.name,150)||!clean(p.funder,150)||!validDate(p.end)||p.end>today()||clean(p.funder)===donor)fail("أكمل بيانات المشروع المنتهي مع المانح الآخر.");projects=[{id:"external",name:clean(p.name,150),funder:clean(p.funder,150),end:p.end,proof:await fileRef(p.proof,role)}];data.projects[role]=projects}
 const r=existing||makeReport(role,cycle.id,projects);r.projects=projects;
 for(const p of projects){const a=b.answers?.[p.id]||{};const answer:Answer=emptyAnswer();for(const [key] of fields)answer[key]=clean(a[key]);answer.file=await fileRef(a.file,role);r.answers[p.id]=answer}
 r.practice=clean(b.practice);r.change=clean(b.change);
 if(b.action==="send"){if(!projects.length||projects.some(p=>fields.some(([k])=>!r.answers[p.id][k])||!r.answers[p.id].file)||!r.practice||!r.change||(role==="fresh"&&!projects[0].proof))fail("أكمل الإجابات وأرفق الشواهد المطلوبة قبل الإرسال.");r.status="sent";r.submitted=today();r.decided=""}
 if(!existing)data.reports.push(r);
 }else fail("العملية غير معروفة.");
 const result=await db().prepare("UPDATE registry SET data=?,revision=revision+1 WHERE id=1 AND revision=?").bind(JSON.stringify(data),rev).run();if(!result.meta.changes)fail("حُدث السجل أثناء العمل. أعد تحميل الصفحة.",409);return reply({role,data:view(role,data),rev:rev+1});
 }catch(e){return errorResponse(e)}}
