/**
 * Same behavior as POST /api/create-async. Admin defaults to this path
 * (DEMO_GENERATOR_ASYNC_PATH=/api/dental-async) for Website Template compatibility.
 */
import { createAsyncPost } from "@/lib/stitch/create-async-post";

export const runtime = "nodejs";

export const maxDuration = 300;

export const POST = createAsyncPost;
