"use client";
import {useActionState} from "react";
import {login} from "./actions";
export default function LoginForm(){const [state,action,pending]=useActionState(login,"");return <form action={action} className="booking-form"><label className="form-submit">Staff email<input name="email" type="email" autoComplete="username" required maxLength={254}/></label><label className="form-submit">Password<input name="password" type="password" autoComplete="current-password" required maxLength={128}/></label>{state&&<p role="alert" className="form-submit">{state}</p>}<button className="btn gold form-submit" disabled={pending}>{pending?"Signing in…":"Sign in"}</button></form>}
