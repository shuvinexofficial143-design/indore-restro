import {currentSession} from "@/lib/session";
import {logout} from "@/app/login/actions";
import {redirect} from "next/navigation";
export const dynamic="force-dynamic";
export default async function Staff(){const session=await currentSession();if(!session)redirect("/login");return <main id="main" className="shell section inner"><p className="eyebrow">STAFF WORKSPACE</p><h1>Welcome, {session.name}</h1><p className="intro">{session.restaurantName} · {session.role}</p><p>Your role-specific operational dashboard will be implemented in the corresponding phase.</p><form action={logout} className="section"><button className="btn outline">Sign out</button></form></main>}
