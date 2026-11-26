"use client";
import {useActionState} from "react";
import {startDemo} from "@/app/demo/actions";
export default function DemoStart(){const [message,action,pending]=useActionState(startDemo,"");return <form className="booking-form" action={action}><label className="form-submit">Private invitation code<input type="password" name="code" required maxLength={128} autoComplete="off"/></label><button className="btn gold form-submit" disabled={pending}>{pending?"Creating isolated demo…":"Start isolated demo"}</button><p role="status" className="form-submit">{message}</p></form>}
