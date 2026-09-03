import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
    console.log("form submission", Object.fromEntries(await request.formData()));

    // ponytail: log-only, bounce back to the page. Swap the log for email/DB when there's somewhere to send it.
    return redirect(request.headers.get("referer") ?? "/", 303);
};
