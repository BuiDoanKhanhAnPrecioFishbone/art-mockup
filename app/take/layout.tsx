import { DemoRoleFloater } from "@/widgets/demo-role-floater";

/** The candidate "take a test" flow runs at the root — no app
 *  sidebar, no role gating. The wireframe is a chrome-less full-screen
 *  experience with a Precio Fishbone branded header card.
 *
 *  We render the global demo role-switcher as a floating pill so the
 *  demo viewer can flip back to an HR role from the chrome-less
 *  surface. (The Candidate role is bounced out of `(app)` entirely,
 *  so without this floater they'd be stranded.) */
export default function TakeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
      <DemoRoleFloater />
    </div>
  );
}
