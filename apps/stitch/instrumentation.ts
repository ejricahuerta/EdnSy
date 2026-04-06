export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureLaunchRosettaProject } = await import(
      "./lib/stitch/bootstrap-node"
    );
    await ensureLaunchRosettaProject();
  }
}
