import { createAsyncPost } from "@/lib/stitch/create-async-post";

export const runtime = "nodejs";

/** Vercel / similar: allow long-running work after 202 (seconds). */
export const maxDuration = 300;

export const POST = createAsyncPost;
