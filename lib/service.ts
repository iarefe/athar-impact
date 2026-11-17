import {env} from "cloudflare:workers";
import {roles, initialData, demoProject, jobAnswer, eduAnswer} from "./impact";
import type {Role,Data,FileRef} from "./impact";
export const db=()=>{if(!env.DB)throw Error("قاعدة البيانات غير متاحة.");return env.DB};
export const bucket=()=>{if(!env.BUCKET)throw Error("مخزن المرفقات غير متاح.");return env.BUCKET};
export function fail(message:string,status=400):never{throw Object.assign(Error(message),{status})}
export function errorResponse(e:unknown){const x=e as {status?:number,message?:string};return Response.json({error:x.status?x.message:"تعذّر إتمام العملية. أعد المحاولة."},{status:x.status||500,headers:{"Cache-Control":"no-store"}})}
export const sessionKey=(r:Request)=>r.headers.get("cookie")?.match(/(?:^|;\s*)athar_session=([\da-f-]{36})/)?.[1]||"";
export async function roleOf(r:Request):Promise<Role|null>{const key=sessionKey(r);if(!key)return null;const row=await db().prepare("SELECT role FROM sessions WHERE id=? AND expires>?").bind(key,Date.now()).first<{role:Role}>();return row?.role??null}
export function sameOrigin(r:Request){if(r.headers.get("origin")&&new URL(r.headers.get("origin")!).host!==new URL(r.url).host)fail("طلب غير مسموح.",403)}
export async function registry(){let row=await db().prepare("SELECT revision,data FROM registry WHERE id=1").first<{revision:number,data:string}>();if(!row){await db().prepare("INSERT OR IGNORE INTO registry VALUES(1,0,?)").bind(JSON.stringify(initialData())).run();row=await db().prepare("SELECT revision,data FROM registry WHERE id=1").first<{revision:number,data:string}>()}return {data:JSON.parse(row!.data) as Data,rev:row!.revision}}
export function view(role:Role,d:Data){return {cycles:d.cycles,projects:role==="donor"?d.projects:{[role]:d.projects[role]||[]},reports:d.reports.filter(r=>role==="donor"?r.status!=="draft":r.org===role)}}
export const samples=[demoProject.proof!,jobAnswer.file!,eduAnswer.file!];
export async function fileRef(f:FileRef|null|undefined,org:Role):Promise<FileRef|null>{if(!f)return null;const sample=samples.find(s=>s.id===f.id);if(sample)return sample;if(!f.id?.startsWith(org+"/")||!(await bucket().head(f.id)))fail("تعذّر التحقق من المرفق.");return {id:f.id,name:String(f.name).slice(0,160)}}
export const knownRole=(s:unknown):s is Role=>typeof s==="string"&&Object.hasOwn(roles,s);
export function clean(x:unknown,max=3500){if(typeof x!=="string")return "";if(x.length>max)fail("النص أطول من الحد المسموح.");return x.trim()}
export function validDate(s:unknown):s is string{return typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s}
