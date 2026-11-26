import {currentSession} from "@/lib/session";
import {logout} from "@/app/login/actions";
import Link from "next/link";
import {redirect} from "next/navigation";
export const dynamic="force-dynamic";
export default async function Staff(){const session=await currentSession();if(!session)redirect("/login");return <main id="main" className="shell section inner"><p className="eyebrow">STAFF WORKSPACE</p><h1>Welcome, {session.name}</h1><p className="intro">{session.restaurantName} · {session.role}</p>{session.role==="kitchen"?<Link className="btn gold" href="/kitchen">Open kitchen</Link>:session.role==="waiter"?<Link className="btn gold" href="/waiter">Open waiter station</Link>:<p>Additional role-specific modules are under development.</p>}<form action={logout} className="section"><button className="btn outline">Sign out</button></form></main>}
