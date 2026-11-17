import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"جهة ذات أثر | التقييم والاعتماد",description:"تقييم أثر مشاريع الجمعيات ومراجعة الشواهد وإصدار الاعتماد الدوري.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body>{children}</body></html>}
