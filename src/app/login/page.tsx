import LoginForm from "./form";
export const dynamic="force-dynamic";
export default function Login(){return <main id="main" className="shell section inner"><p className="eyebrow">SECURE STAFF ACCESS</p><h1>Staff <em>sign in.</em></h1><p className="intro">For authorized restaurant team members only. No public demo credentials.</p><div className="booking-card" style={{maxWidth:520}}>{!process.env.DATABASE_URL?<p role="status">Database connection is pending. Login is disabled until configured.</p>:<LoginForm/>}</div></main>}
