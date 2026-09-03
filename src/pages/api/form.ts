import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
    console.log("form submission", Object.fromEntries(await request.formData()));

    // ponytail: log-only. Swap the log for email/DB when there's somewhere to send it.

    // The toast submits through fetch and asks for JSON; a plain form post
    // (no JS) still bounces back to the page it came from.
    if (request.headers.get("accept")?.includes("application/json")) {
        return Response.json({ ok: true });
    }

    return redirect(request.headers.get("referer") ?? "/", 303);
};
